# Plan d'exécution W2-W8

W1 documente la cible. Le commit `811735139211253818839719617fb97fc373a9b2`
est le **parent code checkpoint** de W1, pas la base directe des lots suivants.
W2 à W8 doivent tous partir du futur commit W1 approuvé. Un fichier attribué à
un lot ne peut pas être modifié en parallèle par un autre lot.

## Séquence

```text
Futur commit W1
 |--> W2a Socle et inventaire
 |     |--> W2b Catalogue Services --> W4 UI Services --> W5 transport/API --|
 |     `--> W2c Catalogue Solutions --> W3 UI Systèmes ----------------|--> W6 Routes/SEO --> W8 QA
 |
 `--> W7 Manifests D-061 ---------------------------------------------------^
```

W2a est séquentiel et bloque W2b/W2c. W2b et W2c peuvent ensuite avancer en
parallèle. W3 démarre après W2c ; W4 après W2b ; W5 après le contrat W2b et le
formulaire W4. W7 peut avancer séparément. W6 est le seul propriétaire des
fichiers transverses de navigation et de SEO global. W8 est le seul candidat
combiné.

## W2a - Socle, inventaire et provenance

- Propriétaire : chantier Gouvernance des données
- Objectif : inventorier toutes les sources, détecter les doublons et définir
  les champs communs de provenance, statut et vérification.
- Allowlist d'écriture :
  - `src/lib/recommendation-source-contract.ts` ;
  - `scripts/audit-recommendation-sources.mjs` ;
  - `tests/recommendation-source-contract.test.ts` ;
  - `docs/governance/source-inventory.md`.
- Entrées en lecture seule : annuaire entreprises, annuaire outils, toolRefs,
  recommandations curées, D-012, ancien catalogue Services et overlays runtime.
- Gate : rapport complet des collisions et aucune mutation d'une source métier.

## W2b - Contrat du catalogue Services

- Propriétaire : chantier Données Services
- Objectif : transformer les sept offres validées en registre typé sans
  réutiliser le catalogue historique mixte comme vérité implicite.
- Allowlist d'écriture :
  - `src/lib/service-catalog-v2.ts` ;
  - `src/lib/service-catalog-v2.generated.json` ;
  - `scripts/validate-service-catalog-v2.mjs` ;
  - `tests/service-catalog-v2.test.ts`.
- Gate : sept offres seulement, deux prix exacts, cinq offres sur devis,
  statuts et périmètres non figés explicitement représentés.

## W2c - Contrat des ressources et placements Solutions

- Propriétaire : chantier Données Solutions
- Objectif : unifier logiciels, prestataires et fournisseurs sans perdre les
  placements D-012 et sans importer de prestation Demaa.
- Allowlist d'écriture :
  - `src/lib/solution-resource-registry.ts` ;
  - `src/lib/solution-placement-registry.ts` ;
  - `src/lib/system-ecosystem-types.ts` ;
  - `src/lib/system-ecosystem.server.ts` ;
  - `src/lib/system-tool-recommendations.ts` ;
  - `src/lib/service-recommendations.ts` ;
  - `src/lib/supplier-recommendations.ts` ;
  - `src/lib/finance-recommendations.ts` ;
  - `src/lib/pro-network-recommendations.ts` ;
  - `src/lib/recruitment-recommendations.ts` ;
  - `src/lib/training-recommendations.ts` ;
  - `src/lib/accounting-recommendation.ts` ;
  - `src/lib/aid-recommendations.ts` ;
  - `src/lib/plumbing-ecosystem-pilot.ts` ;
  - `tests/solution-resource-registry.test.ts` ;
  - `tests/solution-placement-registry.test.ts`.
- Gate : chaque placement possède une source, une date de vérification et une
  justification métier ; aucun fallback public non audité.

## W3 - Interface des Systèmes

- Propriétaire : chantier Systèmes UI
- Objectif : remplacer Outils/Écosystème par Solutions, migrer D-012 sans perte
  et afficher un seul encart commun d'aide à l'organisation.
- Allowlist d'écriture :
  - `src/components/SystemDetailContent.tsx` ;
  - `src/components/SystemEcosystemTab.tsx` ;
  - `src/components/SystemSolutionsTab.tsx` ;
  - `src/lib/system-detail-tabs.ts` ;
  - `tests/system-detail-tabs.test.ts` ;
  - `tests/system-ecosystem.test.ts` ;
  - `tests/system-ux-contract.test.ts`.
- Gate : 115 systèmes, Process/Solutions, mobile/desktop, aucun Service Demaa
  dans Solutions, aucun lien privé ou support fantôme.

## W4 - Interface de la marketplace Services

- Propriétaire : chantier Services produit/UX
- Objectif : créer les pages, cartes, fiches et le formulaire visible qui
  consomment le registre W2b.
