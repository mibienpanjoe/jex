# Self-Hosting

Jex is fully self-hostable. The whole stack — PostgreSQL, the API, and the dashboard — runs from a single `docker-compose up`.

## Prerequisites

- Docker and Docker Compose (v2)
- A domain name for HTTPS in production
- 512 MB RAM minimum

## Quick start

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Generate the two required secrets:

```bash
openssl rand -hex 32     # → use as ENCRYPTION_KEY (must be exactly 64 hex chars)
openssl rand -base64 32  # → use as BETTER_AUTH_SECRET
```

Edit `apps/api/.env`:

```bash
DATABASE_URL=postgresql://jex:jexpass@db:5432/jex
ENCRYPTION_KEY=<paste hex output here>
BETTER_AUTH_SECRET=<paste base64 output here>
BETTER_AUTH_URL=http://localhost:3001
WEB_ORIGIN=http://localhost:3000
WEB_DEFAULT_LOCALE=fr
PORT=3001
```

Start the stack:

```bash
docker-compose up -d
```

The API starts at `http://localhost:3001` and the dashboard at `http://localhost:3000`.

> ⚠️ The API validates these env vars on boot. If `ENCRYPTION_KEY` is missing or not 64 hex chars, the container exits with a clear error message — check `docker logs jex-api-1`.

## Environment variables

### `apps/api/.env`

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string. Inside the compose network the host is `db`. |
| `ENCRYPTION_KEY` | yes | 64-character hex string (32 bytes). Generated with `openssl rand -hex 32`. |
| `BETTER_AUTH_SECRET` | yes | Random secret used to sign auth sessions. |
| `BETTER_AUTH_URL` | no | Public API origin that serves `/api/v1/auth/*`. Defaults to `http://localhost:3001`. |
| `WEB_ORIGIN` | no | Public dashboard origin allowed to make credentialed API requests. Defaults to `http://localhost:3000`. |
| `WEB_DEFAULT_LOCALE` | no | Locale used for auth redirects from the API to the dashboard. Defaults to `fr`. |
| `PORT` | no | Defaults to `3001`. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | yes for GitHub login | OAuth app credentials from GitHub. |

## GitHub OAuth setup

Create a GitHub OAuth App from **Settings → Developer settings → OAuth Apps**.

For local development:

| GitHub field | Value |
|---|---|
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3001/api/v1/auth/callback/github` |

Then copy the generated client ID and client secret into `apps/api/.env`:

```bash
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

For production, use your public origins instead:

```bash
BETTER_AUTH_URL="https://api.jex.yourcompany.com"
WEB_ORIGIN="https://jex.yourcompany.com"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

The production GitHub callback URL must match the public API origin:

```text
https://api.jex.yourcompany.com/api/v1/auth/callback/github
```

### `apps/web/.env`

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | URL the dashboard calls. Use the public API origin, not the internal compose hostname. |

## Pointing the CLI at your instance

```bash
jex login --api-url https://jex.yourcompany.com
```

Or run `jex init --api-url https://jex.yourcompany.com` and the URL is saved to the project's `.envault`.

## Reverse proxy (HTTPS)

Front the stack with a reverse proxy that handles TLS. Example with [Caddy](https://caddyserver.com):

```caddy
jex.yourcompany.com {
    reverse_proxy localhost:3000
}

api.jex.yourcompany.com {
    reverse_proxy localhost:3001
}
```

Then set in `apps/api/.env`:

```bash
BETTER_AUTH_URL=https://api.jex.yourcompany.com
WEB_ORIGIN=https://jex.yourcompany.com
```

And set in `apps/web/.env`:

```bash
NEXT_PUBLIC_API_URL=https://api.jex.yourcompany.com
```

## Database backups

The PostgreSQL data lives in the `pgdata` Docker volume. Back it up with a scheduled dump:

```bash
docker exec jex-db-1 pg_dump -U jex jex > backup-$(date +%F).sql
```

Restore with:

```bash
cat backup-2026-05-15.sql | docker exec -i jex-db-1 psql -U jex jex
```

## Upgrading

```bash
git pull
docker-compose pull
docker-compose up -d --build
```

The API container runs `prisma migrate deploy` on boot, so schema migrations apply automatically.

## Production checklist

- [ ] `ENCRYPTION_KEY` was generated with `openssl rand -hex 32` and stored in a password manager
- [ ] `BETTER_AUTH_SECRET` is a fresh random value, not the example
- [ ] Stack sits behind a reverse proxy with HTTPS — never expose ports 3000/3001 directly to the internet
- [ ] PostgreSQL volume has scheduled backups
- [ ] The host `5432` port mapping is removed if you don't need external DB access

> ⚠️ **Never change `ENCRYPTION_KEY` after storing secrets.** All existing secrets become unreadable. To rotate, decrypt with the old key, re-encrypt with the new key, then swap.
