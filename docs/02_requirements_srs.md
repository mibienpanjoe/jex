# Jex — Software Requirements Specification
Version: v1.0, 2026-04-06

---

## Normative Vocabulary

| Term | Meaning |
|------|---------|
| **MUST / REQUIRED** | Absolute requirement. The system fails if not met. |
| **MUST NOT** | Absolute prohibition. Violation is a defect. |
| **SHOULD** | Recommended. Deviation permitted with documented justification. |
| **MAY** | Optional capability. |
| **SHALL** | Synonym for MUST, used for clarity in legal-style phrasing. |

---

## Actors

| Actor | Description |
|-------|-------------|
| **Owner** | Project member with full read/write access to all environments, including `prod`. Can manage members, tokens, and audit logs. |
| **Developer** | Project member with read+write on `dev`, read-only on `staging`, no access to `prod`. |
| **Read-only** | Project member with read-only access to `dev` and `staging`. No access to `prod`. |
| **CI/CD Token** | Machine actor. Project-scoped, environment-scoped, read-only. No UI access. Cannot be assigned a human role. |
| **Unauthenticated User** | An anonymous visitor or unauthenticated API caller. Has no access to vault data. |
| **System** | Internal automated processes: audit logging, encryption, session management. |

---

## Functional Requirements

### FR-010 — Authentication

- **FR-011**: The system MUST support account creation with email and password.
- **FR-012**: Passwords MUST be hashed using bcrypt with a cost factor ≥ 12 before storage.
- **FR-013**: The system MUST support login via GitHub OAuth.
- **FR-014**: The system MUST support login via Google OAuth.
- **FR-015**: The system MUST support two-factor authentication (TOTP) as an optional account setting.
- **FR-016**: The system MUST issue a session token upon successful authentication.
- **FR-017**: Session tokens MUST be invalidated on logout.
- **FR-018**: The system MUST allow a user to list and revoke individual active sessions from the dashboard.
- **FR-019**: Unauthenticated requests to any protected endpoint MUST be rejected with HTTP 401.

---

### FR-020 — Project Management

- **FR-021**: An authenticated user MUST be able to create a new project with a unique name within their account.
- **FR-022**: A newly created project MUST automatically contain three environments: `dev`, `staging`, and `prod`.
- **FR-023**: The project creator MUST automatically be assigned the Owner role.
- **FR-024**: An Owner MUST be able to rename a project.
- **FR-025**: An Owner MUST be able to delete a project. Deletion MUST also delete all associated secrets, environments, members, tokens, and audit log entries.
- **FR-026**: The system MUST prevent a project from being deleted while a deletion is already in progress (idempotent delete guard).

---

### FR-030 — Environment Management

- **FR-031**: Each project MUST contain exactly three default environments at creation: `dev`, `staging`, `prod`.
- **FR-032**: Environments MUST be isolated: a secret stored in `dev` is a distinct record from a secret of the same key name in `staging`.
- **FR-033**: An Owner MAY create additional custom environments beyond the three defaults.
- **FR-034**: Environment names MUST be lowercase alphanumeric strings with hyphens allowed (regex: `^[a-z0-9-]+$`).
- **FR-035**: Deleting an environment MUST also delete all secrets within it.

---

### FR-040 — Secret Management

- **FR-041**: A user with write access to an environment MUST be able to create a secret as a key-value pair.
- **FR-042**: Secret keys MUST match the pattern `^[A-Z][A-Z0-9_]*$` (uppercase with underscores, consistent with `.env` convention).
- **FR-043**: Secret values MUST be encrypted with AES-256-GCM before storage. The encrypted ciphertext is what persists in the database.
- **FR-044**: Secret values MUST NOT be stored in plain text at any layer — not in the database, not in application logs, not in error messages.
- **FR-045**: A user with read access to an environment MUST be able to retrieve the decrypted value of a specific secret by key.
- **FR-046**: A user with write access MUST be able to update the value of an existing secret.
- **FR-047**: A user with write access MUST be able to delete a secret.
- **FR-048**: The system MUST support bulk import: parsing a `.env`-format file and creating or updating all secrets in the specified environment.
- **FR-049**: The system MUST support bulk export: returning all key-value pairs for an environment as a `.env`-format payload. Each retrieval MUST be logged individually in the audit log.
- **FR-04A**: `jex secrets list` MUST return only key names, never values, regardless of the caller's role.

