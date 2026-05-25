# Jex — System Architecture
Version: v1.0, 2026-04-06

---

## Architectural Style

**Modular monolith with a separate Go CLI binary.**

The API and web dashboard run as a unified Next.js + Node.js deployment on a single hosting unit (Render or Railway). Internally, the backend is organized into clearly bounded modules (AuthGateway, AccessPolicy, SecretsService, CryptoService, VaultStore, AuditLog) that share a single PostgreSQL database via Prisma. The CLI is a separate Go binary distributed via npm.

**Why not microservices:**
- MVP scale does not justify the operational overhead of distributed service topology
- All backend modules share the same database — network hops between services add latency with no benefit
- A single deployable unit means one place to configure secrets, one deployment pipeline, one set of environment variables
- Hosting on Render/Railway free tier is only feasible as one process, not many

**Why Go for the CLI and not Node.js:**
- Go compiles to a single self-contained binary with no runtime dependency — a user running `jex run` should not need Node.js installed
- Go's `os/exec` and environment variable injection model is a natural fit for the `jex run` subprocess pattern
- Cobra (CLI framework) and Bubble Tea (TUI) are mature Go libraries with first-class support for this use case

---

## Component Architecture

### AuthGateway
**Responsibility:** Validate all inbound authentication credentials and manage session lifecycle.

**Owned invariants:** INV-09 (revocation immediacy)

**Inputs:** HTTP requests with `Authorization: Bearer <token>` headers; OAuth callback requests; login/register request bodies

**Outputs:** Authenticated actor context (user ID, role, token type); HTTP 401 on failure

**Key behaviors:**
1. Parse and validate session tokens (JWT or opaque token via Better Auth)
2. On every request, check token revocation status in the database — no in-memory cache that could serve revoked tokens
3. Validate OAuth state parameter and exchange code for user identity via GitHub/Google
4. Manage 2FA challenge/response flow (TOTP via Better Auth plugin)
5. Issue new session tokens on successful login
6. Invalidate tokens on logout

**Must NOT:** Make access control decisions — it only determines *who* the actor is, not *what they can do*

---

### AccessPolicy
**Responsibility:** Evaluate whether a given actor is permitted to perform a given operation on a given environment.

**Owned invariants:** INV-07 (RBAC on every request), INV-08 (CI/CD token scope lock), INV-10 (minimum ownership)

**Inputs:** Actor (from AuthGateway), operation type, project ID, environment name

**Outputs:** `allow` or `deny` with reason

**Key behaviors:**
1. Evaluate actor's role against the RBAC matrix (FR-052) for the requested operation + environment
2. For CI/CD tokens: verify the requested environment matches the token's scoped environment (immutable at creation)
3. For member-removal and role-change requests: check that the resulting state would not leave the project with zero owners

**Must NOT:** Read or write secret data — it only evaluates permission, never touches the vault

---

### CryptoService
**Responsibility:** Encrypt and decrypt secret values using AES-256-GCM.

**Owned invariants:** INV-03 (secret value opacity), INV-04 (encryption before storage), INV-05 (key separation), INV-06 (decryption scope)

**Inputs:** Plain-text secret value (for encryption); ciphertext + IV (for decryption)

**Outputs:** Ciphertext + IV (for storage); plain-text value (for delivery to caller)

**Key behaviors:**
1. Encrypt: generate a random IV (12 bytes), encrypt value with AES-256-GCM, return `{ ciphertext, iv }` as base64 strings
2. Decrypt: accept `{ ciphertext, iv }`, decrypt with the stored key, return plain-text value
3. The encryption key is loaded from an environment variable (`ENCRYPTION_KEY`) — never from the database

**Must NOT:** Log plain-text values or ciphertext; persist any data to the database directly; be called from outside the SecretsService boundary

---

### SecretsService
**Responsibility:** Orchestrate all secret CRUD operations, routing between AccessPolicy, CryptoService, VaultStore, and AuditLog.

**Owned invariants:** None directly — it is the orchestrator that ensures all component invariants fire correctly

**Inputs:** Authorized request context, operation parameters (key, value, environment, project)

**Outputs:** Secret values (for read operations); confirmation (for write operations); HTTP error codes on failure

**Key behaviors:**
1. Call `AccessPolicy.authorize()` — deny if not permitted
2. For writes: call `CryptoService.encrypt()`, then `VaultStore.write()` and `AuditLog.record()` in a single database transaction
3. For reads: call `VaultStore.read()`, then `CryptoService.decrypt()`, then `AuditLog.record()` in the same transaction
4. On audit write failure: roll back the entire transaction — operation is not considered complete (INV-11)
5. For bulk export (`jex secrets pull`): decrypt and return all key-value pairs; each key access is individually audit-logged

