# Environnements

Chaque projet Jex contient trois environnements par défaut : `dev`, `staging` et `prod`.

Chaque environnement possède son propre ensemble de secrets. Un secret avec la clé `DATABASE_URL` dans `dev` est complètement séparé de `DATABASE_URL` dans `prod`.

## Couleurs des environnements

| Environnement | Couleur | Badge |
|---------------|---------|-------|
| `dev` | Vert | Partageable avec tous les membres |
| `staging` | Ambre | Correspond à la configuration de production |
| `prod` | Rouge | Restreint aux admins projet par défaut |

## Créer des environnements personnalisés

Les environnements personnalisés peuvent être créés par les admins projet depuis le tableau de bord (**Paramètres → Environnements → Nouvel environnement**) ou via l'API.

> **Note :** `dev`, `staging` et `prod` sont réservés et ne peuvent pas être supprimés.

## Changer d'environnement dans la CLI

Utilisez `--env` pour remplacer l'environnement par défaut défini dans `.envault` :

```bash
jex secrets pull --env staging
jex run --env prod -- node server.js
jex secrets list --env staging
```

## RBAC par environnement

L'accès à chaque environnement est contrôlé par rôle. Consultez [Contrôle d'accès](/fr/docs/access-control) pour voir comment limiter les membres et tokens CI/CD à des environnements spécifiques.
