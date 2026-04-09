# Environments

Every Jex project comes with three default environments: `dev`, `staging`, and `prod`.

Each environment holds its own independent set of secrets. A secret with the key
`DATABASE_URL` in `dev` is completely separate from `DATABASE_URL` in `prod`.

## Environment color coding

| Environment | Color | Badge |
|-------------|-------|-------|
| `dev` | Green | Safe to share with all members |
| `staging` | Amber | Matches production config |
| `prod` | Red | Restricted to owners by default |

## Creating custom environments

Custom environments can be created by project owners from the dashboard
(**Settings → Environments → New environment**) or via the API.

> **Note:** `dev`, `staging`, and `prod` are reserved and cannot be deleted.

## Switching environments in the CLI

Use `--env` to override the default environment from `.envault`:

```bash
jex secrets pull --env staging
jex run --env prod -- node server.js
jex secrets list --env staging
```

## Per-environment RBAC

Access to each environment is controlled by role. See [Access Control](/docs/access-control)
for details on scoping members and CI/CD tokens to specific environments.
