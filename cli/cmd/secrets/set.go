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

var SetCmd = &cobra.Command{
	Use:   "set KEY=value",
	Short: "Set a single secret",
	Args:  cobra.ExactArgs(1),
	RunE:  runSet,
}

func runSet(cmd *cobra.Command, args []string) error {
	allowInsecure, _ := cmd.Flags().GetBool("allow-insecure")
	envOverride, _ := cmd.Flags().GetString("env")

	pair := args[0]
	idx := strings.Index(pair, "=")
	if idx < 1 {
		return fmt.Errorf("argument must be in KEY=value format")
	}
	key := pair[:idx]
	value := pair[idx+1:]

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

	if err := client.SetSecret(cfg.Project, env, key, value); err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	fmt.Printf("Set %s in %s.\n", key, env)
	return nil
}
