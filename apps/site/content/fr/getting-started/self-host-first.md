# Auto-hébergement d'abord

Installez la CLI seulement après avoir une instance Jex fonctionnelle pour votre équipe. La CLI a besoin d'une URL d'API pour s'authentifier, lister les projets, lire et écrire les secrets.

## Ce qui doit exister avant

- Une API Jex en cours d'exécution
- Un tableau de bord Jex en cours d'exécution
- Une base PostgreSQL
- Une clé `ENCRYPTION_KEY` stable
- Au moins un compte utilisateur créé sur votre propre tableau de bord

Pour un déploiement local ou une petite équipe, commencez par le [guide d'auto-hébergement](/fr/docs/self-hosting).

## Pourquoi cette étape vient avant l'installation

Jex n'exploite pas de vault cloud hébergé. Le site public ne peut pas créer de comptes pour votre équipe, et `jex login` doit pointer vers votre propre API :

```bash
jex login --api-url https://jex.yourcompany.com
```

Quand l'instance est accessible, continuez vers [Installation](/fr/docs/getting-started/installation).

