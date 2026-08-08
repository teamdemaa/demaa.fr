# Handoff pour Codex — Ressources sans mur email, Académie, formulaire partenaire, Opportunités B2B, CTA tarifs préférentiels

Rédigé le 2026-08-08 par Claude, à l'attention de Codex qui reprend l'exécution. Rien n'est commité — tout est en local sur `main`, dans `/Users/oumougory/Apps/Demaa.fr`. Ce document est censé être suffisant seul ; `docs/plan-opportunites-b2b-refonte-cta.md` contient le détail point par point si besoin de plus de contexte produit/rationale.

## État réel au moment du handoff

**Le code des 8 points du chantier est écrit et vérifié.** Dernière vérification (fraîche, relancée juste avant ce handoff) :

```
npx tsc --noEmit     → clean
npx vitest run       → 141/141 fichiers, 808/808 tests
npx eslint .          → clean
```

Ce sont les 3 commandes à relancer en premier si tu reprends, pour confirmer que rien n'a changé entre-temps.

**Rien n'est commité ni poussé.** `git status --short` liste ~26 fichiers modifiés + ~17 nouveaux (liste complète en bas de ce document).

## Ce qui a été construit (résumé fonctionnel)

1. **Accès direct aux ressources, sans mur email.** Les 2 guides (Obligations, Facturation électronique) et les 3 modèles (Tableau de pilotage, Suivi prévisionnel, CRM) sont maintenant accessibles en un clic, sans formulaire email préalable. Nouvelle route `GET /api/systeme-kit/open/[resourceSlug]` qui fait une redirection 302 serveur vers la vraie destination (Google Sheets, Airtable ou PDF hébergé), sans exposer l'URL brute côté client. Un événement analytics silencieux (`trackSystemJourneyEvent("system_resource_opened", ...)`) remplace la notification Slack par téléchargement qu'on perdait en retirant le formulaire.

2. **Nettoyage de `/modeles-de-documents`.** Cette page legacy est neutralisée (404 propre via `notFound()`). Important : **le fichier de données `src/lib/document-models.ts` est conservé** — il est réellement utilisé par `system-resource-assets.server.ts` pour résoudre les vraies URLs de 2 des 3 modèles. Seule la page qui l'exposait publiquement a été retirée. 10 liens internes qui pointaient vers cette page (1 action dans un cours Académie, 7 pages secteurs, 2 pages d'outils gratuits) ont été réécrits pour pointer directement vers `/api/systeme-kit/open/...`.

3. **Nouvelle section "Modèles et documents" dans Académie**, insérée entre "Cours fondamentaux" et "Cas concrets" dans `AcademyIndexClient.tsx`, réutilisant directement le catalogue `SYSTEM_RESOURCES` (pas de duplication de données). L'onglet Ressources par système n'a pas changé de structure (toujours guides + modèles).

4. **Formulaire "Proposer une solution" (`/partenaires`)** : passé de 3 à 2 étapes. "Les métiers concernés" est maintenant un bloc repliable dans l'étape 1 (fermé par défaut, badge avec le nombre sélectionné, s'ouvre automatiquement si on essaie de continuer sans métier choisi). Astérisques ajoutés sur tous les champs obligatoires. Dropdown "Type de solution" corrigé (`appearance-none` + chevron custom).

