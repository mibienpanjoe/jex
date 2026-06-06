package cmd

import (
	"fmt"
	"os"

	"github.com/charmbracelet/lipgloss"
	"github.com/jex-app/cli/internal/api"
	"github.com/jex-app/cli/internal/auth"
	"github.com/jex-app/cli/internal/config"
	"github.com/jex-app/cli/internal/errs"
	"github.com/spf13/cobra"
)

var envsCmd = &cobra.Command{
	Use:   "envs",
	Short: "List environments for the current project",
	RunE:  runEnvs,
}

var envsCreateCmd = &cobra.Command{
	Use:   "create NAME",
	Short: "Create an environment in the current project",
	Args:  cobra.ExactArgs(1),
	RunE:  runEnvCreate,
}

var envsDeleteCmd = &cobra.Command{
	Use:   "delete NAME",
	Short: "Delete an environment from the current project",
	Args:  cobra.ExactArgs(1),
	RunE:  runEnvDelete,
}

var envsUseCmd = &cobra.Command{
	Use:   "use NAME",
	Short: "Set the default environment in .envault",
	Args:  cobra.ExactArgs(1),
	RunE:  runEnvUse,
}

func init() {
	rootCmd.AddCommand(envsCmd)
	envsCmd.AddCommand(envsCreateCmd, envsDeleteCmd, envsUseCmd)
}

var (
	activeEnvStyle   = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("10"))
	inactiveEnvStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("7"))
	countStyle       = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
)

func runEnvs(cmd *cobra.Command, args []string) error {
	allowInsecure, _ := cmd.Flags().GetBool("allow-insecure")

	cfg, err := config.Read()
	if err != nil {
		fmt.Fprintln(os.Stderr, "No .envault found. Run jex init.")
		os.Exit(1)
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

	envs, err := client.ListEnvs(cfg.Project)
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	for _, e := range envs {
		active := e.Name == cfg.DefaultEnv
		marker := "  "
		if active {
			marker = "* "
		}
		nameStr := e.Name
		if active {
			nameStr = activeEnvStyle.Render(marker + nameStr)
		} else {
			nameStr = inactiveEnvStyle.Render(marker + nameStr)
		}
		fmt.Printf("%s  %s\n", nameStr, countStyle.Render(fmt.Sprintf("(%d secrets)", e.SecretsCount)))
	}
	return nil
}

func runEnvCreate(cmd *cobra.Command, args []string) error {
	client, cfg := envClient(cmd)
	env, err := client.CreateEnv(cfg.Project, args[0])
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	fmt.Printf("Created environment %s.\n", env.Name)
	return nil
}

func runEnvDelete(cmd *cobra.Command, args []string) error {
	client, cfg := envClient(cmd)
	envName := args[0]
	if err := client.DeleteEnv(cfg.Project, envName); err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	if cfg.DefaultEnv == envName {
		fmt.Fprintf(os.Stderr, "Deleted the active environment. Run jex envs use NAME to select another default.\n")
	}
	fmt.Printf("Deleted environment %s.\n", envName)
	return nil
}

func runEnvUse(cmd *cobra.Command, args []string) error {
	allowInsecure, _ := cmd.Flags().GetBool("allow-insecure")
	cfg, path, err := config.ReadWithPath()
	if err != nil {
		fmt.Fprintln(os.Stderr, "No .envault found. Run jex init.")
		os.Exit(1)
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

	envName := args[0]
	envs, err := client.ListEnvs(cfg.Project)
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	found := false
	for _, env := range envs {
		if env.Name == envName {
			found = true
			break
		}
	}
	if !found {
		return fmt.Errorf("environment %s does not exist in this project", envName)
	}

	if err := config.WriteAt(path, cfg.Project, envName, cfg.APIURL); err != nil {
		return fmt.Errorf("failed to update .envault: %w", err)
	}

	fmt.Printf("Default environment set to %s.\n", envName)
	return nil
}

func envClient(cmd *cobra.Command) (*api.Client, *config.Envault) {
	allowInsecure, _ := cmd.Flags().GetBool("allow-insecure")

	cfg, err := config.Read()
	if err != nil {
		fmt.Fprintln(os.Stderr, "No .envault found. Run jex init.")
		os.Exit(1)
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

	return client, cfg
}
