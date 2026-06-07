# jex logout

Révoque la session courante et supprime les identifiants locaux.

## Utilisation

```bash
jex logout
```

## Comportement

1. Appelle `DELETE /api/v1/auth/sessions/current` pour révoquer la session côté serveur
2. Supprime `~/.jex/token`
3. Affiche : `Logged out.`

Si l'appel API échoue, par exemple sans réseau, le token local est quand même supprimé et un avertissement est affiché. La session expirera côté serveur selon le TTL configuré.

## Voir aussi

- [`jex login`](/fr/docs/cli/login)
