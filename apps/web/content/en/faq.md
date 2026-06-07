# FAQ

## Does Jex store my secrets in plaintext?

No. Every secret value is encrypted with AES-256-GCM before being stored in the
database. The encryption key (`ENCRYPTION_KEY`) lives in the API's environment,
not in the database. The server never writes a plaintext value to disk.

## Can I use Jex without installing the CLI?

Yes. The dashboard allows you to read, write, and manage secrets directly in the
browser. The CLI is optional, but strongly recommended for local development
(especially `jex run`).

## What happens if I lose my ENCRYPTION_KEY?

All secrets become permanently unreadable. There is no recovery path. Store your
`ENCRYPTION_KEY` in a password manager or secrets manager (the irony is noted).

## Is `.envault` safe to commit?

Yes. `.envault` contains only `project`, `defaultEnv`, and `apiURL` — no secrets,
no tokens, no credentials.

## Can I use Jex with Docker?

Yes. Use `jex run -- docker run ...` if you're building locally. For production
container builds, inject secrets at runtime via environment variables passed to
`docker run --env-file` or use CI/CD tokens.

## Does `jex run` work with Python / Ruby / other languages?

Yes. `jex run` is language-agnostic — it spawns any process and passes secrets
via the environment. `os.environ`, `ENV`, `process.env` — all standard
environment APIs will see the injected secrets.

## How do I rotate a secret?

Run `jex secrets set MY_KEY=new_value` or update it in the dashboard. The change
takes effect immediately — any subsequent call to `jex run` or `jex secrets pull`
will fetch the new value.

## Is Jex production-ready?

Jex v0.1 is suitable for small to medium development teams. For enterprise use,
review the architecture, run a security audit, and consider contributing improvements.
