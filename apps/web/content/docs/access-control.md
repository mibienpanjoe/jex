# Access Control

Jex uses role-based access control (RBAC) to manage what each team member can do.

## Roles

| Role | Read secrets | Write secrets | Manage members | Manage tokens | Delete project |
|------|-------------|--------------|----------------|--------------|----------------|
| Owner | ✓ | ✓ | ✓ | ✓ | ✓ |
| Member | ✓ | ✓ | — | — | — |
| Read-only | ✓ | — | — | — | — |

## Inviting members

Project owners can invite members from the dashboard (**Members → Invite member**)
or via the API. An invitation email is sent with a one-time link.

## The last owner guarantee

The last owner of a project **cannot be removed or demoted**. This prevents a
project from becoming permanently inaccessible. Jex enforces this at the API
level — no workaround exists.

## CI/CD tokens

For automated pipelines, use CI/CD tokens instead of personal accounts. See
[CI/CD Integration](/docs/ci-cd) for the full guide.
