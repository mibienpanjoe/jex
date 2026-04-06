# Jex — API Specification
Version: v1.0, 2026-04-06

---

## Conventions

**Base URL:** `https://api.jex.app/api/v1`

**Content-Type:** `application/json` for all requests and responses

**Authentication:** Bearer token in `Authorization` header
```
Authorization: Bearer <session_token_or_cicd_token>
```

**Common Error Envelope:**
```json
{
  "error": {
    "code": "ERROR_CODE_CONSTANT",
    "message": "Human-readable description of the error"
  }
}
```

**Common Success Envelope for collections:**
```json
{
  "data": [...],
  "total": 42
}
```

**Timestamps:** All timestamps are ISO 8601 UTC strings (e.g. `"2026-04-06T14:30:00.000Z"`)

**IDs:** All IDs are UUIDs (v4)

**Environment names:** Lowercase alphanumeric with hyphens (`dev`, `staging`, `prod`, `preview-1`)

---

## Auth Endpoints

### POST /api/v1/auth/register
Register a new user account with email and password.
Auth required: **No**

**Request:**
```json
{
  "email": "string (valid email, required)",
  "password": "string (min 8 chars, required)",
  "name": "string (display name, required)"
}
```

**Success — 201 Created:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string",
    "createdAt": "ISO 8601"
  },
  "token": "string (session token)"
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |
| 422 | `VALIDATION_ERROR` | Missing or invalid fields |

---

### POST /api/v1/auth/login
Authenticate with email and password.
Auth required: **No**

**Request:**
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "totpCode": "string (6-digit, required only if 2FA enabled)"
}
```

**Success — 200 OK:**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "name": "string"
  },
  "token": "string (session token)"
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `TOTP_REQUIRED` | 2FA enabled but no TOTP code provided |
| 401 | `TOTP_INVALID` | 2FA code wrong or expired |

---

### POST /api/v1/auth/logout
Invalidate the current session token.
Auth required: **Yes**

**Request:** Empty body

**Success — 204 No Content**

---

### GET /api/v1/auth/sessions
List all active sessions for the current user.
Auth required: **Yes**

**Success — 200 OK:**
```json
{
  "data": [
    {
      "id": "uuid",
      "createdAt": "ISO 8601",
      "lastUsedAt": "ISO 8601",
      "userAgent": "string",
      "isCurrent": true
    }
  ]
}
```

---

### DELETE /api/v1/auth/sessions/:sessionId
Revoke a specific session (log out a device).
Auth required: **Yes**

**Success — 204 No Content**

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 404 | `SESSION_NOT_FOUND` | Session ID does not exist or belongs to another user |

---

### GET /api/v1/auth/oauth/:provider
Initiate OAuth login flow. `provider` is `github` or `google`.
Auth required: **No**

**Response:** HTTP 302 redirect to provider's authorization URL

---

### GET /api/v1/auth/oauth/:provider/callback
OAuth callback endpoint. Handled by Better Auth.
Auth required: **No**

**Success:** HTTP 302 redirect to dashboard with session token set in cookie or returned as query param for CLI token exchange

---

## Project Endpoints

### GET /api/v1/projects
List all projects the current user belongs to.
Auth required: **Yes**

**Success — 200 OK:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "role": "Owner | Developer | ReadOnly",
      "environmentCount": 3,
      "memberCount": 4,
      "createdAt": "ISO 8601"
    }
  ],
  "total": 2
}
```

---

### POST /api/v1/projects
Create a new project.
Auth required: **Yes**

**Request:**
```json
{
  "name": "string (required, unique per user)"
}
```

