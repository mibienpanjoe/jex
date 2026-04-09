package errs

import (
	"fmt"
	"strings"

	"github.com/jex-app/cli/internal/api"
)

// Handle converts API and network errors to user-friendly messages.
func Handle(err error, apiURL string) error {
	if err == nil {
		return nil
	}
	if apiErr, ok := err.(*api.APIError); ok {
		switch apiErr.StatusCode {
		case 401:
			return fmt.Errorf("not authenticated. Run jex login")
		case 403:
			return fmt.Errorf("permission denied")
		}
		return fmt.Errorf("API error: %s", apiErr.Message)
	}
	msg := err.Error()
	if strings.Contains(msg, "cannot connect to Jex API") {
		return fmt.Errorf("cannot connect to Jex API at %s", apiURL)
	}
	return err
}
