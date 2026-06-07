# Intégration CI/CD

Jex prend en charge les tokens CI/CD limités à un périmètre précis, pour les pipelines automatisés sans exposer les identifiants des développeurs.

## Créer un token CI/CD

1. Allez dans **Tableau de bord → Tokens → Créer un token**
2. Donnez-lui un nom descriptif, par exemple `github-actions-prod`
3. Sélectionnez l'environnement ciblé (`prod`, `staging`, etc.)
4. Copiez le token : il ne sera plus affiché

## Utiliser le token dans un pipeline

Déclarez le token comme secret dans votre environnement CI, par exemple dans les secrets GitHub Actions, puis utilisez-le avec la CLI Jex :

```yaml
# .github/workflows/deploy.yml
env:
  JEX_TOKEN: ${{ secrets.JEX_TOKEN }}

steps:
  - name: Deploy with secrets
    run: jex run --token $JEX_TOKEN -- ./deploy.sh
```

> **Note :** la prise en charge du flag `--token` arrive en v0.2. Pour l'instant, enregistrez le token dans `~/.jex/token` pendant l'étape de préparation du pipeline.

## Révoquer un token

Les tokens peuvent être révoqués instantanément depuis le tableau de bord (**Tokens → Révoquer**). La révocation est immédiate : le prochain appel API utilisant ce token retourne `401`. Il n'y a pas de cache.

## Recommandations de sécurité

- Créez un token séparé par pipeline et par environnement
- Nommez les tokens clairement pour faciliter l'audit
- Faites tourner les tokens après le départ d'un membre de l'équipe
- N'utilisez jamais un token de session personnel en CI : utilisez uniquement des tokens CI/CD
