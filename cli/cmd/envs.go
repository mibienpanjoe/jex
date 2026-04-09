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

func init() {
	rootCmd.AddCommand(envsCmd)
}

var (
	activeEnvStyle  = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("10"))
	inactiveEnvStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("7"))
	countStyle      = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
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