**Must NOT:** Store plain-text values in any variable that outlives the request; bypass AccessPolicy; call the database directly without going through VaultStore

---

### VaultStore
**Responsibility:** All database reads and writes via Prisma. Single source of truth for persistence.

**Owned invariants:** INV-01 (project isolation), INV-02 (environment isolation)

**Inputs:** Structured queries with required `project_id` and `environment` parameters

**Outputs:** Database records; confirmation of writes

**Key behaviors:**
1. Every public method that reads or writes secrets requires `project_id` as a mandatory parameter — enforced by TypeScript function signature
2. Every public method that reads or writes environment-specific data requires `environment` as a mandatory parameter
3. Executes Prisma queries within caller-provided transactions (for atomic writes with AuditLog)

**Must NOT:** Accept or construct queries without a `project_id` filter; expose raw SQL; manage encryption or decryption

---

### AuditLog
**Responsibility:** Append-only log of all secret operations and membership events.

**Owned invariants:** INV-11 (audit completeness), INV-12 (audit immutability)

**Inputs:** Audit event descriptor (actor, operation, project_id, environment, key, timestamp)

**Outputs:** Written audit record; confirmation

**Key behaviors:**
1. `AuditLog.record()` inserts a row into the `audit_events` table within the caller-provided transaction
2. Exposes no UPDATE or DELETE methods — the interface structurally prevents mutation
3. Supports filtered queries for the dashboard audit log view (by date, actor, operation, environment)

**Must NOT:** Expose mutation operations on historical records; log secret values; execute outside of a transaction

---

### CLI Runner (Go binary)
**Responsibility:** Implement all `jex` commands; manage the `.envault` config; inject secrets into child processes.

**Owned invariants:** INV-13 (no disk write in `jex run`), INV-14 (atomic `.env` write), INV-15 (`.envault` contains no secrets)

**Inputs:** User commands and flags; `.envault` config; local `.env` files; HTTPS responses from the API

**Outputs:** `.env` files (for `pull`); `.envault` config (for `init`); subprocess with injected env (for `run`); terminal output

**Key behaviors:**
1. `jex run -- <cmd>`: fetch secrets from API, call `exec.Command` with `Env` set to secrets, never write to disk
2. `jex secrets pull`: fetch secrets, write to temp file, `os.Rename` to `.env` (atomic write)
3. `jex init`: write `.envault` with `[project, defaultEnv, apiBaseUrl]` only
4. Authenticate via stored token in OS keychain or `~/.jex/token` (never in `.envault`)
5. All HTTP requests to the API use HTTPS; reject `http://` base URLs unless `--allow-insecure` flag is set

**Must NOT:** Perform AES operations; access the database directly; write secrets to any persistent file during `jex run`

---

### Dashboard (Next.js)
**Responsibility:** Web UI for managing projects, secrets, members, tokens, and audit logs.

**Inputs:** User interactions; HTTPS API responses

**Outputs:** Rendered UI; API requests

**Key behaviors:**
1. Mirror RBAC decisions in the UI — hide or disable controls the current user cannot use
2. Fetch secret values only on demand (not displayed in bulk by default)
3. Use next-intl for bilingual string management (English v0.1, French v0.2)

**Must NOT:** Cache or persist secret values in localStorage, sessionStorage, or service workers; trust its own client-side RBAC decisions as a substitute for server-side enforcement

---

## Data Architecture

### Entity-Relationship Overview

```
User
  ├── Sessions (1:N) — active login sessions
  └── ProjectMembership (M:N via ProjectMember) → Project
        └── role: Owner | Developer | ReadOnly

Project
  ├── ProjectMember (1:N)
  ├── Environment (1:N) — default: dev, staging, prod
  │     └── Secret (1:N) — key + encrypted_value + iv
  ├── CICDToken (1:N) — scoped to one Environment
  └── AuditEvent (1:N)
```

### Key Constraints

| Entity | Constraint |
|--------|-----------|
| Secret | `(project_id, environment, key)` is unique — no duplicate keys per env |
| ProjectMember | `(project_id, user_id)` is unique — a user has one role per project |
| Environment | `(project_id, name)` is unique — no duplicate env names per project |
| CICDToken | `scoped_env` is immutable after creation |
| AuditEvent | No foreign key constraints that cascade delete — audit records persist even if the project is deleted |

### Encryption Storage Layout

The `Secret` table stores:
```
id           UUID (PK)
project_id   UUID (FK → Project)
environment  STRING
key          STRING (plain text — key names are not sensitive)
ciphertext   TEXT (base64 AES-256-GCM output)
iv           TEXT (base64, 12-byte nonce)
created_at   TIMESTAMP
updated_at   TIMESTAMP
```

