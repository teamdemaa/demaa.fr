# Décision de périmètre — Tarifs préférentiels

## Décision

Le chantier « tarifs préférentiels » est **rejeté du périmètre actif**. Il ne doit pas être fusionné avec les travaux actifs, ni avec le backlog Opportunités B2B, ni avec une éventuelle V2 « Proposer votre solution ».

Cette décision vaut aussi pour les liens de navigation, CTA, modales, routes API, synchronisations d'audience, variables d'environnement et modifications de données associées.

## Référence archivée exclue

Le commit `473217a` contient notamment :

- `src/components/PreferentialRatesTrigger.tsx` ;
- `src/components/PreferentialRatesModal.tsx` ;
- `src/app/api/preferential-rates/subscribe/route.ts` ;
- des raccordements dans les composants et services de l'archive.

Ces fichiers sont exclus. Ils ne sont pas une base à cherry-pick, à copier ni à adapter dans le lot courant.

## Condition pour une éventuelle réouverture

Toute réouverture devra faire l'objet d'un cadrage distinct : promesse commerciale exacte, éligibilité, partenaires concernés, traitement des demandes, conformité, stockage, audience e-mail éventuelle, suivi opérationnel et tests. Elle ne peut pas être ajoutée comme effet de bord d'un autre chantier.
