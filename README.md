<div align="center">

<img src="apps/site/public/brand/jex-pangolin-mark.svg" alt="Jex logo" width="96" />

# Jex

**Stop sharing `.env` files over chat. Start using a vault.**

[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E.svg?style=flat-square)](LICENSE)
[![Go](https://img.shields.io/badge/CLI-Go-00ADD8?style=flat-square&logo=go&logoColor=white)](cli/)
[![TypeScript](https://img.shields.io/badge/API-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](apps/api/)
[![Next.js](https://img.shields.io/badge/Dashboard-Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](apps/web/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](apps/api/prisma/)
[![Self-hostable](https://img.shields.io/badge/Self--hostable-docker%20compose%20up-2496ED?style=flat-square&logo=docker&logoColor=white)](#quick-start)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-6366F1?style=flat-square)](CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/Status-In%20Development-F59E0B?style=flat-square)](#)

**[Website](https://site-henna-rho-78.vercel.app)** · **[Docs](https://site-henna-rho-78.vercel.app/en/docs)** · **[Self-hosting](https://site-henna-rho-78.vercel.app/en/docs/self-hosting)**

</div>

---

## What is Jex?

Jex is an **open-source secrets manager** for developer teams. It gives your team a shared encrypted vault where secrets are stored, versioned, and accessed by role, replacing the insecure habit of sharing `.env` files over chat.

Jex is self-hosted infrastructure. The public website hosts only the landing page and documentation; teams run their own API, dashboard, PostgreSQL database, encryption key, backups, and access controls.

---

## The Problem

Developer teams routinely share environment variables through insecure channels: Slack DMs, WhatsApp messages, emailed `.env` files. This creates:

| Problem | Impact |
|---------|--------|
| Secrets in chat history | Accessible to anyone with account access, forever |
| Manual rotation | Someone always misses an update, then outages follow |
| `.env` files on disk | One `git add .` away from a public repo leak |
| No audit trail | No record of who accessed which secret, when |

Existing solutions (HashiCorp Vault, AWS Secrets Manager, Doppler) are either too complex, too expensive, or too cloud-dependent for small teams.

---

## A Small Team Workflow

Imagine a team of four developers shipping a SaaS app: one project admin, two backend developers, and one frontend developer. Before Jex, every new API key meant another `.env` file sent through chat, copied to laptops, and forgotten until staging or production broke.

With Jex, the project admin creates a project in the dashboard, adds `dev`, `staging`, and `prod` environments, then invites the team with the right roles. Developers can work with `dev` secrets, read what they need, and avoid touching production credentials. Production access stays limited to project admins and scoped CI/CD tokens.

After self-hosting Jex, the team imports its existing `.env` once:

```bash
jex login --api-url https://jex.yourcompany.com
jex init
jex secrets push
```

After that, day-to-day development is simple. A developer pulls a local `.env` when a framework expects one:

```bash
jex secrets pull
npm run dev
```

Or, when the team wants secrets to stay off disk entirely, they inject them directly into the process:

```bash
jex run -- npm run dev
```

When a database URL changes, a developer updates the shared vault instead of messaging everyone:

```bash
jex secrets set DATABASE_URL=postgres://...
```

The next teammate gets the new value from Jex, not from a stale chat thread. CI uses an environment-scoped token for `staging` or `prod`, so pipelines can read only the secrets they are allowed to use. Every secret mutation is audited, every request goes through RBAC, and every stored value is encrypted with AES-256-GCM before it reaches PostgreSQL.

---

## Quick Start

### Self-host with Docker

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex
docker-compose up
```

That's it. The API, web dashboard, and PostgreSQL database start together. Open `http://localhost:3000` to create your first account.

For production guidance, read the [self-hosting guide](https://site-henna-rho-78.vercel.app/en/docs/self-hosting) and [self-host first](https://site-henna-rho-78.vercel.app/en/docs/getting-started/self-host-first) notes.

### Install the CLI

```bash
# npm (installs the correct binary for your platform automatically)
npm install -g jex-secrets

# Verify
jex --version
```

CLI setup details are in the [installation guide](https://site-henna-rho-78.vercel.app/en/docs/getting-started/installation).

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
│   │   │   ├── auth/        # AuthGateway: token validation, sessions
│   │   │   ├── access/      # AccessPolicy: RBAC enforcement
│   │   │   ├── crypto/      # CryptoService: AES-256-GCM
│   │   │   ├── secrets/     # SecretsService + routes
│   │   │   ├── audit/       # AuditLog: append-only event recorder
│   │   │   └── vault/       # VaultStore: all Prisma queries
│   │   └── prisma/
│   ├── site/                # Public landing page + docs, deployed by the Jex project
│   └── web/                 # Self-hosted Next.js dashboard/auth app
├── cli/                     # Go binary for all jex commands
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

Public documentation:

- [Product docs](https://site-henna-rho-78.vercel.app/en/docs)
- [Why self-host](https://site-henna-rho-78.vercel.app/en/docs/why-self-host)
- [Self-host first](https://site-henna-rho-78.vercel.app/en/docs/getting-started/self-host-first)
- [Self-hosting guide](https://site-henna-rho-78.vercel.app/en/docs/self-hosting)
- [CLI installation](https://site-henna-rho-78.vercel.app/en/docs/getting-started/installation)

Engineering documents in this repository:

| Document | Contents |
|----------|----------|
| [Requirements (PRD)](docs/01_requirements_prd.md) | What we're building and for whom |
| [SRS](docs/02_requirements_srs.md) | Precise functional and non-functional requirements |
| [Invariants](docs/03_design_contract_invariant.md) | Security guarantees that can never be false |
| [Architecture](docs/05_architecture.md) | Component design, data model, flows |
| [API Specification](docs/06_api_specification.md) | Every HTTP endpoint, schema, and error code |
| [Visual Identity](docs/07_visual_identity.md) | Design system: colors, typography, components |

---

## Contributing

Jex is in active development and contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, architecture rules, commit convention, and PR guidelines.

---

## Roadmap

- **v0.1**: MVP with vault, CLI, dashboard, RBAC, audit log, and self-hosting *(in development)*
- **v0.2**: Secret versioning, `--watch` mode, git hook integration, French UI
- **Post v0.2**: Custom environments, secret expiry/TTL, TUI project picker

---

## License

MIT: free to use, self-host, and modify. See [LICENSE](LICENSE).

---

<div align="center">

Built for developer teams who move fast and take security seriously.

**[Get Started](#quick-start)** · **[Read the Docs](https://site-henna-rho-78.vercel.app/en/docs)** · **[Open an Issue](https://github.com/mibienpanjoe/jex/issues)**

</div>
