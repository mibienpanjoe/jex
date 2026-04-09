package auth

import (
	"fmt"
	"os"
	"path/filepath"
)

func tokenPath() (string, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, ".jex", "token"), nil
}

// Save writes the token to ~/.jex/token with 0600 permissions.
func Save(token string) error {
	path, err := tokenPath()
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0700); err != nil {
		return err
	}
	return os.WriteFile(path, []byte(token), 0600)
}

// Load reads the token from ~/.jex/token.
func Load() (string, error) {
	path, err := tokenPath()
	if err != nil {
		return "", err
	}
	b, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("not authenticated. Run jex login")
		}
		return "", err
	}
	return string(b), nil
}

// Clear deletes the token file.
func Clear() error {
	path, err := tokenPath()
	if err != nil {
		return err
	}
	err = os.Remove(path)
	if err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}
