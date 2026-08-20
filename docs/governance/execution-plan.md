# Plan d'exécution W2-W8

## Statut canonique — clôture Production du 9 août 2026

Le plan W2-W8 ci-dessous est désormais une archive de construction. Il ne doit
plus être utilisé pour déterminer l'état public ni relancer un ancien lot.
L'état exécutable courant est défini par les ADR 0003 et 0004 ainsi que par la
section « État de clôture Production » de `docs/central-backlog.md`.

À la clôture :

- le code produit déployé est `3486703` ; le lot documentaire de clôture ne
  modifie aucun fichier runtime ;
- les 115 Systèmes, les Services canoniques, Firebase Solutions,
  Ressources et `/contenus/facturation-electronique` sont actifs ;
- les Webinaires et les Cas concrets contextuels des Systèmes restent volontairement masqués ;
- les parcours de collecte et de livraison ont passé leurs tests Production ;
- les futures activations doivent repartir d'un `origin/main` à jour, dans une
  branche et une Preview dédiées, jamais d'un ancien checkpoint W2-W8.

Les mentions contraires plus bas — Services absents, routes bloquées, aucune
Solution publiée ou Production interdite — décrivent uniquement leur époque et
sont supersédées.

## Clôture Systèmes — 6 août 2026

L'interface publique des fiches Systèmes est désormais stabilisée autour de
trois espaces : `Process / Solutions / Ressources`. Ressources est séparé de
Solutions et contient cinq supports directement utilisables ; les cours
restent dans l'Académie. Les sections W2-W8 ci-dessous décrivent la séquence
historique du chantier et ne remplacent pas l'architecture active définie par
l'ADR 0001.

## Checkpoint W6.0 — consolidation documentaire

Le checkpoint local de référence est le commit
`be33c4d5451b0a61ab23da1945ee72b27cf36c5a`. Les lots de contrats W3a/W3b/W3c,
la migration offline W4m et les implémentations W3/W4/W5 sont présents dans
cette lignée, mais **aucun n'est activé publiquement** par W6.0.

État fermé à préserver :

- 7 offres Services, toutes `draft`, donc 0 publiée ;
- 0 Solution publiée ;
- 115 systèmes toujours servis par la révision D-061 v1 active ;
- `/services` et `/services/[slug]` toujours 404/noindex via le proxy ;
- ancien annuaire Services `superseded` comme cible, mais encore présent au
  runtime jusqu'à la migration W6 ;
- mesure client Services/Solutions différée : seules l'attribution
  consent-aware et les traces opérationnelles serveur sont implémentées.

`docs/governance/release-manifest.json` n'est pas régénéré à ce checkpoint. Il
ne doit être produit qu'à partir du candidat exact W7/W8.

## Amendement M2a — allowlists G0/W3a/W3b/W3c

Pour le checkpoint contractuel M2a, les quatre allowlists ci-dessous remplacent
les anciennes allowlists d'implémentation W2a/W2b/W2c. Les sections historiques
plus bas restent utiles pour la séquence produit, mais n'accordent aucune écriture
supplémentaire à M2a. G0 est committé en premier ; W3a est ensuite le parent
commun de W3b et W3c. Chaque lot doit être relu comme une unité indépendante.

### G0 — gouvernance des lots

- `docs/governance/execution-plan.md`.

Gate : les allowlists exactes, l'ordre des commits et les frontières de
responsabilité sont approuvés avant tout commit de code.

### W3a — socle partagé minimal

- `src/lib/registry-contract-utils.ts` ;
- `src/lib/recommendation-source-contract.ts` ;
- `tests/recommendation-source-contract.test.ts`.

Gate : toutes les frontières acceptent `unknown`, rejettent les structures et
enums invalides sans erreur inattendue, figent récursivement les valeurs parsées,
et contrôlent dates, chronologie et expiration avec `new Date()` par défaut ou
une date injectée en test.

### W3b — catalogue Services serveur (supersédé)

Le catalogue V2 à sept offres et son formulaire ont été retirés. La source
publique unique est désormais `src/lib/canonical-service-catalog.ts`. La
composition et les tarifs actifs sont définis par les ADR 0006 et 0015.

### W3c — registres Solutions serveur