The encryption key itself is stored in the environment variable `ENCRYPTION_KEY` on the API server — never in the database.

---

## Flow Architecture

### Flow 1: Developer pulls secrets (`jex secrets pull`)

```
Developer terminal
    │
    └── jex secrets pull
            │
            ├── Read .envault → get project_id, defaultEnv, apiBaseUrl
            ├── Read ~/.jex/token → get session token
            │
            └── GET /api/v1/secrets?env=dev   [HTTPS, Bearer token]
                    │
                    ├── AuthGateway.validate(token)      → actor
                    ├── AccessPolicy.authorize(actor, read, dev)  → allow
                    ├── VaultStore.getAll(project_id, "dev")      → [{key, ciphertext, iv}]
                    ├── CryptoService.decrypt(ciphertext, iv)     → plain-text value  (×N)
                    ├── AuditLog.record(actor, READ_BULK, dev)    [in transaction]
                    │
                    └── Response: [{key, value}, ...]
                            │
                            └── CLI writes to /tmp/.env.tmp → os.Rename → .env  (INV-14)
```

**Latency budget:** API processing < 300ms, network round-trip < 200ms, total < 600ms

---

### Flow 2: Developer injects secrets into process (`jex run -- npm run dev`)

```
Developer terminal
    │
    └── jex run -- npm run dev
            │
            ├── [same as Flow 1 up to Response]
            │
            └── exec.Command("npm", "run", "dev")
                    .Env = append(os.Environ(), "KEY=value", ...)
                    .Start()
                            │
                            └── Child process runs with secrets as env vars
                                No file written to disk. (INV-13)
```

---

### Flow 3: CI/CD pipeline reads prod secrets

```
GitHub Actions runner
    │
    └── curl -H "Authorization: Bearer $JEX_TOKEN" \
              /api/v1/secrets?env=prod
                    │
                    ├── AuthGateway.validate(token)        → CI/CD actor, scoped_env=prod
                    ├── AccessPolicy.authorize(ci_token, read, prod)
                    │       └── Check: requested_env == token.scoped_env   (INV-08)
                    │       └── allow
                    ├── VaultStore.getAll(project_id, "prod")
                    ├── CryptoService.decrypt(...)
                    ├── AuditLog.record(ci_token_id, READ_BULK, prod)
                    │
                    └── Response: [{key, value}, ...]
```

---

### Flow 4: Secret write with audit (Owner sets prod secret)

```
Dashboard (Owner)
    │
    └── PUT /api/v1/secrets/STRIPE_KEY?env=prod   [HTTPS, Bearer token]
            │
            ├── AuthGateway.validate(token)         → Owner actor
            ├── AccessPolicy.authorize(Owner, write, prod)   → allow
            ├── CryptoService.encrypt("sk_live_...")  → {ciphertext, iv}
            ├── BEGIN TRANSACTION
            │     ├── VaultStore.upsert(project_id, prod, STRIPE_KEY, ciphertext, iv)
            │     └── AuditLog.record(owner_id, SECRET_UPDATE, prod, STRIPE_KEY)
            └── COMMIT   [if audit fails → ROLLBACK, return HTTP 500]   (INV-11)
```

---

## Technology Mapping

| Component | Technology | Hosting |
|-----------|-----------|---------|
| AuthGateway | Better Auth (Node.js library) | Render / Railway |
| AccessPolicy | Custom middleware (TypeScript) | Render / Railway |
| CryptoService | Node.js `crypto` module (built-in) | Render / Railway |
| SecretsService | Express or NestJS route handlers (TypeScript) | Render / Railway |
| VaultStore | Prisma ORM + PostgreSQL | Neon (serverless Postgres) |
| AuditLog | Prisma ORM + PostgreSQL (`audit_events` table) | Neon |
| Dashboard | Next.js 14, Tailwind CSS, next-intl | Vercel |
| CLI Runner | Go, Cobra, Bubble Tea, lipgloss | npm (`jex-secrets`) binary |

---

## Deployment Architecture

```
Internet
    │
    ├── jex.vercel.app         → Vercel (Next.js — landing page + dashboard + docs)
    │
    └── api.jex.app            → Render / Railway (Node.js API server)
                                      │
                                      └── Neon (PostgreSQL, serverless)
                                              └── secrets, users, audit_events, ...

Local developer machine
    └── jex (Go binary, installed via npm)
            └── HTTPS → api.jex.app
```

**Self-hosted alternative (docker-compose):**
```yaml
services:
  api:    # Node.js API server
  web:    # Next.js frontend
  db:     # PostgreSQL
```
All three services start with `docker-compose up`. The API and web are built from the same monorepo.

