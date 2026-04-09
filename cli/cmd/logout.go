package cmd

import (
	"fmt"
	"os"

	"github.com/jex-app/cli/internal/api"
	"github.com/jex-app/cli/internal/auth"
	"github.com/jex-app/cli/internal/errs"
	"github.com/spf13/cobra"
)

var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Revoke the current session and remove local credentials",
	RunE:  runLogout,
}

func init() {
	rootCmd.AddCommand(logoutCmd)
}

func runLogout(cmd *cobra.Command, args []string) error {
	apiURL, _ := cmd.Flags().GetString("api-url")
	allowInsecure, _ := cmd.Flags().GetBool("allow-insecure")

	token, err := auth.Load()
	if err != nil {
		// Already logged out locally; clear anyway.
		_ = auth.Clear()
		fmt.Println("Logged out.")
		return nil
	}

	client, err := api.New(apiURL, token, allowInsecure)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	if err := client.RevokeCurrentSession(); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: could not revoke session on server: %s\n", errs.Handle(err, apiURL))
	}

	if err := auth.Clear(); err != nil {
		return fmt.Errorf("failed to clear local token: %w", err)
	}

	fmt.Println("Logged out.")
	return nil
}
