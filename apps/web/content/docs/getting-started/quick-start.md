# Quick Start

This guide walks you through the complete developer workflow in under five minutes.

## 1. Install the CLI

```bash
npm install -g @jex/cli
```

## 2. Log in

```bash
jex login
```

This opens your browser to the Jex login page. After authenticating, a token is
saved to `~/.jex/token` with 0600 permissions. You only need to do this once per machine.

## 3. Initialize your project

Run this from the root of your project directory:

```bash
jex init
```

You'll be shown a list of your Jex projects and environments to choose from.
This creates a `.envault` file in the current directory:

```toml
project    = "my-app-id"
defaultEnv = "dev"
apiURL     = "https://api.jex.app"
```

The `.envault` file contains no secrets — only a project reference and default
environment. Commit it to version control.

## 4. Add secrets

You can add secrets from the dashboard or directly via the CLI:

```bash
jex secrets set DATABASE_URL=postgres://user:pass@host/mydb
jex secrets set REDIS_URL=redis://localhost:6379
```

## 5. Pull secrets to a local .env

```bash
jex secrets pull
# Pulled 2 secrets to .env
```

This writes an atomic `.env` file using a temp-file-then-rename strategy.
Add `.env` to your `.gitignore`.

## 6. Run your app with secrets injected

The recommended workflow — **no .env file written**:

```bash
jex run -- npm run dev
```

`jex run` fetches secrets over HTTPS, injects them into the child process
environment, and starts your app. No file is written to disk at any point.

## 7. Push secrets from an existing .env

If you have an existing `.env` file you want to migrate to the vault:

```bash
jex secrets push
# Pushed 8 secrets (8 created, 0 updated).
```

## Typical workflow

```bash
# Morning: pull the latest secrets before starting work
jex secrets pull

# Or: use jex run for a no-disk-write workflow
jex run -- npm run dev

# When you add a new secret:
jex secrets set MY_NEW_KEY=value

# Check what environments your project has:
jex envs

# List the secrets in the current environment:
jex secrets list
```

## Next steps

- [CLI reference](/docs/cli/login) — full list of commands and flags
- [Environments](/docs/environments) — managing dev / staging / prod
- [Access control](/docs/access-control) — inviting teammates and RBAC
- [CI/CD integration](/docs/ci-cd) — scoped tokens for pipelines
