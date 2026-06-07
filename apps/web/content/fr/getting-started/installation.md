# Installation

## Prérequis

- Node.js 18 ou plus récent, pour le wrapper npm
- Un compte Jex : [créez-en un gratuitement](/fr/register) ou [auto-hébergez Jex](/fr/docs/self-hosting)

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

## API auto-hébergée

Si vous utilisez votre propre API Jex, passez le flag `--api-url` aux commandes :

```bash
jex login --api-url https://jex.yourcompany.com
```

Ou définissez l'URL une fois dans `.envault` avec `jex init`.

## Étape suivante

→ [Démarrage rapide](/fr/docs/getting-started/quick-start)
