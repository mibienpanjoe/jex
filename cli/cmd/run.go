package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"syscall"

	"github.com/jex-app/cli/internal/api"
	"github.com/jex-app/cli/internal/auth"
	"github.com/jex-app/cli/internal/config"
	"github.com/jex-app/cli/internal/errs"
	"github.com/spf13/cobra"
)

var runCmd = &cobra.Command{
	Use:                "run -- <command> [args...]",
	Short:              "Run a command with secrets injected into the environment",
	DisableFlagParsing: true,
	RunE:               runRun,
}

func init() {
	rootCmd.AddCommand(runCmd)
}

func runRun(cmd *cobra.Command, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: jex run -- <command> [args...]")
	}

	// Strip leading "--" separator if present.
	if args[0] == "--" {
		args = args[1:]
	}
	if len(args) == 0 {
		return fmt.Errorf("usage: jex run -- <command> [args...]")
	}

	cfg, err := config.Read()
	if err != nil {
		fmt.Fprintln(os.Stderr, "No .envault found. Run jex init.")
		os.Exit(1)
	}

	// --env flag is not available since DisableFlagParsing=true; use env var JEX_ENV as override.
	env := cfg.DefaultEnv
	if override := os.Getenv("JEX_ENV"); override != "" {
		env = override
	}

	token, err := auth.Load()
	if err != nil {
		fmt.Fprintln(os.Stderr, "Not authenticated. Run jex login.")
		os.Exit(1)
	}

	allowInsecure := os.Getenv("JEX_ALLOW_INSECURE") == "1"
	client, err := api.New(cfg.APIURL, token, allowInsecure)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	// Fetch secrets as JSON to avoid any file-format ambiguity (INV-13).
	raw, err := client.ExportSecrets(cfg.Project, env, "json")
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	var secrets map[string]string
	if err := json.Unmarshal([]byte(raw), &secrets); err != nil {
		return fmt.Errorf("unexpected response format from API: %w", err)
	}

	// Build env slice: inherit current environment, then overlay secrets.
	envSlice := os.Environ()
	for k, v := range secrets {
		envSlice = append(envSlice, k+"="+v)
	}

	// Execute the child process — never write secrets to disk (INV-13).
	c := exec.Command(args[0], args[1:]...)
	c.Env = envSlice
	c.Stdin = os.Stdin
	c.Stdout = os.Stdout
	c.Stderr = os.Stderr

	if err := c.Run(); err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			if status, ok := exitErr.Sys().(syscall.WaitStatus); ok {
				os.Exit(status.ExitStatus())
			}
		}
		os.Exit(1)
	}
	return nil
}
