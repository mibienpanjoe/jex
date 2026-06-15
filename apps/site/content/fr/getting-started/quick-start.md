# Démarrage rapide

Ce guide couvre le workflow développeur après le déploiement de Jex par votre équipe. Si vous n'avez pas encore d'URL d'API, commencez par [Auto-hébergement d'abord](/fr/docs/getting-started/self-host-first).

## 1. Installer la CLI

```bash
npm install -g jex-secrets
```

## 2. Se connecter

```bash
jex login --api-url https://jex.yourcompany.com
```

Cette commande ouvre votre navigateur sur la page de connexion Jex de votre équipe. Après authentification, un token est enregistré dans `~/.jex/token` avec les permissions `0600`. Vous n'avez besoin de le faire qu'une seule fois par machine.

## 3. Initialiser votre projet

Exécutez cette commande depuis la racine de votre projet :

```bash
jex init
```

Jex affiche la liste de vos projets et environnements. La commande crée un fichier `.envault` dans le répertoire courant :

```toml
project    = "my-app-id"
defaultEnv = "dev"
apiURL     = "https://jex.yourcompany.com"
```

Le fichier `.envault` ne contient aucun secret : seulement une référence de projet et un environnement par défaut. Vous pouvez le commiter.

## 4. Ajouter des secrets

Vous pouvez ajouter des secrets depuis le tableau de bord ou directement via la CLI :

```bash
jex secrets set DATABASE_URL=postgres://user:pass@host/mydb
jex secrets set REDIS_URL=redis://localhost:6379
```

## 5. Récupérer les secrets dans un .env local

```bash
jex secrets pull
# Pulled 2 secrets to .env
```

Cette commande écrit un fichier `.env` atomiquement avec une stratégie fichier temporaire puis renommage. Ajoutez `.env` à votre `.gitignore`.

## 6. Lancer votre app avec les secrets injectés

Workflow recommandé : **aucun fichier .env n'est écrit**.

```bash
jex run -- npm run dev
```

`jex run` récupère les secrets via HTTPS, les injecte dans l'environnement du processus enfant, puis démarre votre application. Aucun fichier n'est écrit sur disque.

## 7. Envoyer les secrets depuis un .env existant

Si vous avez un fichier `.env` existant à migrer dans le vault :

```bash
jex secrets push
# Pushed 8 secrets (8 created, 0 updated).
```

## Workflow typique

```bash
# Le matin : récupérer les derniers secrets avant de commencer
jex secrets pull

# Ou utiliser jex run pour éviter toute écriture sur disque
jex run -- npm run dev

# Quand vous ajoutez un nouveau secret :
jex secrets set MY_NEW_KEY=value

# Voir les environnements disponibles dans le projet :
jex envs

# Lister les secrets de l'environnement courant :
jex secrets list
```

## Étapes suivantes

- [Référence CLI](/fr/docs/cli/login) — liste complète des commandes et flags
- [Environnements](/fr/docs/environments) — gestion de dev / staging / prod
- [Contrôle d'accès](/fr/docs/access-control) — invitation des coéquipiers et RBAC
- [Intégration CI/CD](/fr/docs/ci-cd) — tokens limités pour les pipelines
