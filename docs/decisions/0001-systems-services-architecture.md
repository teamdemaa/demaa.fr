# ADR 0001 - Architecture Systèmes, Solutions, Ressources et Services

- Statut : `validated`
- Date : 31 juillet 2026
- Mise à jour d'état : 6 août 2026, clôture de l'interface Systèmes
- Portée : cible produit et état de l'implémentation locale consolidée
- Implémentation locale : W3, W4 et W5 présents, activation publique bloquée

## Décision

Le parcours principal reste l'entrée par un **Système opérationnel**. La page
d'un métier conserve son en-tête et le bouton contour `Voir le système`, qui
ouvre la modale existante.

Sous cet en-tête, la navigation cible comporte trois espaces :

1. **Process** : routines et méthodes opérationnelles issues du référentiel
   canonique ;
2. **Solutions** : outils, prestataires, fournisseurs et réseaux recommandés
   pour exécuter le système ;
3. **Ressources** : supports Demaa directement utilisables, présentés avec un
   aperçu réel avant une éventuelle demande par e-mail.

Les cours et contenus pédagogiques restent dans l'Académie. Ils ne sont pas
dupliqués dans Ressources. Les anciennes ressources placées dans `Modèles` ou
affichées comme « Ressources héritées » ne doivent plus apparaître dans
Solutions.

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
  - Ressources

Navigation globale
  - Découvrir l'Académie
  - Voir les services -> /services
```

La présence d'un encart d'aide à l'organisation sous le panneau actif de
**Process et de Solutions** est `validated`. Ressources conserve son parcours
d'aperçu et de réception propre, sans dupliquer cet encart. Son texte exact
reste `working`.
L'implémentation locale place bien un seul composant après le contenu du panneau
actif, mais son attribution Fillout est encore libellée
`Système opérationnel - Process`. Cette attribution doit être corrigée avant
l'activation de Solutions. W6.0 ne fige aucune nouvelle copie et le formulaire
Fillout ne doit pas être dupliqué.

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

Les sous-sections visibles sont `Outils`, `Prestataires et fournisseurs` et
`Réseaux professionnels`. Les ressources Demaa et les modèles de documents en
sont exclus.

### Ressources

- présente cinq supports neutres et directement utilisables sur chaque fiche :
  tableau de pilotage opérationnel, suivi et prévisionnel financier, CRM –
  suivi commercial, guide sur la facturation électronique, guide sur les
  obligations et les finances ;
- montre un aperçu réel au clic avant toute demande ;
- ne demande l'adresse e-mail que pour recevoir ou copier la ressource ;
- ne contient aucun cours, ceux-ci restant exclusivement dans l'Académie ;
- accepte les anciens paramètres d'URL `modeles` et `modeles-de-documents`
  comme alias de `resources` afin de préserver les liens existants.

Au checkpoint W6.0, l'interface et son adaptateur serveur `published-only` sont
implémentés localement. Le registre produit contient **0 Solution publiée** :
l'onglet reste donc absent en runtime et les anciens alias retombent sur
Process. Les candidats de migration ne constituent pas une autorisation de
publication.

### Services

- route autonome `/services` ;
- sept offres enregistrées dans deux catégories, toutes `draft` et aucune
  publiée au checkpoint W6.0 ;
- cards, fiche ou modale, puis formulaire minimal ;
- aucun checkout ni Stripe en V1 ;
- qualification, devis et acceptation précèdent tout futur paiement ;
- transparence sur l'opérateur Demaa ou ODEMA à valider avant publication.

Les pages, cartes, détails et le formulaire W4 ainsi que le transport W5 sont
implémentés localement. Le proxy continue néanmoins de répondre 404/noindex sur
`/services` et `/services/[slug]`. Le contrat `published-only` doit rester
fermé jusqu'à promotion explicite des offres et levée des gates W5/W6.

### Classeurs D-061

La feuille de classeur nommée `Écosystème` n'est pas renommée par cette ADR.
L'architecture des classeurs et l'architecture de navigation web sont deux
contrats distincts.

Les **115 systèmes** restent servis par leur révision active **v1**. Les
révisions D-061 v2 pilotes ne sont ni généralisées, ni activées par W6.0.

## Décisions non figées

Les éléments suivants restent à valider avant implémentation définitive :

- le libellé public `Routines essentielles` ;
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
- L'ancien annuaire Services est `superseded` comme cible produit, mais ses
  fiches et sa modale restent présentes au runtime jusqu'à la migration W6.
- La migration exige un inventaire de chaque recommandation existante avant
  retrait d'un composant ou d'un registre.
- La mesure client propre aux parcours Services et Solutions reste différée :
  seuls l'attribution consent-aware jointe aux demandes et les logs
  opérationnels serveur existent dans la branche consolidée.
