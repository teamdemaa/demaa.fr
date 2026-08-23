# D-095 Lot 1F — Candidats de reprise repérés le 23 août 2026

Statut : **les 3 candidats ci-dessous ont été créés en `draft` dans
Firestore Production** le 23 août 2026 via `scripts/seed-d095-lot1f-drafts.ts`
(traçable, gardé dans le dépôt). Ce dossier ne constitue jamais une
source runtime : les brouillons ne sont visibles ni publiquement ni sur
l'API publique (`status: draft`, `publishedAt: null`), vérifié après
écriture. Rien n'est publié — la publication reste un GO contenu
distinct, décidé par la Team via `/admin/opportunites`.

## Candidats créés en brouillon (3) — source officielle avec URL stable

Trouvés sur [Actify](https://actify.fr), le site du Conseil National des
Administrateurs Judiciaires et Mandataires Judiciaires (CNAJMJ) —
source n°1 du plan (administrateurs judiciaires). Contrairement à
Bpifrance Transmission, Actify expose une URL publique stable par
annonce, permettant de satisfaire le gate de publication du Lot 1E
(`sourceName` + `sourceUrl` HTTPS + `verifiedAt`).

### 1. Fonds de commerce — salon de beauté, Le Teich (33)
- `opportunityId` : `salon-de-beaute-a-reprendre-au-teich-20dfcd`
- `sourceKind` : administrateur judiciaire
- `sourceName` : Actify — SELARL EKIP'
- `sourceUrl` : <https://actify.fr/entreprises-liquidation-judiciaire/50784_fonds-de-commerce/>
- `sourcePublishedAt` : 2026-08-21
- `verifiedAt` : 2026-08-23
- `ingestionMode` : `external_discovery`
- Localisation : Le Teich (33470, Gironde)
- Secteur : Beauté / coiffure — fonds de commerce non en activité
- `expiresAt` (date limite de dépôt des offres) : 2026-09-16
- Résumé original proposé : « Fonds de commerce d'un salon de beauté à
  reprendre au Teich, en Gironde, dans le cadre d'une liquidation
  judiciaire. »
- Aucune coordonnée personnelle reprise (contact confié à l'étude
  SELARL EKIP', accessible depuis l'annonce source).

### 2. Fonds de commerce — bar / café / restaurant, Bordeaux (33)
- `opportunityId` : `bar-restaurant-a-reprendre-a-bordeaux-c0248a`
- `sourceKind` : administrateur judiciaire
- `sourceName` : Actify — SELARL EKIP'
- `sourceUrl` : <https://actify.fr/entreprises-liquidation-judiciaire/50883_fonds-de-commerce/>
- `sourcePublishedAt` : 2026-08-21
- `verifiedAt` : 2026-08-23
- `ingestionMode` : `external_discovery`
- Localisation : Bordeaux (33000)
- Secteur : Restauration et Tourisme — fonds de commerce non en activité
- `expiresAt` : 2026-09-16
- Résumé original proposé : « Fonds de commerce d'un bar-restaurant au
  centre de Bordeaux à reprendre dans le cadre d'une liquidation
  judiciaire. »

### 3. Association AIADL (loi 1901) — aide à domicile, Néac (33)
- `opportunityId` : `association-d-aide-a-domicile-a-reprendre-en-gironde-7d30aa`
- `sourceKind` : administrateur judiciaire
- `sourceName` : Actify — ASCAGNE AJ SO
- `sourceUrl` : <https://actify.fr/entreprises-liquidation-judiciaire/recherche-de-candidats-repreneurs-association-aiadl-loi-1901/>
- `sourcePublishedAt` : 2026-08-21
- `verifiedAt` : 2026-08-23
- `ingestionMode` : `external_discovery`
- Localisation : Néac (33500, Gironde)
- Secteur : Aide à la personne (SAAD), 34 salariés, CA 1 à 2,5 M€
- `expiresAt` : 2026-10-01
- **Point d'attention** : structure associative (loi 1901), pas une
  société commerciale classique — à faire valider par la Team avant
  publication, le type `reprise-transmission` reste pertinent mais le
  cas est atypique par rapport aux deux premiers.

## Candidats incomplets (7) — source sans URL stable

Repérés le 23 août sur Bpifrance Transmission (agrégateur, source n°4
du plan). **Ne satisfont pas le gate de publication en l'état** : les
seuls liens disponibles par annonce sont des liens de tracking ou des
formulaires de contact internes à Bpifrance (`/contact/formulaire/...`),
jamais une URL publique vers la source d'origine — Bpifrance masque
volontairement la source tant qu'aucun contact n'est engagé, à la
différence d'Actify. Cela confirme la note du backlog : Bpifrance est
« utile pour découvrir la source d'origine, jamais source d'autorité à
dupliquer ».

1. Rénovation bâtiment — Metz (57), BTP, CA 1 500 K€
2. Désamiantage / démolition — localisation non précisée, BTP, effectif 10, CA 1 700 K€
3. Nettoyage — Occitanie, Services, effectif 40
4. Nettoyage B2B — Finistère (29), Services
5. Vente/location matériel BTP — Haute-Garonne (31)
6. Restaurant traditionnel — Charente-Maritime (17)
7. Restaurant/brasserie — Isère (38)

Pour les rendre exploitables, il faudrait soit retrouver leur véritable
source d'origine (site de l'étude, CessionPME, Fusacq en tant que
plateforme, pas juste logo cité), soit les traiter en `direct_submission`
si un contact aboutit à une soumission volontaire du cédant — aucune des
deux voies n'a été engagée ici.

## Pistes non explorées faute de temps

- **CessionPME.com** et **Fusacq** : cités comme partenaires Bpifrance,
  à vérifier séparément s'ils exposent des fiches publiques avec URL
  stable (non confirmé dans cette session).
- **Vendeurs/dirigeants directs** et **sites officiels des études** :
  aucune recherche dédiée encore faite en dehors d'Actify.
- Actify propose un filtre par région/département/étude et d'autres
  secteurs (BTP, informatique...) que ceux vus ici — la pagination n'a
  pas pu être explorée entièrement dans cette session (page lourde,
  chargement instable), une session dédiée pourrait en tirer davantage
  de candidats du même niveau de qualité que les 3 ci-dessus.

## Prochaine étape

Les 3 candidats Actify existent en `draft` dans Firestore Production.
Reste à faire par la Team, via `/admin/opportunites` :
1. relire chaque fiche (titre, résumé, dates, source) ;
2. pour l'association AIADL, trancher si le cas atypique (structure
   loi 1901) est publiable tel quel ou à écarter ;
3. cliquer « Publier » une fois chaque fiche validée — le gate du
   Lot 1E empêche déjà toute publication si `sourceName`, `sourceUrl`
   ou `verifiedAt` venait à manquer.

Continuer ensuite la recherche (Actify BTP/informatique, CessionPME,
Fusacq, vendeurs directs) pour se rapprocher de 30–50.
