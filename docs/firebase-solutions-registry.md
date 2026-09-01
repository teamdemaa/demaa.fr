# Registre Firebase des Solutions

## Décision

Firebase est l’unique source runtime des recommandations de logiciels tiers et
des comparatifs affichés dans les pages Systèmes. Les services Demaa, aides et
financements restent composés par leurs catalogues applicatifs dédiés. Les
fichiers `*.snapshot.generated.json` ne sont plus
importés par le lecteur applicatif et ne peuvent plus être activés par une
variable d’environnement ou par le build. Ils restent uniquement des archives
de migration et des fixtures de tests explicites. Une absence de configuration,
une indisponibilité ou une révision Firebase invalide provoque une erreur claire :
aucun repli silencieux n’est autorisé.

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

solution_tool_comparison_revisions/{sourceFingerprint}
  registryRevisionId
  registryFingerprint
  knownSystemSlugs
  publishedSystemSlugs
  draftSystemSlugs
  blockedSystemSlugs

solution_tool_comparison_revisions/{sourceFingerprint}/systems/{systemSlug}
  schemaVersion: 2
  publicationStatus
  registryRevisionId
  registryFingerprint
  expiresAt
  sourceUrls
  evidence[]
    evidenceId
    resourceSlug
    sourceRef
    claim
    capturedAt
  comparison
    tools[]
    features[]
      cells[]
        status
        evidenceIds[]
```

Le document actif ne contient qu’un pointeur et l’empreinte attendue. Les
ressources et placements sont séparés parce que la révision complète dépasse
la limite d’un document Firestore.

Chaque comparatif est lié à l’empreinte exacte du registre qui fournit ses
outils. Un document périmé, en brouillon, invalide ou faisant référence à un
outil absent de la révision active est masqué. Les 115 métiers sont classés
explicitement en `published`, `draft` ou `blocked` dans le document racine.

Le schéma 2 impose une provenance au niveau de la cellule : toute cellule
positive (`covered` ou `configurable`) d’un comparatif publié référence au
moins une preuve HTTPS appartenant à l’outil de sa colonne. Une cellule
`not_documented` ne peut pas porter de preuve. Une matrice incomplète ou
incohérente est rejetée avant écriture et à la lecture runtime.

## Candidat avec preuves atomiques — 1er septembre 2026

La révision immuable
`solutions-2026-09-01-firebase-only-comparisons-evidence-v2` est préparée mais
n’est pas activée tant que les recettes Preview ne sont pas terminées.

- empreinte candidate :
  `630b68f26c3a2e8c704351b5f3434b274afcdc07e1c2e19bf8783c84f9966418` ;
- empreinte du plan registre :
  `84b5decbf7dc456e8ca3efd4ce32b2cd211aa23ee68e5c8f297cc89f17a9d8cb` ;
- empreinte du plan comparatifs :
  `62bb20b1f616ea73fd14645569aae746defb52580b739c9eca251e74318f3e39` ;
- 262 ressources et 634 placements, sans ajout ni retrait par rapport à la
  révision source ;
- 113 matrices générées, dont 4 publiables, 109 brouillons et 2 métiers
  bloqués ;
- les 159 cellules positives des quatre matrices publiables référencent toutes
  une preuve atomique ; aucune cellule positive sans preuve n’est autorisée.

## Convergence Firebase-only — 1er septembre 2026

La révision immuable
`solutions-2026-09-01-firebase-only-comparisons-published-v1` est active dans
Firebase Production. Elle part octet pour octet de l’ancienne révision active
`solutions-2026-08-28-accounting-tools-published-v1` et ajoute
uniquement quatre placements revus : L’Addition, Revya, Uber Eats et PayFit.

- empreinte candidate :
  `3190f45e4ac1698c36de0853b3ddad4e479c20cbc3105bade17f7f5fd17690b3` ;
- empreinte du plan registre :
  `0d24823a93a0ea281d4fcf38c9ee8e4f47fd2af24223523ed8b224954a89a5a1` ;
- 4 comparatifs publiables, 109 brouillons non exposés et 2 métiers bloqués ;
- 1 125 documents immuables créés et relus ;
- pointeur inchangé pendant le staging, puis activation transactionnelle et
  relecture complète réussies.

Le rollback transactionnel scellé cible l’ancienne paire révision/empreinte et
refuse de s’exécuter si le pointeur courant a changé entre-temps.

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

## État historique — 12 août 2026

La révision enrichie
`solutions-2026-08-12-catalog-enrichment-published-v1` couvre :

- 115 métiers ;
- 267 ressources ;
- 722 placements ;
- 392 placements Outils couvrant les 115 métiers ;
- 125 placements Fournisseurs couvrant 78 métiers ;
- 90 placements Réseaux couvrant 77 métiers ;
- 115 placements Levier.

Elle est active uniquement dans le projet isolé Firebase Preview
`demaa-preview-2026`. L'import a créé et relu les 990 documents attendus, puis
une seconde exécution idempotente a confirmé zéro écriture et aucun changement
du pointeur. Son empreinte source est
`31789715b771c6464677a418e0d72d3c29a202b17ab0cb1c3ed99211f3b92739` et
l'empreinte du plan est
`9e2fba66924844944ac2daf8850356f3f63167457afb2258ccb84f5dec691b1f`.

Cette activation Preview ne constitue pas une activation Production. Aucun
pointeur ni document Production n'a été modifié par ce lot.

## Migration historique

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
- `Prestations` est une section distincte. Elle expose uniquement une compétence
  explicitement pertinente pour le métier, jamais une personne ou un partenaire
  imposé. Les 114 placements universels Expert-comptable sont retirés du seed ;
  seul le placement contextuel `Délégation et formalités juridiques` du cabinet
  comptable reste préparé.
- Amazon Business est ajouté uniquement aux systèmes des secteurs Conseil et
  Tech & Digital. Alan et Swile restent au catalogue sans placement automatique,
  car leur pertinence dépend notamment du pays et de la présence de salariés.

Le futur audit général des fournisseurs est suivi séparément dans
`docs/providers-by-business-family-backlog.md`. Il couvre tous les fournisseurs qui
font sens par famille de métiers ; il ne se limite pas à Alan et Swile.

Cette règle préserve la valeur éditoriale des rails existants tout en rendant
possible un futur parcours comptable universel, sans promesse implicite ni
recommandation forcée.

## Commandes locales

```bash
npm run export:firebase-solutions-snapshot
npm run plan:firebase-solutions-import
npm run verify:firebase-solutions-emulator
npm run plan:firebase-solutions-catalog-enrichment
npm run generate:firebase-solutions-catalog-enrichment
npm run verify:firebase-solutions-catalog-enrichment-emulator
npm run import:firebase-solutions-catalog-enrichment-preview
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

