package secrets

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

var ListCmd = &cobra.Command{
	Use:   "list",
	Short: "List secret key names in the current environment",
	RunE:  runList,
}

var (
	headerStyle = lipgloss.NewStyle().Bold(true).Foreground(lipgloss.Color("12"))
	keyStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("7"))
	dimStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
)

func runList(cmd *cobra.Command, args []string) error {
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

	keys, err := client.ListKeys(cfg.Project, env)
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	fmt.Println(headerStyle.Render(fmt.Sprintf("Secrets in %s (%d)", env, len(keys))))
	fmt.Println(dimStyle.Render("─────────────────────────"))
	for _, k := range keys {
		fmt.Println(keyStyle.Render("  " + k.Key))
	}
	return nil
}
