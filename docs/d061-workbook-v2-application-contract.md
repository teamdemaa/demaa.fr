# D-061 - Contrat d’application locale des classeurs v2

Ce contrat prépare une future application Google Sheets sans exécuter
d’opération Drive pendant la phase locale D-061.

## Préflight obligatoire

Le lecteur Drive devra relever, immédiatement avant toute compilation :

- l’identifiant exact du classeur ;
- son titre exact ;
- son jeton de révision ou ETag ;
- la liste et les propriétés structurantes des feuilles ;
- les métadonnées développeur Demaa ;
- l’horodatage de la lecture.

`sealOperationalWorkbookV2Preflight` calcule une empreinte SHA-256 déterministe
de cet état. Un préflight dont l’empreinte ne correspond pas à son contenu est
refusé.

Pour un classeur v1 comme pour un no-op v2, le titre doit correspondre au métier
et à la variante ciblés :

- `Démonstration - Système opérationnel - {nom du métier}` ;
- `Système opérationnel modifiable - {nom du métier}`.

Le titre source est inclus dans le preflight, son empreinte, le guard et le plan
scellé. Un classeur d’un autre métier ou l’autre variante est refusé avant la
production du batch.

Le nom utilisé dans ce titre provient de la table canonique immuable des cinq
slugs pilotes, jamais de la valeur mutable `systemName` du blueprint. Le
compilateur refuse aussi un blueprint dont le couple slug/nom ne correspond pas
à cette table.

## Identité du classeur v2

Une reconstruction v2 écrit quatre marqueurs immuables :

- `demaa.systemSlug` ;
- `demaa.variant` (`demo` ou `editable`) ;
- `demaa.workbookVersion` ;
- `demaa.assetRevision`.

Un no-op `already-applied` n’est autorisé que si les sept feuilles et ces quatre
marqueurs correspondent exactement à la cible. Un autre système, une autre
variante ou une ancienne révision est un état inconnu et doit être refusé.

## Garde de fraîcheur

La compilation lie le batch à un `applicationGuard` qui contient l’identifiant
du classeur, son jeton de révision, l’empreinte du préflight et l’identité cible.

Le futur runner Drive devra :

1. lire et sceller un premier préflight ;
2. compiler le batch localement ;
3. relire le même classeur juste avant l’appel `batchUpdate` ;
4. resceller cette nouvelle lecture ;
5. appeler `assertOperationalWorkbookV2ApplicationPlan` avec le plan complet ;
6. abandonner sans écrire si l’identifiant, le jeton ou l’empreinte diffère ;
7. jeter le batch obsolète et recommencer depuis un nouveau préflight.

Cette vérification ne doit jamais être contournée par un fallback. Elle protège
contre une modification humaine, une application concurrente ou un retry fondé
sur un snapshot périmé.

La CLI v2 n’expose plus de mode `raw requests`. L’option
`--sealed-plan-json` émet un plan contenant l’identité cible, l’empreinte du
préflight, l’empreinte déterministe des requêtes et l’empreinte de l’enveloppe
complète. Les requêtes ne sont applicables qu’après validation du plan complet
par `assertOperationalWorkbookV2ApplicationPlan`. Une requête, un guard ou une
identité modifiés rendent le plan invalide.

La représentation transmise par la CLI est le JSON canonique utilisé pour les
empreintes. Les valeurs que JSON transformerait ou ignorerait (`undefined`,
tableaux sparse, fonctions, symboles, BigInt, nombres non finis, Date et objets
non simples) sont refusées récursivement avant le hash et avant la
sérialisation. Les objets canoniques sont reconstruits sans prototype et une
clé propre `__proto__` est explicitement refusée.

## Portée et reprise

- La CLI reste limitée aux cinq pilotes approuvés.
- La phase locale ne contacte pas Drive.
- Un état v1 canonique peut être reconstruit.
- Un état v2 strictement identique produit un no-op.
- Tout autre état est refusé et requiert une inspection.
- La paire demo/editable, son aperçu et sa révision privée ne pourront être
  activés que de façon atomique dans une phase ultérieure.
- Le rollback devra repointer vers une révision complète déjà validée, sans
  reconstruire ni écraser la v1.
