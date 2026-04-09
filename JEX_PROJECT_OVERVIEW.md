# Jex — Project Overview

> **Share secrets, not .env files.**

---

## What is Jex?

Jex is an open source secrets manager built for developer teams. It solves a problem every team faces: sharing environment variables securely. Instead of sending `.env` files over WhatsApp, Slack, or email, Jex gives teams a single encrypted vault where secrets are stored, managed, and accessed safely — from local development all the way to production deployments.

---

## The Problem

When working in a team, sharing environment variables is painful and insecure:

- A new teammate joins and asks: *"can you send me the .env file?"*
- Someone rotates an API key and has to notify everyone manually
- A secret accidentally gets committed to git
- Nobody knows who changed what, and when
- Local `.env` files get out of sync across the team

Jex eliminates all of this.

---

## How It Works

Jex has three layers that work together:

**The Vault** stores encrypted key-value pairs per project, per environment. Secrets are never stored in plain text — not even in the database. Every project gets its own isolated vault.

**The CLI** (`jex`) is how developers interact with the vault from their terminal. They can pull secrets into a local `.env` file, push changes back to the vault, or — most powerfully — inject secrets directly into a running process without ever writing them to disk.

**The Web Dashboard** is where teams manage projects, invite members, assign roles, and review the full audit trail of who accessed what and when.

---

## Key Features

- **Environment segmentation** — `dev`, `staging`, and `prod` are separate namespaces inside each project vault. A developer can never accidentally pull production credentials.
- **Role-based access control** — Owners have full access. Developers can read and write dev, read staging. Production is owner-gated only.
- **Secure secret injection** — The `jex run` command injects secrets directly into a process as environment variables. No `.env` file is created. Nothing touches disk.
- **Auto-sync via git hooks** — `jex init` optionally installs git hooks so secrets update automatically on every `git pull` or branch switch.
- **CI/CD support** — Scoped read-only tokens for GitHub Actions, Docker. Revokable at any time without touching pipeline configuration.
- **Full audit trail** — Every pull, push, set, and delete is logged with the user, timestamp, and affected key.
- **Custom environments** — Teams can define their own environments beyond the defaults (e.g. `preview`, `test`, `demo`).

---

## Developer Workflow

### First time setup (once per machine)

Install the CLI globally and authenticate:

```
npm install -g @jex/cli
jex login
```

### Project setup (once per project)

Inside any project folder, link it to the vault:

```
jex init
```

This creates a `.envault` config file that gets committed to git. It contains no secrets — just the project name and default environment.

### Daily development

Pull secrets into a local `.env` file:

```
jex secrets pull
```

Or inject directly into a process — the recommended approach:

```
jex run -- npm run dev
```

### Updating a secret

```
jex secrets set STRIPE_KEY=sk_live_newkey --env prod
```

Every teammate automatically gets the updated value next time they pull or run.

### New teammate onboards

They clone the repo, install the CLI, log in, and pull:

```
jex secrets pull
```

No group chats. No forwarded files. No stale credentials.

---

## CLI Command Reference

| Command | What it does |
|---|---|
| `jex login` | Authenticate with your account |
| `jex logout` | Sign out |
| `jex init` | Link current folder to a vault project |
| `jex run -- <command>` | Inject secrets into a process without writing to disk |
| `jex secrets pull` | Download secrets to a local `.env` file |
| `jex secrets pull --watch` | Stay in sync — re-pull when secrets change |
| `jex secrets push` | Upload a local `.env` file to the vault |
| `jex secrets set KEY=value` | Set a single secret inline |
| `jex secrets list` | List key names (never values) |
| `jex envs` | List available environments for the project |

All commands support an `--env` flag. If omitted, the default environment from `.envault` is used.

---

## Architecture

### Frontend
- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (`jex.vercel.app`)
- **Internationalization:** next-intl for bilingual support (English and French)
- **Docs engine:** Nextra for the documentation site

The entire frontend lives under one Vercel deployment, split across three routes:

| Route | Purpose |
|---|---|
| `jex.vercel.app` | Landing page (bilingual) |
| `jex.vercel.app/dashboard` | Web app for managing secrets |
| `jex.vercel.app/docs` | Documentation site |

### Backend
- **Runtime:** Node.js
- **Framework:** Express or NestJS
- **Hosting:** Render or Railway (free tier)

### Database
- **Engine:** PostgreSQL via Neon (serverless, free tier)
- **ORM:** Prisma

### Authentication
- **Provider:** Better Auth (open source, self-hostable)
- **Methods:** Email/password, GitHub OAuth, Google OAuth
- **Security:** Two-factor authentication support via Better Auth plugin

