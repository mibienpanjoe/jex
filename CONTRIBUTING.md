# Contributing to Jex

Thank you for considering a contribution to Jex. This document covers everything you need to get the project running locally, understand the architecture, and submit quality work.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Local Setup](#local-setup)
- [Project Structure](#project-structure)
- [Architecture Rules](#architecture-rules)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Code of Conduct

Be respectful and constructive. Jex is built for developer teams across different backgrounds and geographies. Harassment, discrimination, or gatekeeping have no place here. Issues or pull requests that violate this will be closed without discussion.

---

## How to Contribute

There are several ways to contribute:

- **Fix a bug** — open an issue first to confirm it is a bug, then submit a PR with a fix and a test
- **Implement a planned feature** — check the open issues, pick one, and comment before starting
- **Improve documentation** — typos, clarity, missing examples, incorrect information — all PRs welcome
- **Report a security vulnerability** — do NOT open a public issue; email directly (see below)

For anything beyond a small fix, **open an issue before writing code**. This prevents duplicate work and ensures the approach fits the architecture.

---

## Local Setup

### Prerequisites

| Tool | Version | Required for |
|------|---------|-------------|
| Node.js | ≥ 20 | API + dashboard |
| Go | ≥ 1.22 | CLI |
| Docker + Docker Compose | any recent | Full stack |
| PostgreSQL | ≥ 15 | Local DB (or use Docker) |

### Clone and install

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex
npm install   # installs all workspace dependencies (api + web)
```

### Start the full stack

```bash
docker-compose up
```

This starts PostgreSQL, the API, and the web dashboard together. The API is available at `http://localhost:4000` and the dashboard at `http://localhost:3000`.

### Start services individually

**API (watch mode):**
```bash
cd apps/api
cp .env.example .env   # fill in ENCRYPTION_KEY and DATABASE_URL
npm run dev
```

**Dashboard:**
```bash
cd apps/web
npm run dev
```

**CLI:**
```bash
cd cli
go build ./...         # compile
go test ./...          # run tests
go run main.go <cmd>   # run without installing
```

### Database

```bash
cd apps/api
npx prisma migrate dev --name <migration-name>   # create a migration
npx prisma studio                                # inspect the database
```

---

## Project Structure

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

## Architecture Rules

These are non-negotiable. A PR that violates any of them will not be merged regardless of how clean the code looks.

**Secrets are never stored plain text.** `CryptoService.encrypt()` must be called before any `VaultStore` write. `VaultStore` only ever receives ciphertext.

**Every `VaultStore` method requires `project_id`.** No query may omit this parameter. Tenant isolation is enforced by function signature, not convention.

**`AccessPolicy.authorize()` is called before any secret operation.** `SecretsService` calls it first, every time. There is no internal shortcut.

**Audit writes are inside the same transaction as the secret write.** If the audit write fails, the whole operation rolls back. A secret write with no audit record is not considered complete.

**`jex run` never writes a file.** Secrets are injected via `exec.Command` `Env` field only. No temp file, no `.env`, nothing touches disk.

**`.envault` contains no secrets.** Only `project`, `defaultEnv`, and `apiURL`. Never a token, key, or value.

**The last Owner cannot be removed or demoted.** `AccessPolicy` checks owner count before any member removal or role change.

**Revocation is immediate.** Token status is checked in the database on every request — no in-memory cache.

Full rationale is in [`docs/03_design_contract_invariant.md`](docs/03_design_contract_invariant.md) and [`docs/04_transition_req_arch.md`](docs/04_transition_req_arch.md).

---

## Development Workflow

1. Fork the repository and clone your fork
2. Create a branch from `main` — use a short descriptive name (`fix/audit-tx`, `feat/cli-run`)
3. Make your changes following the architecture rules above
4. Write or update tests for your change
5. Run the test suite and make sure everything passes:
   ```bash
   # API
   cd apps/api && npm test

   # CLI
   cd cli && go test ./...
   ```
6. Commit using the convention below
7. Push your branch and open a pull request

---

## Commit Convention

```
<type>(<scope>): <imperative description>
```

**Types:**

| Type | Use |
|------|-----|
| `feat` | New functionality |
| `fix` | Bug fix |
| `chore` | Tooling, config, dependencies |
| `refactor` | Code change with no behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |

**Scopes:**

`monorepo` · `db` · `auth` · `crypto` · `secrets` · `access` · `audit` · `projects` · `envs` · `members` · `tokens` · `cli` · `dashboard` · `landing` · `infra`

**Rules:**
- Subject line ≤ 72 characters, lowercase after the colon
- Imperative mood: "add", "implement", "enforce" — not "added" or "adds"
- One logical change per commit — do not batch unrelated changes
- No co-author lines

**Examples:**
```
feat(secrets): implement SecretsService.create with audit transaction
fix(access): enforce owner-count guard before role demotion
chore(db): add migration for token revocation timestamp
docs(cli): document jex run subprocess injection behavior
```

---

## Submitting a Pull Request

- **Title** — follow the commit convention
- **Description** — explain what changed and why; link the issue it closes (`Closes #123`)
- **Tests** — include tests for new behavior; do not reduce test coverage
- **Scope** — one logical change per PR; large PRs will be asked to split
- **No generated files** — do not commit lock files, compiled binaries, or build artifacts

PRs that break architecture rules, reduce test coverage without justification, or lack a clear description will be asked for changes before review.

---

## Reporting Bugs

Open an issue using the **Bug Report** template. Include:

- What you expected to happen
- What actually happened
- Steps to reproduce (minimal and specific)
- Your OS, Node.js version, Go version, and Jex version

Vague reports ("it doesn't work") will be closed. Specific reports get fixed.

---

## Reporting Security Vulnerabilities

**Do not open a public issue for security vulnerabilities.**

Email the maintainer directly. Include a description of the vulnerability, the affected component, and steps to reproduce. You will receive a response within 72 hours. We follow responsible disclosure — fixes will be released before any public disclosure.

---

## Requesting Features

Open an issue using the **Feature Request** template. Describe:

- The problem you are trying to solve (not just the solution you have in mind)
- Who benefits from this feature
- Whether it fits the MVP scope or belongs in a later version

Check open issues before requesting — it may already be planned.
