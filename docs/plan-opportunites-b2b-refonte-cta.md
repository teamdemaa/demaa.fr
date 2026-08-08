# Plan — Opportunités B2B, accès direct aux ressources, formulaire partenaire, refonte CTA

Statut : **les 8 points (D, F, A, C, B, E, I, G) sont exécutés et vérifiés**, le 2026-08-08. Rien n'est commité (`git status` le confirme) — tout est en local sur `main`, prêt à être relu et commité.

## Vérifications finales

- `npx tsc --noEmit` : clean.
- `npx vitest run` : 141/141 fichiers, 808/808 tests passants.
- `npx eslint .` : clean sur tout le repo.

## Point d'attention — nettoyage manuel requis (limite du sandbox)

Le sandbox d'exécution ne peut pas supprimer de fichiers sur le dossier monté (`rm`/`unlink` renvoient "Operation not permitted"). 3 fichiers destinés à être supprimés ont donc été **vidés en stubs** (avec un commentaire l'expliquant en tête de fichier) plutôt que réellement retirés du repo. À supprimer à la main, sur le Mac :

```
rm src/components/OperationalSystemCopyRequestModal.tsx
rm src/components/ResourcesIndexClient.tsx
rm -rf src/app/modeles-de-documents
```

Les deux pages `modeles-de-documents` sont stubbées pour renvoyer un vrai 404 (`notFound()`) en attendant — le comportement public est donc déjà correct même sans supprimer les fichiers, ce n'est qu'une question de propreté du repo.

## Résumé de ce qui a été livré, point par point

- **D.** Astérisques + mention "champs obligatoires" dans `PartnerSubmissionForm.tsx`.
- **F.** Dropdown "Type de solution" corrigé (`appearance-none` + chevron).
- **A.** Nouvelle route `src/app/api/systeme-kit/open/[resourceSlug]/route.ts` : redirection serveur 302 directe vers la vraie destination (Google Sheets/Airtable/PDF), sans capture email. `GuideSlidesDialog.tsx` a un bouton "Télécharger le PDF" direct. `SystemGuidesRail.tsx` et `SystemResourcesTab.tsx` n'utilisent plus de modale email, juste un lien direct + `trackSystemJourneyEvent("system_resource_opened", ...)` pour garder une trace silencieuse.
- **C.** Les 10 liens internes (1 action Académie, 7 pages secteurs, 2 pages outils) qui pointaient vers `/modeles-de-documents/...` ont été réécrits vers `/api/systeme-kit/open/...`. La page `/modeles-de-documents` est neutralisée (404), son lien retiré du footer et du sitemap. `document-models.ts` (les données) est conservé car réellement utilisé par `system-resource-assets.server.ts`.
- **B.** Nouvelle section "Modèles et documents" dans `AcademyIndexClient.tsx`, entre "Cours fondamentaux" et "Cas concrets", réutilisant le catalogue `SYSTEM_RESOURCES` (format template). L'onglet Ressources par système n'a pas changé.
- **E.** Formulaire "Proposer une solution" passé de 3 à 2 étapes : "Les métiers concernés" est maintenant un bloc repliable dans l'étape 1 (fermé par défaut, badge de compteur, s'ouvre automatiquement si on essaie de continuer sans sélection).
- **I.** Nouvelle page `/opportunites-b2b` (+ lien footer + sitemap) : titre centré deux tons façon Académie, barre de recherche + bouton "+" pour proposer une opportunité, cartes pleine largeur avec catégorie en texte simple et bouton "Intéressé" en contour clair. 2 nouvelles routes API (`interest`, `submit`) qui notifient Slack via `submitLeadRequest`.
- **G.** CTA Solutions remplacé par "Recevoir les tarifs préférentiels" (`PreferentialRatesTrigger` + `PreferentialRatesModal`, popup email seul). Nouvelle route `/api/preferential-rates/subscribe` : notifie Slack et tague le contact dans une Audience Resend dédiée si `RESEND_PREFERENTIAL_RATES_AUDIENCE_ID` est configuré (sinon skip silencieux, Slack reste le canal fiable pour la gestion manuelle des réductions). Le CTA Process n'a pas bougé.
- **H.** Toujours laissé de côté (décision confirmée) — pas de page d'index pour l'annuaire des services Demaa.