5. **Nouvelle page `/opportunites-b2b`** (lien ajouté au footer et au sitemap) : titre centré en deux tons façon page Académie, barre de recherche avec un bouton "+" à côté (ouvre le formulaire public de dépôt d'opportunité), cartes pleine largeur avec catégorie en texte simple (pas de badge coloré) et bouton "Intéressé par cette opportunité" en contour clair. 3 opportunités de lancement pré-remplies dans `src/lib/b2b-opportunities.ts`. Deux nouvelles routes API (`/api/opportunites-b2b/interest` et `/submit`) qui notifient Slack via le pipeline `submitLeadRequest` existant.

6. **CTA de l'onglet Solutions remplacé** : "Recevoir les tarifs préférentiels" au lieu de "Échanger 30 minutes". Ouvre une popup légère (email seul, pas de vrai compte). Nouvelle route `/api/preferential-rates/subscribe` qui notifie Slack et, si la variable d'environnement `RESEND_PREFERENTIAL_RATES_AUDIENCE_ID` est configurée, ajoute le contact à une Audience Resend dédiée (segmentation). Sans cette variable, l'inscription fonctionne quand même (Slack reste le canal fiable) — c'est volontaire, la distribution des réductions reste un process manuel côté équipe pour cette v1. **Le CTA de l'onglet Process n'a pas bougé** ("Réserver mon échange offert", inchangé).

7. **"Annuaire des services" (point H) : volontairement laissé de côté.** Il n'existe pas de page d'index pour lister les propres services Demaa (`/annuaire-services` n'a que des pages détail par slug, pas de page liste). Construire cette page était hors scope de cette session — à traiter séparément si voulu.

## Nettoyage manuel requis (le sandbox d'exécution ne peut pas supprimer de fichiers)

Le sandbox qui a produit ce travail n'avait pas la permission de supprimer des fichiers sur le dossier monté (`rm`/`unlink` → `Operation not permitted`). Trois fichiers destinés à disparaître ont donc été **vidés en stubs** (avec un commentaire l'expliquant en tête de fichier) plutôt que réellement supprimés du repo. Le comportement public est déjà correct (les pages 404 proprement, les composants ne sont plus importés nulle part — vérifié), mais pour un repo propre il faut lancer, sur le Mac directement (pas depuis un sandbox) :

```
rm src/components/OperationalSystemCopyRequestModal.tsx
rm src/components/ResourcesIndexClient.tsx
rm -rf src/app/modeles-de-documents
```

Après ça, relancer `npx tsc --noEmit && npx vitest run` pour confirmer que rien ne dépendait de ces fichiers (ça ne devrait rien casser, c'est déjà vérifié qu'ils n'ont plus d'importeur).

## Autres points non bloquants

- **`node_modules` cassé en local sur le Mac de l'utilisateur** (binaires natifs Linux installés par erreur lors d'une session précédente). Sans rapport avec ce chantier, n'affecte pas la prod. Correctif resté en attente côté utilisateur : `cd ~/Apps/Demaa.fr && rm -rf node_modules && npm install`.
- **`RESEND_PREFERENTIAL_RATES_AUDIENCE_ID`** à configurer si on veut que le tag Resend du point 6 soit actif dès le lancement.
- Aucune vérification visuelle réelle (navigateur) n'a été faite cette session — uniquement `tsc`/`vitest`/`eslint` et relecture de code. À faire une fois le `node_modules` réparé.

## Fichiers modifiés

`scripts/audit-system-kit-pages.mjs`, `src/app/modeles-de-documents/[slug]/page.tsx`, `src/app/modeles-de-documents/page.tsx`, `src/app/sitemap.ts`, `src/components/AcademyIndexClient.tsx`, `src/components/Footer.tsx`, `src/components/OperationalSystemCopyRequestModal.tsx` (stub, à supprimer), `src/components/PartnerSubmissionForm.tsx`, `src/components/ResourcesIndexClient.tsx` (stub, à supprimer), `src/components/SystemCustomOfferCta.tsx`, `src/components/SystemDetailContent.tsx`, `src/components/SystemResourcesTab.tsx`, `src/lib/academy-course-content.ts`, `src/lib/free-tool-seo.ts`, `src/lib/kit-analytics-client.ts`, `src/lib/live-session-assets.ts`, `src/lib/resend-audience.ts`, `src/lib/sector-pages.ts`, `src/lib/system-resource-assets.server.ts`, `src/lib/system-resource-catalog.ts`, `tests/audit-system-kit-pages.test.ts`, `tests/levier-asset-contract.test.ts`, `tests/system-resource-catalog.test.ts`, `tests/system-solutions-ui.test.ts`, `tests/system-ux-contract.test.ts`.

(`src/lib/system-detail-page.ts` est aussi modifié mais appartient au chantier précédent — "rail Guides + Modèles" — déjà terminé et vérifié avant celui-ci.)

## Fichiers créés

`docs/handoff-codex.md` (ce fichier), `docs/plan-opportunites-b2b-refonte-cta.md` (détail point par point), `src/app/api/opportunites-b2b/interest/route.ts`, `src/app/api/opportunites-b2b/submit/route.ts`, `src/app/api/preferential-rates/subscribe/route.ts`, `src/app/api/systeme-kit/open/[resourceSlug]/route.ts`, `src/app/opportunites-b2b/page.tsx`, `src/components/B2BOpportunitiesClient.tsx`, `src/components/B2BOpportunityInterestModal.tsx`, `src/components/B2BOpportunitySubmitModal.tsx`, `src/components/PreferentialRatesModal.tsx`, `src/components/PreferentialRatesTrigger.tsx`, `src/lib/b2b-opportunities.ts`.

(`src/app/api/systeme-kit/notify/route.ts`, `src/components/GuideNotifyModal.tsx`, `src/components/GuideSlidesDialog.tsx`, `src/components/SystemGuidesRail.tsx`, `src/lib/system-guide-slides.ts` sont aussi nouveaux mais appartiennent au chantier précédent, déjà terminé — voir `docs/handoff-guides-ressources.md` pour son propre historique, désormais dépassé par ce document pour tout ce qui concerne le statut d'exécution global.)
