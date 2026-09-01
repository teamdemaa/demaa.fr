# Comparateurs d’outils — rapport source

Dernière vérification : 2026-09-01

## Périmètre livré

- 115 métiers sont classés dans la révision Firebase du comparateur.
- 4 comparateurs sont explicitement validés pour publication : Cabinet comptable, Bâtiment, Restaurant et Gestionnaire de paie indépendant. Les autres n’affichent pas le CTA.
- 22 profils fonctionnels métier réutilisables.
- 15 fonctionnalités visibles par comparateur, sans groupes ni accordéons.
- 3 statuts seulement : `covered`, `configurable`, `not_documented`.
- 196 outils uniques et 386 occurrences composent les pages publiques locales, soit 5 790 cellules candidates contrôlées.
- Le périmètre actuellement publiable représente 18 occurrences et 270 cellules.
- 111 comparateurs reprennent exactement les outils visibles de la page métier.
- 4 comparateurs ayant un seul outil visible ajoutent une seconde recommandation déjà référencée dans la banque du métier.

## Méthode de composition

1. Le profil métier choisit 15 capacités fonctionnelles dans `tool-feature-comparison-catalog.ts`.
2. Les métiers spécialisés peuvent faire remonter des capacités dédiées, sans réintroduire les intitulés des processus.
3. Pour une page publiée, chaque statut positif provient obligatoirement d’une revue explicite `outil → capacité → preuve ciblée → date`. Le comparateur Cabinet utilise lui aussi des preuves sélectionnées cellule par cellule. Aucun tag ni mot-clé ne peut publier une cellule.
4. Le rapprochement lexical historique reste disponible uniquement pour préparer les 111 matrices candidates ; il ne peut pas ouvrir un CTA public.
5. En l’absence de preuve atomique, le statut reste `not_documented`. Cela ne signifie pas que l’outil est incapable de le faire.
6. Une preuve sans URL HTTPS, affirmation précise, date de capture ou date d’expiration fait échouer le comparateur en sécurité.
7. Le comparateur Cabinet comptable conserve sa revue métier détaillée ; Bâtiment, Restaurant et Paie utilisent la banque atomique réutilisable.
8. Le CTA est masqué si la matrice comporte moins de 8 lignes documentées, moins de 4 lignes discriminantes ou un outil avec moins de 3 capacités documentées.
9. Un système générique doit en plus appartenir à la liste explicite des pilotes relus pour être publiable.

## Source canonique

Le runtime lit uniquement
`solution_tool_comparison_revisions/{sourceFingerprint}/systems/{systemSlug}`.
Le document au schéma 2 contient la matrice finale, son statut de publication,
sa date d’expiration, une banque de preuves atomiques et, sur chaque cellule,
les identifiants des preuves utilisées. L’empreinte du registre actif fait partie du
contrat : elle empêche une matrice préparée pour une autre sélection d’outils
d’être affichée.

Les fichiers TypeScript et JSON historiques servent uniquement à produire le
lot de migration initial scellé. Ils ne sont plus importés par les pages
publiques. Toute prochaine correction éditoriale doit créer une nouvelle
révision Firebase ; modifier seulement un fichier local n’a aucun effet public.

Les fiches historiques bloquant la composition réelle ont été revues le 2026-09-01 sur leurs pages éditeur officielles : Costructor, Hektor, Teachable, Podia, Thinkific, Glitz, GestAuto-École, Resamania, Xplor Deciplus, VisioPharm, VétoPartner, Optimum Live, Diag Pilote, Gestion Diag, CoachAccountable, AZEOO, Hexfit et BL.enfance. Digiforma et 360Learning ont également été enrichis à partir de leurs pages produit officielles.

## Contrôles reproductibles

- `npm run audit:tool-comparisons` : génère les 115 matrices candidates et signale les données restant à documenter.
- `npm run audit:firebase-only-solutions` : vérifie la candidate scellée, la couverture des 115 métiers, les quatre publications et l’absence de repli runtime.
- `npm run audit:tool-comparison-routes:active` : relit directement le registre Firebase actif pour contrôler la sélection d’outils.
- `npx vitest run tests/tool-process-comparison.test.ts tests/system-solutions-ui.test.ts` : contrats moteur et intégration des rails de solutions.
- `npx tsc --noEmit` et ESLint ciblé : contrats TypeScript et qualité statique.

## Limites assumées

- `not_documented` ne signifie pas que l’outil ne sait pas faire ; cela signifie que la capacité n’est pas suffisamment étayée dans la banque actuelle.
- Les comparateurs trop proches ou trop peu documentés sont désormais bloqués plutôt que publiés avec une faible valeur décisionnelle.
- Les offres des éditeurs peuvent évoluer ; la date affichée dans chaque comparateur correspond à la plus ancienne revue de la sélection comparée.
- Le comparatif et le registre Firebase doivent porter exactement la même empreinte ; sinon le CTA est masqué.
- La gestion juridique Tiimora est affichée `configurable`, pas `covered` : les demandes génériques peuvent être structurées pour cet usage, mais un module juridique dédié n’est pas documenté comme disponible dans les sources publiques vérifiées.
- Le profil `gestionnaire-paie-independant` ne réutilise plus le profil générique « cabinet réglementé » : ses 15 lignes sont dédiées à la production de la paie, aux variables, à la DSN, aux contrôles, aux conventions, au multi-dossiers et aux usages RH associés.

## Contrat d’affichage vérifié localement

- Cabinet comptable : 6 outils, matrice manuelle détaillée.
- Bâtiment : 4 outils, 13 lignes documentées et 7 lignes discriminantes ; ProGBat documente 9 capacités du profil visible.
- Gestionnaire de paie indépendant : ajout contrôlé d’une seconde recommandation.
- Restaurant : 6 outils, 14 lignes documentées et 14 lignes discriminantes ; Deliverect n’est pas présenté comme une caisse.
- Révision Firebase active : Restaurant contient Lightspeed, Zenchef, Deliverect, L’Addition, Revya et Uber Eats.
- Mobile : le contrat prévoit un tableau horizontal, une première colonne fixe,
  une fermeture visible et un retour vers la page métier. La recette visuelle
  réelle reste obligatoire sur le déploiement Preview avant publication.