## Fichiers touchés (`git status`, 2026-08-08)

Modifiés : `scripts/audit-system-kit-pages.mjs`, `src/app/modeles-de-documents/[slug]/page.tsx`, `src/app/modeles-de-documents/page.tsx`, `src/app/sitemap.ts`, `src/components/AcademyIndexClient.tsx`, `src/components/Footer.tsx`, `src/components/OperationalSystemCopyRequestModal.tsx` (stub, à supprimer), `src/components/PartnerSubmissionForm.tsx`, `src/components/ResourcesIndexClient.tsx` (stub, à supprimer), `src/components/SystemCustomOfferCta.tsx`, `src/components/SystemDetailContent.tsx`, `src/components/SystemResourcesTab.tsx`, `src/lib/academy-course-content.ts`, `src/lib/free-tool-seo.ts`, `src/lib/kit-analytics-client.ts`, `src/lib/live-session-assets.ts`, `src/lib/resend-audience.ts`, `src/lib/sector-pages.ts`, `src/lib/system-detail-page.ts`, `src/lib/system-resource-assets.server.ts`, `src/lib/system-resource-catalog.ts`, `tests/audit-system-kit-pages.test.ts`, `tests/levier-asset-contract.test.ts`, `tests/system-resource-catalog.test.ts`, `tests/system-solutions-ui.test.ts`, `tests/system-ux-contract.test.ts`.

Nouveaux : `docs/handoff-guides-ressources.md`, `docs/plan-opportunites-b2b-refonte-cta.md`, `src/app/api/opportunites-b2b/`, `src/app/api/preferential-rates/`, `src/app/api/systeme-kit/notify/`, `src/app/api/systeme-kit/open/`, `src/app/opportunites-b2b/`, `src/components/B2BOpportunitiesClient.tsx`, `src/components/B2BOpportunityInterestModal.tsx`, `src/components/B2BOpportunitySubmitModal.tsx`, `src/components/GuideNotifyModal.tsx`, `src/components/GuideSlidesDialog.tsx`, `src/components/PreferentialRatesModal.tsx`, `src/components/PreferentialRatesTrigger.tsx`, `src/components/SystemGuidesRail.tsx`, `src/lib/b2b-opportunities.ts`, `src/lib/system-guide-slides.ts`.

## Ce qui reste hors code (non bloquant)

- Configurer `RESEND_PREFERENTIAL_RATES_AUDIENCE_ID` côté environnement si le tag Resend du point G doit être actif dès le lancement (sinon Slack seul suffit pour la gestion manuelle prévue).
- Nettoyage manuel des 3 fichiers stubbés (voir plus haut).
- Vérification visuelle en local une fois le `node_modules` du Mac réparé (`rm -rf node_modules && npm install`, toujours en attente côté utilisateur).

