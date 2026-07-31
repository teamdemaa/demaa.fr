# ADR 0002 - Registre des décisions actives

- Statut : `validated`
- Date : 31 juillet 2026

Les seuls statuts autorisés sont `validated`, `working`, `deferred` et
`superseded`. Le **scope** décrit la décision ; la **phase** décrit son niveau
d'exécution. Une entrée `superseded` reste historique et ne guide plus le
produit.

| ID | Statut | Scope | Phase | Décision courante |
| --- | --- | --- | --- | --- |
| D-012 | `superseded` | Navigation et contenus de l'ancien Écosystème | audit de migration W2c-W3 | Les quatre groupes ne sont plus l'architecture cible. Chaque contenu et placement doit être audité avant migration dans Solutions. |
| D-061 | `working` | Contrats v2, routines Process et cinq pilotes | staging, activation externe bloquée | Les fondations v2 et l'unification Process sont conservées. La révision pilote attendue est `d061-v2-pilot-2026-07-30-03`. |
| D-062 | `superseded` | Prestation marketing et commerciale dans Écosystème | migration W2b-W4 | L'offre devient `Système & automatisation commerciale` sur `/services`. |
| D-063 | `deferred` | Newsletter Structure | backlog | Elle ne façonne ni Process, ni Solutions, ni Services dans la base active. |
| D-064 placement | `validated` | Emplacement de l'aide à l'organisation | implémentation W3 | Afficher un seul encart sous le panneau actif de Process et de Solutions. |
| D-064 copie | `working` | Texte de l'aide à l'organisation | cadrage avant W3 | Le texte exact reste non figé ; conserver un seul parcours Fillout. |
| Académie D-033/D-036 | `validated` | Navigation réciproque, catalogue et composition des deux cours publics | staging à préserver | Aucun changement de contenu dans ce chantier. La matrice de navigation de l'ADR 0001 est obligatoire. |
| Académie cours 3 à 5 | `deferred` | Drafts éditoriaux et assets non publics | hors release Systèmes | Aucun draft ne devient public sans publication réelle et gate dédié. |
| Vidéos | `deferred` | Production, casting et publication vidéo | chantier ultérieur | Les scripts, voix et assets locaux ne valent pas autorisation de publication. |
| Tiimora D-049 à D-060 | `deferred` | Intégration Demaa-Tiimora et retargeting | backlog distinct | Ce chantier ne doit ni orienter ni ralentir la base Systèmes/Services. |
| Services V1 | `validated` | Sept services, deux catégories, deux prix et cinq offres sur devis | cadrage approuvé, implémentation W2b-W5 | Pas de paiement immédiat et aucune offre supplémentaire sans validation. |
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
