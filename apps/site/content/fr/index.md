# Documentation Jex

**Jex** est un gestionnaire de secrets open-source pour les équipes de développeurs.

Trois couches travaillent ensemble :

- **Vault chiffré** — base PostgreSQL ; chaque secret est chiffré avec AES-256-GCM avant stockage
- **CLI Go** (`jex`) — installez, exécutez et injectez les secrets directement dans l'environnement des processus
- **Tableau de bord Next.js** — gérez les projets, environnements, membres d'équipe et tokens

## Pourquoi Jex ?

Votre équipe a très probablement un problème de secrets : identifiants partagés sur Slack, fichiers `.env` obsolètes sur les postes des développeurs, clés API codées en dur dans la configuration CI. Jex remplace ces pratiques par une source de vérité unique et auditable.

Avec la commande `jex run`, **les secrets ne touchent jamais le disque** dans votre workflow de développement : ils sont injectés directement dans l'environnement du processus enfant.

## Liens rapides

- [Installation](/fr/docs/getting-started/installation)
- [Démarrage rapide](/fr/docs/getting-started/quick-start)
- [Référence CLI](/fr/docs/cli/login)
- [Auto-hébergement](/fr/docs/self-hosting)
