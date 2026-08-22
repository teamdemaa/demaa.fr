# D-091 — Revue des cinq pilotes au 22 août 2026

Statut : **seconde revue terminée, révision candidate Preview contrôlée**.

Cette revue ne modifie ni le registre Firebase actif, ni l'interface, ni la
Production. Elle fixe la sélection pilote opposable utilisée pour générer la
révision candidate complète.

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

## Décisions de la seconde revue

### Agence de recrutement

Six outils sont retenus : Recruitee, HubSpot, Calendly, Aircall,
Google Workspace et n8n. Teamtailor, Typeform, Zoom et Power BI sont retirés :
ils dupliquent respectivement l’ATS, la qualification, la visio ou le reporting
déjà couvert, sans valeur assez distincte pour ce pilote.

### SaaS

Huit outils sont retenus : Stripe, Attio, GitHub, Vercel, Linear, Sentry,
PostHog et Intercom. Google Workspace et n8n sont retirés de la sélection
métier : GitHub et Linear couvrent déjà la collaboration prioritaire, tandis
que l’automatisation générique n’est pas indispensable à tous les SaaS.

### Agence web

Huit outils sont retenus : Figma, Webflow, WordPress, GitHub, Vercel, Asana,
Sellsy et n8n. Webflow et WordPress restent deux alternatives de production
explicitement distinctes ; GitHub et Vercel sont conditionnels aux projets
codés. Slack et Google Workspace sont retirés car trop transverses.

### Cabinet comptable

Sept outils sont retenus : Pennylane, MyUnisoft, ACD, Silae, Dext, RCA et
Lefebvre Dalloz. Les trois premières sont présentées comme alternatives de
suite principale ; les quatre autres couvrent paie, collecte, conseil et
documentation. Cegid et Google Workspace sont retirés car trop génériques.
Tiimora reste exclu tant que transparence, sécurité et relation commerciale ne
sont pas validées.

### Bâtiment

Sept outils sont retenus : Obat, Vertuoza, Graneet, Sage Batigest Connect,
Alobees, Fieldwire et Kizeo Forms. Les quatre premiers correspondent à des
profils de gestion différents ; les trois autres couvrent planning, chantier,
plans, réserves et formulaires terrain. ProGBat, Oryka et Google Workspace sont
retirés pour éviter redondance et contenu trop transverse.

Le détail opposable — ordre, besoin, usage, contrainte, source officielle et
date de revue — se trouve dans `pilot-reviewed-selections.v1.json`. Le volume
final varie de six à huit outils selon le métier ; aucun quota n'est rempli.

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

La candidate pilote retire donc les anciens placements Fournisseurs et Réseaux
des cinq systèmes. Ils resteront vides jusqu'à une revue dédiée apportant
preuve officielle, contrainte réelle et date d'expiration. Le fournisseur
Juridi Consulting du cabinet comptable est lui aussi retiré de la candidate :
sa publication historique ne remplace pas la preuve exigée par D-091.

## Prochaine sortie attendue

Faire valider les cinq compositions sur la Preview, puis appliquer cette méthode
aux 110 autres systèmes par lots bornés. La candidate globale devra être auditée
et recettée à son tour avant tout GO de déplacement du pointeur Firebase.
