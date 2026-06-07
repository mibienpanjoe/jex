# FAQ

## Jex stocke-t-il mes secrets en clair ?

Non. Chaque valeur de secret est chiffrée avec AES-256-GCM avant d'être stockée en base de données. La clé de chiffrement (`ENCRYPTION_KEY`) vit dans l'environnement de l'API, pas dans la base. Le serveur n'écrit jamais une valeur en clair sur disque.

## Puis-je utiliser Jex sans installer la CLI ?

Oui. Le tableau de bord permet de lire, écrire et gérer les secrets directement depuis le navigateur. La CLI est optionnelle, mais fortement recommandée pour le développement local, surtout avec `jex run`.

## Que se passe-t-il si je perds ma ENCRYPTION_KEY ?

Tous les secrets deviennent définitivement illisibles. Il n'existe aucune procédure de récupération. Stockez votre `ENCRYPTION_KEY` dans un gestionnaire de mots de passe ou de secrets.

## Est-ce sûr de commiter `.envault` ?

Oui. `.envault` contient uniquement `project`, `defaultEnv` et `apiURL` : aucun secret, aucun token, aucun identifiant.

## Puis-je utiliser Jex avec Docker ?

Oui. Utilisez `jex run -- docker run ...` si vous construisez localement. Pour les conteneurs de production, injectez les secrets à l'exécution via des variables d'environnement passées à `docker run --env-file`, ou utilisez des tokens CI/CD.

## `jex run` fonctionne-t-il avec Python, Ruby ou d'autres langages ?

Oui. `jex run` est indépendant du langage : il démarre n'importe quel processus et transmet les secrets via l'environnement. `os.environ`, `ENV`, `process.env` et les autres API standard verront les secrets injectés.

## Comment faire tourner un secret ?

Exécutez `jex secrets set MY_KEY=new_value` ou mettez-le à jour dans le tableau de bord. Le changement prend effet immédiatement : tout appel suivant à `jex run` ou `jex secrets pull` récupérera la nouvelle valeur.

## Jex est-il prêt pour la production ?

Jex v0.1 convient aux petites et moyennes équipes de développement. Pour un usage entreprise, relisez l'architecture, lancez un audit de sécurité et contribuez aux améliorations nécessaires.
