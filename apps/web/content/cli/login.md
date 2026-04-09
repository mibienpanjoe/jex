# jex login

Authenticate the CLI with your Jex account.

## Usage

```bash
jex login [flags]
```

## Behavior

1. Opens your system browser to `<apiURL>/api/v1/auth/cli-callback`
2. Starts a local HTTP callback server on a random port
3. After you authenticate in the browser, the API redirects back with a token
4. The token is saved to `~/.jex/token` with `0600` permissions
5. Prints: `Logged in successfully.`

On headless systems (CI, SSH), the login URL is printed to stdout if the
browser cannot be opened. You can paste it into a browser on another machine.

## Flags

| Flag | Description |
|------|-------------|
| `--api-url` | Base URL of the Jex API (default: `https://api.jex.app`) |

## Examples

```bash
# Default (Jex cloud)
jex login

# Self-hosted instance
jex login --api-url https://jex.yourcompany.com
```

## Token storage

The token file lives at `~/.jex/token`. It is a plain bearer token string.
Never commit this file. Jex adds `~/.jex/` to your global gitignore by convention.

## See also

- [`jex logout`](/docs/cli/logout) — revoke the current session
- [`jex init`](/docs/cli/init) — initialize a project after logging in
