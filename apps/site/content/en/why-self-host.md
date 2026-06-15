# Why Self-Host?

Jex is not a hosted secrets platform. The public Jex website hosts the landing page and documentation only. Your team runs the API, dashboard, and PostgreSQL database in infrastructure you control.

That boundary is intentional: a secrets manager should keep secret custody close to the team that owns the applications, credentials, audit requirements, and incident response process.

## What your team owns

- The database that stores encrypted secret values
- The `ENCRYPTION_KEY` used by the API to encrypt and decrypt secrets
- The dashboard where accounts, projects, members, and tokens are managed
- Backups, upgrades, monitoring, and network access

## What the public website provides

- Product overview
- Documentation
- CLI installation instructions
- Self-hosting guides
- Links to the open-source repository

It does not provide account creation, a hosted dashboard, or a hosted API.

## Recommended flow

1. Read the [self-hosting guide](/en/docs/self-hosting).
2. Deploy Jex for your team.
3. Create accounts on your own dashboard.
4. Install the CLI.
5. Log in with your API URL.

```bash
jex login --api-url https://jex.yourcompany.com
```

