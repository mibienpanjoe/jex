package cmd

import (
	"fmt"
	"os"

	"github.com/jex-app/cli/cmd/secrets"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "jex",
	Short: "Jex — secrets manager CLI",
	Long:  "Jex is an open-source secrets manager for developer teams.",
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("jex v0.1.0")
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().String("api-url", "https://api.jex.app", "Jex API base URL")
	rootCmd.PersistentFlags().Bool("allow-insecure", false, "Allow HTTP (non-TLS) API connections")
	rootCmd.PersistentFlags().String("env", "", "Override the default environment from .envault")

	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(secrets.SecretsCmd)
}
