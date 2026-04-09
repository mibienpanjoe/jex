# Jex — Implementation Plan
Version: v1.0, 2026-04-06

---

## How to read this plan

Each phase is a self-contained vertical slice of the system. Complete each phase fully before starting the next — later phases depend on what earlier ones put in place. Within a phase, tasks are ordered; commit after each task using the commit message shown.

**Single branch. No feature branches.** All work commits directly to `main`. Commits are atomic and granular — one logical change per commit. This keeps the history readable and makes every commit individually deployable or revertable.

---

## Commit Convention

```
<type>(<scope>): <imperative description>

Types:  feat | fix | chore | refactor | test | docs
Scope:  monorepo | db | auth | crypto | secrets | access | audit |
        projects | envs | members | tokens | cli | dashboard | landing | infra
```

**Rules:**
- Subject line ≤ 72 characters, lowercase after the colon
- Imperative mood: "add", "implement", "wire", "enforce" — not "added" or "adds"
- No co-author line
- Commit after each numbered task below — do not batch multiple tasks into one commit
- If a task produces no files (only a decision), skip the commit

---

## Phase 0 — Monorepo & Project Skeleton

**Goal:** A running repo with the correct directory layout, tooling config, and an empty-but-valid database schema. Nothing functional yet, but `npm install` works and `docker-compose up` starts the services.

### Tasks

**0.1** Initialize the monorepo root

```
mkdir jex && cd jex
git init
npm init -y
```

Create `package.json` at root with workspaces pointing to `apps/web`, `apps/api`, `cli`. Add `.gitignore` (node_modules, .env, dist, bin, *.db).

```
chore(monorepo): initialize npm workspaces monorepo
```

---

**0.2** Scaffold `apps/api`

```
apps/api/
  src/
    index.ts          ← Express app entry point (empty routes, health check)
    health.ts         ← GET /api/v1/health handler
  prisma/
    schema.prisma     ← empty schema (datasource + generator only)
  .env.example        ← DATABASE_URL, ENCRYPTION_KEY, BETTER_AUTH_SECRET, PORT
  tsconfig.json
  package.json        ← express, prisma, @prisma/client, typescript, ts-node-dev
```

```
chore(monorepo): scaffold api app with express entry point and prisma config
```

---

**0.3** Scaffold `apps/web`

```
apps/web/
  app/
    layout.tsx
    page.tsx          ← placeholder "Jex" text
  components/
  messages/
    en.json           ← empty {}
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json        ← next, react, tailwind, next-intl
```

```
chore(monorepo): scaffold web app with next.js app router and tailwind
```

---

**0.4** Scaffold `cli/`

```
cli/
  cmd/
    root.go           ← cobra root command, version flag
  main.go
  go.mod              ← module github.com/jex-app/cli
  go.sum
```

```
chore(monorepo): initialize go cli module with cobra root command
```

---

**0.5** Write the full Prisma schema

Define all models based on the data architecture in `05_architecture.md`:

- `User` — id, email, name, passwordHash, twoFactorEnabled, createdAt
- `Session` — id, userId (FK), token, userAgent, createdAt, lastUsedAt, revokedAt
- `Project` — id, name, createdAt, updatedAt
- `ProjectMember` — id, projectId (FK), userId (FK), role (Owner|Developer|ReadOnly), joinedAt — unique(projectId, userId)
- `Environment` — id, projectId (FK), name, isDefault, createdAt — unique(projectId, name)
- `Secret` — id, projectId (FK), environment (string), key (string), ciphertext (text), iv (text), createdAt, updatedAt — unique(projectId, environment, key)
- `CICDToken` — id, projectId (FK), name, tokenHash (text), scopedEnv (string), createdAt, lastUsedAt, revokedAt
- `AuditEvent` — id, projectId (FK), actorId (string), actorName (string), actorType (User|CICDToken), operation (enum), env (string?), key (string?), timestamp

```
feat(db): define full prisma schema with all entities and constraints
```

---

**0.6** Write `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: jex
      POSTGRES_USER: jex
      POSTGRES_PASSWORD: jexpass
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]

  api:
    build: ./apps/api
    ports: ["3001:3001"]
    depends_on: [db]
    env_file: ./apps/api/.env

  web:
    build: ./apps/web
    ports: ["3000:3000"]
    depends_on: [api]
    env_file: ./apps/web/.env

volumes:
  pgdata:
```

