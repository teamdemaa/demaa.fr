# Archive de la landing `/automatisation`

Instantané créé le 31 août 2026 avant le remplacement de la landing publique par une version plus courte consacrée aux automatisations et aux applications métier simples.

## Fichiers conservés

- `page.tsx.txt` : route et métadonnées publiques.
- `MentoratAutomationLandingPage.tsx.txt` : composition complète de l'ancienne page.
- `mentorat-automation-content.ts.txt` : textes et FAQ associés.
- `automation-offer.ts.txt` : durée, prix et identifiants de l'offre au moment de l'archive.

L'extension `.txt` empêche TypeScript de compiler cette archive avec la version active. Le contenu des fichiers reste inchangé.

Les composants secondaires utilisés par cette version restent également présents dans `src/components` et `src/lib`. Aucun de ces éléments n'a été supprimé.

## Restaurer cette version

Recopier les trois premiers fichiers vers leurs emplacements d'origine :

- `page.tsx.txt` vers `src/app/(marketing)/automatisation/page.tsx`
- `MentoratAutomationLandingPage.tsx.txt` vers `src/components/MentoratAutomationLandingPage.tsx`
- `mentorat-automation-content.ts.txt` vers `src/lib/mentorat-automation-content.ts`

Ne restaurer `automation-offer.ts` que si les conditions commerciales doivent également revenir à leur état du 31 août 2026.
