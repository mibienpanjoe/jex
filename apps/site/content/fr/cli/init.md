# jex init

Initialise un fichier `.envault` dans le répertoire courant.

## Utilisation

```bash
jex init [flags]
```

## Comportement

1. Récupère via l'API la liste des projets auxquels vous appartenez
2. Si plusieurs projets existent, affiche un sélecteur interactif (flèches pour naviguer, Entrée pour confirmer)
3. Récupère la liste des environnements du projet sélectionné
4. Affiche un sélecteur interactif pour l'environnement par défaut
5. Écrit `.envault` dans le répertoire courant :

```toml
project    = "proj_abc123"
defaultEnv = "dev"
apiURL     = "https://jex.yourcompany.com"
```

6. Affiche : `Initialized. .envault created.`

## Le fichier .envault

`.envault` ne contient **aucun secret** : seulement :
- `project` : l'ID du projet
- `defaultEnv` : l'environnement utilisé quand `--env` n'est pas spécifié
- `apiURL` : l'URL de base de l'API

Vous devriez **commiter `.envault`** dans le contrôle de version. C'est sûr.

## Flags

| Flag | Description |
|------|-------------|
| `--api-url` | Remplace l'URL de l'API stockée dans `.envault` |

## Trouver .envault

Toutes les commandes Jex remontent l'arborescence pour trouver `.envault`, comme `git` cherche `.git`. Vous pouvez lancer `jex secrets pull` depuis n'importe quel sous-répertoire du projet.

## Voir aussi

- [`jex secrets pull`](/fr/docs/cli/secrets) — récupérer les secrets après initialisation
- [`jex envs`](/fr/docs/cli/envs) — lister les environnements disponibles