---

### FR-050 — Access Control

- **FR-051**: Access control MUST be enforced on every API request by comparing the authenticated actor's role against the required permission for the requested operation and environment.
- **FR-052**: The RBAC matrix is:

  | Role | dev | staging | prod |
  |------|-----|---------|------|
  | Owner | read + write | read + write | read + write |
  | Developer | read + write | read only | no access |
  | Read-only | read only | read only | no access |
  | CI/CD Token | — | — | read only (scoped to one env) |

- **FR-053**: A Developer attempting to read or write `prod` secrets MUST receive HTTP 403.
- **FR-054**: A Read-only member attempting to write any secret MUST receive HTTP 403.
- **FR-055**: An Owner MUST be able to invite a user to a project by email address and assign them an initial role.
- **FR-056**: An Owner MUST be able to change a member's role at any time.
- **FR-057**: An Owner MUST be able to remove a member from a project.
- **FR-058**: An Owner MUST be able to create a CI/CD token scoped to a specific project and environment.
- **FR-059**: An Owner MUST be able to revoke a CI/CD token instantly. Revoked tokens MUST be rejected on the next API call.
- **FR-05A**: A project MUST always have at least one Owner. The last Owner cannot be removed or demoted.

---

### FR-060 — CLI

- **FR-061**: The CLI binary MUST be named `jex` and installable globally via `npm install -g @jex/cli`.
- **FR-062**: `jex login` MUST authenticate the user. It SHOULD open a browser for OAuth. On headless environments, it MUST accept a token string via stdin or flag.
- **FR-063**: `jex logout` MUST invalidate the local session token and delete it from disk.
- **FR-064**: `jex init` MUST create a `.envault` file in the current directory containing: project name, default environment, and API base URL. This file MUST be committed to version control (it contains no secrets).
- **FR-065**: `jex secrets pull` MUST fetch all secrets for the active environment and write them to a `.env` file in the current directory.
- **FR-066**: `jex secrets push` MUST read a `.env` file from the current directory and upload all key-value pairs to the vault for the active environment.
- **FR-067**: `jex secrets set KEY=value --env <env>` MUST set a single secret. If the key exists it is updated; if not it is created.
- **FR-068**: `jex secrets list` MUST return key names only — never values — for the active environment.
- **FR-069**: `jex run -- <command>` MUST inject secrets for the active environment as environment variables into the child process. It MUST NOT write any `.env` file to disk. The child process inherits the secrets; they are never persisted on the filesystem.
- **FR-06A**: `jex envs` MUST list all available environments for the project linked in `.envault`.
- **FR-06B**: All commands MUST support an `--env <name>` flag to override the default environment from `.envault`.
- **FR-06C**: The CLI MUST display clear error messages when: not authenticated, no `.envault` found, network unreachable, or the user lacks permission for the requested operation.

---

### FR-070 — Audit Log

- **FR-071**: The system MUST record an audit event for every: secret create, secret read (individual or bulk), secret update, secret delete, member invite, member role change, member removal, CI/CD token create, CI/CD token revoke.
- **FR-072**: Each audit event MUST record: actor identity (user ID or token ID), actor display name, timestamp (UTC), operation type, project ID, environment, and affected key (where applicable).
- **FR-073**: Audit events MUST be immutable — they cannot be edited or deleted through any user-facing interface.
- **FR-074**: An Owner MUST be able to view the full audit log for their project in the dashboard.
- **FR-075**: The audit log view MUST support filtering by: date range, actor, operation type, and environment.

---

### FR-080 — Web Dashboard

- **FR-081**: The dashboard MUST be accessible at a web URL and function in modern browsers (Chrome, Firefox, Safari, Edge — latest two major versions).
- **FR-082**: The dashboard MUST display a project list for the authenticated user.
- **FR-083**: The dashboard MUST allow secret CRUD for each environment the user has access to.
- **FR-084**: Owners MUST be able to manage team members and CI/CD tokens from the dashboard.
- **FR-085**: Owners MUST be able to view the audit log from the dashboard.
- **FR-086**: The dashboard MUST enforce the same RBAC rules as the API — the UI MUST hide or disable actions the current user is not permitted to perform.

---

## Business Rules

