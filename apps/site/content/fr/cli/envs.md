# jex envs

Liste et gère les environnements du projet courant.

## Utilisation

```bash
jex envs
jex envs create preview-1
jex envs use preview-1
jex envs delete preview-1
```

## Sortie

```
* dev      (14 secrets)
  staging  (14 secrets)
  prod     (14 secrets)
```

L'environnement actif, défini dans `.envault`, est marqué avec `*`.

## Commandes

| Commande | Description |
|---|---|
| `jex envs` | Liste les environnements du projet. |
| `jex envs create NAME` | Crée un environnement personnalisé. Les noms doivent utiliser des minuscules, chiffres et tirets. |
| `jex envs use NAME` | Met à jour `.envault` pour que les prochaines commandes utilisent cet environnement par défaut. |
| `jex envs delete NAME` | Supprime un environnement personnalisé et ses secrets. Les environnements par défaut ne peuvent pas être supprimés. |

## Voir aussi

- [`jex init`](/fr/docs/cli/init) — changer l'environnement par défaut
- [Environnements](/fr/docs/environments) — créer et gérer les environnements
