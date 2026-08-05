# Registre de remplacement

Ce registre indique ce qui est conservé comme preuve historique, ce qui est
remplacé et la nouvelle référence à consulter.

| Ancienne source ou décision | Statut | Nouvelle référence ou action |
| --- | --- | --- |
| Navigation web `Process / Outils / Écosystème` | `superseded` | `Process / Solutions`, voir ADR 0001 |
| Écosystème D-012 à quatre groupes | `superseded` | inventaire vers Solutions dans W2c-W3 |
| Outils comme onglet autonome | `superseded` | sous-section de Solutions, libellé exact non figé |
| Prestations Demaa dans Écosystème | `superseded` | marketplace autonome `/services` |
| D-062 dans Écosystème | `superseded` | `Système & automatisation commerciale` dans Services V1 |
| D-064 uniquement sous Process | `superseded` | encart unique après le panneau actif Process/future Solutions ; attribution source encore `Process` à corriger avant activation, copie finale non figée |
| Newsletter D-063 sous Outils ou Écosystème | `deferred` | backlog sans impact sur la base active |
| `/annuaire-services` comme marketplace cible | `superseded` | index déjà 404/noindex ; fiches et modale historiques encore runtime jusqu'à la migration W6 |
| `/services` actuellement retiré par le proxy | `working` | pages W4 implémentées localement, mais 7 offres encore `draft` et activation/matrice de routes réservées à W6 |
| Fiches `/annuaire-services/[slug]` encore générées et sitemappées | `working` | inventaire contenu, destination ou retrait, redirects et sitemap dans W6 |
| Catalogue historique de services mixtes | `superseded` | Catalogue Services V1 suivi par Git ; ancien runtime conservé transitoirement jusqu'à la migration W6 |
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
- les patterns de rails, cartes carrées et modales issus de D-012, après
  migration de leur contenu ;
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
