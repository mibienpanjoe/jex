# Jex — Transition: Requirements to Architecture
Version: v1.0, 2026-04-06

---

## Method

Every invariant defined in `03_design_contract_invariant.md` must be assigned to exactly one component owner. Not a framework. Not a library. A conceptual responsibility with a clear enforcement point. After reading this document, any engineer should be able to answer: *"If INV-07 was violated in production, which component do I look at and which on-call engineer do I call?"*

The rule: if two components both claim an invariant, either split the invariant or clarify delegation. Ambiguity here causes production bugs where "everyone assumes someone else handles it."

---

## Component Definitions

**VaultStore** — All database reads and writes. Every query it executes requires a `project_id` parameter and an `environment` parameter where applicable. It knows nothing about HTTP, authentication tokens, or CLI state. It is the sole interface between the application and PostgreSQL.

**CryptoService** — Owns all encryption and decryption of secret values. It is the only component that holds references to encryption keys and calls AES-256-GCM primitives. All other components pass plain-text values in and receive ciphertext out (for storage), or pass ciphertext in and receive plain text out (for delivery). No other component performs cryptographic operations on secret values.

**AuthGateway** — Handles all authentication and session lifecycle: login (email/password, OAuth), logout, session token validation, CI/CD token validation, and revocation. All inbound API requests pass through AuthGateway before any business logic runs. It also owns the 2FA flow.

**AccessPolicy** — Owns role-based access control enforcement. Given an authenticated actor (from AuthGateway) and a requested operation + environment, it returns allow or deny. It is the single enforcement point for the RBAC matrix. No component may skip this check.

**SecretsService** — The application's core business logic for secret CRUD. It orchestrates: calling VaultStore to read/write, routing values through CryptoService, calling AccessPolicy to authorize, and writing audit events to AuditLog. It is the only component that calls both CryptoService and VaultStore in the same operation.

**AuditLog** — Append-only log of all state-changing and read operations on secrets and project membership. It writes audit records atomically with the operations they describe (within a database transaction). It is the enforcement point for INV-11 and INV-12.

**CLI Runner** — The Go process that implements all `jex` commands. It owns the `jex run` subprocess injection behavior, the `.env` file write behavior, and the `.envault` config file format. It communicates with the API over HTTPS. It never performs encryption or direct database access.

**Dashboard** — The Next.js web application. It owns the UI presentation layer, enforces which UI elements are visible to which roles (mirroring server-side RBAC), and communicates with the API over HTTPS. It never holds raw secret values beyond the render cycle of the requesting page.

---

## Invariant Assignments

### VaultStore (owns: INV-01, INV-02)

VaultStore enforces **project isolation** (INV-01) and **environment isolation** (INV-02) because it is the only component with direct database access. No query can be constructed that returns cross-project or cross-environment data without going through VaultStore — all other components depend on it for persistence.

Every public VaultStore method that accesses secrets requires both `project_id` and `environment` as mandatory parameters. These are enforced by function signature, not by convention. A caller cannot accidentally omit them.

---

### CryptoService (owns: INV-03, INV-04, INV-05, INV-06)

CryptoService owns the **secret value opacity** guarantee (INV-03), **encryption before storage** (INV-04), **key separation** (INV-05), and **decryption scope** (INV-06).

These are all properties of how secret values are handled cryptographically. CryptoService is the only component that touches raw secret values and encryption keys simultaneously. By consolidating this responsibility here, INV-05 (key not stored with ciphertext) can be verified in a single component, and INV-06 (no client-side decryption) is enforced structurally — the API only delivers decrypted values server-side within a request scope.

---

### AuthGateway (owns: INV-09)

AuthGateway owns **revocation immediacy** (INV-09). It is the enforcement point for all token validation — every API request passes through it. When a token is revoked, its revoked status is checked in AuthGateway before any other component sees the request. Since AuthGateway is the sole gatekeeper, there is no path through which a revoked token can reach SecretsService.

AuthGateway also enforces session expiry and handles all OAuth callback flows, but it does not own access control decisions beyond "is this token valid" — that belongs to AccessPolicy.

---

### AccessPolicy (owns: INV-07, INV-08, INV-10)

AccessPolicy owns **RBAC enforcement on every request** (INV-07), **CI/CD token scope lock** (INV-08), and **minimum ownership guarantee** (INV-10).

INV-07: AccessPolicy is the single evaluation point for the role matrix. SecretsService calls AccessPolicy.authorize(actor, operation, environment) before doing anything else. If the result is deny, the request is rejected before any VaultStore or CryptoService call is made.

INV-08: When evaluating a CI/CD token, AccessPolicy checks that the requested environment matches the token's scoped environment. A token scoped to `prod` cannot access `dev` even if the actor tries.

INV-10: AccessPolicy evaluates role-change and member-removal requests to ensure the result does not leave a project with zero owners. This check happens before VaultStore writes the change.

---

### SecretsService (no direct invariant ownership — orchestrator)

SecretsService is an orchestrator, not an invariant owner. It delegates:
- Encryption/decryption to CryptoService
- Authorization to AccessPolicy
- Persistence to VaultStore
- Audit writing to AuditLog

However, SecretsService is responsible for **calling all four** in the right order and ensuring atomicity (database transaction spanning VaultStore write + AuditLog write). If SecretsService skips any delegation, invariants owned by those components are at risk.

