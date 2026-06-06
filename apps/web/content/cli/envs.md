# jex envs

List and manage environments for the current project.

## Usage

```bash
jex envs
jex envs create preview-1
jex envs use preview-1
jex envs delete preview-1
```

## Output

```
* dev      (14 secrets)
  staging  (14 secrets)
  prod     (14 secrets)
```

The active environment (from `.envault`) is marked with `*`.

## Commands

| Command | Description |
|---|---|
| `jex envs` | List project environments. |
| `jex envs create NAME` | Create a custom environment. Names must use lowercase letters, numbers, and hyphens. |
| `jex envs use NAME` | Update `.envault` so future commands use this environment by default. |
| `jex envs delete NAME` | Delete a custom environment and its secrets. Default environments cannot be deleted. |

## See also

- [`jex init`](/docs/cli/init) — change the default environment
- [Environments](/docs/environments) — creating and managing environments