- `src/lib/solution-registry-contract.ts` ;
- `src/lib/solution-registry-dto.ts` ;
- `src/lib/solution-registry.server.ts` ;
- `tests/fixtures/solution-migration-candidates.ts` ;
- `tests/solution-registry-boundary.test.ts` ;
- `tests/solution-registry-contract.test.ts` ;
- `tests/solution-registry-server.test.ts`.

Gate : registres produit vides, ressources discriminées `software`, `provider`
ou `directory`, interactions `external_link`, `detail` ou `referral_form`,
placements exclusivement explicites sans fallback. Qonto, La Plateforme du
Bâtiment et CAPEB restent exclusivement des fixtures de migration sous `tests/`.
Toutes les enveloppes et collections runtime sont parsées depuis `unknown` et
échouent fermées. Le DTO public est type-only. Le hashing runtime et tout
canonicaliseur incomplet sont différés.

### W4m — données candidates de migration Solutions/Outils

- `migrations/solutions-v1/README.md` ;
- `migrations/solutions-v1/source-manifest.json` ;
- `migrations/solutions-v1/build-snapshot.mjs` ;
- `migrations/solutions-v1/sources/w2-ecosystem-effective-matrix.json` ;
- `migrations/solutions-v1/sources/w2-ecosystem-summary.json` ;
- `migrations/solutions-v1/sources/w2-tools-snapshot.json` ;
- `migrations/solutions-v1/solutions-migration-candidates.json` ;
- `migrations/solutions-v1/output-manifest.json` ;
- `tests/solutions-migration-snapshot.test.ts`.

Gate : génération strictement offline et reproductible depuis les empreintes
W2 figées ; 115 systèmes couverts ; candidats exclusivement `pending` avec
relation commerciale `unknown` ; aucun statut approuvé ou publié, aucun
fallback, aucun import depuis `src/`. Les quatre systèmes sans outil visible,
les 35 systèmes sous cinq cartes, les 12 écarts UI/SEO, les ressources
universelles, les anciens Services, l'exclusion EM2A et les deux besoins sans
prestataire sont conservés explicitement. Ce lot ne remplit ni ne consomme les
registres runtime W3c et n'accorde aucune publication.

W1 documente la cible. Le commit `811735139211253818839719617fb97fc373a9b2`
reste le **parent code checkpoint** historique de W1. La lignée consolidée W6.0
est désormais celle identifiée ci-dessus. Un fichier attribué à un lot ne peut
pas être modifié en parallèle par un autre lot.

## Séquence

