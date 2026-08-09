# Inventaire des sources et preuves

Cet inventaire empêche un checkout sale, une maquette ou un miroir externe de
devenir implicitement la source du produit. Les chemins locaux sont des repères
d'audit ; ils ne doivent pas être copiés en bloc dans Git.

## Sources Git et checkouts

| Source | Empreinte ou révision | Autorité | Destination | Propriétaire |
| --- | --- | --- | --- | --- |
| Checkpoint consolidé W6.0 | commit `be33c4d5451b0a61ab23da1945ee72b27cf36c5a` | état local de référence W3/W4/W5, non activé publiquement | W6 routes/SEO puis candidat W7/W8 | Intégration |
| UI Systèmes W3 | commits `616e9df83b411d8995c83f0fdf772bf92105356e` et `be33c4d5451b0a61ab23da1945ee72b27cf36c5a` | implémentation locale `published-only` | activation W6 après levée du gate metadata/JSON-LD et D-064 | Systèmes UI |
| Marketplace Services W4 | commits `60205ace7a1731328d4407a4b35b653c1bb31309` et `ddb9adfddc94aaacbc23df19f34a05d315b540e5` | implémentation locale fail-closed | activation W6 après promotion explicite des offres | Services produit/UX |
| Transport Services/Solutions W5 | commits `84e73e0eb65efc16a0ea203c426149df369e608e`, `c4e742ffa57f2c5d283945364e260c858acd196a` et `5e34d2e8881f0c427c2f3905eec8f81ff95bc498` | implémentation locale sécurisée | configuration worker, secrets et supervision avant activation | Leads/Conformité |
| Checkpoint combiné Systèmes + Académie | commit `104fffecec7fdedd5eefc0c1c208445c684f3836` | provenance de la lignée propre | parent de l'intégration des corrections D-061 | Intégration |
| Correctif lisibilité original | commit `9629b0a35a93c65a2841d19dab7c4ffe06530e0b` | preuve de patch | réappliqué dans la lignée propre sous `155b2ababb1b9c748b7f465a6cd6a1a38daecc1d` | Workbooks |
| Correctif lisibilité intégré | commit `155b2ababb1b9c748b7f465a6cd6a1a38daecc1d` | code checkpoint intermédiaire | parent direct de `811735139211253818839719617fb97fc373a9b2` | Workbooks |
| Correctif hauteur original | commit `5e9f2db3cd5054f092d3ce00d8c925e89de8ee20` | preuve de patch | réappliqué dans la lignée propre sous `811735139211253818839719617fb97fc373a9b2` | Workbooks |
| Parent code checkpoint de W1 | commit `811735139211253818839719617fb97fc373a9b2` | provenance historique de W1 | lignée consolidée W6.0 ci-dessus | Intégration |
| Branche D-061 pilotes protégés | commit `dfa036ade6e1c95b0157665a7ed2dc6d0e9df851` | preuve historique intégrée à contrôler, pas à cherry-pick deux fois | W7 | Workbooks |
| Branche Process unifié | commit `39bfa1f2ab2d4bb8bfb682a4454ddd504729de7e` | preuve de staging, pas source isolée de release | W3/W8 | Systèmes UI |
| Branche Académie cinq cours | commit `82b95bdada34c85c0b19a7af611e53edd655f5c1` | preuve Académie à préserver | W6/W8 | Académie |
| Checkout partagé Demaa | HEAD `0e30a68983b8ab9d7cf1b86e117ff17abc0b4eee`; SHA-256 de la liste d'état sale `fb0109067a43b66623e4c73b6eacfa491d118ebd1ab6e9e88489d5d08c7fc9ae` | aucune pour intégration | lecture ciblée seulement ; ne jamais merger ou stager en bloc | propriétaire de chaque chantier historique |

L'empreinte de l'état sale est reproductible avec la commande en lecture seule :

```sh
git status --porcelain=v1 -z | openssl dgst -sha256
```

## Backlog et preuves visuelles non suivis

| SourceRef | Chemin normalisé | SHA-256 | Autorité | Destination | Propriétaire |
| --- | --- | --- | --- | --- | --- |
| `backlog-central-untracked` | `shared-checkout://docs/central-backlog.md` | `e7a94fd4abbe017d1268a876cb341fc3cf55dd9c56486ccf7933e5e568d4eace` | historique d'exécution non suivi, inférieur aux ADR | décisions utiles déjà synthétisées dans ADR 0002 et plan W2-W8 | Gouvernance |
| `services-v1-matrix` | `evidence://services-v1/services-v1-matrice.md` | `923f551c7614cbc84ed330c415d87979ee90e19567989c8fa21c03df52a405e2` | preuve de cadrage | registre W2b après validation | Services produit/UX |
| `services-v1-interactive-mockup` | `evidence://services-v1/demaa-services-staging-v1.html` | `80b0bf7d74bdd94150a867c1e94a6b3a4119f2983b121d06f5d8227261c9b2d8` | preuve visuelle non contractuelle | composants W4, sans copie directe | Services produit/UX |
| `services-v1-no-mutation-proof` | `evidence://services-v1/services-v1-preuve-non-mutation.md` | `a5b7dea74973f0912134d4160763e1104080a0977aa8c5c2485ef5adb78c9b52` | preuve d'audit | dossier de recette W4/W8 | QA Services |
| `services-v1-desktop-reference` | `evidence://services-v1/demaa-services-desktop-1440.png` | `b3d6f3fa7ae7c4988e4d58913b6e977149343cdb9e8dc388f3829cc73453ad6d` | preuve visuelle | comparaison W4, jamais source de contenu | Services produit/UX |

