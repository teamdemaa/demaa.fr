# ADR 0024 — Demaa Studio

- Décision : D-100
- Statut : validé localement
- Date : 26 août 2026

## Contexte

Demaa observe des problèmes opérationnels récurrents en travaillant sur
l'organisation des TPE. Certains de ces problèmes justifient un logiciel
spécialisé plutôt qu'une nouvelle recommandation d'outil ou une simple
adaptation de processus.

La page Studio ne constitue ni une nouvelle entrée principale du produit, ni
un catalogue de prestations. Elle documente les logiciels issus de cette
observation du terrain.

## Décision

La page publique s'appelle `Demaa Studio` et utilise la route canonique
`/studio`. Elle est reliée uniquement depuis le footer, sous `Collaborer avec
Demaa`. Elle n'apparaît pas dans la navigation principale, qui reste
`Solutions / Application métier / Organiser` avec le CTA transversal
`Diagnostic organisation`.

Le positionnement public est :

> Des logiciels conçus à partir de problèmes métier réels.

La page explique l'avantage terrain de Demaa, présente les projets dont le
problème et la destination publique sont vérifiables, puis propose uniquement
de rejoindre Demaa Studio. Elle ne contient pas de CTA « Tester un projet ».

La première publication contient :

- `Tiimora` — cabinets comptables — projet actif, équipe constituée ;
- `Oryka` — équipes terrain — version en ligne ;
- `Revyo` — restaurants — version en ligne.

`Tendera` reste masqué tant que son statut, son problème traité et sa
destination publique ne sont pas validés.

Les données publiques des projets nommés sont centralisées dans
`src/lib/demaa-studio-projects.ts` et utilisées uniquement par Demaa Studio.
La page Application métier présente séparément trois projets réels anonymisés
— bâtiment, nettoyage et cabinet d’expertise comptable — depuis
`src/lib/application-metier-case-studies.ts`. Chaque carte ouvre une modal qui
décrit le problème de départ, l’application construite et son flux de travail,
sans image, nom de produit ni résultat chiffré non vérifié.

## Frontières

- `Demaa Studio` n'est pas `The Done Studio`, qui reste un produit et un dépôt
  autonomes.
- Aucun contrat, composant, stockage ou contenu n'est partagé avec The Done
  Studio par cette page.
- La page n'affirme pas qu'un projet est commercialisé ou disponible au-delà
  du statut explicitement vérifié.
- Aucun projet supplémentaire n'est publié pour compléter artificiellement la
  liste.

## Gates de publication

- route, canonical, Open Graph et sitemap valides ;
- lien Studio présent dans le footer et absent de la navbar ;
- Tendera absent ;
- CTA `Tester un projet` absent ;
- Tiimora, Oryka et Revyo absents de la page Application métier ;
- les trois cas anonymisés ouvrent une modal accessible et fidèle au besoin
  réellement traité ;
- liens externes ouverts dans une nouvelle fenêtre avec libellé accessible ;
- aucun débordement horizontal sur mobile ;
- tests, lint, TypeScript et build de production verts ;
- recette humaine avant mise en production.