## A. Retirer le mur email sur les Guides et les Modèles
- S'applique aux **2 guides disponibles** (Obligations, Facturation électronique) **et aux 3 modèles** (Tableau de pilotage, Suivi prévisionnel financier, CRM).
- Accès direct au clic : plus de formulaire email avant de recevoir le document, ouverture/téléchargement immédiat via un lien résolu côté serveur (on ne met pas l'URL brute en clair dans le bundle client, mais aucune étape de capture n'est requise).
- On perd la notification Slack par téléchargement (plus d'email collecté), mais on garde une trace : ajouter un événement analytics silencieux (pas de formulaire, pas de PII) par `resourceSlug`, sur le modèle des événements déjà suivis dans `kit-analytics-client.ts` (ex. `resource_opened`).
- Les 2 guides **"bientôt disponibles"** (Comment ouvrir/gérer un restaurant) gardent leur flux "être informé" par email — logique inchangée, il n'y a simplement rien à délivrer pour l'instant.
- Conséquences techniques à vérifier en implémentant : `OperationalSystemCopyRequestModal` (formulaire de livraison par email) devient inutile pour ces 5 ressources — s'assurer qu'elle n'est pas utilisée ailleurs avant de la retirer. `system-resource-assets.server.ts` garde la résolution serveur des destinations, mais sans étape de capture.

## B. Modèles dans Académie, en plus de l'onglet Ressources (pas de simplification de l'onglet Ressources)
- L'onglet Ressources par système **garde sa structure actuelle** : rail Guides + rail Modèles, sans changement — avoir la même ressource visible dans Académie et dans Ressources n'est plus un problème dès lors que l'accès est direct des deux côtés (pas de duplication de comportement, juste du cross-listing de la même source de contenu).
- Académie gagne une nouvelle section, après "cours fondamentaux", qui liste les mêmes 3 modèles (réutilise la même donnée/catalogue, pas une copie maintenue séparément).
- CTA en fin d'onglet Ressources → lien vers Académie (reste valable).

## C. Suppression de la page `/modeles-de-documents` (révisé après double-check)
- **`document-models.ts` (le fichier de données) reste.** `system-resource-assets.server.ts` va y chercher les vraies URLs de destination (Google Sheets, Airtable) pour 2 des 3 modèles — le supprimer casserait la livraison réelle. On supprime seulement les **pages** (`src/app/modeles-de-documents/page.tsx`, `src/app/modeles-de-documents/[slug]/page.tsx`) et le composant `ResourcesIndexClient.tsx` (confirmé non réutilisé ailleurs).
- **10 liens internes réels pointent vers cette page aujourd'hui** — ils doivent être réécrits avant suppression, pas laissés cassés :
  - `academy-course-content.ts` (`getAcademyActionHref`) — 1 bouton d'action d'un cours Académie existant.
  - `sector-pages.ts` — 7 liens "highlights" sur des pages secteurs (BTP, Immobilier, Tech, Patrimoine, etc.).
  - `free-tool-seo.ts` — 2 liens "related" sur des pages d'outils gratuits.
  - Décision : ces 10 liens pointent **directement vers le document externe réel** (même résolution que `document-models.ts` / `ctaHref`), plus de page Demaa intermédiaire.
- Suppression de la page sans redirection (décision explicite, pas de conservation du référencement de cette page précise — mais les 10 liens internes, eux, sont réécrits, pas cassés).
- Retirer aussi le lien "Modèles de documents" et les entrées `/modeles-de-documents` du footer et de `sitemap.ts`.

## D. Fix — champs obligatoires non indiqués (`PartnerSubmissionForm.tsx`)
Bug confirmé : tous les champs ont `required` en HTML sans aucune indication visuelle, d'où le blocage silencieux à la soumission. Correctif : astérisque sur chaque label obligatoire + mention "* champs obligatoires" en haut du formulaire.

## E. Fusion 3 étapes → 2 étapes (formulaire "Proposer une solution")
- Étape 1 "La solution" + section "Les métiers concernés" repliée par défaut (accordéon, ouverte au clic) intégrée dans la même étape.
- Étape 2 "Votre contact" (inchangée).

## F. Fix — dropdown "Type de solution"
Le `<select>` a le même padding déclaré que les champs texte, mais le rendu natif du navigateur l'écrase (pas de chevron custom). Correctif : `appearance-none` + icône chevron ajoutée manuellement, aligné avec le design system.

## G. CTA Solutions → "Recevoir les tarifs préférentiels"
- Remplace uniquement le CTA de l'onglet Solutions (`SystemCustomOfferCta`, `context="solutions"`). Le CTA de l'onglet Process reste "Réserver mon échange offert" (30 min), inchangé.
- Copy validée :
  - Titre : "Des tarifs préférentiels avec les partenaires Demaa"
  - Description : "Recevez la liste des partenaires recommandés et les réductions négociées pour vous."
  - Bouton : "Recevoir les tarifs préférentiels"
- Popup léger : email seul, pas de vrai compte/auth (pas de réutilisation de `mon-espace`) — capture d'email taguée pour segmentation. Nécessite d'étendre `resend-audience.ts` pour supporter un tag/segment (ex. `"tarifs-preferentiels"`), qui n'existe pas encore.
- Mécanisme de réduction confirmé pour la v1 : gestion manuelle côté équipe (pas d'automatisation de code promo). On code la capture + le tag, la distribution de la réduction reste un process manuel pour l'instant.

## H. Annuaire Services — révision : pas de simple lien, il manque la page
- `/annuaire-services` n'a en réalité **aucune page d'index** (`src/app/annuaire-services/page.tsx` n'existe pas) — seulement des pages détail par service (`/annuaire-services/[slug]`), consommées uniquement par le sitemap. Ajouter un lien footer vers `/annuaire-services` pointerait vers un 404.
- Les catégories "Prestataire de services" et "Fournisseur" existent déjà dans `PartnerSubmissionForm` — ça, rien à changer.
- **Point ouvert** : soit on construit une vraie page d'index (liste des `demaaServices`) avant de la lier, soit on laisse ce point de côté pour l'instant. Ce n'est plus un "fix rapide" comme supposé initialement — à trancher avant d'exécuter.

## I. Page "Opportunités B2B" (+ lien footer)
- Nouvelle route, design annuaire épuré (réutilise le pattern de `ToolDirectoryClient`) : cartes rectangulaires pleine largeur (pas une grille).
- **Titre** : centré, deux tons façon page Académie ("Apprendre à / entreprendre") — ligne Satoshi neutre ("Des besoins concrets,") + ligne Gambetta italique couleur forêt ("à pourvoir"). Pas de surtitre (eyebrow), pas de paragraphe de description en dessous.
- **Recherche** : barre de recherche pleine largeur + petit bouton carré "+" aligné à sa droite, même hauteur — c'est lui qui ouvre le formulaire public de dépôt d'opportunité (plus de bouton "Proposer une opportunité" séparé en haut de page).
- **Cartes** : catégorie affichée en texte simple (pas de pastille/badge coloré), au-dessus du titre. Bouton "Intéressé par cette opportunité" aligné à droite de la carte (jamais en dessous du texte), en contour clair (fond blanc, liseré `#c7d4cc`, texte forêt) plutôt qu'en vert plein — le vert plein était jugé trop foncé.
- Contenu géré par Demaa (ajout manuel) **et** formulaire public (déclenché par le bouton "+").
- Clic "Intéressé par cette opportunité" → petite modale (nom + email) → notification Slack via `submitLeadRequest`.
- Lien "Opportunités B2B" ajouté à `resourceLinks` du footer.
- 3 exemples de lancement : prestataire spécialisé appels d'offres BTP ; créateur de contenu pour un fast food ; product builder pour une association, SaaS à destination des restaurants.

## Ordre d'implémentation précis (révisé après double-check)
1. D — astérisques + mention champs obligatoires (`PartnerSubmissionForm.tsx`).
2. F — fix dropdown "Type de solution" (`appearance-none` + chevron).
3. A — retrait du mur email sur les 2 guides + 3 modèles (dont le tableau de pilotage, résolu via le système "Levier" séparé). Accès direct au clic, tracking silencieux à la place du Slack par téléchargement, suppression d'`OperationalSystemCopyRequestModal` (confirmé non utilisé ailleurs). Construit ici : le helper de résolution directe vers la destination réelle, réutilisé à l'étape suivante.
4. C — réécriture des 10 liens internes vers `/modeles-de-documents` (Académie, 7 pages secteurs, 2 pages outils) pour pointer directement vers le document externe, en réutilisant le helper de l'étape 3. Puis suppression des pages `/modeles-de-documents` + `ResourcesIndexClient.tsx` + lien footer + entrées sitemap. `document-models.ts` (les données) reste.
5. B — nouvelle section Modèles dans Académie, insérée entre la section "Cours fondamentaux" et la section études de cas dans `AcademyIndexClient.tsx` (position confirmée). Réutilise la donnée du catalogue, l'onglet Ressources ne bouge pas.
6. E — fusion des étapes du formulaire partenaire (3 → 2, métiers repliés).
7. I — page Opportunités B2B (design validé par mockup) + lien footer.
8. G — CTA "Recevoir les tarifs préférentiels" + popup email + tag Resend.
9. H — laissé de côté pour l'instant (page d'index manquante, scope pas encore validé).
