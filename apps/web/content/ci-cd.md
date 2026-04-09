# CI/CD Integration

Jex supports scoped CI/CD tokens for use in automated pipelines without exposing
developer credentials.

## Creating a CI/CD token

1. Go to **Dashboard → Tokens → Create token**
2. Give it a descriptive name (e.g. `github-actions-prod`)
3. Select the environment scope (`prod`, `staging`, etc.)
4. Copy the token — it won't be shown again

## Using the token in a pipeline

Set the token as a secret in your CI environment (e.g. GitHub Actions secrets),
then use it with the Jex CLI:

```yaml
# .github/workflows/deploy.yml
env:
  JEX_TOKEN: ${{ secrets.JEX_TOKEN }}

steps:
  - name: Deploy with secrets
    run: jex run --token $JEX_TOKEN -- ./deploy.sh
```

> **Note:** `--token` flag support is coming in v0.2. For now, save the token
> to `~/.jex/token` in your pipeline setup step.

## Revoking a token

Tokens can be revoked instantly from the dashboard (**Tokens → Revoke**).
Revocation is immediate — the next API call using the revoked token returns `401`.
There is no cache.

## Security recommendations

- Create a separate token per pipeline and environment
- Name tokens descriptively so you can audit them
- Rotate tokens after team member offboarding
- Never use a personal session token in CI — use CI/CD tokens exclusively