```
chore(infra): add docker-compose with postgres, api, and web services
```

---

**0.7** Run first migration and verify health check

```bash
cd apps/api && npx prisma migrate dev --name init
```

Start the API and confirm `GET /api/v1/health` returns `{ status: "ok" }`.

```
feat(infra): run initial prisma migration and confirm health endpoint
```

---

**Phase 0 exit gate:** `docker-compose up` starts all three services. `GET /api/v1/health` returns 200. `prisma studio` shows all tables. The Go binary compiles with `go build ./...`.

---

## Phase 1 — Authentication

**Goal:** A user can register, log in with email/password, log in via GitHub or Google OAuth, manage sessions, and enable 2FA. Every subsequent phase builds on the authenticated actor context this phase produces.

### Tasks

**1.1** Install and configure Better Auth

```bash
cd apps/api && npm install better-auth
```

Create `src/auth/better-auth.config.ts`:
- Connect to Prisma adapter
- Configure email/password provider
- Configure GitHub OAuth provider (env: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)
- Configure Google OAuth provider (env: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- Configure TOTP 2FA plugin

```
feat(auth): configure better-auth with prisma adapter and oauth providers
```

---

**1.2** Mount auth routes on the API

Wire Better Auth's handler to `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/oauth/:provider`, `GET /api/v1/auth/oauth/:provider/callback`.

```
feat(auth): mount better-auth route handlers on express api
```

---

**1.3** Implement session list and revoke endpoints

`GET /api/v1/auth/sessions` — query all non-revoked sessions for the current user.
`DELETE /api/v1/auth/sessions/:sessionId` — set `revokedAt = now` on the target session; verify it belongs to the requesting user.

```
feat(auth): add session list and individual session revoke endpoints
```

---

**1.4** Implement the `authenticate` middleware

Create `src/auth/middleware.ts`:
- Extract `Authorization: Bearer <token>` from every request
- Look up the token in the Sessions table — reject with 401 if not found or `revokedAt` is set (INV-09, no cache)
- Attach `req.actor = { userId, actorType: "User" }` to the request context
- Separate path for CI/CD tokens (look up in `CICDToken` table, attach `{ tokenId, actorType: "CICDToken", scopedEnv }`)

```
feat(auth): implement authenticate middleware with per-request revocation check
```

---

**1.5** Protect all non-auth routes

Apply the `authenticate` middleware to all routes except `/api/v1/health`, `/api/v1/auth/*`.

```
feat(auth): apply authenticate middleware globally to protected routes
```

---

**1.6** Wire auth UI in the web dashboard

Create `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx` using Better Auth's client SDK. Include email/password form and GitHub/Google OAuth buttons. Use the design tokens from `07_visual_identity.md` (Indigo brand, dark surface, Inter font).

```
feat(auth): add login and register pages with email and oauth support
```

---

**Phase 1 exit gate:** A new user can register via the web UI. They can log in with email/password. GitHub and Google OAuth redirects complete and land on a (placeholder) dashboard page. The `authenticate` middleware rejects requests with no token or a revoked token with 401.

---

## Phase 2 — Projects & Environments

**Goal:** Authenticated users can create projects, and each project automatically gets its three default environments. Owners can rename and delete projects, and manage custom environments.

### Tasks

**2.1** Implement VaultStore — project queries

Create `src/vault/vault.store.ts`:
- `createProject(userId, name)` — insert Project + ProjectMember(role=Owner) + 3 Environments in one transaction
- `listProjectsForUser(userId)` — join ProjectMember → Project
- `getProject(projectId, userId)` — verify membership, return project + member's role
- `renameProject(projectId, name)` — update Project.name
- `deleteProject(projectId)` — delete cascade (secrets, envs, members, tokens, audit events)

All queries include `projectId` as a required parameter.

```
feat(projects): implement vault store project queries with membership checks
```

---

**2.2** Implement project API routes

Create `src/projects/projects.router.ts`:
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `GET /api/v1/projects/:projectId`
- `PATCH /api/v1/projects/:projectId`
- `DELETE /api/v1/projects/:projectId`

```
feat(projects): add project CRUD endpoints
```

---

**2.3** Implement AccessPolicy — project-level checks

Create `src/access/access.policy.ts`. For now implement only:
- `requireMember(actor, projectId)` — verify the actor belongs to this project
- `requireOwner(actor, projectId)` — verify the actor is an Owner on this project

Call these at the top of every project and environment route handler.

```
feat(access): implement requireMember and requireOwner policy checks
```

---

**2.4** Implement VaultStore — environment queries

Add to `vault.store.ts`:
- `listEnvironments(projectId)` — return envs with secret counts
- `createEnvironment(projectId, name)` — insert Environment, enforce unique(projectId, name)
- `deleteEnvironment(projectId, name)` — block deletion of `dev`, `staging`, `prod`; cascade delete secrets

```
feat(envs): implement vault store environment queries
```

---

**2.5** Implement environment API routes

Create `src/projects/envs.router.ts`:
- `GET /api/v1/projects/:projectId/envs`
- `POST /api/v1/projects/:projectId/envs` (Owner only)
- `DELETE /api/v1/projects/:projectId/envs/:envName` (Owner only)

```
feat(envs): add environment management endpoints
```

---

**2.6** Implement AccessPolicy — last-owner guard

Add to `access.policy.ts`:
- `requireNotLastOwner(projectId, targetUserId)` — count owners; throw if removing/demoting the last one (INV-10)

Wire this into the delete-project and future member-management routes.

```
feat(access): enforce last-owner guard to prevent ownerless projects
```

---

**2.7** Build projects UI in the dashboard

- `app/dashboard/page.tsx` — project list, "New project" button, project cards
- `app/dashboard/[projectId]/page.tsx` — project overview with environment tabs
- Project creation modal (name input, submit → POST /projects)

```
feat(dashboard): add project list and project overview pages
```

---

**Phase 2 exit gate:** A user can create a project from the dashboard. The project appears with `dev`, `staging`, `prod` tabs. Deleting a project removes all associated data. The last owner cannot be demoted.

---

## Phase 3 — Secrets Core

**Goal:** The vault's core function — secrets can be created, read, updated, deleted, imported in bulk, and exported. Values are always encrypted before storage and decrypted only for authorized reads. Every operation is audit-logged atomically.

### Tasks

**3.1** Implement CryptoService

Create `src/crypto/crypto.service.ts`:
- `encrypt(plainText: string): { ciphertext: string, iv: string }` — generate 12-byte random IV, AES-256-GCM encrypt, return base64 strings
- `decrypt(ciphertext: string, iv: string): string` — AES-256-GCM decrypt, return plain text
- Key loaded from `process.env.ENCRYPTION_KEY` (must be 32-byte hex string = 64 hex chars); throw on startup if missing or wrong length

```
feat(crypto): implement aes-256-gcm encrypt and decrypt in crypto service
```

---

**3.2** Implement AuditLog

Create `src/audit/audit.log.ts`:
- `record(tx, event: AuditEventInput): Promise<void>` — insert into `audit_events` within the provided Prisma transaction `tx`
- `query(projectId, filters): Promise<AuditEvent[]>` — filtered read for the dashboard

No UPDATE or DELETE methods on this class.

```
feat(audit): implement append-only audit log with transaction-scoped record method
```

---

**3.3** Implement VaultStore — secret queries

Add to `vault.store.ts`:
- `listSecretKeys(projectId, env)` — return key names + timestamps, no values
- `getSecret(projectId, env, key)` — return `{ ciphertext, iv }`
- `getAllSecrets(projectId, env)` — return all `[{ key, ciphertext, iv }]`
- `upsertSecret(tx, projectId, env, key, ciphertext, iv)` — insert or update within tx
- `deleteSecret(tx, projectId, env, key)` — delete within tx

```
feat(secrets): implement vault store secret queries with required project and env params
```

---

**3.4** Implement AccessPolicy — RBAC matrix

Add to `access.policy.ts`:
- `authorize(actor, operation: 'read'|'write', projectId, env)` — enforce FR-052 RBAC matrix
- For CI/CD tokens: additionally verify `actor.scopedEnv === env` (INV-08)
- Return `{ allowed: true }` or throw `ForbiddenError` with code `INSUFFICIENT_PERMISSIONS`

```
feat(access): implement full rbac matrix enforcement for secret operations
```

---

**3.5** Implement SecretsService

Create `src/secrets/secrets.service.ts`. All methods call AccessPolicy first, then route through CryptoService + VaultStore + AuditLog inside a Prisma transaction:

- `listKeys(actor, projectId, env)` — access check, then VaultStore.listSecretKeys
- `getSecret(actor, projectId, env, key)` — access check, decrypt, audit READ
- `exportSecrets(actor, projectId, env)` — access check, decrypt all, audit READ_BULK
- `createSecret(actor, projectId, env, key, value)` — access check, encrypt, upsertSecret + auditLog in one tx
- `updateSecret(actor, projectId, env, key, value)` — same as create
- `deleteSecret(actor, projectId, env, key)` — access check, deleteSecret + auditLog in one tx
- `importSecrets(actor, projectId, env, pairs)` — validate all keys, encrypt all, upsert all + one bulk audit event in one tx

```
feat(secrets): implement secrets service orchestrating access, crypto, store, and audit
```

---

**3.6** Implement secret API routes

Create `src/secrets/secrets.router.ts`:
- `GET /api/v1/projects/:projectId/secrets?env=`
- `GET /api/v1/projects/:projectId/secrets/export?env=&format=`
- `GET /api/v1/projects/:projectId/secrets/:key?env=`
- `POST /api/v1/projects/:projectId/secrets`
- `PUT /api/v1/projects/:projectId/secrets/:key?env=`
- `DELETE /api/v1/projects/:projectId/secrets/:key?env=`
- `POST /api/v1/projects/:projectId/secrets/import`

```
feat(secrets): add all secret crud and import/export api endpoints
```

---

**3.7** Build secrets UI in the dashboard

- `app/dashboard/[projectId]/secrets/page.tsx` — secrets table per environment tab
  - List key names (no values by default)
  - Reveal button: calls GET /secrets/:key on click, shows value in monospace
  - Add secret form (inline or modal)
  - Edit value inline
  - Delete with confirmation dialog
  - Import from `.env` file (file picker → parse → POST /secrets/import)

```
feat(dashboard): add secrets management page with reveal, add, edit, delete, and import
```

---

**3.8** Build audit log UI in the dashboard

- `app/dashboard/[projectId]/audit/page.tsx`
- Table showing: actor name, operation badge, key (monospace), environment badge, timestamp
- Filters: environment selector, operation type selector, date range picker

```
feat(dashboard): add audit log viewer page with filtering
```

---

**Phase 3 exit gate:** A user can set a secret via the dashboard and verify it is stored encrypted (check DB directly). A Developer cannot access `prod`. Deleting a secret while the audit write is blocked rolls back the deletion. The reveal button decrypts and shows the value on demand.

---

## Phase 4 — Members & CI/CD Tokens

**Goal:** Owners can invite teammates, assign roles, and remove members. Owners can create environment-scoped CI/CD tokens and revoke them instantly.

### Tasks

**4.1** Implement VaultStore — member queries

Add to `vault.store.ts`:
- `listMembers(projectId)`
- `getMember(projectId, userId)`
- `addMember(projectId, userId, role)` — insert ProjectMember
- `updateMemberRole(tx, projectId, userId, role)`
- `removeMember(tx, projectId, userId)`

```
feat(members): implement vault store member queries
```

---

**4.2** Implement member API routes

Create `src/members/members.router.ts`:
- `GET /api/v1/projects/:projectId/members`
- `POST /api/v1/projects/:projectId/members` — invite by email; if user doesn't exist, queue pending invite
- `PATCH /api/v1/projects/:projectId/members/:userId` — role change + last-owner guard
- `DELETE /api/v1/projects/:projectId/members/:userId` — remove + last-owner guard

Each write operation is audit-logged.

```
feat(members): add member management endpoints with audit logging
```

---

**4.3** Build members UI in the dashboard

- `app/dashboard/[projectId]/members/page.tsx`
- Members table: avatar, name, email, role badge (Owner/Developer/Read-only), remove button
- "Invite member" button → modal (email input + role selector)
- Role badge is a dropdown for owners (click to change role inline)
- Last owner's remove button is disabled with tooltip

```
feat(dashboard): add members management page with invite, role change, and remove
```

---

**4.4** Implement VaultStore — CI/CD token queries

Add to `vault.store.ts`:
- `listTokens(projectId)` — return metadata only, never the plain token
- `createToken(projectId, name, scopedEnv, tokenHash)` — insert CICDToken
- `getTokenByHash(tokenHash)` — used by AuthGateway to validate token on each request
- `revokeToken(projectId, tokenId)` — set `revokedAt = now`

```
feat(tokens): implement vault store cicd token queries
```

---

**4.5** Implement CI/CD token API routes

Create `src/tokens/tokens.router.ts`:
- `GET /api/v1/projects/:projectId/tokens`
- `POST /api/v1/projects/:projectId/tokens` — generate random token, store only the hash (bcrypt or sha256), return plain token once
- `DELETE /api/v1/projects/:projectId/tokens/:tokenId`

```
feat(tokens): add cicd token create, list, and revoke endpoints
```

---

**4.6** Wire CI/CD token validation into AuthGateway

In `src/auth/middleware.ts`, add the second path:
- If token prefix is `jex_` (CI/CD token), hash the incoming value and look up in `CICDToken` by hash
- Verify `revokedAt` is null (INV-09)
- Attach `req.actor = { tokenId, actorType: "CICDToken", projectId, scopedEnv }`

```
feat(auth): wire cicd token validation into authenticate middleware
```

---

**4.7** Build CI/CD tokens UI in the dashboard

- `app/dashboard/[projectId]/tokens/page.tsx`
- Tokens table: name, scoped environment badge, created date, last used date, revoke button
- "New token" button → modal (name input + environment selector)
- After creation: display token value in a one-time reveal box with copy button and clear warning that it won't be shown again

```
feat(dashboard): add cicd tokens page with create and revoke functionality
```

---

**Phase 4 exit gate:** An owner can invite a teammate. The teammate logs in and can access `dev` secrets but cannot see `prod`. A CI/CD token scoped to `prod` can read prod secrets but gets 403 on `dev`. Revoking a token causes the next API call with that token to return 401 immediately.

---

## Phase 5 — Go CLI

**Goal:** All `jex` commands are implemented as a compiled Go binary. `jex run` injects secrets without writing to disk. `jex secrets pull` writes atomically. The binary is wrapped in an npm package.

### Tasks

**5.1** Implement the API client package

Create `cli/internal/api/client.go`:
- `Client` struct with `baseURL`, `token` fields
- Methods: `ExportSecrets(projectId, env)`, `ListKeys(projectId, env)`, `SetSecret(projectId, env, key, value)`, `ListProjects()`, `ListEnvs(projectId)`
- All requests use HTTPS; reject `http://` base URLs unless `--allow-insecure` is set

```
feat(cli): implement api http client with all required request methods
```

---

**5.2** Implement the config package (`.envault`)

Create `cli/internal/config/envault.go`:
- `Read()` — walk up directories to find `.envault`, parse TOML or JSON
- `Write(project, env, apiURL)` — write `.envault` to current directory
- Fields: `project` (string), `defaultEnv` (string), `apiURL` (string) — nothing else (INV-15)

```
feat(cli): implement envault config read and write with no-secrets guarantee
```

---

**5.3** Implement auth token storage

Create `cli/internal/auth/token.go`:
- `Save(token)` — write to `~/.jex/token` with 0600 permissions
- `Load()` — read token from `~/.jex/token`
- `Clear()` — delete the file

```
feat(cli): implement local auth token storage in home directory
```

---

**5.4** Implement `jex login`

`cmd/login.go`:
- Open browser to `<apiURL>/api/v1/auth/cli-callback` (or print URL for headless)
- Wait for local callback server on a random port to receive the token
- Call `auth.Save(token)`
- Print: `Logged in successfully.`

```
feat(cli): implement jex login with browser oauth and local callback server
```

---

**5.5** Implement `jex logout`

`cmd/logout.go`:
- Call `DELETE /api/v1/auth/sessions/current`
- Call `auth.Clear()`
- Print: `Logged out.`

```
feat(cli): implement jex logout with server-side session revocation
```

---

**5.6** Implement `jex init`

`cmd/init.go`:
- Call `GET /api/v1/projects` to list available projects
- If multiple projects: show an interactive selector (Bubble Tea list component)
- If one project: select automatically
- Prompt for default environment (show env list via Bubble Tea)
- Call `config.Write(project, env, apiURL)`
- Print: `Initialized. .envault created.`

```
feat(cli): implement jex init with interactive project and environment selection
```

---

**5.7** Implement `jex secrets pull`

`cmd/secrets/pull.go`:
- Read `.envault` config
- Call `GET /api/v1/projects/:id/secrets/export?env=&format=dotenv`
- Write response body to a temp file in the same directory
- Call `os.Rename(tempFile, ".env")` — atomic write (INV-14)
- Print: `Pulled N secrets to .env`

```
feat(cli): implement jex secrets pull with atomic env file write
```

---

**5.8** Implement `jex secrets push`

`cmd/secrets/push.go`:
- Read `.envault` config
- Parse local `.env` file into key-value pairs
- Call `POST /api/v1/projects/:id/secrets/import`
- Print: `Pushed N secrets (X created, Y updated).`

```
feat(cli): implement jex secrets push from local env file
```

---

**5.9** Implement `jex secrets set`

`cmd/secrets/set.go`:
- Parse `KEY=value` from args
- Call `PUT /api/v1/projects/:id/secrets/:key?env=`
- Print: `Set KEY in <env>.`

```
feat(cli): implement jex secrets set for single key-value pairs
```

---

**5.10** Implement `jex secrets list`

`cmd/secrets/list.go`:
- Call `GET /api/v1/projects/:id/secrets?env=`
- Print key names in a clean table (lipgloss styling — minimal, monospace)

```
feat(cli): implement jex secrets list displaying key names only
```

---

**5.11** Implement `jex run`

`cmd/run.go`:
- Read `.envault` config
- Call `GET /api/v1/projects/:id/secrets/export?env=&format=json`
- Build env slice: `append(os.Environ(), "KEY=value", ...)`
- `cmd := exec.Command(args[0], args[1:]...)`
- `cmd.Env = envSlice`
- `cmd.Stdin = os.Stdin`, `cmd.Stdout = os.Stdout`, `cmd.Stderr = os.Stderr`
- `cmd.Run()` — never write anything to disk (INV-13)
- Exit with the child process exit code

```
feat(cli): implement jex run with in-memory secret injection and no disk write
```

---

**5.12** Implement `jex envs`

`cmd/envs.go`:
- Call `GET /api/v1/projects/:id/envs`
- Print environment names with their secret counts and the active one marked with `*`

```
feat(cli): implement jex envs command to list project environments
```

---

**5.13** Add error handling and `--env` flag

For every command:
- Add `--env` flag that overrides the `.envault` default
- Wrap all API errors into clear CLI messages:
  - 401 → `"Not authenticated. Run jex login."`
  - 403 → `"Permission denied for <env> environment."`
  - No `.envault` → `"No .envault found. Run jex init."`
  - Network error → `"Cannot connect to Jex API at <url>."`
- Exit with code 1 on any error

```
feat(cli): add --env flag and user-friendly error messages to all commands
```

---

**5.14** Create the npm wrapper package

```
packages/npm-wrapper/
  package.json          ← name: @jex/cli, bin: { jex: "./bin/run.js" }
  bin/run.js            ← detect platform/arch, exec the correct binary
  scripts/
    postinstall.js      ← download correct binary for current platform from GitHub releases
```

Add `Makefile` targets to cross-compile the Go binary for linux/amd64, linux/arm64, darwin/amd64, darwin/arm64.

```
chore(cli): add npm wrapper package and cross-compile makefile targets
```

---

**Phase 5 exit gate:** Install the binary locally. Run `jex login`, `jex init`, `jex secrets pull`. Verify `.env` is created atomically. Run `jex run -- env | grep MY_SECRET` and confirm the value appears without any `.env` file being written. Run `jex run -- env | grep MY_SECRET` while offline and confirm a clean error with exit code 1.

---

## Phase 6 — Landing Page & Docs

**Goal:** A public-facing landing page and documentation site that load fast, look polished, and clearly communicate what Jex does.

### Tasks

**6.1** Build the landing page shell

Implement `apps/web/app/(marketing)/page.tsx`:
- Sticky header: logo, nav (Features, Docs, GitHub), Login button, "Get Started" CTA
- Apply color tokens and typography from `07_visual_identity.md`
- Light mode for the landing page

```
feat(landing): add landing page shell with header and light mode layout
```

---

**6.2** Build hero section

- Headline: "Share secrets, not .env files."
- Sub-headline: one sentence summary
- Two CTA buttons: "Get Started for free" (primary, brand indigo) | "View on GitHub" (secondary)
- Terminal demo block: static code showing `jex run -- npm run dev` with lipgloss-style syntax highlighting as HTML

```
feat(landing): implement hero section with cta and cli demo block
```

---

**6.3** Build features sections

- Problem section (3-column): "No more Slack DMs", "No more stale credentials", "No more accidental commits"
- How it works (3 steps): Vault → CLI → Run
- Feature cards (6): env segmentation, RBAC, secret injection, audit trail, CI/CD tokens, self-hosting

```
feat(landing): add problem, how-it-works, and feature cards sections
```

---

**6.4** Build footer and install block

- Install command block: `npm install -g @jex/cli` in a styled code box with a copy button
- Footer: logo, GitHub link, MIT license, "Built by PARE Mibienpan Joseph"

```
feat(landing): add install command block and footer
```

---

**6.5** Set up next-intl for bilingual routing

Install `next-intl`. Configure `next.config.ts` for locale routing (`/en/*`, `/fr/*`). Move all UI strings from hardcoded text into `messages/en.json`. Wire `useTranslations()` into landing page components. French JSON file is an empty copy of English for now — it will be filled in v0.2.

```
feat(landing): wire next-intl bilingual routing and extract all strings to en.json
```

---

**6.6** Set up Nextra docs site

Install Nextra. Create `apps/web/app/docs/` route with Nextra config. Scaffold the doc pages from the structure in `JEX_PROJECT_OVERVIEW.md`:

```
docs/
  getting-started/installation.md
  getting-started/quick-start.md
  cli/login.md  init.md  run.md  secrets.md  envs.md
  environments.md
  access-control.md
  ci-cd.md
  self-hosting.md
  faq.md
```

Write the Getting Started and CLI reference pages in full. Leave others as stubs.

```
docs(landing): scaffold nextra docs site with getting-started and cli reference pages
```

---

**Phase 6 exit gate:** The landing page scores ≥ 90 on Lighthouse performance. `/en/docs/getting-started/quick-start` renders correctly. Switching locale in the URL changes the language routing without 404.

---

## Phase 7 — Self-Hosting & Release Prep

**Goal:** The full stack starts with one command. A `.env.example` with all required variables is documented. The CLI login flow works against a self-hosted instance.

### Tasks

**7.1** Harden `docker-compose.yml`

- Add Dockerfiles for `apps/api` and `apps/web` with multi-stage builds
- Add health checks for each service
- Document all required environment variables in `apps/api/.env.example` and `apps/web/.env.example`

```
chore(infra): add multi-stage dockerfiles and health checks for api and web
```

---

**7.2** Add startup validation

In `apps/api/src/index.ts`, on startup:
- Verify `ENCRYPTION_KEY` is present and is a 64-char hex string; throw with a clear message if not
- Verify `DATABASE_URL` is reachable (Prisma connect); throw if not
- Verify `BETTER_AUTH_SECRET` is set; throw if not

```
feat(infra): add startup validation for required environment variables
```

---

**7.3** Run the full system end-to-end

Smoke test the complete developer workflow:
1. `docker-compose up`
2. Register an account on the dashboard
3. Create a project
4. Set `DATABASE_URL=postgres://...` in `dev`
5. `npm install -g @jex/cli` (local link)
6. `jex login` → `jex init` → `jex secrets pull` → verify `.env` created
7. `jex run -- printenv DATABASE_URL` → verify value printed, no `.env` written
8. Revoke a CI/CD token → verify next API call returns 401

Fix any integration issues found.

```
fix(infra): resolve integration issues found in full end-to-end smoke test
```

---

**7.4** Write self-hosting documentation

Fill in `docs/self-hosting.md`:
- Prerequisites (Docker, Docker Compose)
- Clone the repo
- Copy `.env.example` → `.env`, fill in values
- `docker-compose up`
- Access dashboard at `localhost:3000`
- Configure a custom domain

```
docs(infra): write complete self-hosting guide
```

---

**7.5** Tag v0.1.0

Create an annotated git tag:

```bash
git tag -a v0.1.0 -m "Jex v0.1.0 — core secrets management"
```

```
chore(release): tag v0.1.0 core release
```

---

**Phase 7 exit gate:** A fresh machine with only Docker installed can run the full Jex stack with `docker-compose up`. The CLI binary works against the self-hosted instance. All 16 invariants from `03_design_contract_invariant.md` are verifiable by inspection or test.

---

## Commit Log Shape (Expected)

By the end of implementation, `git log --oneline` should read approximately:

```
chore(release): tag v0.1.0 core release
docs(infra): write complete self-hosting guide
fix(infra): resolve integration issues found in full end-to-end smoke test
feat(infra): add startup validation for required environment variables
chore(infra): add multi-stage dockerfiles and health checks for api and web
docs(landing): scaffold nextra docs site with getting-started and cli reference pages
feat(landing): wire next-intl bilingual routing and extract all strings to en.json
feat(landing): add install command block and footer
feat(landing): add problem, how-it-works, and feature cards sections
feat(landing): implement hero section with cta and cli demo block
feat(landing): add landing page shell with header and light mode layout
chore(cli): add npm wrapper package and cross-compile makefile targets
feat(cli): add --env flag and user-friendly error messages to all commands
feat(cli): implement jex envs command to list project environments
feat(cli): implement jex run with in-memory secret injection and no disk write
feat(cli): implement jex secrets list displaying key names only
feat(cli): implement jex secrets set for single key-value pairs
feat(cli): implement jex secrets push from local env file
feat(cli): implement jex secrets pull with atomic env file write
feat(cli): implement jex init with interactive project and environment selection
feat(cli): implement jex logout with server-side session revocation
feat(cli): implement jex login with browser oauth and local callback server
feat(cli): implement local auth token storage in home directory
feat(cli): implement envault config read and write with no-secrets guarantee
feat(cli): implement api http client with all required request methods
feat(dashboard): add cicd tokens page with create and revoke functionality
feat(auth): wire cicd token validation into authenticate middleware
feat(tokens): add cicd token create, list, and revoke endpoints
feat(tokens): implement vault store cicd token queries
feat(dashboard): add members management page with invite, role change, and remove
feat(members): add member management endpoints with audit logging
feat(members): implement vault store member queries
feat(dashboard): add audit log viewer page with filtering
feat(dashboard): add secrets management page with reveal, add, edit, delete, and import
feat(secrets): add all secret crud and import/export api endpoints
feat(secrets): implement secrets service orchestrating access, crypto, store, and audit
feat(access): implement full rbac matrix enforcement for secret operations
feat(secrets): implement vault store secret queries with required project and env params
feat(audit): implement append-only audit log with transaction-scoped record method
feat(crypto): implement aes-256-gcm encrypt and decrypt in crypto service
feat(dashboard): add project list and project overview pages
feat(access): enforce last-owner guard to prevent ownerless projects
feat(envs): add environment management endpoints
feat(envs): implement vault store environment queries
feat(access): implement requireMember and requireOwner policy checks
feat(projects): add project CRUD endpoints
feat(projects): implement vault store project queries with membership checks
feat(auth): add login and register pages with email and oauth support
feat(auth): apply authenticate middleware globally to protected routes
feat(auth): implement authenticate middleware with per-request revocation check
feat(auth): add session list and individual session revoke endpoints
feat(auth): mount better-auth route handlers on express api
feat(auth): configure better-auth with prisma adapter and oauth providers
chore(infra): run initial prisma migration and confirm health endpoint
chore(infra): add docker-compose with postgres, api, and web services
feat(db): define full prisma schema with all entities and constraints
chore(monorepo): scaffold web app with next.js app router and tailwind
chore(monorepo): initialize go cli module with cobra root command
chore(monorepo): scaffold api app with express entry point and prisma config
chore(monorepo): initialize npm workspaces monorepo
```

---

## Phase Dependencies Summary

```
Phase 0 (Skeleton)
    └── Phase 1 (Auth)
            └── Phase 2 (Projects & Envs)
                    └── Phase 3 (Secrets Core)  ←── most critical path
                            ├── Phase 4 (Members & Tokens)
                            └── Phase 5 (CLI)
                                    └── Phase 6 (Landing & Docs)
                                            └── Phase 7 (Self-hosting & Release)
```

Phases 4 and 5 can proceed in parallel once Phase 3 is complete — CLI only depends on the API being functional, not on the dashboard members UI being built.
