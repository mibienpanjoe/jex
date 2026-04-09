package secrets

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/jex-app/cli/internal/api"
	"github.com/jex-app/cli/internal/auth"
	"github.com/jex-app/cli/internal/config"
	"github.com/jex-app/cli/internal/errs"
	"github.com/spf13/cobra"
)

var PushCmd = &cobra.Command{
	Use:   "push",
	Short: "Push secrets from local .env file to the vault",
	RunE:  runPush,
}

func runPush(cmd *cobra.Command, args []string) error {
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

	secrets, err := parseDotenv(".env")
	if err != nil {
		return fmt.Errorf("failed to parse .env: %w", err)
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

	result, err := client.ImportSecrets(cfg.Project, env, secrets)
	if err != nil {
		fmt.Fprintln(os.Stderr, errs.Handle(err, cfg.APIURL))
		os.Exit(1)
	}

	fmt.Printf("Pushed %d secrets (%d created, %d updated).\n", result.Created+result.Updated, result.Created, result.Updated)
	return nil
}

// parseDotenv parses a .env file into a map of key-value pairs.
func parseDotenv(path string) (map[string]string, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	m := make(map[string]string)
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		idx := strings.Index(line, "=")
		if idx < 0 {
			continue
		}
		key := strings.TrimSpace(line[:idx])
		val := strings.TrimSpace(line[idx+1:])
		// Strip surrounding quotes.
		if len(val) >= 2 && ((val[0] == '"' && val[len(val)-1] == '"') || (val[0] == '\'' && val[len(val)-1] == '\'')) {
			val = val[1 : len(val)-1]
		}
		m[key] = val
	}
	return m, scanner.Err()
}