### CLI
- **Language:** Go
- **Libraries:** Cobra (commands), Bubble Tea (interactive TUI),lipgloss
- **Distribution:** npm scoped public package (`@jex/cli`)
- **Binary name:** `jex` — users type `jex` in the terminal regardless of the package name
- **Install command:** `npm install -g @jex/cli`

### Encryption
- **Algorithm:** AES-256-GCM
- **Library:** Node.js built-in `crypto` or `libsodium`
- Secrets are encrypted before storage — the server never holds plain text values

---

## Environment Segmentation

Each project has isolated environments. The same key (e.g. `DB_URL`) exists independently per environment with a different value. Environments never share secret values — only key names.

| Environment | Access level | Typical use |
|---|---|---|
| `dev` | All members — read + write | Local development |
| `staging` | Devs read only, leads read + write | Pre-production QA |
| `prod` | Owners only + CI/CD token | Live application |

Teams can add custom environments at any time.

---

## Access Control

| Role | dev | staging | prod |
|---|---|---|---|
| Owner | read + write | read + write | read + write |
| Developer | read + write | read only | no access |
| Read-only | read only | read only | no access |
| CI/CD token | — | — | read only (scoped) |

CI/CD tokens are project-scoped, environment-scoped, and read-only. They can be revoked instantly from the dashboard.

---

## Bilingual Support

Jex targets developer teams across the world, with a specific focus on the African tech community — a large portion of which is francophone. Jex is the first secrets manager to offer a fully bilingual experience in English and French.

**What is bilingual:**
- Landing page — fully translated in both languages
- Web dashboard — all UI strings translated
- Documentation — maintained in both languages
- Error messages from the CLI — translated based on system locale

**How it works technically:**

Next.js built-in i18n routing handles language detection and URL structure automatically. UI strings are managed through `next-intl` with one JSON file per language. The documentation pages are maintained as separate markdown files per language.

```
jex.vercel.app/en/docs    → English documentation
jex.vercel.app/fr/docs    → French documentation
```

A language switcher in the navbar lets users toggle between English and French at any time. The selected language is persisted across sessions.

**Launch plan:** English ships with v0.1. French ships with v0.2 to avoid blocking the initial release while keeping the architecture bilingual-ready from day one.

---

## Documentation Site

Good documentation is non-negotiable for an open source CLI tool. Jex ships a dedicated docs site built with Nextra — a Next.js based documentation framework that renders markdown into a clean, searchable site. It lives at `jex.vercel.app/docs` and is deployed alongside the main frontend on Vercel at no extra cost.

### Structure

```
docs/
  getting-started/
    installation.md
    quick-start.md
  cli/
    login.md
    init.md
    run.md
    secrets.md
    envs.md
  environments.md
  access-control.md
  ci-cd.md
  self-hosting.md
  faq.md
```

### What the docs cover

- **Getting started** — install the CLI, create an account, link a project, pull your first secrets in under 5 minutes
- **CLI reference** — every command documented with flags, examples, and expected output
- **Environments** — how dev, staging and prod are segmented and what access each role has
- **CI/CD guides** — step-by-step setup for GitHub Actions, Docker Compose
- **Self-hosting** — how to run the full Jex stack on your own server with Docker
- **FAQ** — common questions about security, encryption, and team management

---

## Open Source Philosophy

Jex is fully open source under the **MIT license**.

**Why open source?**

Secrets managers require trust. The only way to earn that trust is full transparency — any developer can read the source code and verify that Jex never logs, transmits, or exposes their secrets. There are no hidden telemetry calls, no analytics, no ads.

**Self-hosting**

Because Jex is open source, any team can run it on their own infrastructure. A `docker-compose.yml` will be provided so the entire stack (API, frontend, database) can be spun up locally with a single command. This is especially valuable for teams with data sovereignty requirements or limited cloud budgets.

**Hosted version**

A free hosted version at `jex.vercel.app` is available for teams that don't want to manage their own infrastructure. The hosted version is identical to the self-hosted version — same codebase, no proprietary features locked behind a paywall.

---

## Roadmap

### v0.1 — Core
- [ ] Project and environment management
- [ ] Secret CRUD (create, read, update, delete)
- [ ] Role-based access control
- [ ] Basic CLI (`login`, `init`, `pull`, `push`, `run`)
- [ ] Better Auth integration
- [ ] Audit log

### v0.2 — Team experience & French language
- [ ] Team invitations via email
- [ ] Secret versioning and rollback
- [ ] Git hook auto-install on `jex init`
- [ ] `--watch` mode for auto-sync
- [ ] TUI project picker (Bubble Tea)
- [ ] Full French translation (dashboard + landing page)
- [ ] French documentation


---

## Built by

**PARE Mibienpan Joseph** — Software developer and CS student based in Burkina Faso.
GitHub: [@mibienpanjoe](https://github.com/mibienpanjoe)
