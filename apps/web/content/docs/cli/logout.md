# jex logout

Revoke the current session and remove local credentials.

## Usage

```bash
jex logout
```

## Behavior

1. Calls `DELETE /api/v1/auth/sessions/current` to revoke the session server-side
2. Deletes `~/.jex/token`
3. Prints: `Logged out.`

If the API call fails (e.g. no network), the local token is still deleted and a
warning is printed. The session will expire server-side per the configured TTL.

## See also

- [`jex login`](/docs/cli/login)
