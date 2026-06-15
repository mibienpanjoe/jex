# Pourquoi auto-héberger ?

Jex n'est pas une plateforme de secrets hébergée. Le site public Jex héberge uniquement la page de présentation et la documentation. Votre équipe exécute l'API, le tableau de bord et la base PostgreSQL dans l'infrastructure qu'elle contrôle.

Cette limite est volontaire : un gestionnaire de secrets doit garder la responsabilité des secrets auprès de l'équipe qui possède les applications, les identifiants, les exigences d'audit et la réponse aux incidents.

## Ce que votre équipe contrôle

- La base de données qui stocke les secrets chiffrés
- La clé `ENCRYPTION_KEY` utilisée par l'API pour chiffrer et déchiffrer les secrets
- Le tableau de bord où les comptes, projets, membres et tokens sont gérés
- Les sauvegardes, mises à jour, alertes et accès réseau

## Ce que fournit le site public

- Présentation du produit
- Documentation
- Instructions d'installation de la CLI
- Guides d'auto-hébergement
- Liens vers le dépôt open-source

Il ne fournit pas de création de compte, de tableau de bord hébergé ou d'API hébergée.

## Flux recommandé

1. Lisez le [guide d'auto-hébergement](/fr/docs/self-hosting).
2. Déployez Jex pour votre équipe.
3. Créez les comptes sur votre propre tableau de bord.
4. Installez la CLI.
5. Connectez-vous avec l'URL de votre API.

```bash
jex login --api-url https://jex.yourcompany.com
```

