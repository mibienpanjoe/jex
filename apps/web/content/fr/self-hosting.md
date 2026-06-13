# Auto-hébergement

Jex est entièrement auto-hébergeable. Toute la stack — PostgreSQL, l'API et le tableau de bord — démarre avec un seul `docker-compose up`.

## Prérequis

- Docker et Docker Compose (v2)
- Un nom de domaine pour HTTPS en production
- 512 Mo de RAM minimum

## Démarrage rapide

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Générez les deux secrets requis :

```bash
openssl rand -hex 32     # → à utiliser comme ENCRYPTION_KEY (exactement 64 caractères hex)
openssl rand -base64 32  # → à utiliser comme BETTER_AUTH_SECRET
```

Modifiez `apps/api/.env` :

```bash
DATABASE_URL=postgresql://jex:jexpass@db:5432/jex
ENCRYPTION_KEY=<paste hex output here>
BETTER_AUTH_SECRET=<paste base64 output here>
BETTER_AUTH_URL=http://localhost:3001
WEB_ORIGIN=http://localhost:3000
WEB_DEFAULT_LOCALE=fr
PORT=3001
```

Démarrez la stack :

```bash
docker-compose up -d
```

L'API démarre sur `http://localhost:3001` et le tableau de bord sur `http://localhost:3000`.

> ⚠️ L'API valide ces variables d'environnement au démarrage. Si `ENCRYPTION_KEY` est absente ou ne fait pas 64 caractères hexadécimaux, le conteneur s'arrête avec un message clair. Vérifiez `docker logs jex-api-1`.

## Variables d'environnement

### `apps/api/.env`

| Variable | Requise | Notes |
|---|---|---|
| `DATABASE_URL` | oui | Chaîne de connexion PostgreSQL. Dans le réseau compose, l'hôte est `db`. |
| `ENCRYPTION_KEY` | oui | Chaîne hexadécimale de 64 caractères (32 octets), générée avec `openssl rand -hex 32`. |
| `BETTER_AUTH_SECRET` | oui | Secret aléatoire utilisé pour signer les sessions d'authentification. |
| `BETTER_AUTH_URL` | non | Origine publique de l'API qui sert `/api/v1/auth/*`. Par défaut : `http://localhost:3001`. |
| `WEB_ORIGIN` | non | Origine publique du tableau de bord autorisée à faire des requêtes API avec identifiants. Par défaut : `http://localhost:3000`. |
| `WEB_DEFAULT_LOCALE` | non | Locale utilisée pour les redirections auth de l'API vers le tableau de bord. Par défaut : `fr`. |
| `PORT` | non | Par défaut : `3001`. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | oui pour la connexion GitHub | Identifiants de l'application OAuth GitHub. |

## Configuration OAuth GitHub

Créez une application OAuth GitHub depuis **Settings → Developer settings → OAuth Apps**.

Pour le développement local :

| Champ GitHub | Valeur |
|---|---|
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3001/api/v1/auth/callback/github` |

Copiez ensuite le client ID et le client secret générés dans `apps/api/.env` :

```bash
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

En production, utilisez vos origines publiques :

```bash
BETTER_AUTH_URL="https://api.jex.yourcompany.com"
WEB_ORIGIN="https://jex.yourcompany.com"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

L'URL de callback GitHub en production doit correspondre à l'origine publique de l'API :

```text
https://api.jex.yourcompany.com/api/v1/auth/callback/github
```

### `apps/web/.env`

| Variable | Requise | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | oui | URL appelée par le tableau de bord. Utilisez l'origine publique de l'API, pas le nom d'hôte interne compose. |

## Pointer la CLI vers votre instance

```bash
jex login --api-url https://jex.yourcompany.com
```

Vous pouvez aussi lancer `jex init --api-url https://jex.yourcompany.com` : l'URL sera enregistrée dans le `.envault` du projet.

## Reverse proxy (HTTPS)

Placez la stack derrière un reverse proxy qui gère TLS. Exemple avec [Caddy](https://caddyserver.com) :

```caddy
jex.yourcompany.com {
    reverse_proxy localhost:3000
}

api.jex.yourcompany.com {
    reverse_proxy localhost:3001
}
```

Puis définissez dans `apps/api/.env` :

```bash
BETTER_AUTH_URL=https://api.jex.yourcompany.com
WEB_ORIGIN=https://jex.yourcompany.com
```

Et dans `apps/web/.env` :

```bash
NEXT_PUBLIC_API_URL=https://api.jex.yourcompany.com
```

## Sauvegardes de la base de données

Les données PostgreSQL vivent dans le volume Docker `pgdata`. Sauvegardez-les avec un dump planifié :

```bash
docker exec jex-db-1 pg_dump -U jex jex > backup-$(date +%F).sql
```

Restaurez avec :

```bash
cat backup-2026-05-15.sql | docker exec -i jex-db-1 psql -U jex jex
```

## Mise à jour

```bash
git pull
docker-compose pull
docker-compose up -d --build
```

Le conteneur API exécute `prisma migrate deploy` au démarrage, donc les migrations de schéma s'appliquent automatiquement.

## Checklist production

- [ ] `ENCRYPTION_KEY` a été générée avec `openssl rand -hex 32` et stockée dans un gestionnaire de mots de passe
- [ ] `BETTER_AUTH_SECRET` est une valeur aléatoire fraîche, pas l'exemple
- [ ] La stack est derrière un reverse proxy HTTPS ; n'exposez jamais directement les ports 3000/3001 sur internet
- [ ] Le volume PostgreSQL a des sauvegardes planifiées
- [ ] Le mapping du port hôte `5432` est supprimé si vous n'avez pas besoin d'accès externe à la base

> ⚠️ **Ne changez jamais `ENCRYPTION_KEY` après avoir stocké des secrets.** Tous les secrets existants deviendront illisibles. Pour effectuer une rotation, déchiffrez avec l'ancienne clé, rechiffrez avec la nouvelle, puis remplacez-la.