| ID | Rule |
|----|------|
| BR-01 | A project name must be unique per owner account. Two different owners may have projects with the same name. |
| BR-02 | A secret key must be unique within an environment. The same key may exist in different environments with different values. |
| BR-03 | A `.envault` file contains no secrets — it is safe to commit to version control. |
| BR-04 | CI/CD tokens are environment-scoped. A token scoped to `prod` cannot read `dev` secrets. |
| BR-05 | The encryption key used for AES-256-GCM MUST NOT be stored in the database alongside the encrypted data. |
| BR-06 | A `jex run` child process receives secrets as OS environment variables. Secrets are not written to the filesystem at any point. |

---

## Non-Functional Constraints

### Performance

| Metric | Target |
|--------|--------|
| `jex secrets pull` (≤ 50 secrets) | < 1 second on a standard broadband connection |
| `jex run -- <command>` secret injection overhead | < 500ms before child process starts |
| Dashboard initial page load (LCP) | < 3 seconds on a 4G connection |
| API response time (p95) for secret read/write | < 300ms |
| Audit log query (last 1,000 events) | < 500ms |

### Availability

- The hosted API SHOULD target 99.5% uptime.
- The system MUST degrade gracefully: if the API is unreachable, the CLI MUST display a clear error and exit cleanly (no silent failure, no partial `.env` write).

### Security

- All transport MUST use HTTPS with TLS 1.2 or higher.
- Secrets MUST be encrypted with AES-256-GCM before storage.
- The encryption key MUST NOT co-reside with the encrypted data in the same database field or table.
- All API endpoints MUST validate the session token on every request. Tokens MUST NOT be cached in a way that allows access after revocation.
- CI/CD token revocation MUST take effect within 1 second of the revocation request completing.
- Passwords MUST be hashed with bcrypt (cost ≥ 12) and MUST NOT be stored or transmitted in plain text.
- The API MUST enforce CORS to allow requests only from the configured dashboard origin.

### Data Privacy

- Secret values MUST only be decrypted server-side in response to an authenticated, authorized request.
- Secret values MUST NOT appear in application logs, error traces, or monitoring payloads.
- The CLI MUST NOT cache secret values locally beyond the duration of a `jex run` child process.

### Scalability

- The system MUST function correctly with ≥ 100 simultaneous API requests at MVP scale.
- The database schema MUST support multiple tenants (users, projects) without data isolation issues.

### Portability

- The full stack (API, frontend, database) MUST be launchable with `docker-compose up` on any machine with Docker installed.
- The CLI MUST distribute as a self-contained binary for Linux (amd64, arm64) and macOS (amd64, arm64). The npm package wraps the binary — no Node.js runtime is required to run `jex`.

---

## Error Cases

| ID | Trigger | Required Behavior |
|----|---------|-------------------|
| ERR-011 | Login with unknown email or wrong password | HTTP 401, generic message: "Invalid email or password" (do not reveal which field is wrong) |
| ERR-012 | OAuth provider returns error | HTTP 400, surface provider error message to user |
| ERR-013 | 2FA code invalid or expired | HTTP 401, prompt re-entry |
| ERR-041 | Attempt to create duplicate key in same environment | HTTP 409, error code `SECRET_KEY_ALREADY_EXISTS` |
| ERR-042 | Invalid secret key format | HTTP 422, error code `INVALID_KEY_FORMAT`, with regex explanation |
| ERR-043 | Secret value exceeds max length (32 KB) | HTTP 422, error code `VALUE_TOO_LARGE` |
| ERR-051 | Access to forbidden environment | HTTP 403, error code `INSUFFICIENT_PERMISSIONS` |
| ERR-052 | CI/CD token used after revocation | HTTP 401, error code `TOKEN_REVOKED` |
| ERR-053 | Attempt to remove last Owner | HTTP 422, error code `LAST_OWNER_REMOVAL` |
| ERR-061 | CLI used without authentication | Print: "Not authenticated. Run `jex login`." Exit 1. |
| ERR-062 | CLI used outside a `jex init` directory | Print: "No .envault file found. Run `jex init`." Exit 1. |
| ERR-063 | API unreachable from CLI | Print: "Cannot connect to Jex API at <url>." Exit 1. No partial file written. |
| ERR-071 | Audit log write fails | Log error server-side. MUST NOT silently succeed — the operation MUST fail if audit logging fails. |
