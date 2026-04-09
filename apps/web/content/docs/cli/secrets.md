# jex secrets

Manage secrets in the vault. The `secrets` command has four subcommands.

---

## jex secrets pull

Pull all secrets for the current environment and write them atomically to `.env`.

```bash
jex secrets pull [--env <name>]
```

The write is atomic: Jex writes to a temp file in the same directory, then
calls `os.Rename()`. If the process is interrupted, you won't end up with a
partial `.env`.

**Add `.env` to your `.gitignore`.** The pulled file contains plaintext secrets.

---

## jex secrets push

Push secrets from a local `.env` file to the vault.

```bash
jex secrets push [--env <name>]
```

Reads the `.env` file in the current directory, parses key-value pairs, and
calls the bulk import API endpoint. Useful for migrating an existing project.

Output:

```
Pushed 12 secrets (10 created, 2 updated).
```

---

## jex secrets set

Set a single secret.

```bash
jex secrets set KEY=value [--env <name>]
```

Creates the key if it doesn't exist; updates it if it does.

```bash
jex secrets set DATABASE_URL=postgres://user:pass@host/db
jex secrets set STRIPE_KEY=sk_live_...
```

---

## jex secrets list

List the key names in the current environment (values are never shown).

```bash
jex secrets list [--env <name>]
```

Output is a styled table showing key names only. Secrets are never printed
to the terminal by this command.

---

## Common flags

All `jex secrets` subcommands accept:

| Flag | Description |
|------|-------------|
| `--env` | Override the default environment from `.envault` |
| `--allow-insecure` | Allow HTTP API connections |

## See also

- [`jex run`](/docs/cli/run) — inject secrets without writing to disk
- [Environments](/docs/environments) — managing dev / staging / prod
