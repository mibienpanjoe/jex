package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// Client is an HTTP client for the Jex API.
type Client struct {
	baseURL        string
	token          string
	allowInsecure  bool
	httpClient     *http.Client
}

// New creates a new API client. baseURL must use HTTPS unless allowInsecure is true.
func New(baseURL, token string, allowInsecure bool) (*Client, error) {
	if !allowInsecure && strings.HasPrefix(baseURL, "http://") {
		return nil, fmt.Errorf("insecure base URL rejected (use --allow-insecure to override): %s", baseURL)
	}
	return &Client{
		baseURL:       strings.TrimRight(baseURL, "/"),
		token:         token,
		allowInsecure: allowInsecure,
		httpClient:    &http.Client{},
	}, nil
}

// Project represents a project returned by the API.
type Project struct {
	ID   string `json:"id"`
	Name string `json:"slug"`
}

// Env represents an environment returned by the API.
type Env struct {
	Name          string `json:"name"`
	SecretsCount  int    `json:"secretCount"`
}

// SecretKey represents a key entry from the list endpoint.
type SecretKey struct {
	Key string `json:"key"`
	Env string `json:"env"`
}

// ImportResult is the response from the import endpoint.
type ImportResult struct {
	Created int `json:"created"`
	Updated int `json:"updated"`
}

func (c *Client) do(method, path string, body any) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(b)
	}
	req, err := http.NewRequest(method, c.baseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("cannot connect to Jex API at %s", c.baseURL)
	}
	return resp, nil
}

func (c *Client) decodeJSON(resp *http.Response, v any) error {
	defer resp.Body.Close()
	return json.NewDecoder(resp.Body).Decode(v)
}

// ListProjects returns all projects the authenticated user belongs to.
func (c *Client) ListProjects() ([]Project, error) {
	resp, err := c.do("GET", "/api/v1/projects", nil)
	if err != nil {
		return nil, err
	}
	if err := checkStatus(resp); err != nil {
		return nil, err
	}
	var result struct {
		Projects []Project `json:"projects"`
	}
	if err := c.decodeJSON(resp, &result); err != nil {
		return nil, err
	}
	return result.Projects, nil
}

// ListEnvs returns all environments for a project.
func (c *Client) ListEnvs(projectID string) ([]Env, error) {
	resp, err := c.do("GET", "/api/v1/projects/"+projectID+"/envs", nil)
	if err != nil {
		return nil, err
	}
	if err := checkStatus(resp); err != nil {
		return nil, err
	}
	var result struct {
		Envs []Env `json:"envs"`
	}
	if err := c.decodeJSON(resp, &result); err != nil {
		return nil, err
	}
	return result.Envs, nil
}

// ListKeys returns secret key names for a project and environment.
func (c *Client) ListKeys(projectID, env string) ([]SecretKey, error) {
	resp, err := c.do("GET", fmt.Sprintf("/api/v1/projects/%s/secrets?env=%s", projectID, env), nil)
	if err != nil {
		return nil, err
	}
	if err := checkStatus(resp); err != nil {
		return nil, err
	}
	var result struct {
		Secrets []SecretKey `json:"secrets"`
	}
	if err := c.decodeJSON(resp, &result); err != nil {
		return nil, err
	}
	return result.Secrets, nil
}

// ExportSecrets exports all key-value pairs for a project/env in the given format ("dotenv" or "json").
func (c *Client) ExportSecrets(projectID, env, format string) (string, error) {
	resp, err := c.do("GET", fmt.Sprintf("/api/v1/projects/%s/secrets/export?env=%s&format=%s", projectID, env, format), nil)
	if err != nil {
		return "", err
	}
	if err := checkStatus(resp); err != nil {
		return "", err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// SetSecret creates or updates a single secret.
func (c *Client) SetSecret(projectID, env, key, value string) error {
	body := map[string]string{"value": value, "env": env}
	resp, err := c.do("PUT", fmt.Sprintf("/api/v1/projects/%s/secrets/%s", projectID, key), body)
	if err != nil {
		return err
	}
	return checkStatus(resp)
}

// ImportSecrets bulk-imports key-value pairs.
func (c *Client) ImportSecrets(projectID, env string, secrets map[string]string) (*ImportResult, error) {
	body := map[string]any{"env": env, "secrets": secrets}
	resp, err := c.do("POST", fmt.Sprintf("/api/v1/projects/%s/secrets/import", projectID), body)
	if err != nil {
		return nil, err
	}
	if err := checkStatus(resp); err != nil {
		return nil, err
	}
	var result ImportResult
	if err := c.decodeJSON(resp, &result); err != nil {
		return nil, err
	}
	return &result, nil
}

// RevokeCurrentSession calls DELETE /api/v1/auth/sessions/current.
func (c *Client) RevokeCurrentSession() error {
	resp, err := c.do("DELETE", "/api/v1/auth/sessions/current", nil)
	if err != nil {
		return err
	}
	return checkStatus(resp)
}

// APIError represents an error returned by the API.
type APIError struct {
	StatusCode int
	Code       string
	Message    string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("API error %d (%s): %s", e.StatusCode, e.Code, e.Message)
}

func checkStatus(resp *http.Response) error {
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}
	defer resp.Body.Close()
	var body struct {
		Error   string `json:"error"`
		Message string `json:"message"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&body)
	return &APIError{
		StatusCode: resp.StatusCode,
		Code:       body.Error,
		Message:    body.Message,
	}
}
