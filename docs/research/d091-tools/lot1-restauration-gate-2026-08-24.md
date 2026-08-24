# D-091 — Lot 1 Restauration

Date de revue : 24 août 2026

Candidate : `solutions-2026-08-24-d091-tpe-restauration-candidate-v1`

Statut : **candidate recettée en Preview, non importée et non activée**.

## Périmètre

Ce premier lot de généralisation applique la méthode validée sur sept systèmes
de la famille restauration : `restaurant`, `fast-food`, `traiteur`,
`dark-kitchen`, `boulangerie`, `bar-cafe` et `food-truck`.

Le nombre d'outils reste le résultat de la revue. Aucune liste n'est complétée
pour atteindre un quota. Les outils bureautiques évidents et les plateformes
de demande client qui ne structurent pas directement l'exploitation restent
hors sélection.

| Système | Sélection revue, dans l'ordre | Couverture recherchée |
| --- | --- | --- |
| Restaurant | L'Addition, Zenchef, Melba, Combo, Traqfood, Deliverect, Lightspeed | service et caisse, réservations, marge et stock, équipe, HACCP, commandes externes, alternative de caisse |
| Restauration rapide | Zelty, Innovorder, Deliverect, Melba, Combo, Traqfood | vente multicanale, cuisine et bornes, agrégation, marge et stock, équipe, HACCP |
| Traiteur | Melba, L'Addition, Combo, Traqfood | devis et production, encaissement, équipe, traçabilité |
| Dark kitchen | Zelty, Innovorder, Deliverect, Melba, Combo, Traqfood | commandes et cuisine, agrégation, marge et stock, équipe, HACCP |
| Boulangerie | Toporder, Melba, Combo, Traqfood | caisse et commandes métier, production et marge, équipe, traçabilité |
| Bar-café | L'Addition, Lightspeed, Combo, Traqfood | caisse métier, alternative de caisse, équipe, HACCP |
| Food truck | Nomad, SumUp Caisse, Traqfood | exploitation mobile, caisse simple complémentaire, traçabilité |

## Arbitrages appliqués

- Google Workspace, Canva, ChatGPT et Brevo ne sont pas retenus : leur utilité
  générale n'apporte pas ici une décision métier suffisante.
- Uber Eats n'est pas une carte Outil du lot : c'est un canal de demande, pas
  le système d'exploitation du food truck.
- les suites principales peuvent apparaître ensemble lorsqu'elles représentent
  des profils ou trajectoires différents ; elles ne sont jamais présentées
  comme des briques à cumuler ;
- les fonctions transverses restent admissibles seulement lorsqu'elles
  structurent un besoin opérationnel concret d'une TPE : planning HCR, HACCP,
  marge, stock ou production ;
- Services, Fournisseurs, Financement, Aides et Réseaux ne comptent pas dans la
  sélection Outils et ne sont pas réécrits par ce lot.

## Preuves et contrôles terminés

- 12 pages officielles distinctes contrôlées le 24 août 2026 ; elles répondent
  toutes en HTTP 200 après correction de l'URL officielle Lightspeed déplacée ;
- chaque placement documente cible, usage métier, disponibilité France,
  contrainte, justification, source officielle et date de revue ;
- Combo, Melba, Toporder et Traqfood sont ajoutés au répertoire canonique en
  statut `hidden` : ils ne deviennent ni publics ni indexables par ce commit ;
- rangs continus, aucun doublon, aucun outil évident ajouté pour remplir ;
- candidate complète des 115 systèmes, `draft`, sans déplacement du pointeur
  Firebase ;
- les 103 systèmes hors pilote et Lot 1 produisent exactement le même rendu que
  la révision active ;
- Services contextuels identiques avant et après composition ;
- générateurs déterministes et mode pilote v4 byte-identique ;
- audit D-091 Lot 1 vert ; 28 tests ciblés verts ; 1 554 tests uniques verts
  après relance isolée du seul test ayant atteint son délai ; lint strict, TypeScript,
  Académie et validations de données verts.

## Preview recettée

- URL : <https://demaa-9d6qwigno-hiteamdemaa-2292s-projects.vercel.app> ;
- déploiement Vercel `dpl_EECsN16QcsmzvfF57Gh951Dc6VC7`, statut `READY`,
  cible non-Production ;
- build et runtime forcés sur la fallback locale de la candidate, sans lecture
  ni déplacement du pointeur Firebase ;
- API des sept systèmes : 7/6/4/6/4/4/3 Outils, dans l'ordre documenté ;
- Services reste présent dans le payload contextuel avec neuf entrées, mais ne
  figure ni dans le rail public ni dans le JSON-LD Outils ;
- les sept pages contiennent un `ItemList` exact, non tronqué, avec positions
  continues et même ordre que l'API ;
- contrôles visuels desktop Restaurant et mobile Food truck : contenu visible,
  défilement horizontal normal, aucun overlay d'erreur ;
- aucun log runtime Vercel de niveau `error` après la recette.

## Gates restant avant toute publication

1. valider métier l'ordre et la densité des sept compositions ;
2. confirmer que les alternatives sont compréhensibles sans badge ni module
   d'aide au choix ;
3. poursuivre les autres familles avec la même méthode ;
4. ne déplacer le pointeur Firebase qu'après couverture des 115 systèmes,
   recette globale, rollback vérifié et GO PROD explicite.
