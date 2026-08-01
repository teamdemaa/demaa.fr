# ADR 0002 - Registre des décisions actives

- Statut : `validated`
- Date : 31 juillet 2026
- Mise à jour d'état : 1er août 2026, checkpoint documentaire W6.0

Les seuls statuts autorisés sont `validated`, `working`, `deferred` et
`superseded`. Le **scope** décrit la décision ; la **phase** décrit son niveau
d'exécution. Une entrée `superseded` reste historique et ne guide plus le
produit.

| ID | Statut | Scope | Phase | Décision courante |
| --- | --- | --- | --- | --- |
| D-012 | `superseded` | Navigation et contenus de l'ancien Écosystème | audit de migration W2c-W3 | Les quatre groupes ne sont plus l'architecture cible. Chaque contenu et placement doit être audité avant migration dans Solutions. |
| D-061 | `working` | Contrats v2, routines Process et cinq pilotes | 115 révisions v1 actives ; pilotes v2 non activés | Les fondations v2 et l'unification Process sont conservées. La révision pilote attendue est `d061-v2-pilot-2026-07-30-03`, sans activation ni généralisation par W6.0. |
| D-062 | `superseded` | Prestation marketing et commerciale dans Écosystème | migration W2b-W4 | L'offre devient `Système & automatisation commerciale` sur `/services`. |
| D-063 | `deferred` | Newsletter Structure | backlog | Elle ne façonne ni Process, ni Solutions, ni Services dans la base active. |
| D-064 placement | `validated` | Emplacement de l'aide à l'organisation | implémenté localement, non activé pour Solutions | Afficher un seul encart sous le panneau actif de Process et de Solutions. Le composant est au bon niveau, mais l'attribution source reste `Système opérationnel - Process` et doit être corrigée avant activation de Solutions. |
| D-064 copie | `working` | Texte de l'aide à l'organisation | copie finale non figée | Conserver un seul parcours Fillout. W6.0 n'invente ni ne valide de nouvelle copie. |
| Académie D-033/D-036 | `validated` | Navigation réciproque, catalogue et composition des deux cours publics | staging à préserver | Aucun changement de contenu dans ce chantier. La matrice de navigation de l'ADR 0001 est obligatoire. |
| Académie cours 3 à 5 | `deferred` | Drafts éditoriaux et assets non publics | hors release Systèmes | Aucun draft ne devient public sans publication réelle et gate dédié. |
| Vidéos | `deferred` | Production, casting et publication vidéo | chantier ultérieur | Les scripts, voix et assets locaux ne valent pas autorisation de publication. |
| Tiimora D-049 à D-060 | `deferred` | Intégration Demaa-Tiimora et retargeting | backlog distinct | Ce chantier ne doit ni orienter ni ralentir la base Systèmes/Services. |
| Services V1 | `validated` | Sept services, deux catégories, deux prix et cinq offres sur devis | W3b/W4/W5 implémentés localement, activation bloquée | Les sept offres restent `draft` et aucune n'est publique. Pas de paiement immédiat et aucune offre supplémentaire sans validation. |
| Solutions V1 | `working` | Registre et interface `published-only` par système | W3c/W3 implémentés localement, activation bloquée | Le registre produit contient 0 Solution publiée. Les candidats de migration restent des preuves `pending`, jamais un fallback runtime. |
| Mesure client Services/Solutions | `deferred` | Événements de parcours et conversion sans PII | chantier ultérieur après contrat de mesure | La branche ne contient que l'attribution consent-aware jointe aux demandes et des logs opérationnels serveur ; aucun dispositif client spécifique n'est déclaré actif. |
| Boutique en ligne | `superseded` | Offre Services | retirée avant implémentation | Aucune carte V1. |
| Site 1 350 EUR + cadeaux | `deferred` | Hypothèse d'offre enrichie D-071 | revue commerciale ultérieure | Elle ne modifie pas l'offre active à 950 EUR HT. |
| Audit des outils | `working` | Pertinence des placements par métier | W2a-W2c puis contrôle périodique | Aucune proposition publique sans placement vérifié. |

## Gates explicites

- **GO cadrage** ne vaut pas GO implémentation.
- **GO staging** ne vaut pas GO Production.
- Une activation Drive ou une mutation de registre privé demande un GO séparé.
- Un prix validé ne valide pas automatiquement les livrables, exclusions,
  délais, maintenance ou conditions de correction.
- D-061 ne peut être activé qu'après un preflight frais, la vérification de la
  révision `d061-v2-pilot-2026-07-30-03` et la réconciliation des pointeurs
  public et privé.
- Le worker de livraison W5 ne peut être activé qu'après ajout explicite de sa
  planification dans `vercel.json`, configuration de `CRON_SECRET` et de
  `SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET`, puis validation de la supervision
  des échecs, reprises et files persistées.
- `docs/governance/release-manifest.json` reste une preuve W1 historique. Il ne
  sera régénéré que depuis le candidat exact W7/W8, jamais depuis W6.0.
