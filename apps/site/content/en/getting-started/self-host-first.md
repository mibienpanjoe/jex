# Self-Host First

Install the CLI only after your team has a running Jex instance. The CLI needs an API URL to authenticate, list projects, and read or write secrets.

## What must exist first

- A running Jex API
- A running Jex dashboard
- A PostgreSQL database
- A stable `ENCRYPTION_KEY`
- At least one user account created on your own dashboard

For a local or small team deployment, start with the [self-hosting guide](/en/docs/self-hosting).

## Why this comes before installation

Jex does not operate a hosted cloud vault. The public website cannot create accounts for your team, and `jex login` should point to your own API:

```bash
jex login --api-url https://jex.yourcompany.com
```

After the instance is reachable, continue to [Installation](/en/docs/getting-started/installation).

