# Gouvernance des Systèmes Demaa

Ce dossier est la porte d'entrée de la gouvernance active des Systèmes Demaa.
Il distingue les décisions produit, les données canoniques, les miroirs
éditoriaux et les preuves de travail afin qu'une ancienne maquette ou une
conversation ne puisse plus réintroduire une décision remplacée.

## Hiérarchie des sources de vérité

En cas de contradiction, appliquer cet ordre :

1. ADR et registre de décisions portant le statut `validated` ;
2. contrats, catalogues et registres de domaine approuvés et suivis par Git ;
3. manifests suivis par Git qui prouvent l'état exact d'une release ;
4. plans et backlogs d'exécution suivis par Git ;
5. Google Sheets ou Google Docs utilisés comme miroirs éditoriaux ;
6. conversations, handoffs, captures et maquettes, qui restent des preuves et
   non des contrats.

Le code d'interface, le SEO et les pages publiques consomment les contrats. Ils
ne constituent pas une source de vérité indépendante.

Au checkpoint W6.0, le manifeste W1 reste une preuve historique et non une
photographie de la branche consolidée. Sa prochaine génération appartient au
candidat exact W7/W8.

## Documents actifs

- [Architecture cible](../decisions/0001-systems-services-architecture.md)
- [Registre des décisions](../decisions/0002-decision-register.md)
- [ADR 0008 — Générateur de plan d'action](../decisions/0008-action-plan-generator-homepage.md)
- [ADR 0009 — Coaching et accès unifié](../decisions/0009-coaching-and-unified-app-access.md)
- [ADR 0010 — Plan vierge, Opportunités et navigation](../decisions/0010-blank-plan-opportunities-and-app-navigation.md)
- [Contrat produit D-076](../action-plan-generator-product-contract.md)
- [Catalogue Services V1](../services-v1-catalog.md)
- [Inventaire des sources](./source-inventory.md)
- [Registre de remplacement](./supersession-register.md)
- [Plan d'exécution W2-W8](./execution-plan.md)
- [Manifeste historique W1](./release-manifest.json) — ne pas régénérer avant
  le candidat exact W7/W8

## Propriétaires

| Domaine | Propriétaire de décision | Propriétaire d'exécution | Contrôle indépendant |
| --- | --- | --- | --- |
| Architecture Système, Process, Solutions, Ressources | Master Demaa + utilisatrice | chantier Systèmes UI | recette intégration |
| Registres Process et routines | Master Demaa | chantier Données | audit 115 métiers |
| Placements Logiciels et prestataires | Master Demaa | chantier Données | audit pertinence par métier |
| Catalogue Services Demaa | utilisatrice + Master Demaa | chantier Services | revue commerciale et légale |
| Leads, consentement et mesure | Master Demaa | chantier Leads | audit confidentialité |
| Routes, navigation et SEO | Master Demaa | chantier Routes | audit liens, sitemap et indexation |
| Classeurs D-061 et révisions | Master Demaa | chantier Workbooks | audit de révision et rollback |
| Académie et vidéos | utilisatrice + Master Demaa | chantiers dédiés, actuellement différés | QA média indépendante |
| Générateur de plan, sélection Système et persistance | utilisatrice + Master Demaa | chantier Action Plan | QA schéma, sécurité, coût et parcours |
| Opportunités, Team Demaa et navigation applicative | utilisatrice + Master Demaa | chantier Application | QA données, consentement, Slack et parcours public/connecté |

Une modification qui traverse plusieurs domaines doit être découpée en lots.
Les fichiers exclusifs de chaque lot sont indiqués dans le plan d'exécution.

## Règles de changement

- Une décision `superseded` reste traçable dans le registre, mais ne guide plus
  le produit.
- Une décision `working` ou marquée **non figée** ne doit pas être codée comme constante
  produit sans validation explicite.
- Un agent peut recommander une option, en exposer les risques et proposer un
  ordre d'exécution ; il ne transforme jamais cet avis en décision produit à la
  place de l'utilisatrice. Une décision explicitement donnée par l'utilisatrice
  prévaut sur la recommandation, sous réserve des contraintes de sécurité et de
  légalité qui doivent alors être signalées clairement.
- Aucun identifiant Drive privé, secret, e-mail, donnée personnelle ou URL de
  copie modifiable ne doit apparaître dans ces documents.
- Une release doit référencer des commits et des empreintes, jamais des valeurs
  d'environnement.
- Un Google Sheet peut faciliter l'édition, mais une décision n'est active
  qu'après validation et synchronisation dans le contrat Git correspondant.
