# Dette dependance `firebase-admin`

## Statut

Sujet separe du chantier applicatif principal. L'application peut etre consideree comme fermee cote correctifs code, tests et CI.

## Contexte

`npm audit --omit=dev` remonte encore `6` vulnerabilites `moderate` transitives via la chaine:

- `firebase-admin`
- `@google-cloud/storage`
- `retry-request`
- `teeny-request`
- `gaxios`
- `uuid`

## Constat

- aucune vulnerabilite `high` restante;
- aucun usage direct de `firebase-admin/storage` dans le code applicatif audite;
- la correction automatique proposee par `npm audit fix --force` downgrade `firebase-admin` vers `10.3.0`;
- ce downgrade est juge plus risqué que le reliquat actuel.

## Decision retenue

Ne pas appliquer `npm audit fix --force` sur ce projet dans ce chantier.

Le reliquat est accepte temporairement comme dette dependance documentee.

## Conditions de fermeture definitive

Fermer ce sous-sujet uniquement si l'un de ces cas se produit:

- une mise a jour amont de `firebase-admin` supprime proprement la chaine vulnerable;
- une strategie de remplacement ou d'isolation de la dependance est validee;
- un test de non-regression confirme qu'une mise a niveau structurelle est sure.

## Prochaine investigation recommandee

1. verifier a la prochaine mise a jour `firebase-admin` si la chaine `@google-cloud/storage` change;
2. confirmer si le projet a reellement besoin du sous-ensemble concerne;
3. tester la mise a jour dans une branche dediee avec `lint`, `npm test`, `npm run test:e2e` et `npm run build`;
4. clore ce sujet seulement si le reliquat disparait sans regression.
