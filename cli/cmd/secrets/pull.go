package secrets

import (
	"fmt"
	"os"
	"strings"

	"github.com/jex-app/cli/internal/api"
	"github.com/jex-app/cli/internal/auth"
	"github.com/jex-app/cli/internal/config"
	"github.com/jex-app/cli/internal/errs"
	"github.com/spf13/cobra"
)

var PullCmd = &cobra.Command{
	Use:   "pull",
	Short: "Pull secrets and write them atomically to .env",
	RunE:  runPull,
}

func runPull(cmd *cobra.Command, args []string) error {
	allowInsecure, _ := cmd.Flags().GetBool("allow-insecure")
	envOverride, _ := cmd.Flags().GetString("env")

	cfg, err := config.Read()
	if err != nil {
		fmt.Fprintln(os.Stderr, "No .envault found. Run jex init.")
		os.Exit(1)
	}

	env := cfg.DefaultEnv
	if envOverride != "" {
		env = envOverride
	}

	token, err := auth.Load()
	if err != nil {
		fmt.Fprintln(os.Stderr, "Not authenticated. Run jex login.")
		os.Exit(1)
	}

	client, err := api.New(cfg.APIURL, token, allowInsecure)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	content, err := client.ExportSecrets(cfg.Project, env, "dotenv")
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	// Count the number of secrets (non-empty, non-comment lines).
	n := 0
	for _, line := range strings.Split(content, "\n") {
		line = strings.TrimSpace(line)
		if line != "" && !strings.HasPrefix(line, "#") {
			n++
		}
	}

	// Atomic write: write to temp file then rename (INV-14).
	tmp, err := os.CreateTemp(".", ".env.tmp")
	if err != nil {
		return fmt.Errorf("failed to create temp file: %w", err)
	}
	tmpName := tmp.Name()

	if _, err := tmp.WriteString(content); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		return fmt.Errorf("failed to write temp file: %w", err)
	}
	if err := tmp.Close(); err != nil {
		os.Remove(tmpName)
		return err
	}

	if err := os.Rename(tmpName, ".env"); err != nil {
		os.Remove(tmpName)
		return fmt.Errorf("failed to rename temp file: %w", err)
	}

	fmt.Printf("Pulled %d secrets to .env\n", n)
	return nil
}
