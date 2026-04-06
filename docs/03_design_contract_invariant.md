# Jex — System Contract & Invariants
Version: v1.0, 2026-04-06

---

## Actors & Allowed Actions

| Actor | Permitted Actions |
|-------|------------------|
| **Owner** | Full CRUD on secrets in all environments; manage members and roles; create/revoke CI/CD tokens; view audit log; delete project |
| **Developer** | CRUD on `dev` secrets; read-only on `staging` secrets; no access to `prod` |
| **Read-only** | Read-only on `dev` and `staging` secrets; no access to `prod` |
| **CI/CD Token** | Read secrets in the single environment the token was scoped to at creation; nothing else |
| **Unauthenticated** | Access public endpoints only (login, register, OAuth callbacks, health check) |

---

## System Guarantees (Invariants)

### Data Isolation

**INV-01 — Project Isolation**
A user's secrets, environments, members, and audit log entries MUST be fully isolated to their project. No query or API response may leak data from a project the requesting actor does not belong to.

**INV-02 — Environment Isolation**
Secrets are scoped to a specific environment within a project. A secret with key `DB_URL` in `dev` is a distinct record from `DB_URL` in `prod`. They share only the key name; their values, IDs, and access history are independent.

**INV-03 — Secret Value Opacity**
Secret values MUST exist only in two states in any system boundary: encrypted at rest in the database, or decrypted in-memory during a single authorized request-response cycle. No intermediate representation of a secret value in plain text may be persisted to disk, logged, or transmitted without TLS.

---

### Encryption

**INV-04 — Encryption Before Storage**
A secret value MUST be encrypted with AES-256-GCM before any write to the database. The system MUST NEVER write a plain-text secret value to the database.

**INV-05 — Key Separation**
The encryption key used for AES-256-GCM MUST NOT be stored in the same database record, table, or schema as the encrypted ciphertext it was used to produce. Key and ciphertext MUST be separated at rest.

**INV-06 — Decryption Scope**
Secret decryption MUST only occur server-side, within the scope of an authenticated and authorized API request. Client-side decryption (in-browser or in-CLI before transport) is not supported and MUST NOT be introduced.

---

### Access Control

**INV-07 — RBAC Enforcement on Every Request**
Every API request that accesses a secret or manages a member MUST be evaluated against the role matrix (FR-052) before any business logic executes. There is no fast path, no internal shortcut, and no service-to-service call that bypasses role checking.

**INV-08 — CI/CD Token Scope Lock**
A CI/CD token is bound to exactly one project and one environment at creation. This binding is immutable. The token can never be upgraded to a broader scope or a different environment without being revoked and a new token issued.

**INV-09 — Revocation Immediacy**
A revoked session token or CI/CD token MUST be rejected on the very next API request that presents it. The system MUST NOT honor a token that has been marked revoked, regardless of its expiry timestamp.

**INV-10 — Minimum Ownership Guarantee**
Every project MUST have at least one Owner at all times. The system MUST prevent any operation (role change, member removal, account deletion) that would result in a project with zero owners.

---

### Audit Integrity

**INV-11 — Audit Completeness**
Every state-changing operation on a secret (create, update, delete) and every read of a secret value (individual or bulk) MUST produce an audit log entry. Operations MUST fail atomically if the audit write fails — the business operation MUST NOT succeed while the audit record is silently dropped.

**INV-12 — Audit Immutability**
Audit log entries MUST be append-only. No user-facing API endpoint, no background job, and no migration may delete or update an existing audit log entry.

---

### CLI Behavior

**INV-13 — No Disk Persistence During `jex run`**
`jex run -- <command>` MUST inject secrets as OS environment variables into the child process. It MUST NOT write any file to disk (no `.env`, no temp file, no cache). If the process exits or is killed, the secrets cease to exist.

**INV-14 — Atomic `.env` Write**
`jex secrets pull` MUST write the `.env` file atomically. The file must not be left in a partial state if the pull fails mid-transfer. The implementation MUST write to a temp file then rename (atomic on POSIX systems).

**INV-15 — `.envault` Contains No Secrets**
The `.envault` config file created by `jex init` MUST contain only project name, default environment name, and API base URL. It MUST NOT contain any authentication token, secret key, encryption material, or secret value.

---

### Transport Security

**INV-16 — TLS-Only Transport**
All communication between the CLI, the web dashboard, and the API MUST use HTTPS (TLS 1.2+). The system MUST NOT expose any secret-bearing endpoint over plain HTTP.

---

## Absolute Prohibitions

| ID | The system MUST NEVER... |
|----|--------------------------|
| FRB-01 | Store a secret value in plain text in the database |
| FRB-02 | Return data from a project the requesting actor does not belong to |
| FRB-03 | Allow a Developer or Read-only actor to read or write `prod` secrets |
| FRB-04 | Allow a CI/CD token to access any environment other than the one it was scoped to at creation |
| FRB-05 | Honor a revoked session or CI/CD token |
| FRB-06 | Leave a project with zero owners |
| FRB-07 | Write a secret value to disk during `jex run` |
| FRB-08 | Include secret values in application logs, error responses, or monitoring payloads |
| FRB-09 | Write a partial `.env` file on a failed pull |
| FRB-10 | Succeed in writing a secret while silently failing to write its audit log entry |
| FRB-11 | Allow the encryption key to co-reside in the same database field or row as the ciphertext it protects |
| FRB-12 | Include any secret, token, or encryption material in the `.envault` config file |

---

## Exception Handlers

| ID | Trigger | Contracted Recovery |
|----|---------|---------------------|
| EXC-01 | Database write for a secret fails | Return HTTP 500 to caller. No partial state is committed. Audit event is also rolled back. |
| EXC-02 | Audit log write fails during a secret operation | Roll back the secret write. Return HTTP 500. The operation is not considered complete. |
| EXC-03 | Decryption fails for a stored secret (key mismatch or corrupt ciphertext) | Return HTTP 500 with code `DECRYPTION_FAILURE`. Do not return partial or garbage data. Log the error server-side without the ciphertext. |
| EXC-04 | CI/CD token presented but already revoked | Return HTTP 401 with code `TOKEN_REVOKED`. Do not process the request. |
| EXC-05 | `jex run` child process fails to start | Secrets injected into the failed process scope are discarded when the process exits. No cleanup needed — nothing was written to disk. |
| EXC-06 | API unreachable during `jex secrets pull` | Exit with error. Do not write a partial `.env` file. Existing `.env` file (if present) is left untouched. |
| EXC-07 | Owner removal would leave project with zero owners | Return HTTP 422 with code `LAST_OWNER_REMOVAL`. Block the operation. |
| EXC-08 | OAuth provider returns error during login | Surface provider error to the user in the dashboard. Do not create a session. |
| EXC-09 | Encryption key unavailable at secret write time | Return HTTP 503. Do not write an unencrypted fallback. Alert operators. |
