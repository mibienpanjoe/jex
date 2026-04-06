# Jex — Product Requirements Document
Version: v1.0, 2026-04-06

---

## 1. Problem Statement

Developer teams routinely share environment variables — API keys, database credentials, tokens — through insecure, ad hoc channels: WhatsApp messages, Slack DMs, emailed `.env` files. This practice creates four compounding problems:

1. **Security exposure**: secrets traverse chat logs, email inboxes, and message history where they linger indefinitely and are accessible to anyone with account access.
2. **Stale credentials**: when a secret is rotated, the team must be notified manually. Someone always misses it, causing outages or continued use of revoked credentials.
3. **Accidental commits**: `.env` files on disk are one mistaken `git add` away from being pushed to a public repository.
4. **No accountability**: there is no record of who accessed which secret, when, or from where.

Existing solutions (HashiCorp Vault, AWS Secrets Manager, Doppler) are either too complex to self-host, prohibitively expensive for small teams, or too coupled to specific cloud providers. Developer teams — especially in emerging markets — need a self-hostable, open-source secrets manager that fits the way they actually work.

---

## 2. Personas

### Primary — Developer
A software engineer working on a team project. They need to pull the correct environment variables for their local setup quickly, without bothering a teammate or digging through chat history. They care about speed and simplicity.

**Pain point**: "I just cloned the repo — where do I get the `.env` file?"

### Secondary — Team Owner / Lead
A senior developer or tech lead who manages project access, onboards teammates, and controls which environments each person can touch. They need oversight and control without becoming a bottleneck.

**Pain point**: "I rotated the production DB password — now I have to message everyone individually and hope they update before something breaks."

### Tertiary — CI/CD Pipeline (Automated Actor)
A GitHub Actions workflow, Docker build, or deployment script that needs read access to production secrets at runtime. It must receive scoped, revokable credentials without human involvement.

**Pain point**: "Hardcoding secrets in CI environment variables means revoking a key requires updating every pipeline manually."

---

## 3. Solution Overview

Jex is an open-source secrets manager built for developer teams. It provides a shared encrypted vault where secrets are stored, versioned, and accessed by role. Developers interact with secrets through a Go CLI (`jex`) that can pull secrets to a local `.env` file or inject them directly into a running process without writing anything to disk. Team owners manage access, environments, and audit history through a web dashboard. CI/CD pipelines receive scoped, read-only tokens that can be revoked instantly.

The entire stack is MIT-licensed and self-hostable via a single `docker-compose up` command, removing cloud vendor lock-in.

---

## 4. MVP Scope (v0.1)

### Authentication
- Email/password account creation and login
- GitHub OAuth login
- Google OAuth login
- Two-factor authentication (via Better Auth plugin)
- Session management (create, list, revoke sessions)

### Project & Environment Management
- Create, rename, and delete projects
- Each project contains three default environments: `dev`, `staging`, `prod`
- Team members are invited to a project by email

### Secret Management (CRUD)
- Create a secret (key + value) in a specific environment
- Read all key names for an environment (values are never listed in bulk — fetched on demand)
- Update the value of an existing secret
- Delete a secret
- Push a local `.env` file to the vault (bulk import)
- Pull secrets from the vault to a local `.env` file

### Role-Based Access Control
- Three roles: Owner, Developer, Read-only
- Owners: full access to all environments
- Developers: read + write on `dev`, read-only on `staging`, no access to `prod`
- Read-only: read-only access to `dev` and `staging`, no access to `prod`
- CI/CD tokens: project-scoped, environment-scoped, read-only, revokable

### CLI (core commands)
- `jex login` / `jex logout` — authenticate via browser OAuth or token
- `jex init` — link current directory to a vault project, create `.envault` config file
- `jex secrets pull` — download secrets to a local `.env` file
- `jex secrets push` — upload a local `.env` file to the vault
- `jex secrets set KEY=value` — set a single secret inline
- `jex secrets list` — list key names (never values) for the active environment
- `jex run -- <command>` — inject secrets directly into a child process (no `.env` file created)
- `jex envs` — list available environments for the current project

### Audit Log
- Every secret read, write, create, and delete is logged
- Each log entry records: actor (user or CI/CD token), timestamp, operation, affected key, and environment
- Audit log is viewable in the web dashboard (owner-only)

### Web Dashboard
- Project list and creation
- Secret CRUD per environment per project
- Team member management (invite, remove, role assignment)
- CI/CD token creation and revocation
- Audit log viewer

---

## 5. Out of Scope for MVP (v0.1)

- **Secret versioning and rollback** — secrets have no history in v0.1; planned for v0.2
- **`--watch` mode** — `jex secrets pull --watch` for auto-sync on remote change; planned for v0.2
- **Git hook auto-install** — automatic pull on `git pull` or branch switch; planned for v0.2
- **TUI project picker** — interactive Bubble Tea interface for selecting projects; planned for v0.2
- **French language** — full dashboard and landing page translation; planned for v0.2
- **French documentation** — French docs site; planned for v0.2
- **Custom environments** — teams adding environments beyond dev/staging/prod; planned post-v0.2
- **Secret sharing between projects** — no cross-project references
- **Secret expiry / TTL** — secrets do not expire automatically
- **Notifications** — no email/Slack alerts on secret changes
- **Mobile app** — web dashboard only
- **Payment processing or monetization features** — Jex is free and open source

---

## 6. Success Criteria

| Criterion | Target |
|-----------|--------|
| A new developer can onboard (clone, install, authenticate, pull secrets) without help from a teammate | ≤ 5 minutes end-to-end |
| A team owner can invite a teammate and assign a role | ≤ 2 minutes |
| `jex run -- <command>` injects secrets into a process without creating a file on disk | Verified on macOS, Linux |
| CI/CD token, once revoked, stops granting access immediately | ≤ 1 second propagation |
| All secrets are encrypted before storage — no plain-text secrets in the database | Verified by database inspection |
| Audit log records every secret access event without exception | 100% coverage on create/read/update/delete |
| Self-hosted stack starts successfully with `docker-compose up` | Works on any machine with Docker installed |
| At least one team successfully uses Jex in their daily development workflow | ≥ 1 real-world team adoption |
