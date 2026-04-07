<div align="center">

<img src="https://img.shields.io/badge/Jex-Secrets%20Manager-6366F1?style=for-the-badge&logoColor=white" alt="Jex" />

**Stop sharing `.env` files over Slack. Start using a vault.**

[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E.svg?style=flat-square)](LICENSE)
[![Go](https://img.shields.io/badge/CLI-Go-00ADD8?style=flat-square&logo=go&logoColor=white)](cli/)
[![TypeScript](https://img.shields.io/badge/API-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](apps/api/)
[![Next.js](https://img.shields.io/badge/Dashboard-Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](apps/web/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](apps/api/prisma/)
[![Self-hostable](https://img.shields.io/badge/Self--hostable-docker%20compose%20up-2496ED?style=flat-square&logo=docker&logoColor=white)](#quick-start)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-6366F1?style=flat-square)](CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/Status-In%20Development-F59E0B?style=flat-square)](#)

</div>

---

## What is Jex?

Jex is an **open-source secrets manager** for developer teams. It gives your team a shared encrypted vault where secrets are stored, versioned, and accessed by role — replacing the insecure habit of sharing `.env` files over chat.

```bash
# Inject secrets directly into any process — nothing written to disk
jex run -- npm start

# Pull secrets to a local .env file
jex secrets pull

# Push your existing .env to the vault
jex secrets push
```

Secrets are **encrypted with AES-256-GCM** before they ever reach the database. The server never stores plain text — ever.

---

## The Problem

Developer teams routinely share environment variables through insecure channels: Slack DMs, WhatsApp messages, emailed `.env` files. This creates:

| Problem | Impact |
|---------|--------|
| Secrets in chat history | Accessible to anyone with account access, forever |
| Manual rotation | Someone always misses an update — outages follow |
| `.env` files on disk | One `git add .` away from a public repo leak |
| No audit trail | No record of who accessed which secret, when |

Existing solutions (HashiCorp Vault, AWS Secrets Manager, Doppler) are either too complex, too expensive, or too cloud-dependent for small teams.

---

## Solution

Jex is **self-hostable**, **MIT-licensed**, and designed for the way developers actually work.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Jex Architecture                        │
│                                                                 │
│   Developer           CI/CD Pipeline         Team Owner        │
│       │                     │                     │            │
│       ▼                     ▼                     ▼            │
│  ┌─────────┐         ┌──────────┐          ┌──────────┐        │
│  │  Go CLI │         │  Token   │          │ Web Dash │        │
│  │  (jex)  │         │ (scoped) │          │(Next.js) │        │
│  └────┬────┘         └────┬─────┘          └────┬─────┘        │
│       └──────────┬────────┘                     │              │
│                  ▼                               │              │
│         ┌─────────────────────────────────────── ┘             │
│         │         Node.js / Express API                        │
│         │  AuthGateway → AccessPolicy → SecretsService         │
│         │               CryptoService → VaultStore             │
│         │                          ↕ AuditLog                  │
│         └───────────────────────────────────────               │
│                         PostgreSQL                              │
│                (AES-256-GCM encrypted at rest)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### For Developers
- **`jex run -- <command>`** — inject secrets into a subprocess without writing any file to disk
- **`jex secrets pull`** — download secrets to a local `.env` instantly
- **`jex secrets push`** — bulk-import an existing `.env` to the vault
- **`jex secrets set KEY=value`** — set a single secret from the terminal
- **`jex login`** — authenticate via browser OAuth (GitHub, Google) or token

### For Team Owners
- Role-based access control with three roles: **Owner**, **Developer**, **Read-only**
- Environment-scoped permissions: `dev`, `staging`, `prod`
- Invite teammates by email — no account required to receive an invite
- **Audit log** — every secret access event is recorded (who, what, when, which env)
- Full-featured web dashboard — no CLI required for management

### For CI/CD Pipelines
- Create scoped, environment-locked tokens from the dashboard
- Tokens are **revoked instantly** — no propagation delay, no cache
- Read-only by design — CI tokens cannot create or modify secrets

### Security Architecture
- **AES-256-GCM** encryption — secrets are encrypted before any database write
- **Zero plain text at rest** — `VaultStore` only ever receives ciphertext
- **Audit-first** — audit writes are inside the same transaction as secret writes; no silent failures
- **RBAC on every request** — `AccessPolicy` is called before any secret operation, no shortcuts
- **`jex run` never writes a file** — subprocess injection via `exec.Command` env only

---

## Quick Start

### Self-host with Docker

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex
docker-compose up
```

That's it. The API, web dashboard, and PostgreSQL database start together. Open `http://localhost:3000` to create your first account.

### Install the CLI

```bash
# npm (installs the correct binary for your platform automatically)
npm install -g @jex/cli

# Verify
jex --version
```

### First project setup

```bash
# Link your repo to a Jex project
jex init

# Pull secrets for your current environment
jex secrets pull

# Run your app with secrets injected — no .env file created
jex run -- npm run dev
```

---

## RBAC Matrix

| Operation | Owner | Developer | Read-only | CI Token |
|-----------|:-----:|:---------:|:---------:|:--------:|
| Read `dev` | ✅ | ✅ | ✅ | ✅ (if scoped) |
| Write `dev` | ✅ | ✅ | ❌ | ❌ |
| Read `staging` | ✅ | ✅ | ✅ | ✅ (if scoped) |
| Write `staging` | ✅ | ❌ | ❌ | ❌ |
| Read `prod` | ✅ | ❌ | ❌ | ✅ (if scoped) |
| Write `prod` | ✅ | ❌ | ❌ | ❌ |
| Manage members | ✅ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ | ❌ |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| CLI | **Go** + Cobra | Single self-contained binary; no runtime dependency for end users |
| API | **Node.js / Express** + TypeScript | Familiar, fast to iterate, excellent Prisma support |
| Dashboard | **Next.js 16** | App Router, server components, same repo as API |
| Auth | **Better Auth** | Self-hostable, ships TOTP 2FA plugin, has a Prisma adapter |
| Database | **PostgreSQL** via Prisma | Relational integrity for audit log; Prisma for type-safe queries |
| Encryption | **Node.js `crypto`** (AES-256-GCM) | No native addon; auditable; zero external dependency |
| Deploy | **Docker Compose** | One command for the full stack |

---

## Repository Structure

```
jex/
├── apps/
│   ├── api/                 # Node.js/Express backend (TypeScript)
│   │   ├── src/
│   │   │   ├── auth/        # AuthGateway — token validation, sessions
│   │   │   ├── access/      # AccessPolicy — RBAC enforcement
│   │   │   ├── crypto/      # CryptoService — AES-256-GCM
│   │   │   ├── secrets/     # SecretsService + routes
│   │   │   ├── audit/       # AuditLog — append-only event recorder
│   │   │   └── vault/       # VaultStore — all Prisma queries
│   │   └── prisma/
│   └── web/                 # Next.js 16 dashboard + landing + docs
├── cli/                     # Go binary — all jex commands
│   ├── cmd/
│   └── internal/
│       ├── api/             # HTTP client to the API
│       ├── config/          # .envault read/write
│       └── auth/            # Token storage (~/.jex/token)
├── docs/                    # Full engineering documentation
└── docker-compose.yml
```

---

## Documentation

| Document | Contents |
|----------|----------|
| [Requirements (PRD)](docs/01_requirements_prd.md) | What we're building and for whom |
| [SRS](docs/02_requirements_srs.md) | Precise functional and non-functional requirements |
| [Invariants](docs/03_design_contract_invariant.md) | What can never be false — security guarantees |
| [Architecture](docs/05_architecture.md) | Component design, data model, flows |
| [API Specification](docs/06_api_specification.md) | Every HTTP endpoint, schema, and error code |
| [Visual Identity](docs/07_visual_identity.md) | Design system — colors, typography, components |

---

## Contributing

Jex is in active development and contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, architecture rules, commit convention, and PR guidelines.

---

## Roadmap

- **v0.1** — MVP: vault, CLI, dashboard, RBAC, audit log, self-host *(in development)*
- **v0.2** — Secret versioning, `--watch` mode, git hook integration, French UI
- **Post v0.2** — Custom environments, secret expiry/TTL, TUI project picker

---

## License

MIT — free to use, self-host, and modify. See [LICENSE](LICENSE).

---

<div align="center">

Built for developer teams who move fast and take security seriously.

**[Get Started](#quick-start)** · **[Read the Docs](docs/)** · **[Open an Issue](https://github.com/mibienpanjoe/jex/issues)**

</div>
