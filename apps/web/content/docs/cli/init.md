# jex init

Initialize a `.envault` file in the current directory.

## Usage

```bash
jex init [flags]
```

## Behavior

1. Fetches the list of projects you belong to via the API
2. If multiple projects exist, shows an interactive selector (arrow keys to navigate, Enter to confirm)
3. Fetches the list of environments for the selected project
4. Shows an interactive selector for the default environment
5. Writes `.envault` to the current directory:

```toml
project    = "proj_abc123"
defaultEnv = "dev"
apiURL     = "https://api.jex.app"
```

6. Prints: `Initialized. .envault created.`

## The .envault file

`.envault` contains **no secrets** — only:
- `project`: the project ID
- `defaultEnv`: the environment used when `--env` is not specified
- `apiURL`: the API base URL

You should **commit `.envault`** to version control. It is safe to do so.

## Flags

| Flag | Description |
|------|-------------|
| `--api-url` | Override the API URL stored in `.envault` |

## Finding .envault

All Jex commands walk up the directory tree to find `.envault`, the same way
`git` finds `.git`. You can run `jex secrets pull` from any subdirectory of
your project.

## See also

- [`jex secrets pull`](/docs/cli/secrets) — pull secrets after initializing
- [`jex envs`](/docs/cli/envs) — list available environments
