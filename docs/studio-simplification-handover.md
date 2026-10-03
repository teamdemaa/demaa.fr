# Simplification de Demaa — 3 octobre 2026

Cette livraison remplace les décisions de navigation et de présentation du premier plan de consolidation.

## Ligne directrice

Demaa crée des entreprises et partage des ressources pour entreprendre. Trois entrées publiques : Studio, Solutions, Academy. Les URL existantes de Solutions et des tutoriels sont conservées.

## Étapes réalisées

1. Navigation typographique sans capsule, icônes ni fond actif ; soulignement de la page courante. Les fiches projet et les pistes activent Studio.
2. Ressources limitées à Solutions et Academy. L’offre d’accompagnement à quatre semaines et son diagnostic sont retirés du parcours public. `/accompagnement` redirige vers `/tutoriels` et sort du sitemap. Les composants et contenus anciens restent dans le code et dans Git.
3. Trois projets illustrés : Tiimora, Dumaan et MND. Les autres initiatives et partenaires sont présentés en texte.
4. « Construire avec nous » présente six pistes avec leur proposition, l’expérience recherchée et un lien mailto par projet. Aucune image ni indication de maturité. Aucune candidature n’a été envoyée pendant les vérifications.
5. Les anciennes fiches de pistes restent accessibles, sans photo ni statut visible, afin de conserver les URL. Les données et images originales ne sont pas supprimées.
6. Dumaan est présenté comme une activité alimentaire B2B. Son visuel corrigé montre des grands conditionnements de pastels surgelés, mafé et légumes découpés, avec une caisse sur chariot. Les tailles imprimées (2 L et 2,5 kg) sont illustratives et ne constituent pas un conditionnement commercial confirmé.

## Images et Canva

Le site utilise `public/images/studio/dumaan-restauration-v2.webp`. L’ancienne image reste conservée. L’original haute définition corrigé, prêt à importer dans le deck, est sauvegardé dans `../output/consolidation-demaa-2026-10-03/dumaan-restauration-pour-canva.png`. Le deck Canva partagé n’a pas été modifié ; le remplacement y reste à effectuer dans un accès éditable. La provenance est documentée dans `studio-image-provenance.json`.

## Validation et publication

43 tests ciblés, ESLint et build de production avec TypeScript réussis. Contrôle navigateur de Studio, du menu, de la page de recrutement sans images/statuts et de l’affichage mobile. Prévisualisation : http://localhost:3013/studio.

La production demaa.fr n’est pas modifiée. Les limites Firebase de la livraison précédente restent applicables : vérifier les fiches métier et sessions avec le registre actif en préproduction. Les contacts mailto et paiements ne sont pas exercés.
