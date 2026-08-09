# Gate d’intégration Marketplace Services

> Document historique supersédé le 9 août 2026 par l’ADR 0004. La marketplace
> V2, son catalogue à sept offres et `/api/service-request` ont été retirés.
> Les trois offres actives proviennent exclusivement de
> `src/lib/canonical-service-catalog.ts`.

La publication reste volontairement fermée tant que le registre ne contient
aucune offre `published`. Les sélecteurs publics et les routes ne doivent pas
être assouplis pour contourner cette règle.

Avant intégration publique, les propriétaires des chantiers concernés doivent
valider ensemble les points suivants :

- backend sécurisé `/api/service-request` intégré avec son contrat de succès
  `202 application/json` et `{ "ok": true }`, idempotence, limitation de débit,
  stockage et notifications ;
- promotion explicite des offres du catalogue, avec périmètres, opérateur et
  responsabilités validés ;
- matrice proxy et redirections Services intégrée par W6 ;
- entrée Navbar et sitemap global intégrés par W6 ;
- QA navigateur W6 sur les cartes carrées et rails (mobile et desktop), le
  dialogue accessible, le focus, `Escape`, les erreurs et reprises du
  formulaire, les canonical et les réponses 404/noindex des brouillons.

W4 ne modifie aucun de ces propriétaires. Les metadata et canonical propres à
`/services` et `/services/[slug]` restent définis dans leurs pages W4.
