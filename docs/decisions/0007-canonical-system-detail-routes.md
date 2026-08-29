# ADR 0007 - Routes canoniques des fiches Système métier

- Statut : `validated`
- Date : 10 août 2026
- Portée : URL publiques des systèmes, métadonnées SEO, liens internes et
  compatibilité des anciennes livraisons

> Cette ADR supersède le point 4 et les références à
> `/kit-operationnel/[slug]` de l'ADR 0003. Les autres décisions de l'ADR 0003
> restent applicables.

## Contexte

Le hub public utilise `/systemes`, mais les 115 fiches étaient encore servies
sous `/kit-operationnel/[slug]`. Cette divergence entre le vocabulaire public
« Système métier » et l'URL historique « kit opérationnel » compliquait le
maillage interne, les canonicals et une future internationalisation.

## Décision

1. Le hub reste `/systemes`.
2. La fiche canonique d'un métier devient `/systemes/[slug]`.
3. Son récapitulatif non indexable devient
   `/systemes/[slug]/recapitulatif`.
4. Les chemins historiques `/kit-operationnel/[slug]`,
   `/systemes-operationnels/[slug]` et `/kit-systeme/[slug]` redirigent en
   permanence vers `/systemes/[slug]` en conservant la query string.
5. Les variantes historiques des récapitulatifs redirigent vers le nouveau
   récapitulatif canonique.
6. Les canonicals, Open Graph, JSON-LD, sitemap, liens internes, e-mails et
   scripts d'audit émettent exclusivement les nouvelles URL.
7. Les endpoints internes `/api/systeme-kit/*`, les identifiants de révision
   et les anciens assets ne sont pas renommés : ils ne constituent pas des URL
   éditoriales et doivent préserver les livraisons historiques.
8. Le vocabulaire visible est « Système métier ». Les noms techniques
   historiques peuvent rester lorsqu'ils sont strictement internes.

## Conséquences

- Les anciennes URL et les anciens e-mails continuent de fonctionner grâce
  aux redirections `308`.
- Une future localisation pourra préfixer cette structure, par exemple
  `/fr-fr/systemes/[slug]`, sans conserver « kit opérationnel » dans le chemin.
- Un test d'architecture empêche la réintroduction d'un lien public actif vers
  les anciens chemins.

## Critères d'acceptation

1. `/systemes/[slug]` répond directement `200` pour les 115 systèmes ;
2. les trois anciennes familles d'URL répondent `308` vers la fiche canonique ;
3. les paramètres `tab` et les paramètres d'attribution sont conservés ;
4. le sitemap contient 115 fiches `/systemes/[slug]` et aucune fiche
   `/kit-operationnel/[slug]` ;
5. canonical, Open Graph et JSON-LD utilisent `https://demaa.fr/systemes/...` ;
6. les tests, lint, TypeScript, build et E2E desktop/mobile restent verts.
