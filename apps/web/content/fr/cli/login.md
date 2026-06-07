# jex login

Authentifie la CLI avec votre compte Jex.

## Utilisation

```bash
jex login [flags]
```

## Comportement

1. Ouvre le navigateur système vers `<apiURL>/api/v1/auth/cli-callback`
2. Démarre un serveur HTTP local de callback sur un port aléatoire
3. Après authentification dans le navigateur, l'API redirige vers la CLI avec un token
4. Le token est enregistré dans `~/.jex/token` avec les permissions `0600`
5. Affiche : `Logged in successfully.`

Sur les systèmes sans interface graphique (CI, SSH), l'URL de connexion est affichée sur stdout si le navigateur ne peut pas être ouvert. Vous pouvez la coller dans un navigateur sur une autre machine.

## Flags

| Flag | Description |
|------|-------------|
| `--api-url` | URL de base de l'API Jex (par défaut : `https://api.jex.app`) |

## Exemples

```bash
# Par défaut (Jex cloud)
jex login

# Instance auto-hébergée
jex login --api-url https://jex.yourcompany.com
```

## Stockage du token

Le fichier de token se trouve dans `~/.jex/token`. C'est une simple chaîne bearer token. Ne commitez jamais ce fichier. Par convention, Jex ajoute `~/.jex/` au gitignore global.

## Voir aussi

- [`jex logout`](/fr/docs/cli/logout) — révoquer la session courante
- [`jex init`](/fr/docs/cli/init) — initialiser un projet après connexion
