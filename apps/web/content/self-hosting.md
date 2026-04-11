# Self-Hosting

Jex is fully self-hostable. The entire stack runs with a single `docker-compose up`.

## Prerequisites

- Docker and Docker Compose
- A domain name (for HTTPS)
- 512 MB RAM minimum

## Setup

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```bash
DATABASE_URL=postgresql://jex:jex@db:5432/jex
ENCRYPTION_KEY=<64 hex characters — generate with: openssl rand -hex 32>
BETTER_AUTH_SECRET=<random string>
PORT=3001
```

Start the stack:

```bash
docker-compose up -d
```

The API starts at `http://localhost:3001` and the dashboard at `http://localhost:3000`.

## Pointing the CLI at your instance

```bash
jex login --api-url https://jex.yourcompany.com
```

Or run `jex init --api-url https://jex.yourcompany.com` and the URL is saved to `.envault`.

## Production checklist

- [ ] Set `ENCRYPTION_KEY` to a securely generated 32-byte hex string
- [ ] Put the API and dashboard behind a reverse proxy (nginx, Caddy) with HTTPS
- [ ] Set up automated database backups for the PostgreSQL volume
- [ ] Restrict the API port to localhost; only expose via the reverse proxy

> ⚠️ **Never change `ENCRYPTION_KEY` after storing secrets.** All existing
> secrets will become unreadable.
