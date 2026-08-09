# Nettoyage Solutions France — candidat Firebase local

Date du contrôle : 8 août 2026.

## Périmètre et garde-fous

- Source éditable unique : Firebase (`solution_registry_revisions`).
- Le fichier `firebase-solution-registry.snapshot.generated.json` reste uniquement le
  fallback généré et la preuve de rollback de la révision active ; il n'est pas édité.
- Révision source : `solutions-2026-08-05-active-v1`, empreinte
  `759558daa13d489231fb1040a236173a61e35d316955ded530f97442108c2401`.
- Candidat : `solutions-2026-08-08-france-clean-v1`, statut `draft`.
- Aucun import Firebase, aucune activation et aucune écriture distante dans ce lot.
- Les Prestations restent masquées par le contrat de visibilité public.
- Aucun tiers n'est promu : les tiers restent `draft`, relation commerciale
  `unknown`, avec le bloqueur `commercial-relationship-unconfirmed`.
- Aucun acteur n'est présenté comme partenaire, affilié, Demaa ou ODEMA.
- Aucun ajout Sira/getsira, « Restaurant africain » ou « Commerçant africain » dans
  le registre France.

## Destinations officielles corrigées

Chaque destination ci-dessous a été contrôlée sur le site officiel le 8 août 2026.
La date de contrôle et l'URL officielle sont aussi inscrites dans les preuves de la
ressource et de ses placements.

| Ressource | Ancienne destination | Destination officielle contrôlée |
|---|---|---|
| Tiimora | `https://app.tiimora.com/` (connexion) | `https://www.tiimora.com/` |
| Diag Pilote | `https://dpil.fr/` | `https://www.diag-pilote.com/` |
| Google Ads | `https://ads.google.com/intl/fr_fr/home/` | `https://business.google.com/fr/google-ads/` |
| LICIEL | `https://www.liciel.fr/logiciel.html` | `https://www.liciel.fr/logiciels-details-pack-liciel-diagnostics.html` |
| Onaya | `https://www.onaya.com/` | `https://www.orisha.com/fr/construction/logiciel/onaya-btp/` |
| Riverside | `https://riverside.fm/` | `https://riverside.com/` |
| SECIB | `https://www.secib.fr/` | `https://www.secib.septeo.com/` |
| Zoom | `https://zoom.us/` | `https://www.zoom.com/` |

La description Tiimora est réalignée sur le produit officiel destiné aux cabinets
comptables : relation client, demandes, documents, signatures, relances et portail.

## Retrait éditorial sûr

`Regate` est retiré du seul placement `daf-externalise`. Son ancienne destination
redirige désormais vers l'offre Qonto destinée aux cabinets comptables ; conserver
la promesse historique de workflows fournisseurs pour un DAF externalisé ne serait
donc pas défendable. Aucun remplacement n'est inventé. La section conserve :

1. Pennylane ;
2. Microsoft Power BI.

Leurs textes ne font plus référence à Regate et les rangs sont contigus.

## Résultat du candidat

- 115 systèmes, ordre canonique inchangé ;
- 247 ressources (248 avant retrait de Regate) ;
- 599 placements (600 avant retrait de Regate) ;
- 115 placements Levier, un par système dans Modèles ;
- 847 écritures dans le plan Firestore, par lots `400 + 400 + 47` ;
- activation du plan : `null`, puisque le candidat reste `draft` ;
- rollback : pointeur exact vers la révision active et son empreinte.

Commande locale de preuve, strictement en lecture :

```bash
npm run plan:firebase-solutions-france-cleanup
```

La commande refuse explicitement `--apply` et `--write`.

## Territoire France

Le schéma Firebase v1 n'a pas de champ de territoire. Ajouter un champ maintenant
forcerait une migration transversale du contrat, du lecteur, des imports et des
révisions existantes. Le minimum propre est donc :

- candidat explicitement nommé `france-clean` ;
- tests interdisant les ajouts identifiés comme non-France ;
- aucun système « africain » dupliqué tant que l'internationalisation n'est pas
  conçue ;
- futur schéma v2 avec une portée de marché explicite (`marketScopes`) avant toute
  publication multi-pays.

`iVoirNet` est volontairement conservé : malgré son nom, son site officiel présente
une équipe basée en France et une solution SESAM-Vitale pour le marché français.

## Dette hors registre actif

L'audit réseau du catalogue historique a contrôlé 522 URL uniques : 500 ont répondu,
19 bloquent les robots et demandent une vérification manuelle, une est morte
(`patriom.app`) et deux sont à recontrôler (`maliora.fr`, `propilot.io`). Ces trois
acteurs ne sont ni ressources ni placements de la révision Firebase active ; ils ne
sont donc pas modifiés dans ce lot afin de ne pas confondre le runtime public et le
catalogue historique.

## Import DRAFT gardé

L'importeur `import:firebase-solutions-france-cleanup` accepte uniquement cette
révision `draft`. Il exige le projet, le plan, l'empreinte de révision et le pointeur
actif courant exacts. Après écriture, il relit les 247 ressources et 599 placements,
revalide la révision et vérifie que les données ainsi que la date de mise à jour du
pointeur actif n'ont pas changé.

Empreintes scellées :

- révision : `66718297385ad6c23221c3bb9c62d3b41f86749637b2ecdb7b8a6b4feeeb9dd9` ;
- plan : `4b4bfdadcd6abb4cd24880aeeaff27024a69e542266da23ef319d7c04f0eefcb` ;
- pointeur à préserver : `solutions-2026-08-05-active-v1` /
  `759558daa13d489231fb1040a236173a61e35d316955ded530f97442108c2401`.

La recette Emulator a réellement écrit et relu les 847 documents, contrôlé les 115
systèmes et confirmé `activePointerChanged: false`. L'import Production n'a pas été
exécuté : l'identité locale disponible reçoit `PERMISSION_DENIED`, et le reader OIDC
Production n'est pas une identité d'import. Aucun pointeur distant n'a donc changé.

Après obtention d'une identité éphémère autorisée : importer le candidat comme
révision non active, refaire les contrôles 115/115, puis produire une révision
publiée et déplacer le pointeur actif dans un jalon séparé. Le fallback local ne
devra être régénéré qu'après cette activation vérifiée.