```text
Lignée W1 approuvée
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

- Statut : allowlist remplacée par W3a dans l'amendement M2a ci-dessus.
- Les audits d'inventaire W2 restent des entrées en lecture seule et ne sont pas
  rouverts par ce checkpoint.

## W2b - Contrat du catalogue Services

- Statut : allowlist remplacée par W3b dans l'amendement M2a ci-dessus.
- Le validateur MJS historique est explicitement retiré afin de conserver un
  seul parseur TypeScript canonique.

## W2c - Contrat des ressources et placements Solutions

- Statut : allowlist remplacée par W3c dans l'amendement M2a ci-dessus.
- Les migrations D-012 restent différées ; aucun ancien catalogue n'est muté
  ni consommé comme fallback par le registre produit vide.

## W3 - Interface des Systèmes

- Propriétaire : chantier Systèmes UI
- Statut : implémenté localement, non activé ; 0 Solution publiée.
- Objectif : préparer le remplacement Outils/Écosystème par une interface
  Solutions `published-only`, sans consommer les candidats de migration comme
  fallback, et conserver un seul encart commun d'aide à l'organisation.
- Allowlist d'écriture :
  - `docs/system-solutions-ui-w6-integration-gate.md` ;
  - `src/app/(french)/(marketing)/systemes/[slug]/page.tsx` ;
  - `src/components/SystemDetailContent.tsx` ;
  - `src/components/SystemSolutionsTab.tsx` ;
  - `src/lib/system-detail-tabs.ts` ;
  - `src/lib/system-solutions-ui-dto.ts` ;
  - `src/lib/system-solutions-ui.server.ts` ;
  - `tests/fixtures/published-solution-sections.ts` ;
  - `tests/system-detail-tabs.test.ts` ;
  - `tests/system-solutions-ui.test.ts` ;
  - `tests/system-ux-contract.test.ts`.
- Gate : 115 systèmes, Process/Solutions/Ressources, mobile/desktop, aucun Service Demaa
  dans Solutions, aucun lien privé ou support fantôme ; metadata et JSON-LD
  alignés sur le même sélecteur publié ; attribution D-064 corrigée avant
  activation de Solutions, sans inventer la copie finale.

## W4 - Interface Services (supersédée puis remplacée)

- Propriétaire : chantier Services produit/UX
- Statut : ancienne marketplace retirée ; interface canonique active selon
  l'ADR 0006.
- Objectif : créer les pages, cartes, fiches et le formulaire visible qui
  consomment exclusivement les sélecteurs publiés du registre W3b.
- Allowlist d'écriture :
  - `docs/services-marketplace-w6-integration-gate.md` ;
  - `src/app/(french)/(marketing)/services/page.tsx` ;
  - `src/app/(french)/(marketing)/services/[slug]/page.tsx` ;
  - `src/components/CanonicalServiceDetails.tsx` ;
  - `src/components/ServicesCatalog.tsx` ;
  - `tests/services-marketplace-ui.test.ts`.
- Frontière : W4 possède les champs visibles, les validations client,
  les metadata et le canonical des pages `/services` et
  `/services/[slug]`. Il ne possède ni le transport, ni le stockage, ni
  l'e-mail, ni le sitemap global.
- Gate : deux prix exacts, cinq `sur devis`, pas de Stripe, pas de boutique en
  ligne, pas d'offre différée exposée.

## W5 - Transport, leads, consentement et mesure

- Propriétaire : chantier Leads et conformité
- Statut : transport sécurisé implémenté localement, non activé ; mesure client
  spécifique différée.
- Objectif : réceptionner le formulaire W4, conserver l'attribution, notifier
  sans fuite et préparer les reprises persistées. La mesure client des étapes
  et conversions n'est pas implémentée dans ce lot.
- Allowlist d'écriture :
  - `src/app/api/cron/service-request-deliveries/route.ts` ;
  - `src/app/api/solution-referral/route.ts` ;
  - `src/lib/operational-maintenance.ts` ;
  - `src/lib/service-request-delivery-scheduler.server.ts` ;
  - `src/lib/service-request-delivery-worker.server.ts` ;
  - `src/lib/service-request-notifications.server.ts` ;
  - `src/lib/service-request-security.server.ts` ;
  - `src/lib/service-request-snapshots.server.ts` ;
  - `src/lib/service-request-storage.server.ts` ;
  - `src/lib/service-solution-request-contract.ts` ;
  - `src/lib/solution-referral-disclosures.server.ts` ;
  - `tests/service-request-boundary.test.ts` ;
  - `tests/service-request-notifications.test.ts` ;
  - `tests/service-request-security.test.ts` ;
  - `tests/service-request-snapshots.test.ts` ;
  - `tests/service-request-storage.test.ts` ;
  - `tests/service-solution-request-contract.test.ts` ;
  - `tests/service-solution-request-routes.test.ts` ;
  - `tests/solution-referral-disclosures.test.ts`.
- Frontière : W5 possède le transport/API, l'idempotence, le stockage, le
  consentement et les notifications. Il ne modifie pas le DOM du formulaire ni
  les metadata des pages. L'attribution consent-aware et les logs opérationnels
  ne valent pas activation d'une mesure client.
- Livraison immédiate : chaque demande acceptée programme le worker après la
  réponse HTTP. Le cron quotidien `/api/cron/service-request-deliveries` est
  configuré dans `vercel.json` comme filet de reprise persistant.
- Gate distant restant : configurer `CRON_SECRET` et un
  `SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET` d'au moins 32 caractères, puis
  valider la supervision des échecs/reprises/files persistées ; consentement
  séparé, retrait possible, aucune PII dans une future mesure ou URL, politique
  de conservation, anti-spam et idempotence testés.

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
  toujours inactifs sans GO distinct. Le fichier
  `docs/governance/release-manifest.json` ne sera régénéré qu'à partir du
  candidat exact W7/W8.

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
