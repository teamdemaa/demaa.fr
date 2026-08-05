# Registre Firebase des Solutions

## Décision

Firebase devient l’unique source éditable des recommandations affichées dans
les pages Systèmes. Les anciens fichiers restent temporairement des entrées de
migration. Le fichier
`firebase-solution-registry.snapshot.generated.json` est une sortie générée de
secours : il ne doit jamais être édité manuellement.

## Structure Firestore

```text
solution_registry_config/active
  revisionId
  sourceFingerprint

solution_registry_revisions/{revisionId}
  schemaVersion
  revisionId
  revisionStatus
  createdAt
  createdBy
  sourceFingerprint
  knownSystemSlugs

solution_registry_revisions/{revisionId}/resources/{resourceSlug}
  resource

solution_registry_revisions/{revisionId}/placements/{placementId}
  placement
  presentation
```

Le document actif ne contient qu’un pointeur et l’empreinte attendue. Les
ressources et placements sont séparés parce que la révision complète dépasse
la limite d’un document Firestore.

## Règles de publication

- Une recommandation tierce migrée conserve le statut `draft`, la relation
  commerciale `unknown` et ses blocages.
- Aucune recommandation n’est déclarée partenaire, affiliée, Demaa ou ODEMA
  sans décision et preuve séparées.
- Levier est la seule ressource `owned` actuellement publiée.
- Une révision `draft` peut être importée pour recette, mais elle ne peut pas
  devenir le pointeur actif.
- Une révision `published` ne peut contenir que des ressources et placements
  publiés, vérifiés et sans blocage.
- Chaque métier possède exactement un Levier dans `Modèles`, au maximum cinq
  cartes par section et des rangs continus.
- Toute tarification visible porte une source, une date de capture et une date
  d’expiration. Une tarification expirée est masquée.

## Migration actuelle

La révision locale `solutions-2026-08-05-v1` couvre :

- 115 métiers ;
- 248 ressources ;
- 600 placements ;
- 115 placements Levier ;
- une parité de rendu contrôlée métier par métier avec l’interface historique.

Elle reste `draft`. Les pages continuent donc à utiliser la lecture historique.
Elles ne basculeront sur Firebase que lorsqu’un pointeur désignera une révision
entièrement publiée et validée.

## Commandes locales

```bash
npm run generate:firebase-solutions-snapshot
npm run plan:firebase-solutions-import
npm run verify:firebase-solutions-emulator
```

La deuxième commande est strictement en lecture seule. Elle produit un plan de
849 écritures réparties en lots de 400 maximum et refuse `--apply`.

La troisième commande démarre un projet Firestore Emulator jetable, applique
réellement les 849 écritures, relit les 248 ressources et les 600 placements,
revalide les deux empreintes et vérifie que le pointeur actif n’existe pas. Le
script refuse de démarrer sans `FIRESTORE_EMULATOR_HOST` et utilise uniquement
le projet de démonstration `demo-demaa-solutions`, qui ne peut pas atteindre un
service Firebase distant.

## Séparation Preview / Production

Le contrôle Vercel du 5 août 2026 montre que les trois identifiants Firebase
actuels sont communs aux environnements Development, Preview et Production.
Une Preview Vercel n’est donc pas, à elle seule, un environnement Firestore
isolé. Tant qu’un projet Firebase Preview distinct n’est pas configuré, tout
import distant est interdit, même pour une révision `draft` et même sans mise à
jour du pointeur actif.

## Activation et rollback

1. Auditer et promouvoir explicitement les ressources et placements retenus.
2. Construire une nouvelle révision `published` et vérifier son empreinte.
3. Importer ses documents dans une branche Preview Firebase isolée.
4. Relire les documents importés et refaire les contrôles 115/115.
5. Mettre à jour atomiquement `solution_registry_config/active` avec
   `revisionId` et `sourceFingerprint`.
6. Invalider le tag de cache `solutions-registry`.

Le rollback consiste uniquement à remettre le pointeur vers une ancienne
révision publiée et complète. Aucune révision n’est écrasée ni supprimée.
