# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project State

Jex is currently in the **pre-implementation phase**. The repository contains the full engineering documentation suite and implementation plan. No application code exists yet. Implementation follows `IMPLEMENTATION_PLAN.md` phase by phase.

---

## What Jex Is

An open-source secrets manager for developer teams. Three layers: an encrypted vault (PostgreSQL), a Go CLI (`jex`), and a Next.js web dashboard. Secrets are encrypted with AES-256-GCM before storage — the server never holds plain text.

---

## Planned Repository Structure

```
jex/
├── apps/
│   ├── api/          # Node.js/Express backend (TypeScript)
│   │   ├── src/
│   │   │   ├── auth/        # AuthGateway — Better Auth config + middleware
│   │   │   ├── access/      # AccessPolicy — RBAC enforcement
│   │   │   ├── crypto/      # CryptoService — AES-256-GCM encrypt/decrypt
│   │   │   ├── secrets/     # SecretsService + routes
│   │   │   ├── audit/       # AuditLog — append-only event recorder
│   │   │   └── vault/       # VaultStore — all Prisma queries
│   │   └── prisma/schema.prisma
│   └── web/          # Next.js 14 app (dashboard + landing + docs)
│       ├── app/
│       └── messages/ # next-intl i18n JSON (en.json, fr.json)
├── cli/              # Go binary — all jex commands
│   ├── cmd/
│   └── internal/
│       ├── api/      # HTTP client to the API
│       ├── config/   # .envault read/write
│       └── auth/     # token storage (~/.jex/token)
├── docker-compose.yml
└── IMPLEMENTATION_PLAN.md
```

---

## Commands (once implementation begins)

### API
```bash
cd apps/api
npm run dev          # ts-node-dev watch mode
npx prisma migrate dev --name <name>   # create a migration
npx prisma studio    # inspect the database
```

### Web
```bash
cd apps/web
npm run dev          # Next.js dev server
```

### CLI
```bash
cd cli
go build ./...       # compile
go test ./...        # run all tests
go run main.go <cmd> # run without installing
make build-all       # cross-compile for all platforms
```

### Full stack
```bash
docker-compose up    # starts db + api + web
```

---

## Architecture Rules (non-negotiable)

These come from `docs/03_design_contract_invariant.md` and `docs/04_transition_req_arch.md`. Violating them is a defect, not a trade-off.

**Secrets are never stored plain text.** `CryptoService.encrypt()` is called before any `VaultStore` write. `VaultStore` only ever receives ciphertext.

**Every VaultStore method requires `project_id`.** No query may omit this parameter. Tenant isolation (INV-01) is enforced by function signature, not convention.

**`AccessPolicy.authorize()` is called before any secret operation.** `SecretsService` calls it first, every time. There is no internal shortcut.

**Audit writes are inside the same transaction as the secret write.** If the audit write fails, the whole transaction rolls back. A secret write that produces no audit record is not considered complete (INV-11).

**`jex run` never writes a file.** Secrets are injected via `exec.Command` `Env` field only. No temp file, no `.env`, nothing on disk (INV-13).

**`.envault` contains no secrets.** Only `project`, `defaultEnv`, and `apiURL`. Never a token, key, or value (INV-15).

**The last Owner cannot be removed or demoted.** `AccessPolicy` checks owner count before any member removal or role change (INV-10).

**Revocation is immediate.** Token status is checked in the database on every request — no in-memory cache (INV-09).

---

## Component Ownership Map

| Component | Owns | Must NOT |
|-----------|------|----------|
| `VaultStore` | All DB reads/writes | Perform encryption; accept queries without `project_id` |
| `CryptoService` | AES-256-GCM encrypt/decrypt; key loading | Log values; be called outside SecretsService |
| `AuthGateway` | Token validation, session lifecycle | Make RBAC decisions |
| `AccessPolicy` | RBAC matrix, CI/CD token scope, owner-count guard | Touch secret data |
| `SecretsService` | Orchestration (access → crypto → store → audit) | Skip any of the four steps |
| `AuditLog` | Append-only event inserts | Expose UPDATE or DELETE methods |
| `CLI Runner` | `jex run` subprocess injection, atomic `.env` write, `.envault` format | Write secrets to disk; perform encryption |

---

## Key Tech Decisions

- **Auth:** Better Auth (not Auth.js) — self-hostable, ships TOTP 2FA plugin, has a Prisma adapter
- **Encryption:** Node.js built-in `crypto` with AES-256-GCM (not libsodium) — no native addon, auditable
- **CLI language:** Go (not Node.js) — compiles to a self-contained binary; no runtime dependency for end users
- **Audit atomicity:** `AuditLog.record()` runs inside the caller's Prisma transaction — not async, not fire-and-forget
- **npm wraps Go binary:** `@jex/cli` npm package ships pre-compiled binaries; `postinstall` selects the right one by platform/arch

---

## Commit Convention

Single branch (`main`). No feature branches.

```
<type>(<scope>): <imperative description>

Types:  feat | fix | chore | refactor | test | docs
Scopes: monorepo | db | auth | crypto | secrets | access | audit |
        projects | envs | members | tokens | cli | dashboard | landing | infra
```

One logical change per commit. No co-author lines.

---

## Documentation Index

| File | What it answers |
|------|----------------|
| `docs/01_requirements_prd.md` | What are we building and for whom? |
| `docs/02_requirements_srs.md` | What must the system do, precisely? (FR/NFR/error cases) |
| `docs/03_design_contract_invariant.md` | What can never be false? (invariants + prohibitions) |
| `docs/04_transition_req_arch.md` | Which component owns which invariant? |
| `docs/05_architecture.md` | How is the system built? (flows, data model, ADRs) |
| `docs/06_api_specification.md` | Every HTTP endpoint, schema, and error code |
| `docs/07_visual_identity.md` | Design system (colors, typography, components) |
