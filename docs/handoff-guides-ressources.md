# Handoff — Refonte "Ressources" (Guides + Modèles et documents)

État au 2026-08-07. Travail fait par Claude, repris par Codex. Rien n'est commité (`git status` le confirme) — tout est en local sur `main`, au-dessus de `57c24dd`.

## Objectif du chantier

Sur les pages système (`/systemes/<slug>`), l'onglet "Ressources" est passé d'une seule liste plate à deux sections :

1. **Guides** (nouveau rail, format vidéo/YouTube-like avec vignette 16:9 + modale plein écran type diaporama)
2. **Modèles et documents** (inchangé, existant)

### Contenu de "Guides", dans cet ordre
1. "Maîtriser les obligations et les finances de son entreprise" — disponible
2. "La facturation électronique" — disponible
3. "Comment ouvrir un restaurant ?" — **bientôt disponible**, visible uniquement sur le système `restaurant`
4. "Comment gérer un restaurant ?" — **bientôt disponible**, visible uniquement sur le système `restaurant`

Les 2 guides "bientôt disponible" sont scoping via `systemSlugs: ["restaurant"]` — ils n'apparaissent sur aucun des 114 autres systèmes. Décision explicite : ce pattern n'est **pas** étendu aux autres systèmes pour l'instant.

**Académie n'a pas été touchée** — c'est un système séparé (vrais cours, contenu riche), volontairement laissé de côté.

## Architecture mise en place

- `src/lib/system-resource-catalog.ts` — source de vérité unique, catalogue de `SystemResource` (7 entrées). Champs ajoutés : `format` (`"template" | "guide"`), `availability` (`"available" | "coming-soon"`), `tagline`, `readingMinutes`, `systemSlugs` (scoping optionnel). Helper `getSystemResourcesForSystem(systemSlug)`.
- `src/lib/system-resource-assets.server.ts` — résolution des destinations réelles de téléchargement, `"server-only"`, séparée du catalogue client-safe.
- `src/components/SystemGuidesRail.tsx` — nouveau rail "Guides" (vignettes, flèches discrètes, clic → modale diaporama si disponible, sinon modale "être informé").
- `src/components/GuideSlidesDialog.tsx` — nouvelle modale générique de diaporama (zoom, scroll-snap, pager, clavier). Remplace l'ancienne `CourseSlidesDialog` (liée à Académie, non réutilisée).
- `src/components/GuideNotifyModal.tsx` — modale de capture email pour les guides "bientôt disponible".
- `src/app/api/systeme-kit/notify/route.ts` — endpoint waitlist, réutilise `submitLeadRequest()` sans étape de livraison d'asset.
- `src/lib/system-guide-slides.ts` — mapping resourceSlug → dossier + nombre de slides PNG (`/images/courses/...`).
- `src/components/SystemResourcesTab.tsx` — section "Modèles et documents", `resources` maintenant obligatoire (plus de défaut).
- `src/components/SystemDetailContent.tsx` — calcule `scopedResources` via `getSystemResourcesForSystem(system.slug)`, affiche `<SystemGuidesRail>` au-dessus de `<SystemResourcesTab>`.
- `src/lib/system-detail-page.ts` — SEO (meta description, JSON-LD) utilise désormais le catalogue scopé au lieu du catalogue global.

## Fichiers modifiés/créés (voir `git status`)

Modifiés : `OperationalSystemCopyRequestModal.tsx`, `SystemDetailContent.tsx`, `SystemResourcesTab.tsx`, `kit-analytics-client.ts`, `system-detail-page.ts`, `system-resource-assets.server.ts`, `system-resource-catalog.ts`, `tests/system-resource-catalog.test.ts`, `tests/system-solutions-ui.test.ts`, `tests/system-ux-contract.test.ts`.

Nouveaux : `src/app/api/systeme-kit/notify/`, `src/components/GuideNotifyModal.tsx`, `src/components/GuideSlidesDialog.tsx`, `src/components/SystemGuidesRail.tsx`, `src/lib/system-guide-slides.ts`.

## Vérifications faites

- `npx tsc --noEmit` : clean
- `npx vitest run` : 808/808 tests passants (141 fichiers) au moment du refactor principal ; les 2 derniers correctifs (titres avec "?", hiérarchie visuelle) ont été revérifiés sur les 3 fichiers de tests directement concernés (24/24), **pas** de re-run complet du suite depuis.
- Pas de vérification en local (`npm run dev`) — voir "Problème connu" ci-dessous.

## Reste à faire (tâche en cours, non commencée en code)

Demande explicite de l'utilisateur : ajouter une **vignette dédiée au style vert de marque** (fond `#315f46`, texte blanc Satoshi, même esprit que la diapositive de titre de "Comment ouvrir un restaurant") pour les 2 guides déjà disponibles, **uniquement pour l'affichage de la carte dans le rail Guides**. Le vrai contenu (diapositives PDF, aperçu dans `OperationalSystemCopyRequestModal`) ne doit **pas** être modifié — seulement l'image de la carte doit changer.

Étapes prévues :
1. Ajouter un nouveau champ au type `SystemResource` (distinct de `preview`), ex. `railThumbnail`, pour les 2 guides disponibles.
2. Générer les 2 images (fond vert marque, titre en Satoshi blanc) — polices sources réelles disponibles dans `src/app/fonts/*.woff2` (à convertir en TTF, ex. via `fontTools` + `brotli` si besoin, ces libs Python sont dispo).
3. Sauvegarder les PNG dans `public/` (chemin à définir, ex. `public/images/guides/rail/`).
4. Mettre à jour `SystemGuidesRail.tsx` pour utiliser ce nouveau champ en priorité pour l'image de la carte (fallback sur `preview` si absent).
5. Revérifier `npx tsc --noEmit` + tests concernés + idéalement un run complet.

## Problème connu — ne pas reproduire

Un `npm ci`/`npm install` a été lancé depuis un environnement Linux sur le `node_modules` du repo (monté depuis le Mac), ce qui a installé des binaires natifs Linux (`lightningcss.linux-x64-gnu.node`) au lieu des binaires macOS ARM64 attendus (`lightningcss.darwin-arm64.node`). Résultat : `npm run dev` cassé en local sur le Mac de l'utilisateur. **Aucun impact en production** (déploiement fait un install propre sur son propre host). Correctif à faire **sur le Mac directement**, pas depuis un sandbox Linux :

```
cd ~/Apps/Demaa.fr && rm -rf node_modules && npm install
```

## Décisions produit à respecter

- Ne pas toucher à l'Académie.
- Ne pas étendre le pattern "guides bientôt disponibles" aux 114 autres systèmes pour l'instant.
- Les 2 guides "bientôt disponible" auront leur `coming-soon` remplacé une fois le contenu réellement écrit/validé (slides, `preview`, révision d'asset).