- Allowlist d'écriture :
  - `src/app/services/page.tsx` ;
  - `src/app/services/[slug]/page.tsx` ;
  - `src/components/ServicesCatalogClient.tsx` ;
  - `src/components/ServiceDetailModal.tsx` ;
  - `src/components/ServiceRequestForm.tsx` ;
  - `tests/services-catalog-ui.test.ts` ;
  - `tests/service-request-form-ui.test.ts`.
- Frontière : W4 possède les quatre champs visibles, les validations client,
  les metadata et le canonical des pages `/services` et
  `/services/[slug]`. Il ne possède ni le transport, ni le stockage, ni
  l'e-mail, ni le sitemap global.
- Gate : deux prix exacts, cinq `sur devis`, pas de Stripe, pas de boutique en
  ligne, pas d'offre différée exposée.

## W5 - Transport, leads, consentement et mesure

- Propriétaire : chantier Leads et conformité
- Objectif : réceptionner le formulaire W4, conserver l'attribution, notifier
  sans fuite et mesurer les étapes utiles.
- Allowlist d'écriture :
  - `src/app/api/service-request/route.ts` ;
  - `src/lib/service-lead-contract.ts` ;
  - `src/lib/service-lead-storage.ts` ;
  - `src/lib/service-lead-notifications.server.ts` ;
  - `src/lib/service-analytics-client.ts` ;
  - `tests/service-request-route.test.ts` ;
  - `tests/service-lead-storage.test.ts` ;
  - `tests/service-analytics.test.ts`.
- Frontière : W5 possède le transport/API, l'idempotence, le stockage, le
  consentement, les notifications et les événements. Il ne modifie pas le DOM
  du formulaire ni les metadata des pages.
- Gate : consentement séparé, retrait possible, aucune PII dans analytics ou
  URL, politique de conservation définie, anti-spam et idempotence testés.

## W6 - Navigation, routes et SEO global

- Propriétaire : chantier Routes/SEO
- Objectif : appliquer la matrice D-033, intégrer Services, traiter les routes
  historiques et préserver Académie.
- Allowlist d'écriture :
  - `src/components/Navbar.tsx` ;
  - `src/proxy.ts` ;
  - `next.config.ts` ;
  - `src/app/sitemap.ts` ;
  - `tests/navbar-navigation.test.ts` ;
  - `tests/services-route-migration.test.ts`.
- Frontière : W6 possède la navbar, le proxy, les redirects, l'indexation et le
  sitemap global. Il audite les canonical des pages Services sans les modifier ;
  leur propriété reste à W4.
- Gate : matrice de routes approuvée, redirections sans boucle, risque
  soft-404 Académie inchangé, canonical et sitemap corrects.

## W7 - Consolidation des manifests D-061

- Propriétaire : chantier Workbooks et livraison
- Objectif : faire du manifest révisionné l'unique contrat public et convertir
  les manifests historiques en sorties dérivées avant leur retrait.
- Allowlist d'écriture :
  - `src/lib/operational-system-asset-revisions.generated.json` ;
  - `src/lib/operational-system-asset-revisions.ts` ;
  - `src/lib/operational-system-demo-assets.generated.json` ;
  - `src/lib/system-kit-previews.generated.json` ;
  - `src/lib/system-kit-previews.ts` ;
  - `src/lib/editable-operational-system-assets.server.ts` ;
  - `scripts/register-operational-system-assets.mjs` ;
  - `scripts/build-operational-workbook-v2-pilots.ts` ;
  - `tests/operational-system-asset-manifests.test.ts` ;
  - `tests/operational-system-asset-revisions.test.ts` ;
  - `tests/editable-operational-system-assets.test.ts`.
- Gate : révision exacte `d061-v2-pilot-2026-07-30-03`, preflight relu juste
  avant application, concordance public/privé, rollback testé, cinq pilotes
  toujours inactifs sans GO distinct.

## W8 - Intégration et recette indépendante

- Propriétaire : chantier Intégration/QA, différent des propriétaires W2-W7
- Objectif : intégrer les lots approuvés dans un candidat staging unique.
- Allowlist d'écriture : aucune par défaut. Tout défaut est retourné au lot
  propriétaire dans un correctif isolé.
- Gate : build, tests, audits 115 systèmes, sept Services, routes, consentement,
  responsive, accessibilité, absence de secret/PII et preuve SHA/Preview exacte.

## Travaux différés

- activation Drive des classeurs v2 et généralisation au-delà des cinq pilotes ;
- supports clés D-061 ;
- newsletter D-063 ;
- production vidéo et publication Académie 3 à 5 ;
- intégration Tiimora ;
- paiement en ligne Services ;
- extensions du catalogue Services.
