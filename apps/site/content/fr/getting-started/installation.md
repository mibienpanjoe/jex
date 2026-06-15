# Installation

## Prérequis

- Node.js 18 ou plus récent, pour le wrapper npm
- Une instance Jex auto-hébergée en cours d'exécution
- Un compte Jex créé sur le tableau de bord de votre équipe

Jex ne fournit pas de vault cloud hébergé. Avant d'installer la CLI pour l'usage quotidien, déployez l'API, le tableau de bord et la base de données pour votre équipe. Consultez [Auto-hébergement d'abord](/fr/docs/getting-started/self-host-first) et [Auto-hébergement](/fr/docs/self-hosting).

## Installer la CLI

La CLI `jex` est distribuée comme un binaire Go compilé, enveloppé dans un package npm.

```bash
npm install -g jex-secrets
```

Cette commande installe le binaire `jex` dans votre `PATH`. Le script `postinstall` télécharge le bon binaire pour votre plateforme (linux/darwin × amd64/arm64).

Vérifiez l'installation :

```bash
jex version
# jex v0.1.0
```

## Alternative : installer depuis les sources

Si Go 1.23+ est installé :

```bash
git clone https://github.com/mibienpanjoe/jex.git
cd jex/cli
go build -o jex .
# Déplacez le binaire vers un emplacement présent dans votre PATH
sudo mv jex /usr/local/bin/jex
```

## Connexion à l'API de votre équipe

Passez le flag `--api-url` lors de la connexion :

```bash
jex login --api-url https://jex.yourcompany.com
```

Ou définissez l'URL une fois dans `.envault` avec `jex init`. Le fichier `.envault` stocke uniquement les métadonnées du projet et l'URL de l'API. Il ne doit pas contenir de secrets.

## Étape suivante

→ [Démarrage rapide](/fr/docs/getting-started/quick-start)
