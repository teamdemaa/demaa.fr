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

## Documents actifs

- [Architecture cible](../decisions/0001-systems-services-architecture.md)
- [Registre des décisions](../decisions/0002-decision-register.md)
- [Catalogue Services V1](../services-v1-catalog.md)
- [Inventaire des sources](./source-inventory.md)
- [Registre de remplacement](./supersession-register.md)
- [Plan d'exécution W2-W8](./execution-plan.md)
- [Manifeste public de release](./release-manifest.json)

## Propriétaires

| Domaine | Propriétaire de décision | Propriétaire d'exécution | Contrôle indépendant |
| --- | --- | --- | --- |
| Architecture Système, Process, Solutions | Master Demaa + utilisatrice | chantier Systèmes UI | recette intégration |
| Registres Process et routines | Master Demaa | chantier Données | audit 115 métiers |
| Placements Logiciels et prestataires | Master Demaa | chantier Données | audit pertinence par métier |
| Catalogue Services Demaa | utilisatrice + Master Demaa | chantier Services | revue commerciale et légale |
| Leads, consentement et mesure | Master Demaa | chantier Leads | audit confidentialité |
| Routes, navigation et SEO | Master Demaa | chantier Routes | audit liens, sitemap et indexation |
| Classeurs D-061 et révisions | Master Demaa | chantier Workbooks | audit de révision et rollback |
| Académie et vidéos | utilisatrice + Master Demaa | chantiers dédiés, actuellement différés | QA média indépendante |

Une modification qui traverse plusieurs domaines doit être découpée en lots.
Les fichiers exclusifs de chaque lot sont indiqués dans le plan d'exécution.

## Règles de changement

- Une décision `superseded` reste traçable dans le registre, mais ne guide plus
  le produit.
- Une décision `working` ou marquée **non figée** ne doit pas être codée comme constante
  produit sans validation explicite.
- Aucun identifiant Drive privé, secret, e-mail, donnée personnelle ou URL de
  copie modifiable ne doit apparaître dans ces documents.
- Une release doit référencer des commits et des empreintes, jamais des valeurs
  d'environnement.
- Un Google Sheet peut faciliter l'édition, mais une décision n'est active
  qu'après validation et synchronisation dans le contrat Git correspondant.
