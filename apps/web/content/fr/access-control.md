# Contrôle d'accès

Jex utilise un contrôle d'accès basé sur les rôles (RBAC) pour définir ce que chaque membre peut faire.

## Rôles

| Rôle | Lire les secrets | Écrire les secrets | Gérer les membres | Gérer les tokens | Supprimer le projet |
|------|------------------|--------------------|-------------------|------------------|---------------------|
| Admin projet | ✓ | ✓ | ✓ | ✓ | ✓ |
| Développeur | ✓ | ✓ | — | — | — |
| Lecture seule | ✓ | — | — | — | — |

## Inviter des membres

Les admins projet peuvent inviter des membres depuis le tableau de bord (**Membres → Inviter un membre**) ou via l'API. Un email d'invitation est envoyé avec un lien à usage unique.

## Garantie du dernier admin projet

Le dernier admin projet **ne peut pas être supprimé ni rétrogradé**. Cela empêche un projet de devenir définitivement inaccessible. Jex applique cette règle au niveau de l'API : aucun contournement n'existe.

## CI/CD tokens

Pour les pipelines automatisés, utilisez des tokens CI/CD plutôt que des comptes personnels. Consultez [Intégration CI/CD](/fr/docs/ci-cd) pour le guide complet.
