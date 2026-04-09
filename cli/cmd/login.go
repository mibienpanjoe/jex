package cmd

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os/exec"
	"runtime"

	"github.com/jex-app/cli/internal/auth"
	"github.com/spf13/cobra"
)

var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Authenticate with the Jex API",
	RunE:  runLogin,
}

func init() {
	rootCmd.AddCommand(loginCmd)
}

func runLogin(cmd *cobra.Command, args []string) error {
	apiURL, _ := cmd.Flags().GetString("api-url")

	// Start a local callback server on a random port.
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return fmt.Errorf("cannot start local callback server: %w", err)
	}
	port := ln.Addr().(*net.TCPAddr).Port

	tokenCh := make(chan string, 1)
	errCh := make(chan error, 1)

	mux := http.NewServeMux()
	mux.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Token string `json:"token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Token == "" {
			// Also support token as query param.
			body.Token = r.URL.Query().Get("token")
		}
		if body.Token == "" {
			http.Error(w, "missing token", http.StatusBadRequest)
			errCh <- fmt.Errorf("no token received in callback")
			return
		}
		fmt.Fprintln(w, "Logged in. You can close this tab.")
		tokenCh <- body.Token
	})

	srv := &http.Server{Handler: mux}
	go func() {
		_ = srv.Serve(ln)
	}()

	callbackURL := fmt.Sprintf("http://127.0.0.1:%d/callback", port)
	loginURL := fmt.Sprintf("%s/api/v1/auth/cli-callback?redirect=%s", apiURL, callbackURL)

	fmt.Printf("Opening browser to log in...\nIf it does not open, visit:\n  %s\n", loginURL)
	openBrowser(loginURL)

	select {
	case token := <-tokenCh:
		_ = srv.Close()
		if err := auth.Save(token); err != nil {
			return fmt.Errorf("failed to save token: %w", err)
		}
		fmt.Println("Logged in successfully.")
	case err := <-errCh:
		_ = srv.Close()
		return err
	}
	return nil
}

func openBrowser(url string) {
	var cmd string
	var args []string
	switch runtime.GOOS {
	case "darwin":
		cmd, args = "open", []string{url}
	case "windows":
		cmd, args = "cmd", []string{"/c", "start", url}
	default:
		cmd, args = "xdg-open", []string{url}
	}
	_ = exec.Command(cmd, args...).Start()
}
