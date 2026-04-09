package secrets

import "github.com/spf13/cobra"

// SecretsCmd is the parent command for all secret operations.
var SecretsCmd = &cobra.Command{
	Use:   "secrets",
	Short: "Manage secrets in the vault",
}

func init() {
	SecretsCmd.AddCommand(PullCmd, PushCmd, SetCmd, ListCmd)
}
