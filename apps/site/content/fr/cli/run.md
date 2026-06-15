# jex run

Exécute une commande avec les secrets injectés dans l'environnement, sans les écrire sur disque.

## Utilisation

```bash
jex run [flags] -- <command> [args...]
```

## Comportement

1. Lit `.envault` pour déterminer l'ID du projet et l'environnement par défaut
2. Récupère les secrets depuis l'API (`GET /projects/:id/secrets/export?format=json`)
3. Construit une liste d'environnement : `os.Environ()` + les secrets récupérés
4. Exécute `<command>` avec `cmd.Env = envSlice`
5. Transmet `stdin`, `stdout` et `stderr`
6. Quitte avec le code de sortie du processus enfant

**Aucun fichier n'est écrit sur disque.** Les secrets vivent uniquement dans l'environnement du processus.

## Flags

| Flag | Description |
|------|-------------|
| `--env` | Remplace l'environnement par défaut de `.envault` |
| `--allow-insecure` | Autorise les connexions API HTTP non TLS |

## Exemples

```bash
# Lancer votre serveur de développement avec les secrets dev
jex run -- npm run dev

# Lancer avec un environnement spécifique
jex run --env staging -- node server.js

# Lancer un script ponctuel
jex run -- python scripts/migrate.py

# Passer des arguments à la commande
jex run -- docker build --build-arg TAG=latest .
```

## Remplacer l'environnement via une variable

Comme `jex run` désactive le parsing des flags pour la commande enfant, vous pouvez aussi remplacer l'environnement avec la variable `JEX_ENV` :

```bash
JEX_ENV=staging jex run -- node server.js
```

## Codes de sortie

`jex run` quitte avec le même code de sortie que le processus enfant. Une erreur de connexion ou d'authentification quitte avec le code `1`.

## Invariants de sécurité

- Les secrets ne sont **jamais écrits sur disque**, même pas dans `/tmp`
- Les secrets ne sont **pas journalisés** sur stdout ou stderr par `jex run`
- La récupération se fait en HTTPS ; HTTP est refusé sauf si `--allow-insecure` est défini

## Voir aussi

- [`jex secrets pull`](/fr/docs/cli/secrets) — écrire les secrets dans `.env` à la place
- [`jex init`](/fr/docs/cli/init) — configurer `.envault` d'abord
