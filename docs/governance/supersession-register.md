# Registre de remplacement

Ce registre indique ce qui est conservé comme preuve historique, ce qui est
remplacé et la nouvelle référence à consulter.

| Ancienne source ou décision | Statut | Nouvelle référence ou action |
| --- | --- | --- |
| Navigation web `Process / Outils / Écosystème` | `superseded` | `Process / Solutions / Ressources`, voir ADR 0001 |
| ADR 0003, point 3 : `/` peut reproduire le hub `/systemes` | `superseded` | `/` devient l'entrée du générateur de plan ; `/systemes` reste le hub public intact, voir ADR 0008 et D-076 |
| ADR 0008/D-076 : masquer la navigation applicative avant le résultat | `superseded` | navigation visible et utilisable dès l'arrivée, sans compte ni persistance avant sauvegarde, voir ADR 0010 et D-077 |
| ADR 0009 : `Coaching` comme quatrième onglet principal | `superseded` | Coaching reste accessible par `Échanger`, voir ADR 0010 ; navigation courante dans ADR 0012 |
| ADR 0010 : navigation `Plan d’action / Opportunités / Académie` avec sous-onglets `Actions / Solutions` | `superseded` | navigation `Plan d’action / Solutions / Académie / Opportunités`, sans sous-onglets dans le Plan, voir ADR 0012 |
| Page et cartes dédiées `Rejoindre Team Demaa` | `superseded` | lien simple dans Opportunités ouvrant la modale de profil à expertise principale unique ; l'ancienne route redirige vers cette intention, voir ADR 0010 |
| Cartes Solutions carrées à trois colonnes desktop | `superseded` | cartes compactes à hauteur naturelle, avec quatre colonnes sur grand desktop, voir ADR 0010 |
| Académie `Cours / Ateliers`, Cours par défaut | `superseded` | `Tutoriels / Cours`, Tutoriels par défaut ; les slugs `case-study` sont conservés, voir ADR 0004 |
| Académie `Tutoriels / Cours`, Tutoriels par défaut | `temporarily-superseded` | `Cours` uniquement, sans onglet ; Tutoriels et Webinaires conservés derrière les bascules éditoriales, voir ADR 0004 |
| Onglets spécialiste `Messages / Formules` | `superseded` | conversation écrite ou dictée sans onglets ; Coach business devient une carte Services, voir ADR 0009 |
| Portail distinct `Mon espace` ou `Mes plans` | `superseded` | authentification Firebase puis retour direct à l'intention dans l'application unifiée ; la session fournit ensuite l'UID et l'e-mail de contact |
| Adresse e-mail redemandée dans chaque formulaire applicatif | `superseded` | authentification Firebase unique, puis e-mail de contact récupéré côté serveur ; l'UID reste l'identité racine et les plans utilisent l'appartenance d'entreprise dérivée de cet UID |
| Nouveau plan réécrit au format historique V1/V2 | `superseded` | génération V3 ; V1 est normalisé en V2 à la lecture, V2 et `manual` restent inchangés, voir ADR 0011 |
| Support générique non typé pour les nouveaux plans | `superseded` | support V3 typé avec choix déterministe par nature d'action, voir ADR 0011 |
| Commande IA considérée active parce que son contrat existe | `superseded` | activation seulement après l'autorisation explicite du 12 août 2026 ; enveloppe minimale et exclusions gouvernées par ADR 0011 |
| Ressources dans `Solutions > Modèles` ou « Ressources héritées » | `superseded` | onglet autonome `Ressources`, sans cours de l'Académie |
| Écosystème D-012 à quatre groupes | `superseded` | inventaire vers Solutions dans W2c-W3 |
| Outils comme onglet autonome | `superseded` | sous-section de Solutions, libellé exact non figé |
| Prestations Demaa dans Écosystème | `superseded` | marketplace autonome `/services` |
| D-062 dans Écosystème | `superseded` | `Système & automatisation commerciale` dans Services V1 |
| D-064 uniquement sous Process | `superseded` | encart unique après le panneau actif Process/Solutions ; Ressources conserve son parcours d'aperçu et de réception |
| Newsletter D-063 sous Outils ou Écosystème | `deferred` | backlog sans impact sur la base active |
| `/annuaire-services` comme marketplace cible | `retired` | routes exactes utiles redirigées vers `/services/*`; ancien runtime supprimé |
| Marketplace Services V2 à sept offres | `retired` | remplacée par les six offres de `canonical-service-catalog.ts`, voir ADR 0006 |
| Fiches `/annuaire-services/[slug]` générées au runtime | `retired` | composants/pages supprimés; redirects permanents conservés |
| Catalogue historique de services mixtes | `retired` | remplacé physiquement par le catalogue canonique à six offres |
| Pages `/cours` générées au runtime et sitemappées | `retired` | contenus canoniques sous `/academie` ou `/contenus`; redirects historiques conservés |
| Boutique en ligne | `superseded` | aucune carte V1 |
| Site vitrine 1 350 EUR avec cadeaux | `deferred` | Site vitrine actif à 950 EUR HT, portée non figée |
| Google Sheet maître au-dessus de Git | `superseded` | ADR validée, contrat Git approuvé, plan Git, puis miroir Google |
| Ordre historique des feuilles du classeur | `superseded` | ordre défini par le contrat D-061 |
| Recommandations outils dispersées sans placement audité | `working` | candidats offline `pending`; registre produit à 0 Solution publiée jusqu'à audit et promotion explicites |
| Mesure client Services/Solutions | `deferred` | attribution consent-aware et logs opérationnels seulement ; contrat d'événements sans PII à définir ultérieurement |
| Manifests démo et preview historiques multiples | `working` | 115 révisions v1 restent actives ; manifest révisionné D-061 et consolidation W7 avant tout pilote v2 |
| `docs/governance/release-manifest.json` W1 utilisé comme état courant | `superseded` | conserver comme preuve historique ; régénérer uniquement depuis le candidat exact W7/W8 |

## Éléments à préserver

- le référentiel Process et ses identifiants stables ;
- le bouton `Voir le système` et sa modale ;
- les patterns de rails et modales issus de D-012, avec des cartes compactes à
  hauteur naturelle après migration de leur contenu ;
- le parcours de copie modifiable sécurisé ;
- l'Académie et ses routes publiques déjà validées ;
- les contrats D-061 de révision, idempotence et rollback.

## Règle de suppression

Aucun ancien fichier, route ou registre n'est supprimé tant que :

1. ses consommateurs ne sont pas inventoriés ;
2. chaque donnée utile n'a pas une destination explicite ;
3. les redirections nécessaires ne sont pas testées ;
4. la nouvelle source n'est pas couverte par des tests anti-fuite et de
   complétude ;
5. une recette indépendante n'a pas confirmé l'absence de régression.
