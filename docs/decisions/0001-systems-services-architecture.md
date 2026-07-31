# ADR 0001 - Architecture Systèmes, Solutions et Services

- Statut : `validated`
- Date : 31 juillet 2026
- Portée : cible produit, sans implémentation dans ce lot
- Implémentée : non

## Décision

Le parcours principal reste l'entrée par un **Système opérationnel**. La page
d'un métier conserve son en-tête et le bouton contour `Voir le système`, qui
ouvre la modale existante.

Sous cet en-tête, la navigation cible ne comporte que deux espaces :

1. **Process** : routines et méthodes opérationnelles issues du référentiel
   canonique ;
2. **Solutions** : ressources externes permettant d'exécuter le système.

Le nom des sous-sections de Solutions reste non figé. La direction de travail
est de distinguer les logiciels recommandés des prestataires et fournisseurs,
sans créer un troisième onglet.

Les prestations réalisées ou vendues par Demaa ne sont pas injectées dans les
systèmes métier. Elles vivent dans une marketplace autonome à la route
`/services`. Cette séparation évite de mélanger recommandation externe,
contenu opérationnel et offre commerciale Demaa.

## Parcours cible

```text
Recherche d'un métier
        |
        v
Système opérationnel
  - Voir le système -> modale existante
  - Process
  - Solutions

Navigation globale
  - Découvrir l'Académie
  - Voir les services -> /services
```

La présence d'un encart d'aide à l'organisation sous le panneau actif de
**Process et de Solutions** est `validated`. Son texte exact reste `working`.
D-064 n'est donc plus limité au seul onglet Process, mais son formulaire
Fillout et son contrat ne doivent pas être dupliqués.

## Frontières

### Process

- consomme les 115 métiers, 526 processus et 8 510 étapes canoniques ;
- présente une sélection lisible de routines, sans modifier la profondeur du
  référentiel source ;
- ne vend pas de prestation ;
- n'affiche un support que si l'asset existe et a été validé.

### Solutions

- regroupe les logiciels, prestataires, fournisseurs et autres solutions
  externes pertinentes pour le métier ;
- exige un placement explicite et auditable par métier ;
- ne contient pas les Services opérés par Demaa ;
- remplace les usages web des anciens onglets `Outils` et `Écosystème`.

### Services

- route autonome `/services` ;
- sept offres actives dans deux catégories ;
- cards, fiche ou modale, puis formulaire minimal ;
- aucun checkout ni Stripe en V1 ;
- qualification, devis et acceptation précèdent tout futur paiement ;
- transparence sur l'opérateur Demaa ou ODEMA à valider avant publication.

### Classeurs D-061

La feuille de classeur nommée `Écosystème` n'est pas renommée par cette ADR.
L'architecture des classeurs et l'architecture de navigation web sont deux
contrats distincts.

## Décisions non figées

Les éléments suivants restent à valider avant implémentation définitive :

- le libellé public `Routines essentielles` ;
- les libellés internes des sous-sections de Solutions ;
- le texte exact de l'encart d'aide à l'organisation ;
- la présence et le comportement d'une recherche sur `/services` ;
- le périmètre exact du Site vitrine à 950 EUR HT ;
- le périmètre exact du système d'avis inclus dans l'offre Visibilité locale à
  490 EUR HT.

## Matrice de navigation à préserver

La réciprocité D-033 est `validated`. La présence de `Voir les services` sur
l'accueil et les pages Systèmes est également `validated`. Sa forme, son ordre
et son interaction exacte avec les routes Académie et Services restent
`working`.

| Routes | CTA Académie/Système validé | Services |
| --- | --- | --- |
| `/` | `Découvrir l'Académie` vers `/academie` | présence de `Voir les services` `validated`; forme et ordre `working` |
| `/kits-operationnels` | `Découvrir l'Académie` vers `/academie` | présence de `Voir les services` `validated`; forme et ordre `working` |
| `/kit-operationnel/[slug]` | `Découvrir l'Académie` vers `/academie` | présence de `Voir les services` `validated`; forme et ordre `working` |
| `/academie` | `Trouver mon système` vers `/` | comportement `working` |
| `/academie/[slug]` | `Trouver mon système` vers `/` | comportement `working` |
| `/services` et futures fiches | à valider sans casser la réciprocité D-033 | route courante, forme de navigation `working` |

Les contrats visuels D-033 restent : pilule secondaire blanche, icône livre sur
`Découvrir l'Académie`, aucune flèche. W6 doit tester la matrice avant toute
modification de `Navbar.tsx`.

## Conséquences

- D-012 devient une source à auditer et migrer, pas une architecture à
  conserver telle quelle.
- D-062 devient une offre de `/services`, pas une carte Écosystème.
- D-063 reste différé.
- Les anciens annuaires ou routes de services ne sont pas automatiquement la
  nouvelle marketplace.
- La migration exige un inventaire de chaque recommandation existante avant
  retrait d'un composant ou d'un registre.
