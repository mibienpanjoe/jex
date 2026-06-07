# Jex Documentation

**Jex** is an open-source secrets manager for developer teams.

Three layers work together:

- **Encrypted vault** — PostgreSQL database; every secret encrypted with AES-256-GCM before storage
- **Go CLI** (`jex`) — install, run, and inject secrets directly into process environments
- **Next.js dashboard** — manage projects, environments, team members, and tokens

## Why Jex?

Your team almost certainly has a secret problem. Credentials shared over Slack, stale `.env` files on developer laptops, API keys hardcoded in CI config. Jex replaces all of these with a single, auditable source of truth.

The CLI's `jex run` command means **secrets never touch disk** in your development workflow — they're injected directly into the child process environment.

## Quick links

- [Installation](/en/docs/getting-started/installation)
- [Quick start](/en/docs/getting-started/quick-start)
- [CLI reference](/en/docs/cli/login)
- [Self-hosting](/en/docs/self-hosting)
