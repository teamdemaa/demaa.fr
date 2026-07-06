# Systeme Demaa

Ce document fige le cadrage du futur onglet `Systeme` avant implementation UI.

## Objectif

Ajouter un onglet `Systeme` avant `Outils` sur les pages systeme.

Le rendu cible:

- desktop: `3` cartes par ligne
- mobile: `1` carte par ligne
- une carte par pilier
- chaque carte est depliable
- dans chaque carte: liste des `process`

L'interface n'affiche que:

- `Pilier`
- `Process`

La couche de donnees conserve bien le champ `document`, mais il est masque dans la vue principale.
Le detail documentaire est reserve a une experience secondaire future:

- modale
- preview
- page detaillee
- offre complete

## Libelles cibles

Les libelles visibles cibles sont:

- `Direction`
- `Marketing et Vente`
- `Opérations`
- `Équipe`
- `Finance et Admin`

Des piliers additionnels peuvent exister selon le metier:

- `Sécurité & Conformité Chantier`
- `Matériel & Approvisionnement`
- `Hygiène & Conformité`
- `Conformité Qualiopi`
- etc.

## Ecart avec l'existant

L'existant technique n'utilise pas encore ces libelles partout.

Variantes actuellement presentes:

- `Stratégie`
- `Marketing & Vente`
- `Finance & administration`
- `Finance & Juridique`

Regle:

- on ne casse pas l'existant brutalement
- on normalise vers les libelles cibles dans la future couche `Systeme`

## Schema minimal

Le schema minimal pour construire l'onglet est volontairement simple:

- `sectorSlug`
- `sectorName`
- `pillar`
- `process`
- `document`

Ce schema est oriente rendu. Il ne cherche pas a embarquer toute la logique editoriale de pilotage.

## Decision de presentation

Le tab `Systeme` ne doit pas etre lu comme une bibliotheque brute de documents.
Il doit etre lu comme:

- une cartographie du fonctionnement attendu
- une preuve de structuration
- une entree vers un systeme complet

Regle produit:

- vue principale = `Pilier` + `Process`
- le champ `document` reste stocke en base
- le champ `document` est masque dans la vue principale
- les documents pourront etre reveles plus tard dans une experience secondaire

## Regles de qualite

Chaque lot doit respecter:

- aucun process attendu ne disparait
- aucun document attendu ne disparait
- aucun renommage libre d'un element canonique
- l'ordre des piliers est stable
- les cartes gardent une largeur homogene
- le rendu mobile reste lisible sans scroll horizontal

## Ordre recommande d'execution

1. Figer les libelles cibles
2. Figer le schema minimal
3. Construire le lot pilote `BTP`
4. Valider le lot pilote sur fond + forme
5. Integrer les tableaux-meres deja valides
6. Etendre secteur par secteur

## Lots recommandes

### Lot 0

Fondations:

- types
- normalisation des piliers
- structure de donnees minimale
- premiere saisie `BTP`

### Lot 1

Tableaux-meres valides:

- BTP
- Fast-food
- Commerce de detail
- Services professionnels
- Sante / Bien-etre
- CFA

### Lot 2

Declinaisons des secteurs qui heritent de ces tableaux-meres.

### Lot 3

Familles adjacentes, familles neuves et cas particuliers.

## Verification transverse

Avant generalisation complete, verifier sur plusieurs secteurs:

- `se faire payer`
- `traiter une reclamation`
- `remplacer un absent`

Le but est de detecter les incoherences de structure avant propagation.