**Success — 201 Created:**
```json
{
  "id": "uuid",
  "name": "string",
  "role": "Owner",
  "environments": ["dev", "staging", "prod"],
  "createdAt": "ISO 8601"
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 409 | `PROJECT_NAME_TAKEN` | User already has a project with this name |
| 422 | `VALIDATION_ERROR` | Missing or invalid name |

---

### GET /api/v1/projects/:projectId
Get project details.
Auth required: **Yes** (any member)

**Success — 200 OK:**
```json
{
  "id": "uuid",
  "name": "string",
  "role": "Owner | Developer | ReadOnly",
  "environments": ["dev", "staging", "prod"],
  "memberCount": 4,
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

### PATCH /api/v1/projects/:projectId
Rename a project.
Auth required: **Yes** (Owner only)

**Request:**
```json
{
  "name": "string (required)"
}
```

**Success — 200 OK:** Returns updated project object (same schema as GET)

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 409 | `PROJECT_NAME_TAKEN` | New name conflicts with another project |

---

### DELETE /api/v1/projects/:projectId
Delete a project and all associated data (secrets, environments, members, tokens, audit log).
Auth required: **Yes** (Owner only)

**Success — 204 No Content**

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |

---

## Environment Endpoints

### GET /api/v1/projects/:projectId/envs
List all environments for a project.
Auth required: **Yes** (any member)

**Success — 200 OK:**
```json
{
  "data": [
    {
      "name": "dev",
      "secretCount": 12,
      "isDefault": true
    },
    {
      "name": "staging",
      "secretCount": 12,
      "isDefault": false
    },
    {
      "name": "prod",
      "secretCount": 12,
      "isDefault": false
    }
  ]
}
```

---

### POST /api/v1/projects/:projectId/envs
Create a custom environment.
Auth required: **Yes** (Owner only)

**Request:**
```json
{
  "name": "string (lowercase alphanumeric + hyphens, required)"
}
```

**Success — 201 Created:**
```json
{
  "name": "string",
  "secretCount": 0,
  "isDefault": false
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 409 | `ENVIRONMENT_NAME_TAKEN` | Environment with this name already exists in the project |
| 422 | `INVALID_ENV_NAME` | Name does not match `^[a-z0-9-]+$` |

---

### DELETE /api/v1/projects/:projectId/envs/:envName
Delete an environment and all secrets within it. Cannot delete default environments (`dev`, `staging`, `prod`).
Auth required: **Yes** (Owner only)

**Success — 204 No Content**

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 422 | `CANNOT_DELETE_DEFAULT_ENV` | Attempting to delete dev, staging, or prod |

---

## Secret Endpoints

### GET /api/v1/projects/:projectId/secrets
List all secret **key names** (not values) for an environment.
Auth required: **Yes** (read access to the environment)

**Query parameters:**
- `env` (string, required) — environment name

**Success — 200 OK:**
```json
{
  "data": [
    {
      "key": "DATABASE_URL",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    },
    {
      "key": "STRIPE_KEY",
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ],
  "total": 2
}
```

Note: Values are never returned by this endpoint regardless of role.

---

### GET /api/v1/projects/:projectId/secrets/export
Export all secrets as key-value pairs for an environment. Each key access is individually audit-logged.
Auth required: **Yes** (read access to the environment)

**Query parameters:**
- `env` (string, required) — environment name
- `format` (string, optional) — `json` (default) or `dotenv`

**Success — 200 OK (format=json):**
```json
{
  "data": [
    { "key": "DATABASE_URL", "value": "postgres://..." },
    { "key": "STRIPE_KEY", "value": "sk_live_..." }
  ],
  "env": "dev",
  "projectId": "uuid"
}
```

**Success — 200 OK (format=dotenv):**
```
Content-Type: text/plain

DATABASE_URL=postgres://...
STRIPE_KEY=sk_live_...
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor lacks read access to this environment |

---

### GET /api/v1/projects/:projectId/secrets/:key
Get the decrypted value of a single secret by key.
Auth required: **Yes** (read access to the environment)

**Query parameters:**
- `env` (string, required) — environment name

**Success — 200 OK:**
```json
{
  "key": "DATABASE_URL",
  "value": "postgres://user:pass@host:5432/db",
  "env": "dev",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor lacks read access to this environment |
| 404 | `SECRET_NOT_FOUND` | Key does not exist in this environment |

---

### POST /api/v1/projects/:projectId/secrets
Create a new secret.
Auth required: **Yes** (write access to the environment)

**Request:**
```json
{
  "env": "string (required)",
  "key": "string (required, uppercase + underscores)",
  "value": "string (required, max 32 KB)"
}
```

**Success — 201 Created:**
```json
{
  "key": "STRIPE_KEY",
  "env": "dev",
  "createdAt": "ISO 8601"
}
```

Note: Value is not returned in the response.

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor lacks write access to this environment |
| 409 | `SECRET_KEY_ALREADY_EXISTS` | Key already exists in this environment |
| 422 | `INVALID_KEY_FORMAT` | Key does not match `^[A-Z][A-Z0-9_]*$` |
| 422 | `VALUE_TOO_LARGE` | Value exceeds 32 KB |

---

### PUT /api/v1/projects/:projectId/secrets/:key
Update the value of an existing secret.
Auth required: **Yes** (write access to the environment)

**Query parameters:**
- `env` (string, required) — environment name

**Request:**
```json
{
  "value": "string (required, max 32 KB)"
}
```

**Success — 200 OK:**
```json
{
  "key": "STRIPE_KEY",
  "env": "dev",
  "updatedAt": "ISO 8601"
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor lacks write access to this environment |
| 404 | `SECRET_NOT_FOUND` | Key does not exist in this environment |
| 422 | `VALUE_TOO_LARGE` | Value exceeds 32 KB |

---

### DELETE /api/v1/projects/:projectId/secrets/:key
Delete a secret.
Auth required: **Yes** (write access to the environment)

**Query parameters:**
- `env` (string, required) — environment name

**Success — 204 No Content**

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor lacks write access to this environment |
| 404 | `SECRET_NOT_FOUND` | Key does not exist in this environment |

---

### POST /api/v1/projects/:projectId/secrets/import
Bulk import secrets from a `.env`-format body. Existing keys are updated; new keys are created.
Auth required: **Yes** (write access to the environment)

**Request:**
```json
{
  "env": "string (required)",
  "secrets": [
    { "key": "DATABASE_URL", "value": "postgres://..." },
    { "key": "STRIPE_KEY", "value": "sk_live_..." }
  ]
}
```

**Success — 200 OK:**
```json
{
  "created": 3,
  "updated": 1,
  "failed": 0,
  "env": "dev"
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor lacks write access to this environment |
| 422 | `VALIDATION_ERROR` | One or more keys fail format validation (operation is rejected entirely) |

---

## Member Endpoints

### GET /api/v1/projects/:projectId/members
List all members of a project.
Auth required: **Yes** (any member)

**Success — 200 OK:**
```json
{
  "data": [
    {
      "userId": "uuid",
      "name": "string",
      "email": "string",
      "role": "Owner | Developer | ReadOnly",
      "joinedAt": "ISO 8601"
    }
  ],
  "total": 4
}
```

---

### POST /api/v1/projects/:projectId/members
Invite a user to the project by email.
Auth required: **Yes** (Owner only)

**Request:**
```json
{
  "email": "string (required)",
  "role": "Developer | ReadOnly (required)"
}
```

**Success — 201 Created:**
```json
{
  "userId": "uuid",
  "name": "string",
  "email": "string",
  "role": "Developer",
  "joinedAt": "ISO 8601"
}
```

Note: If the email does not correspond to an existing Jex account, the invite is queued and fulfilled when the user registers.

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 409 | `ALREADY_A_MEMBER` | User is already a member of this project |
| 422 | `INVALID_ROLE` | Role is not `Developer` or `ReadOnly` (cannot invite as Owner) |

---

### PATCH /api/v1/projects/:projectId/members/:userId
Change a member's role.
Auth required: **Yes** (Owner only)

**Request:**
```json
{
  "role": "Owner | Developer | ReadOnly (required)"
}
```

**Success — 200 OK:** Returns updated member object

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 422 | `LAST_OWNER_DEMOTION` | Operation would leave the project with zero owners |

---

### DELETE /api/v1/projects/:projectId/members/:userId
Remove a member from the project.
Auth required: **Yes** (Owner only)

**Success — 204 No Content**

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 422 | `LAST_OWNER_REMOVAL` | Operation would leave the project with zero owners |

---

## CI/CD Token Endpoints

### GET /api/v1/projects/:projectId/tokens
List all CI/CD tokens for a project (token values are not returned after creation).
Auth required: **Yes** (Owner only)

**Success — 200 OK:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "scopedEnv": "prod",
      "createdAt": "ISO 8601",
      "lastUsedAt": "ISO 8601 | null",
      "revokedAt": "ISO 8601 | null"
    }
  ],
  "total": 2
}
```

---

### POST /api/v1/projects/:projectId/tokens
Create a new CI/CD token scoped to a specific environment.
Auth required: **Yes** (Owner only)

**Request:**
```json
{
  "name": "string (label, e.g. 'GitHub Actions prod', required)",
  "scopedEnv": "string (environment name, required)"
}
```

**Success — 201 Created:**
```json
{
  "id": "uuid",
  "name": "string",
  "scopedEnv": "prod",
  "token": "string (plain-text token value — shown ONCE, never again)",
  "createdAt": "ISO 8601"
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 404 | `ENVIRONMENT_NOT_FOUND` | Specified `scopedEnv` does not exist in this project |

---

### DELETE /api/v1/projects/:projectId/tokens/:tokenId
Revoke a CI/CD token immediately.
Auth required: **Yes** (Owner only)

**Success — 204 No Content**

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |
| 404 | `TOKEN_NOT_FOUND` | Token ID does not exist in this project |

---

## Audit Log Endpoints

### GET /api/v1/projects/:projectId/audit
Retrieve the audit log for a project.
Auth required: **Yes** (Owner only)

**Query parameters:**
- `env` (string, optional) — filter by environment
- `actor` (string, optional) — filter by user ID or token ID
- `operation` (string, optional) — filter by operation type (see values below)
- `from` (ISO 8601, optional) — start of date range
- `to` (ISO 8601, optional) — end of date range
- `limit` (integer, optional, default: 50, max: 200)
- `offset` (integer, optional, default: 0)

**Operation type values:**
`SECRET_CREATE`, `SECRET_READ`, `SECRET_READ_BULK`, `SECRET_UPDATE`, `SECRET_DELETE`, `MEMBER_INVITE`, `MEMBER_ROLE_CHANGE`, `MEMBER_REMOVE`, `TOKEN_CREATE`, `TOKEN_REVOKE`

**Success — 200 OK:**
```json
{
  "data": [
    {
      "id": "uuid",
      "actorId": "uuid",
      "actorName": "string",
      "actorType": "User | CICDToken",
      "operation": "SECRET_UPDATE",
      "env": "prod",
      "key": "STRIPE_KEY",
      "timestamp": "ISO 8601"
    }
  ],
  "total": 143,
  "limit": 50,
  "offset": 0
}
```

**Errors:**
| Status | Code | Trigger |
|--------|------|---------|
| 403 | `INSUFFICIENT_PERMISSIONS` | Actor is not an Owner |

---

## System Endpoints

### GET /api/v1/health
Health check endpoint. No authentication required.

**Success — 200 OK:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "ISO 8601"
}
```

---

## Type Reference

### Role
```
"Owner" | "Developer" | "ReadOnly"
```

### OperationType
```
"SECRET_CREATE" | "SECRET_READ" | "SECRET_READ_BULK" | "SECRET_UPDATE" |
"SECRET_DELETE" | "MEMBER_INVITE" | "MEMBER_ROLE_CHANGE" | "MEMBER_REMOVE" |
"TOKEN_CREATE" | "TOKEN_REVOKE"
```

### Secret (list item — no value)
```json
{
  "key": "string",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

### SecretWithValue (single read — value included)
```json
{
  "key": "string",
  "value": "string",
  "env": "string",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

### AuditEvent
```json
{
  "id": "uuid",
  "actorId": "uuid",
  "actorName": "string",
  "actorType": "User | CICDToken",
  "operation": "OperationType",
  "env": "string | null",
  "key": "string | null",
  "timestamp": "ISO 8601"
}
```

---

## Endpoint Summary Table

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/auth/register` | Register new account | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/logout` | Revoke current session | Yes |
| GET | `/auth/sessions` | List active sessions | Yes |
| DELETE | `/auth/sessions/:id` | Revoke a session | Yes |
| GET | `/auth/oauth/:provider` | Initiate OAuth | No |
| GET | `/auth/oauth/:provider/callback` | OAuth callback | No |
| GET | `/projects` | List user's projects | Yes |
| POST | `/projects` | Create project | Yes |
| GET | `/projects/:id` | Get project details | Yes (member) |
| PATCH | `/projects/:id` | Rename project | Yes (Owner) |
| DELETE | `/projects/:id` | Delete project | Yes (Owner) |
| GET | `/projects/:id/envs` | List environments | Yes (member) |
| POST | `/projects/:id/envs` | Create environment | Yes (Owner) |
| DELETE | `/projects/:id/envs/:name` | Delete environment | Yes (Owner) |
| GET | `/projects/:id/secrets` | List secret keys | Yes (read) |
| GET | `/projects/:id/secrets/export` | Export all key-value pairs | Yes (read) |
| GET | `/projects/:id/secrets/:key` | Get single secret value | Yes (read) |
| POST | `/projects/:id/secrets` | Create secret | Yes (write) |
| PUT | `/projects/:id/secrets/:key` | Update secret value | Yes (write) |
| DELETE | `/projects/:id/secrets/:key` | Delete secret | Yes (write) |
| POST | `/projects/:id/secrets/import` | Bulk import secrets | Yes (write) |
| GET | `/projects/:id/members` | List members | Yes (member) |
| POST | `/projects/:id/members` | Invite member | Yes (Owner) |
| PATCH | `/projects/:id/members/:userId` | Change member role | Yes (Owner) |
| DELETE | `/projects/:id/members/:userId` | Remove member | Yes (Owner) |
| GET | `/projects/:id/tokens` | List CI/CD tokens | Yes (Owner) |
| POST | `/projects/:id/tokens` | Create CI/CD token | Yes (Owner) |
| DELETE | `/projects/:id/tokens/:tokenId` | Revoke CI/CD token | Yes (Owner) |
| GET | `/projects/:id/audit` | View audit log | Yes (Owner) |
| GET | `/health` | Health check | No |