---

### AuditLog (owns: INV-11, INV-12)

AuditLog owns **audit completeness** (INV-11) and **audit immutability** (INV-12).

INV-11: AuditLog ensures that its write is part of the same database transaction as the secret operation. If the audit write fails, the transaction rolls back. SecretsService calls AuditLog.record() inside its transaction — success is atomic.

INV-12: AuditLog exposes only INSERT operations. It has no UPDATE or DELETE methods. This is a structural guarantee — no accidental deletion is possible through the component's public interface.

---

### CLI Runner (owns: INV-13, INV-14, INV-15)

CLI Runner owns **no disk persistence during `jex run`** (INV-13), **atomic `.env` write** (INV-14), and **`.envault` contains no secrets** (INV-15).

These are all behavioral properties of the CLI binary that run client-side and cannot be enforced by the server. INV-13 is enforced by the `jex run` implementation using `exec.Command` with `Env` injection — it never calls `os.WriteFile`. INV-14 is enforced by writing to a temp file and using `os.Rename` (atomic on POSIX). INV-15 is enforced by the `jex init` implementation which only writes `[project, env, api_url]` to `.envault`.

---

### (All components share): INV-16 — TLS-Only Transport

INV-16 is a cross-cutting infrastructure constraint, not owned by a single component. It is enforced at the deployment level:
- The API server MUST be deployed behind HTTPS-only (TLS termination at the reverse proxy or hosting platform).
- The CLI Runner MUST reject API base URLs that use `http://` (non-TLS), unless an explicit `--allow-insecure` flag is passed for local development only.
- The Dashboard is served over HTTPS by Vercel.

The component responsible for enforcement at deploy time is the **infrastructure configuration** (docker-compose, Render/Railway settings, Vercel deployment).

---

## Invariant Coverage Table

| Invariant | Owner | Enforcement Point |
|-----------|-------|-------------------|
| INV-01 Project isolation | VaultStore | `project_id` required parameter on all queries |
| INV-02 Environment isolation | VaultStore | `environment` required parameter on all secret queries |
| INV-03 Secret value opacity | CryptoService | Plain text exists only in-memory during encrypt/decrypt call |
| INV-04 Encryption before storage | CryptoService | VaultStore receives only ciphertext — never plain text |
| INV-05 Key separation | CryptoService | Key stored in env var / key management service, not in DB |
| INV-06 Decryption scope | CryptoService | Decryption only called server-side inside a request handler |
| INV-07 RBAC on every request | AccessPolicy | SecretsService calls `AccessPolicy.authorize()` before any DB op |
| INV-08 CI/CD token scope lock | AccessPolicy | Token's `scoped_env` checked against requested `environment` |
| INV-09 Revocation immediacy | AuthGateway | Token status checked in DB on every request, no cache |
| INV-10 Minimum ownership | AccessPolicy | Ownership count checked before member removal/demotion |
| INV-11 Audit completeness | AuditLog | Audit write inside same DB transaction as secret write |
| INV-12 Audit immutability | AuditLog | No UPDATE/DELETE methods on the AuditLog component interface |
| INV-13 No disk write in `jex run` | CLI Runner | Child process launched via `exec.Command` with env injection only |
| INV-14 Atomic `.env` write | CLI Runner | Write to temp file + `os.Rename`, never direct file write |
| INV-15 `.envault` no secrets | CLI Runner | `jex init` writes only `[project, env, api_url]` to `.envault` |
| INV-16 TLS-only transport | Infrastructure | HTTPS enforced at load balancer/hosting layer; CLI rejects http:// |

---

## Coupling & Cohesion Decisions

**Why CryptoService is separate from VaultStore**
VaultStore could theoretically encrypt before writing and decrypt after reading. It was separated because the encryption key lifecycle (rotation, storage location, algorithm versioning) is a distinct concern from SQL query construction. Keeping them together would mean a database migration could accidentally expose encryption logic, or a key rotation would require touching persistence code.

**Why AccessPolicy is separate from AuthGateway**
AuthGateway answers "is this token valid?"; AccessPolicy answers "is this actor allowed to do this thing?". These are separate concerns. AuthGateway has no knowledge of RBAC roles; it only validates credentials. This separation means the RBAC matrix is in one place and the token validation logic is in another — neither bleeds into the other.

**Why AuditLog is separate from SecretsService**
SecretsService is an orchestrator — if it also owned audit logic, changes to the audit schema would require touching the secrets business logic. By separating them, AuditLog can evolve (add fields, change storage backend) without affecting how secrets are created or updated.

**Why CLI Runner is a separate codebase (Go binary) from the API (Node.js)**
The CLI is distributed as a compiled binary with no runtime dependency — users install it via npm but only the binary runs. The API is a Node.js server that runs persistently. These have different deployment, distribution, and runtime models. A shared codebase would create a tight coupling between a client-side tool and a server-side service with no benefit.

**Why Dashboard mirrors RBAC rather than delegating entirely to the API**
The dashboard hides or disables UI elements the current actor cannot use (e.g., a Developer sees `prod` as locked). This is a UX decision — it prevents confusing 403 errors from appearing after the user has already started an action. However, the API enforces RBAC independently and does not trust the dashboard's client-side decisions. Both layers must enforce RBAC; one is for UX, one is for security.
