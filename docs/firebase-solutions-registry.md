# Registre Firebase des Solutions

## Décision

Firebase est l’unique source éditable des recommandations affichées dans les
pages Systèmes. Les anciens fichiers ne sont plus lus par le runtime et restent
uniquement des archives de migration. Le fichier
`firebase-solution-registry.snapshot.generated.json` est une sortie générée de
secours exportée depuis la révision Firebase active : il ne doit jamais être
édité manuellement ni régénéré depuis les anciens fichiers.

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
- Le statut de la révision décrit son activation technique. Les statuts des
  ressources et placements décrivent leur validation éditoriale séparément.
- Une révision active peut conserver des recommandations tierces en `draft`,
  avec une relation `unknown` et leurs blocages explicites. Cela ne les
  transforme jamais en partenaires ou recommandations validées.
- Chaque métier possède exactement un Levier dans `Modèles`, au maximum cinq
  cartes par section et des rangs continus.
- Toute tarification visible porte une source, une date de capture et une date
  d’expiration. Une tarification expirée est masquée.

## Migration actuelle

La révision active `solutions-2026-08-05-active-v1` couvre :

- 115 métiers ;
- 248 ressources ;
- 600 placements ;
- 115 placements Levier ;
- une parité de rendu contrôlée métier par métier avec l’interface historique.

Elle est techniquement active, mais conserve 247 ressources et 485 placements
tiers en `draft`. Seuls Levier et ses 115 placements sont éditorialement
`published`. Le rendu normal lit cette révision ; le rendu SEO structuré ne
retient que les entrées éditorialement publiées.

## Commandes locales

```bash
npm run export:firebase-solutions-snapshot
npm run plan:firebase-solutions-import
npm run verify:firebase-solutions-emulator
```

La première commande exporte la révision Firebase active vers le snapshot de
secours local. Elle exige des identifiants serveur et ne lit aucune source
historique. La deuxième commande est strictement en lecture seule. Elle produit
un plan de 849 écritures réparties en lots de 400 maximum et refuse `--apply`.

La troisième commande démarre un projet Firestore Emulator jetable, applique
réellement les 849 écritures, relit les 248 ressources et les 600 placements,
revalide les deux empreintes et vérifie le pointeur actif. Le
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

Le projet Firebase isolé retenu pour cette recette est `demaa-preview-2026`,
avec une base Firestore Standard en région `eur3`, des règles clientes fermées
et la protection contre la suppression activée. L’import distant exige à la
fois le projet attendu, le projet confirmé en argument, l’empreinte exacte du
plan et le drapeau `--apply-active-revision`. Le projet de Production est refusé en dur.
L’authentification distante utilise uniquement un jeton utilisateur éphémère
fourni au processus d’import. Aucune clé de compte de service n’est créée ou
conservée, et l’ADC partagé avec un autre projet n’est pas utilisé.

Les fonctions Vercel utilisent également une identité sans clé. Le fournisseur
OIDC Google n’accepte que le projet Vercel `demaa-fr` dans l’environnement
`preview`. Il peut seulement emprunter le compte
`demaa-solutions-preview-reader`, limité au rôle `roles/datastore.viewer` sur
`demaa-preview-2026`. Les jetons expirent après une heure ; aucune clé privée
Firebase Preview n’est stockée dans Vercel.

## Recette Firebase Preview du 5 août 2026

La révision de parité active a été importée, relue et activée dans
`demaa-preview-2026` :

- 849 documents créés lors du premier passage ;
- 248 ressources et 600 placements relus et revalidés ;
- empreinte source `759558daa13d489231fb1040a236173a61e35d316955ded530f97442108c2401` ;
- empreinte du plan `b50470f407539974a195f896b54b3f58c5c32adfa89b8a1608e7e807f62696b9` ;
- pointeur actif créé et relu avec ces deux valeurs exactes ;
- seconde exécution idempotente avec zéro écriture créée.

Cette activation ne promeut aucune recommandation tierce : leurs statuts
`draft`, relations `unknown` et blocages restent inchangés. Elle déplace
uniquement la source de lecture vers Firebase avec une parité de rendu 115/115.

## Activation et rollback

1. Construire une nouvelle révision immuable et vérifier son empreinte.
2. Importer ses documents dans une branche Preview Firebase isolée.
3. Relire les documents importés et refaire les contrôles 115/115.
4. Mettre à jour atomiquement `solution_registry_config/active` avec
   `revisionId` et `sourceFingerprint`.
5. Exporter le snapshot de secours depuis cette révision active.
6. Invalider le tag de cache `solutions-registry`.

Le rollback consiste uniquement à remettre le pointeur vers une ancienne
révision publiée et complète. Aucune révision n’est écrasée ni supprimée.