---

## Project Structure

```
jex/
├── apps/
│   ├── web/                  # Next.js app (dashboard + landing + docs)
│   │   ├── app/              # App Router pages
│   │   ├── components/
│   │   └── messages/         # i18n JSON files (en.json, fr.json)
│   └── api/                  # Node.js backend
│       ├── src/
│       │   ├── auth/         # AuthGateway (Better Auth config)
│       │   ├── access/       # AccessPolicy middleware
│       │   ├── crypto/       # CryptoService
│       │   ├── secrets/      # SecretsService + routes
│       │   ├── audit/        # AuditLog
│       │   └── vault/        # VaultStore (Prisma queries)
│       └── prisma/
│           └── schema.prisma
├── cli/                      # Go CLI binary
│   ├── cmd/                  # Cobra command definitions
│   │   ├── login.go
│   │   ├── init.go
│   │   ├── run.go
│   │   └── secrets/
│   ├── internal/
│   │   ├── api/              # API client (HTTP calls)
│   │   ├── config/           # .envault read/write
│   │   └── auth/             # Token storage
│   └── main.go
├── docker-compose.yml
└── JEX_PROJECT_OVERVIEW.md
```

---

## Invariant Traceability Matrix

| Invariant | Enforced By | Mechanism |
|-----------|-------------|-----------|
| INV-01 | VaultStore | `project_id` required on all query methods |
| INV-02 | VaultStore | `environment` required on all secret query methods |
| INV-03 | CryptoService | Plain text exists only in-memory in encrypt/decrypt scope |
| INV-04 | CryptoService | SecretsService passes only encrypted output to VaultStore |
| INV-05 | CryptoService + Infrastructure | Key in `ENCRYPTION_KEY` env var, not in DB |
| INV-06 | CryptoService | Decrypt called only server-side within request handler |
| INV-07 | AccessPolicy | Called before every secret or membership operation |
| INV-08 | AccessPolicy | Token's `scoped_env` checked against requested env |
| INV-09 | AuthGateway | Token revocation status read from DB on every request |
| INV-10 | AccessPolicy | Owner count checked before removal/demotion |
| INV-11 | AuditLog | Audit write in same DB transaction as secret write |
| INV-12 | AuditLog | No UPDATE/DELETE methods on AuditLog interface |
| INV-13 | CLI Runner | `exec.Command` env injection, no `os.WriteFile` in `jex run` |
| INV-14 | CLI Runner | Write to temp → `os.Rename` |
| INV-15 | CLI Runner | `jex init` writes only `[project, env, apiUrl]` |
| INV-16 | Infrastructure | HTTPS enforced at Vercel + Render/Railway layer |

---

## Architectural Constraints & ADRs

### ADR-01: Use Better Auth over Passport.js / Auth.js
**Decision:** Use Better Auth for authentication.
**Rationale:** Better Auth is open-source, self-hostable, and ships with first-class support for TOTP 2FA, OAuth (GitHub, Google), and session management — matching all FR-010 requirements without custom implementation. Auth.js (NextAuth) is tightly coupled to Next.js and does not integrate cleanly with a standalone API server.
**Consequence:** Better Auth owns the sessions table schema; Prisma adapter is used for PostgreSQL.

### ADR-02: AES-256-GCM over libsodium (secretbox)
**Decision:** Use Node.js built-in `crypto` module with AES-256-GCM.
**Rationale:** No external dependency, auditable by any Node.js developer, GCM provides authenticated encryption (integrity checking included). libsodium's `secretbox` (XSalsa20-Poly1305) is equally secure but requires a native addon, adding complexity to the Docker and self-hosting setup.
**Consequence:** The implementation is ~30 lines of standard Node.js crypto — easy to audit and replace.

### ADR-03: Audit write inside the business transaction
**Decision:** AuditLog.record() executes inside the same Prisma transaction as the secret write.
**Rationale:** Ensures INV-11 — if the audit write fails, the entire operation rolls back. An alternative (async audit write) would be simpler but would allow secrets to be written without an audit trail, violating the contract.
**Consequence:** All secret writes are slightly slower (two DB writes per transaction vs one). This is acceptable given the p95 < 300ms target.

### ADR-04: npm package wraps Go binary
**Decision:** The CLI is distributed as an npm package that ships pre-compiled Go binaries for each platform.
**Rationale:** Most developers already have npm installed globally. Distributing via npm means `npm install -g jex-secrets` works without requiring users to install Go or download binaries manually. The npm package's `postinstall` script selects the correct binary for the user's platform.
**Consequence:** The npm package contains no JavaScript logic — it is a thin wrapper. The Go binary is the sole runtime artifact.