Les quatre commandes `catalog-enrichment` construisent la révision courante,
écrivent son fallback dédié, vérifient ses 990 documents dans l'émulateur, puis
permettent son import Preview. L'import Preview exige toujours le projet isolé,
les empreintes exactes du plan et de l'activation, la confirmation du pointeur
courant et un jeton utilisateur éphémère.

## Révision V2 préparée localement — non activée

La révision `solutions-2026-08-08-active-v2` est un candidat distinct de la
révision V1 actuellement active. Elle conserve toutes les 600 cartes existantes
et ajoute 43 placements fournisseurs, dont Amazon Business sur 40 systèmes de
services ou du numérique. Elle ne modifie aucun document V1.

Son import exige les empreintes exactes du nouveau plan et de la révision, mais
aussi l'identifiant et l'empreinte du pointeur actif à remplacer. La mise à jour
du pointeur utilise la date de version Firestore lue juste avant l'import : une
modification concurrente fait donc échouer l'activation au lieu d'être écrasée.

## Candidat France clean DRAFT — 9 août 2026

Le candidat `solutions-2026-08-08-france-clean-v1` reste `draft` : 115 systèmes,
247 ressources, 599 placements et 847 écritures. Son plan possède une activation
`null`. La recette Emulator a écrit et relu tous les documents sans modifier le
pointeur actif. L'import distant n'a pas été exécuté faute d'identité d'écriture
autorisée ; Production reste donc sur `solutions-2026-08-05-active-v1`.

Le seed réseau contient désormais un seul placement contextuel et une garde refuse
toute réintroduction de `chartered-accountant`. La suppression distante des 114
documents historiques est accompagnée d'une capture exacte obligatoire et d'un
rollback scellé ; elle reste en attente de l'identité Firebase adéquate. Aucun
fallback n'est régénéré avant une future activation vérifiée.

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

Les fonctions Vercel utilisent également des identités sans clé. Le fournisseur
OIDC Google n’accepte que le projet Vercel `demaa-fr` dans l’environnement
`preview`. La lecture historique du registre Solutions conserve le compte
`demaa-solutions-preview-reader`, limité à `roles/datastore.viewer`.

Depuis la recette applicative du 15 août 2026, le runtime applicatif des
Previews emprunte séparément
`demaa-app-preview-runtime@demaa-preview-2026.iam.gserviceaccount.com`. Cette
identité possède `roles/datastore.user` et le rôle personnalisé
`demaaFirebaseSessionManager`, limité à
`firebaseauth.users.createSession` et `firebaseauth.users.get`. Le rôle large
`roles/firebaseauth.admin` a été retiré après la recette. Les quatre variables
Web publiques Firebase, l'identité serveur et les fournisseurs e-mail/mot de
passe et Google ciblent tous `demaa-preview-2026` ; le domaine de la Preview de
branche est autorisé dans Firebase Authentication. Les jetons expirent après
une heure et aucune clé privée Firebase Preview n’est stockée dans Vercel.

La preuve E2E a couvert la création de session, la création transactionnelle de
l'entreprise et de l'appartenance propriétaire, la création d'un plan vierge,
son autosauvegarde, son rechargement et sa restauration via `/plans`. Cette
configuration reste isolée de Production et ne vaut pas promotion de
`demaa.fr`.

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
`environment=production`. Depuis la clôture du 9 août, le runtime emprunte le
compte sans clé `demaa-prod-app@demaa-dde32.iam.gserviceaccount.com`, limité à
`roles/datastore.user`. Ce rôle couvre la lecture du registre Solutions et les
écritures strictement nécessaires aux leads ; la confiance
`roles/iam.workloadIdentityUser` reste limitée au principal Vercel du projet
Demaa. L'ancien compte `demaa-solutions-prod-reader` décrit l'étape historique
de lecture seule et n'est plus l'identité runtime active. Aucune clé privée
Firebase Production n'est stockée dans Vercel.

Le code Production est aligné sur `3486703`. La lecture de la révision Firebase
par OIDC ne produit ni fallback, ni avertissement, ni erreur. L'audit contrôle
115 pages Process, 115 pages Solutions, 600 cartes et 115 placements Levier,
sans échec. Les parcours de leads ont également été vérifiés en Production avec
l'identité runtime actuelle.

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
