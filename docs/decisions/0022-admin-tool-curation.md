# ADR 0022 - Administration éditoriale des Outils

- Statut : `validated`
- Décision : D-097
- Date : 24 août 2026
- Portée : administration Team Demaa, curation D-091 et activation Firebase

## Contexte

D-091 prépare des sélections d'outils par système métier à partir de preuves
officielles, de limites explicites et d'un classement éditorial. Le registre
Firebase distingue déjà les ressources, les placements, les révisions
immuables et le pointeur actif. Une interface admin utile ne doit pas affaiblir
ce contrat en permettant une modification directe de la Production.

Les Services Demaa, Fournisseurs, Financement, Aides et Réseaux ont des règles,
des sources et des gates différents. Ils ne deviennent pas des Outils et ne
doivent pas être mélangés dans un écran générique.

## Décision

L'administration des Outils suit un workflow en six étapes :

```text
lecture de l'actif
→ brouillon éditorial
→ audits D-091
→ révision candidate immuable
→ Preview
→ activation explicite avec rollback
```

Le premier lot runtime, livré par les PR 214 et 216, expose uniquement
`/admin/outils` en lecture seule. Il
utilise la session Team D-094 et montre au minimum :

- l'identifiant et le statut de la révision active ;
- l'identifiant de la candidate lorsqu'elle existe ;
- les 115 systèmes recherchables ;
- les outils retenus, leur rang, leur preuve, leur date de revue, leurs limites
  et leur justification contextualisée ;
- les différences entre actif et candidat ;
- les échecs de contrat sans fallback silencieux.

Une phase ultérieure pourra enregistrer des brouillons, mais elle ne peut ni
muter la révision active ni déplacer son pointeur. La création d'une candidate
reste une opération séparée et auditée. L'activation exige :

1. une candidate immuable entièrement validée ;
2. une recette Preview de l'API, des interfaces, des pages Système, du HTML et
   du JSON-LD ;
3. un journal de l'ancienne et de la nouvelle révision ;
4. une confirmation explicite ;
5. un GO PROD distinct ;
6. une procédure de rollback testée.

## Sécurité et maintenance

- `/admin/outils` utilise `requireAdminIdentity` et l'allowlist admin existante.
- Le navigateur n'est jamais l'autorité de la révision active.
- Aucune clé, preuve interne sensible ni donnée personnelle n'est sérialisée
  inutilement vers le client.
- Les erreurs de lecture sont visibles et fail-closed ; elles n'activent aucun
  fallback historique silencieux.
- Les identifiants canoniques des outils, systèmes, ressources et placements
  restent inchangés.
- Aucun badge, quota artificiel, recommandation IA ou module d'aide au choix
  n'est ajouté à la surface publique par D-097.

## Séquencement

1. PR documentation et contrats.
2. PR lecture seule `/admin/outils`.
3. PR brouillons éditoriaux, si la lecture seule est validée.
4. PR génération et audit d'une candidate immuable.
5. recette Preview.
6. activation Firebase seulement après GO PROD séparé.

La vue lecture seule est livrée. Les mutations, la création d'une candidate et
l'activation attendent la validation métier du pilote D-091 et des GO séparés.
