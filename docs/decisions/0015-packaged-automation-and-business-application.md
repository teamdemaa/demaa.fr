# ADR 0015 — Accompagnement à l’automatisation

- Statut : `validated`
- Date de mise à jour : 29 août 2026
- Décision : D-089
- Portée : offre française d’automatisation, tarification, page publique,
  formulaire de rappel et données structurées

## Positionnement

L’automatisation est le levier principal. L’intelligence artificielle peut être
utilisée lorsqu’elle apporte une valeur concrète, mais elle ne constitue pas une
offre séparée.

Demaa part du fonctionnement réel de l’entreprise, simplifie ou automatise les
tâches retenues avec l’équipe, documente ce qui est mis en place et transfère les
compétences à la personne qui le fera vivre au quotidien.

Cette offre se distingue à la fois d’une formation générique à un outil et d’une
prestation livrée comme une boîte noire entièrement maintenue par une agence.

L’offre Application métier reste conservée à `/application-metier`, en `noindex`
et hors du sitemap, sans être proposée dans la navigation publique.

## Offre publique

- durée : 2 mois ;
- tarif : 3 500 EUR HT ;
- périmètre : une entreprise, un référent principal et un binôme ;
- paiement possible en trois fois ;
- licences, consommations et abonnements tiers séparés.

Le programme est défini après le diagnostic. Il ne promet aucun nombre uniforme
de processus ou d’automatisations. Les tâches retenues dépendent du fonctionnement
de l’entreprise, de leur utilité et de leur complexité.

La promesse porte sur un résultat maîtrisable : les tâches retenues sont
simplifiées ou automatisées, leur fonctionnement est documenté et l’équipe sait
les faire vivre au quotidien.

## Source de vérité

`src/lib/automation-offer.ts` est la source unique du nom de l’offre, de sa durée,
de son prix et de son slug de forfait. Le catalogue canonique, la page publique,
la modale de rappel, le serveur et les tests réutilisent cette définition.

Le navigateur transmet uniquement l’intention. Le serveur retrouve le forfait
et son tarif dans le catalogue canonique avant de créer la demande et la
notification Team.

## Parcours public

La route canonique est `/automatisation`. Les anciennes routes `/accompagnement`,
`/services`, `/services/automatisation-processus`, `/sur-mesure` et
`/solutions/mentorat-automatisation-ia` redirigent de manière permanente vers
cette route.

Le CTA public est `Discuter de mon besoin`. Il ouvre un formulaire minimal avec
le nom de l’entreprise et un numéro de rappel. Aucun paiement n’est déclenché.

## Preuves commerciales

Les cas réels peuvent être anonymisés. Les résultats chiffrés doivent être
présentés comme des gains observés sur les tâches concernées, jamais comme une
promesse uniforme applicable à toute l’entreprise.

## Gates

- tarif, durée, modale, serveur, notification et données SEO cohérents ;
- aucune définition tarifaire recopiée dans un composant ;
- aucun nombre imposé de processus, d’automatisations ou de séances ;
- automatisation toujours présentée avant l’IA ;
- limites de périmètre et coûts tiers visibles ;
- résultats de cas réels correctement qualifiés ;
- tests, TypeScript, lint, desktop, mobile et clavier vérifiés avant production.
