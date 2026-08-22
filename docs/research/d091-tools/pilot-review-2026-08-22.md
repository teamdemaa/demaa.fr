# D-091 — Revue des cinq pilotes au 22 août 2026

Statut : **pools contrôlés, non publiables**.

Cette revue ne modifie ni le registre Firebase actif, ni l'interface, ni la
Production. Elle vérifie la cohérence de la méthode avant la revue métier
contradictoire et la construction d'une révision candidate complète.

## Contrôles fermés

- les cinq slugs métier existent dans le catalogue canonique des 115 systèmes ;
- les 50 occurrences candidates pointent vers un outil canonique actif ;
- chaque occurrence possède au moins une source HTTPS et une date de revue
  récente dans le répertoire ;
- tous les besoins prioritaires déclarés sont couverts par au moins un candidat ;
- aucune sélection n'est présentée comme activable ;
- aucun quota final n'est inscrit dans le contrat ;
- Services reste hors de la sélection Outils ;
- le JSON-LD supporte désormais toute la sélection publiée sans troncature à
  dix ;
- le gate pilote exige une révision candidate complète des 115 systèmes et ne
  peut pas déplacer le pointeur actif.

## Points à arbitrer pendant la seconde revue

### Agence de recrutement

Le pool couvre sourcing et diffusion, vivier, relation client, entretiens,
documents, automatisation et reporting. Recruitee et Teamtailor sont deux
alternatives ATS à comparer, pas deux choix obligatoires. HubSpot et Aircall
servent la relation client ; ils ne doivent pas être classés comme ATS.

### SaaS

Le pool est équilibré entre revenu récurrent, vente, développement, qualité,
support et collaboration. La seconde revue doit vérifier si chaque outil garde
une valeur distincte pour une petite équipe : GitHub/Vercel, Linear, Sentry et
PostHog couvrent des étapes différentes, mais leur ordre dépend de la maturité
du produit.

### Agence web

Webflow et WordPress sont des alternatives de production dont la coexistence
doit être justifiée par les types de projets réellement livrés. GitHub/Vercel
ne sont utiles que pour les agences qui développent du code. Le pool final peut
donc être plus court selon la cible retenue.

### Cabinet comptable

Le pool contient plusieurs suites de production concurrentes. Elles ne doivent
pas toutes être conservées sans segmentation explicite par taille, organisation
ou besoin. Tiimora nécessite en plus la validation de transparence, sécurité et
relation commerciale déjà inscrite au backlog. Dext, RCA et Lefebvre Dalloz
répondent à des besoins distincts et ne doivent pas être comparés comme des
suites comptables équivalentes.

### Bâtiment

Vertuoza, ProGBat, Graneet, Sage Batigest Connect et Obat se chevauchent
partiellement. La seconde revue doit définir les profils auxquels chaque
alternative apporte une valeur distincte. Alobees, Fieldwire et Kizeo Forms
couvrent davantage le terrain ; Oryka est rattaché au planning des équipes, pas
à la rentabilité chantier.

## Écosystème connexe constaté

- Financement : 95 systèmes sur 115 utilisent encore le fallback générique ;
  agence de recrutement et agence web sont concernées parmi les pilotes.
- Aides : les cinq pilotes ont une sélection explicite, mais les dispositifs
  restent temporels et doivent recevoir une preuve, une date de revue et une
  règle d'expiration avant un gate strict.
- Fournisseurs : seul le cabinet comptable possède un fournisseur publié parmi
  les cinq pilotes.
- Réseaux : aucun réseau n'est actuellement publié.

Ces absences sont acceptables. Elles ne doivent jamais être comblées par des
cartes faibles.

## Prochaine sortie attendue

Pour chaque pilote : liste retenue à volume variable, ordre, besoin couvert,
source officielle, usage, contrainte, date de revue et décision contradictoire.
Seulement ensuite, transformer les éléments retenus en ressources et placements
d'une révision Firebase candidate complète, puis lancer le gate Preview.
