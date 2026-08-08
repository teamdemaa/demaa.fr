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
- Levier reste la seule ressource `owned` publiée dans la révision Firebase historique.
- Le statut de la révision décrit son activation technique. Les statuts des
  ressources et placements décrivent leur validation éditoriale séparément.
- Une révision active peut conserver des recommandations tierces en `draft`,
  avec une relation `unknown` et leurs blocages explicites. Cela ne les
  transforme jamais en partenaires ou recommandations validées.
- Chaque métier possède encore exactement un Levier dans `Modèles`, au maximum cinq
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
`published`. Depuis le chantier Ressources, le rendu normal et le rendu SEO
filtrent entièrement la section historique `models`. Les cinq ressources Demaa
communes sont servies par `system-resource-catalog.ts`; la révision Firebase
reste intacte uniquement pour permettre un retour arrière sans écriture distante.

## Audit de couverture des Solutions — 8 août 2026

Cet audit porte sur la révision Firebase active et son snapshot exporté. Les
sections sont affichées uniquement lorsqu'elles contiennent au moins une
recommandation sélectionnée : une section vide ne doit jamais être rendue.

| Section | Cartes sélectionnées | Systèmes couverts | Systèmes sans carte |
| --- | ---: | ---: | ---: |
| Outils | 313 | 114 | 1 |
| Prestataires et fournisseurs | 82 | 39 | 76 |
| Réseaux professionnels | 90 | 77 | 38 |
| Modèles | 115 | 115 | 0 |

Les 82 cartes de la section `Prestataires et fournisseurs` restent toutes en
relation commerciale `unknown`. Leur visibilité ne signifie ni partenariat,
ni affiliation, ni recommandation commerciale de Demaa ou d’ODEMA.

### Décision de structure

- `Fournisseurs` reste une section **métier et conditionnelle**.
  Elle est réservée aux acteurs réellement utiles à l'activité concernée : par
  exemple un négoce de matériaux pour le BTP ou un grossiste pour la restauration.
- Il ne faut pas créer une carte vide, ni forcer la section sur les 115 systèmes
  pour donner l'illusion d'une couverture complète.
- `Prestations` est une section distincte. Elle expose une compétence générique,
  jamais une personne ou un partenaire imposé. L'expert-comptable y est proposé
  aux 114 systèmes hors cabinet comptable ; le cabinet comptable reçoit à la
  place `Délégation et formalités juridiques`.
- Amazon Business est ajouté uniquement aux systèmes des secteurs Conseil et
  Tech & Digital. Alan et Swile restent au catalogue sans placement automatique,
  car leur pertinence dépend notamment du pays et de la présence de salariés.

Cette règle préserve la valeur éditoriale des rails existants tout en rendant
possible un futur parcours comptable universel, sans promesse implicite ni
recommandation forcée.

## Commandes locales

```bash
npm run export:firebase-solutions-snapshot
npm run plan:firebase-solutions-import
npm run verify:firebase-solutions-emulator
```

La première commande exporte la révision Firebase active vers le snapshot de
secours local. Elle exige des identifiants serveur et ne lit aucune source
historique. La deuxième commande est strictement en lecture seule. Elle produit
le plan de la prochaine révision immuable et refuse `--apply`. La révision V2
préparée le 8 août contient 250 ressources, 643 placements et 894 écritures,
réparties en lots de 400 maximum.

La troisième commande démarre un projet Firestore Emulator jetable, applique
réellement les 894 écritures, relit les 250 ressources et les 643 placements,
revalide les deux empreintes et vérifie le pointeur actif. Le
script refuse de démarrer sans `FIRESTORE_EMULATOR_HOST` et utilise uniquement
le projet de démonstration `demo-demaa-solutions`, qui ne peut pas atteindre un
service Firebase distant.

## Révision V2 préparée localement — non activée

La révision `solutions-2026-08-08-active-v2` est un candidat distinct de la
révision V1 actuellement active. Elle conserve toutes les 600 cartes existantes
et ajoute 43 placements fournisseurs, dont Amazon Business sur 40 systèmes de
services ou du numérique. Elle ne modifie aucun document V1.

Son import exige les empreintes exactes du nouveau plan et de la révision, mais
aussi l'identifiant et l'empreinte du pointeur actif à remplacer. La mise à jour
du pointeur utilise la date de version Firestore lue juste avant l'import : une
modification concurrente fait donc échouer l'activation au lieu d'être écrasée.

## Séparation Preview / Production

Depuis la bascule du 5 août 2026, Vercel Preview et Vercel Production utilisent
deux identités OIDC sans clé et deux projets Firestore distincts. Toutes les
Previews utilisent `demaa-preview-2026` ; la Production utilise exclusivement
`demaa-dde32`. Les anciens identifiants statiques ne sont plus présents dans
l’environnement Production.

Le projet Firebase isolé retenu pour cette recette est `demaa-preview-2026`,
avec une base Firestore Standard en région `eur3`, des règles clientes fermées
et la protection contre la suppression activée. L’import distant exige à la
fois le projet attendu, le projet confirmé en argument, l’empreinte exacte du
plan et le drapeau `--apply-active-revision`. La Production utilise le même
importeur, mais exige séparément `--target=production`,
`--apply-production-active-revision`, le projet canonique `demaa-dde32` et les
deux empreintes exactes. Un gate Preview ne peut donc jamais écrire en
Production, et réciproquement.
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

## Activation Firebase Production du 5 août 2026

La même révision scellée a été importée puis activée dans le projet canonique
`demaa-dde32` :

- protection contre la suppression activée sur la base `(default)` en `eur3` ;
- 849 documents créés, puis 248 ressources et 600 placements relus ;
- seconde exécution idempotente avec zéro écriture créée ;
- pointeur actif conforme aux empreintes Preview ci-dessus ;
- audit HTTP Production : 115 pages Process et 115 pages Solutions en 200,
  600 cartes Solutions, 115 placements Levier et zéro échec.

Les fonctions Vercel Production utilisent le provider OIDC
`demaa-fr-production`, limité au projet Vercel `demaa-fr` et à
`environment=production`. Il peut uniquement emprunter le compte sans clé
`demaa-solutions-prod-reader`, lui-même limité à
`roles/datastore.viewer`. Le déploiement final
`demaa-n24a1htef-hiteamdemaa-2292s-projects.vercel.app` a été reconstruit après
le retrait des identifiants statiques. La lecture de la révision Firebase par
OIDC ne produit ni fallback, ni avertissement, ni erreur. L’audit final contrôle
115 pages Process, 115 pages Solutions, 600 cartes et 115 placements Levier,
sans échec.

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