## Miroirs et overlays externes

| Source | Empreinte | Autorité | Destination | Propriétaire |
| --- | --- | --- | --- | --- |
| Google Sheet historique `DEMAA - Référentiel Process - Nettoyage` ([miroir](https://docs.google.com/spreadsheets/d/1Y_FqDpG9AshpS-gS46MpDZaPG-2lktfOsVYp3miB75c/edit)) | non figée, source externe mutable | miroir de proposition uniquement | validation puis génération de `process-registry.generated.json` et `process-steps.generated.json` | Éditorial Process |
| Google Sheets métier | non figés, sources externes mutables | sorties historiques et classeurs livrés, jamais vérité Process commune | audit et activation D-061 | Workbooks |
| Firestore `enterprise_annuaire` | overlay runtime non capturé dans W1 | enrichissement runtime sous contrat serveur | réconciliation W2a, fallback Git conservé | Données entreprises |
| Firestore annuaire outils | overlay runtime non capturé dans W1 | enrichissement runtime sous contrat serveur | réconciliation W2a-W2c, fallback Git conservé | Données Solutions |
| Registre privé des copies modifiables | overlay serveur non capturé et interdit au client | résolution privée de livraison | W7, concordance avec le manifest public | Workbooks/Livraison |

Les overlays runtime ne peuvent pas modifier une décision produit. Leur schéma,
leur ordre de fusion et leur fallback doivent être testés dans le domaine qui
les consomme.

## Studio Académie et Vidéos

| SourceRef | Chemin normalisé | SHA-256 | Autorité | Destination | Propriétaire |
| --- | --- | --- | --- | --- | --- |
| `video-oumou-warm-v2-handoff` | `studio://academy-video-prototype/content/editorial-variants/oumou-warm-v2/handoff.md` | `b302fff624039ddc433f8cc238f9582764faea72d890a38fad20e3ebe727f810` | preuve locale différée | futur chantier Vidéos | Vidéos |
| `video-safe-zone-d041` | `studio://academy-video-prototype/docs/D-041-safe-zone-4x3.md` | `3b7c603347218e8ab4ff6c96da1cb21194b3df3e5ce9fe832e9929354cebd35b` | preuve locale différée | futur chantier Vidéos | Vidéos/DA |
| `video-transitions-d042` | `studio://academy-video-prototype/docs/D-042-transition-stabilization.md` | `2de793f493470bbb637c3aa4b66d3769c68618f98ca003effd43b7ae4cd39568` | preuve locale différée | futur chantier Vidéos | Vidéos |
| `video-casting-12-v1` | `shared-checkout://docs/assets/demaa-casting-12-personnages-v1.png` | `79fa6617851f264271bcfe159e13367e1e951f2da73b1308262efc1bf80d37a8` | référence créative, non publication | futur chantier casting | Vidéos/DA |

Le dossier `studio/` du checkout partagé est non suivi et contient des outputs
volumineux. Il ne doit jamais être ajouté en bloc au dépôt produit.

## Backlogs explicitement différés

| IDs | Autorité actuelle | Destination | Propriétaire |
| --- | --- | --- | --- |
| D-049 à D-060 | historique dans le backlog non suivi, statut `deferred` dans ADR 0002 | backlog Tiimora séparé | Tiimora |
| D-071 | hypothèse 1 350 EUR et cadeaux, statut `deferred` dans ADR 0002 | revue commerciale ultérieure | Services produit |

## Manifeste de release

`docs/governance/release-manifest.json` décrit encore le lot documentaire W1.
Il n'est pas une photographie de W6.0 et ne doit pas être régénéré depuis ce
checkpoint. Sa prochaine génération est réservée au candidat exact W7/W8, afin
que ses commits et empreintes correspondent à l'état réellement présenté à la
recette.

## Inventaire des routes Services au 1er août 2026

| Route | État observé | Autorité future | Action W6 |
| --- | --- | --- | --- |
| `/services` | page W4 présente mais réécrite en 404/noindex par le proxy ; sélecteur à 0 offre publiée | ADR 0001 et implémentation W4 locale | activer seulement après promotion des offres, gates W5 et matrice navbar W6 |
| `/services/[slug]` | pages W4 présentes mais préfixe réécrit en 404/noindex ; aucun paramètre draft généré | catalogue W3b et pages W4 | ne rendre publiques que les fiches explicitement publiées |
| `/annuaire-services` | réécrite en 404/noindex ; cible produit `superseded` | aucune comme nouvelle marketplace | décider redirect ou maintien 404 |
| `/annuaire-services/[slug]` | runtime retiré | redirects exacts vers les quatre offres canoniques | conserver et tester les redirects |
| modal interceptée `/annuaire-services/[slug]` | retirée | modale canonique `/services/[slug]` | aucune réactivation |
| sitemap des fiches historiques | entrées toujours générées | SEO global W6 | retirer ou rediriger seulement après inventaire |

Le soft-404 Académie déjà documenté est un risque faible accepté et reste hors
du périmètre W1-W7. W6 doit seulement prouver qu'il n'est pas aggravé.
