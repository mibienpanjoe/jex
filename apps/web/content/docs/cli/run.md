# jex run

Run a command with secrets injected into the environment — without writing them to disk.

## Usage

```bash
jex run [flags] -- <command> [args...]
```

## Behavior

1. Reads `.envault` to determine the project ID and default environment
2. Fetches secrets from the API (`GET /projects/:id/secrets/export?format=json`)
3. Builds an environment slice: `os.Environ()` + fetched secrets
4. Executes `<command>` with `cmd.Env = envSlice`
5. Passes `stdin`, `stdout`, and `stderr` through
6. Exits with the child process's exit code

**No file is ever written to disk.** Secrets live only in the process environment.

## Flags

| Flag | Description |
|------|-------------|
| `--env` | Override the default environment from `.envault` |
| `--allow-insecure` | Allow HTTP (non-TLS) API connections |

## Examples

```bash
# Run your dev server with dev secrets
jex run -- npm run dev

# Run with a specific environment
jex run --env staging -- node server.js

# Run a one-off script
jex run -- python scripts/migrate.py

# Pass arguments to the command
jex run -- docker build --build-arg TAG=latest .
```

## Environment override via variable

Since `jex run` disables flag parsing for the child command, you can also
override the environment using the `JEX_ENV` environment variable:

```bash
JEX_ENV=staging jex run -- node server.js
```

## Exit codes

`jex run` exits with the same exit code as the child process. A connection error
or authentication failure exits with code `1`.

## Security invariants

- Secrets are **never written to disk** (not even to `/tmp`)
- Secrets are **not logged** to stdout or stderr by `jex run`
- The fetch happens over HTTPS; HTTP is rejected unless `--allow-insecure` is set

## See also

- [`jex secrets pull`](/docs/cli/secrets) — write secrets to `.env` instead
- [`jex init`](/docs/cli/init) — set up `.envault` first
