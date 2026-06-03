# AGENTS.md

Guidance for coding agents working in this repository. Keep this file release-agnostic: it should describe durable project facts, architecture boundaries, and rules that must remain true regardless of milestone or version.

---

## What Jex Is

Jex is an open-source secrets manager for developer teams. It has three primary surfaces:

- API: TypeScript/Express service backed by PostgreSQL and Prisma.
- CLI: Go binary named `jex`.
- Web: Next.js dashboard, docs, and marketing site.

Secrets are encrypted with AES-256-GCM before storage. The server must never persist plain text secret values.

---

## Repository Map

```text
jex/
├── apps/
│   ├── api/                  # TypeScript/Express API
│   │   ├── src/
│   │   │   ├── auth/         # Better Auth config, auth routes, middleware
│   │   │   ├── access/       # RBAC and owner-count guards
│   │   │   ├── crypto/       # AES-256-GCM encryption/decryption
│   │   │   ├── secrets/      # Secret orchestration and HTTP routes
│   │   │   ├── audit/        # Append-only audit event recording/querying
│   │   │   ├── vault/        # Prisma data access layer
│   │   │   ├── projects/     # Project and environment routes
│   │   │   ├── members/      # Membership routes
│   │   │   └── tokens/       # CI/CD token routes
│   │   └── prisma/           # Prisma schema and migrations
│   └── web/                  # Next.js app: dashboard, docs, marketing
│       ├── app/
│       ├── content/          # Nextra docs content
│       ├── i18n/
│       └── messages/         # next-intl translations
├── cli/                      # Go CLI
│   ├── cmd/                  # Cobra commands
│   └── internal/
│       ├── api/              # HTTP client to the API
│       ├── auth/             # token storage in ~/.jex/token
│       ├── config/           # .envault read/write
│       └── errs/             # user-facing error mapping
├── packages/npm-wrapper/     # npm package that runs/downloads CLI binaries
├── docs/                     # Product, architecture, invariant, API, and UI docs
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Common Commands

### API

```bash
npm run dev --workspace=apps/api
npm run build --workspace=apps/api
JEX_INTEGRATION_TESTS=1 DATABASE_URL=<test-db-url> npm run test:integration --workspace=apps/api
cd apps/api && npx prisma migrate dev --name <name>
cd apps/api && npx prisma studio
```

Run API integration tests only against a disposable database. The suite resets all application tables.

### Web

```bash
npm run dev --workspace=apps/web
npm run build --workspace=apps/web
```

### CLI

```bash
cd cli && go build ./...
cd cli && go test ./...
cd cli && go run main.go <cmd>
cd cli && make build-all
```

### Full Stack

```bash
docker-compose up
```

---

## Architecture Rules

These come from `docs/03_design_contract_invariant.md` and `docs/04_transition_req_arch.md`. Violating them is a defect, not a trade-off.

**Secrets are never stored plain text.** `CryptoService.encrypt()` must run before any `VaultStore` secret write. `VaultStore` receives ciphertext and IV, never plain values.

**Every tenant-scoped data access must include `projectId`.** Tenant isolation is enforced by query shape and function signatures, not by convention.

**`AccessPolicy.authorize()` is called before every secret operation.** `SecretsService` must authorize before read, write, delete, import, or export work. There is no internal shortcut.

**Audit writes for secret mutations are transactional with the mutation.** If the audit write fails, the secret write must roll back. A secret mutation without an audit record is incomplete.

**`jex run` never writes secrets to disk.** It fetches secrets and injects them through `exec.Command.Env` only. No temp file, no `.env`, no secret-bearing disk artifact.

**`.envault` contains no secrets.** It may contain project reference, default environment, and API URL only. Never store tokens, encryption keys, or secret values there.

**The last Owner cannot be removed or demoted.** Owner-count checks must happen before member removal or role changes that could leave a project ownerless.

**Revocation is immediate.** Session and CI/CD token status must be checked in the database on every authenticated request. Do not add in-memory auth caches.

**CI/CD tokens are environment-scoped.** A token must only operate within its configured environment. Treat token capability changes as security-sensitive and verify against the docs/README contract.

---

## Component Ownership

| Component | Owns | Must Not |
|-----------|------|----------|
| `VaultStore` | Prisma reads/writes and data shape | Encrypt/decrypt values; query tenant data without `projectId` |
| `CryptoService` | AES-256-GCM encrypt/decrypt and key loading | Log secret values; perform data access |
| `AuthGateway` / auth middleware | Credential validation and session/token lifecycle | Make project RBAC decisions |
| `AccessPolicy` | RBAC, CI/CD token scope checks, last-owner guard | Touch secret values |
| `SecretsService` | Secret operation orchestration: access, crypto, store, audit | Skip authorization, encryption, or audit steps |
| `AuditLog` | Append-only event insertion and audit querying | Expose update/delete behavior for audit events |
| CLI runner | Subprocess secret injection, `.envault` use, atomic `.env` pull writes | Encrypt on the client; write secrets during `jex run` |
| Web dashboard | User workflows and RBAC-aware UI | Be the only enforcement layer for permissions |

---

## Durable Tech Decisions

- Auth: Better Auth with Prisma adapter and 2FA plugin.
- Database: PostgreSQL via Prisma.
- API runtime: Node.js/Express with TypeScript.
- Encryption: Node.js built-in `crypto`, AES-256-GCM, 32-byte hex key from `ENCRYPTION_KEY`.
- CLI: Go with Cobra, producing self-contained binaries.
- Web: Next.js App Router, Nextra docs, `next-intl` marketing localization.
- Distribution: `jex-secrets` npm wrapper selects/downloads the platform-specific Go binary.
- Deployment: Docker Compose for local/self-hosted full-stack startup.

---

## Documentation Index

| File | What it answers |
|------|-----------------|
| `docs/01_requirements_prd.md` | Product goals, users, and feature scope |
| `docs/02_requirements_srs.md` | Functional/non-functional requirements and error cases |
| `docs/03_design_contract_invariant.md` | Security invariants and prohibited states |
| `docs/04_transition_req_arch.md` | Mapping from requirements to architecture ownership |
| `docs/05_architecture.md` | System architecture, flows, data model, ADRs |
| `docs/06_api_specification.md` | HTTP endpoints, schemas, and error codes |
| `docs/07_visual_identity.md` | Visual system, components, and brand guidance |

---

## Commit Convention

Use one logical change per commit.

```text
<type>(<scope>): <imperative description>

Types:  feat | fix | chore | refactor | test | docs
Scopes: monorepo | db | auth | crypto | secrets | access | audit |
        projects | envs | members | tokens | cli | dashboard | landing | infra
```

No co-author lines.
