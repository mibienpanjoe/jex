# jex secrets

Gère les secrets dans le vault. La commande `secrets` contient quatre sous-commandes.

---

## jex secrets pull

Récupère tous les secrets de l'environnement courant et les écrit atomiquement dans `.env`.

```bash
jex secrets pull [--env <name>]
```

L'écriture est atomique : Jex écrit dans un fichier temporaire du même répertoire, puis appelle `os.Rename()`. Si le processus est interrompu, vous ne vous retrouvez pas avec un `.env` partiel.

**Ajoutez `.env` à votre `.gitignore`.** Le fichier récupéré contient des secrets en clair.

---

## jex secrets push

Envoie les secrets d'un fichier `.env` local vers le vault.

```bash
jex secrets push [--env <name>]
```

Lit le fichier `.env` du répertoire courant, parse les paires clé-valeur et appelle l'endpoint API d'import en masse. Utile pour migrer un projet existant.

Sortie :

```
Pushed 12 secrets (10 created, 2 updated).
```

---

## jex secrets set

Définit un secret unique.

```bash
jex secrets set KEY=value [--env <name>]
```

Crée la clé si elle n'existe pas ; la met à jour si elle existe déjà.

```bash
jex secrets set DATABASE_URL=postgres://user:pass@host/db
jex secrets set STRIPE_KEY=sk_live_...
```

---

## jex secrets list

Liste les noms des clés dans l'environnement courant. Les valeurs ne sont jamais affichées.

```bash
jex secrets list [--env <name>]
```

La sortie est un tableau stylisé qui montre uniquement les noms des clés. Cette commande n'affiche jamais les secrets dans le terminal.

---

## Flags communs

Toutes les sous-commandes `jex secrets` acceptent :

| Flag | Description |
|------|-------------|
| `--env` | Remplace l'environnement par défaut de `.envault` |
| `--allow-insecure` | Autorise les connexions API HTTP |

## Voir aussi

- [`jex run`](/fr/docs/cli/run) — injecter les secrets sans écrire sur disque
- [Environnements](/fr/docs/environments) — gérer dev / staging / prod
