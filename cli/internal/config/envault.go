package config

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
)

const filename = ".envault"

// Envault holds the contents of the .envault config file.
// It contains no secrets — only project reference, default environment, and API URL (INV-15).
type Envault struct {
	Project    string `toml:"project"`
	DefaultEnv string `toml:"defaultEnv"`
	APIURL     string `toml:"apiURL"`
}

// Read walks up the directory tree from the current directory to find and parse .envault.
func Read() (*Envault, error) {
	dir, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	for {
		candidate := filepath.Join(dir, filename)
		if _, err := os.Stat(candidate); err == nil {
			var cfg Envault
			if _, err := toml.DecodeFile(candidate, &cfg); err != nil {
				return nil, fmt.Errorf("failed to parse %s: %w", candidate, err)
			}
			return &cfg, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return nil, fmt.Errorf("no .envault found. Run jex init")
}

// Write creates or overwrites .envault in the current directory.
// Only project, defaultEnv, and apiURL are written — never secrets (INV-15).
func Write(project, defaultEnv, apiURL string) error {
	cfg := Envault{
		Project:    project,
		DefaultEnv: defaultEnv,
		APIURL:     apiURL,
	}
	f, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer f.Close()
	return toml.NewEncoder(f).Encode(cfg)
}
