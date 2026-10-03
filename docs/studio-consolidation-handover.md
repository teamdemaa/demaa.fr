# Demaa — version consolidée du 3 octobre 2026

> La navigation et la présentation ont ensuite été simplifiées : voir [la livraison de simplification](studio-simplification-handover.md).

## Version et périmètre

Branche : `codex/demaa-consolidation`, construite sur `origin/main` à la révision `18dfdd474eaaf8d893a83e294218d0aa4f3ef2ee`.
Checkout : `/Users/oumougory/Documents/ChatGPT/Demaa/app`.

L’accueil public dirige vers `/studio`. Les entrées explicites de l’application, notamment `/?intent=structure-problem&view=plan`, gardent leur comportement. La navigation présente Studio, Projets et Opportunités. Solutions, Tutoriels, Accompagnement et cinq annuaires restent accessibles dans les ressources et le pied de page. La route historique `/opportunites` conserve sa redirection vers `/a-reprendre` ; les contributions au Studio utilisent `/studio/opportunites`.

La palette reprend les tons ivoire, sable, brun et encre du deck Canva. Les dix images sont stockées et optimisées dans `public/images/studio`, sans dépendance à des URL Canva temporaires. Leur origine et leurs empreintes sont documentées dans `studio-image-provenance.json`. Les images de projets sont présentées comme des visuels de concept.

Les neuf projets du deck sont repris, dont les trois priorités Tiimora, Dumaan et MND. Quatre projets et partenaires supplémentaires restent visibles. L’ensemble des dix-neuf fiches de l’ancien Studio et de ses opportunités reste conservé dans `src/lib/demaa-studio-archive.ts`. Les offres anciennes ne sont pas présentées comme des recrutements ouverts. Les informations financières destinées aux investisseurs ne sont pas publiées sur le site.

## Vérifications

- 42 tests ciblés : portefeuille, navigation, proxy, routes publiques, pied de page, positionnement, PWA et style marketing.
- TypeScript, ESLint sur les fichiers modifiés et `git diff --check`.
- Build Next.js de production, incluant les treize fiches publiques de projets.
- Affichage Studio sur ordinateur et mobile à 390 px, sans débordement horizontal.
- Parcours Projets → Tiimora → ressources ; recherche « comptable » dans Solutions.
- Contrôles HTTP du Studio, des projets, des ressources, des cinq annuaires, du sitemap et des entrées de l’application. Les routes qui diffusent leur réponse peuvent conserver un statut HTTP 200 pour une redirection ou une page introuvable intégrée au contenu. Le slug `/projets/inconnu` affiche bien la page introuvable et une directive `noindex`, mais le serveur local répond HTTP 200. Les fiches publiques utilisent `dynamicParams = false` et `notFound()` ; vérifier aussi le statut sur la préproduction.

Les fichiers de contrôle et captures sont conservés dans `../output/consolidation-demaa-2026-10-03/`.

## Limites de la vérification locale

Le serveur local utilise `DEMAA_FORCE_LOCAL_DATA=true` et `DEMAA_GUEST_PRODUCT_ENABLED=true`. Les mutations Firebase, les sessions réelles, les paiements et les envois de messages ne sont pas exercés.

La fiche détaillée d’une solution exige le registre Firebase actif en production. Le snapshot éditorial est autorisé uniquement en développement par le code existant. Sans configuration Firebase, cette fiche échoue sous `next start` : cette protection est conservée. Une réponse HTTP 200 ne suffit donc pas à valider les données d’une fiche métier ; le parcours doit aussi être vérifié avec le registre configuré en préproduction.

Les dépendances locales réutilisent le store du checkout précédent. Le build vérifié utilise Next.js 16.3.6 ; le fichier de verrouillage reste celui de main. La CI doit faire une installation propre à partir de ce verrouillage. `google-gax` et `@google-cloud/firestore` restent externes au bundle serveur ; la chaîne de transpilation Firebase Auth existante est conservée.

## Sauvegarde et retour arrière

Deux repères Git conservent les versions d’origine : `backup/main-2026-10-03` et `backup/studio-2026-10-03`.
Une sauvegarde Git complète et vérifiée précède les changements : `../output/consolidation-demaa-2026-10-03/source-before.bundle`.
Une seconde sauvegarde, `source-consolidated.bundle`, contient la branche consolidée et son historique après les commits.

Pour consulter une version précédente sans écraser le travail actuel :

```sh
git worktree add --detach ../demaa-main-before backup/main-2026-10-03
git worktree add --detach ../demaa-studio-before backup/studio-2026-10-03
```

Pour relancer la version consolidée avec les dépendances normalement installées :

```sh
npm ci
DEMAA_FORCE_LOCAL_DATA=true DEMAA_GUEST_PRODUCT_ENABLED=true npm run dev -- --port 3013
```

## Mise en production

Cette livraison est locale ; aucun changement n’a été publié sur demaa.fr.

1. Pousser `codex/demaa-consolidation` et ouvrir une PR vers main.
2. Installer les dépendances à partir du verrouillage et exécuter les contrôles du dépôt dans la CI.
3. Créer une préproduction avec les variables Firebase déjà utilisées par le projet. Ne pas recopier les indicateurs de données locales ou d’accès invité dans la production.
4. Vérifier le registre actif, une fiche métier, les sessions et les flux métier ; vérifier les canoniques, le sitemap, les redirections et les images sur les vraies URL.
5. Relire les statuts publics des projets et les contenus des fondatrices, puis fusionner et publier.
6. Contrôler `/`, `/studio`, `/projets`, `/studio/opportunites`, les ressources et les annuaires après publication. En cas de régression, restaurer le précédent déploiement plutôt que modifier les données Firebase.

Le plan initial détaillé est conservé dans `studio-consolidation-plan.md`.
