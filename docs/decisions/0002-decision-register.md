# ADR 0002 - Registre des décisions actives

- Statut : `validated`
- Date : 31 juillet 2026
- Mise à jour d'état : 9 août 2026, architecture publique France

Les seuls statuts autorisés sont `validated`, `working`, `deferred` et
`superseded`. Le **scope** décrit la décision ; la **phase** décrit son niveau
d'exécution. Une entrée `superseded` reste historique et ne guide plus le
produit.

| ID | Statut | Scope | Phase | Décision courante |
| --- | --- | --- | --- | --- |
| D-012 | `superseded` | Navigation et contenus de l'ancien Écosystème | audit de migration W2c-W3 | Les quatre groupes ne sont plus l'architecture cible. Chaque contenu et placement doit être audité avant migration dans Solutions. |
| D-061 | `working` | Contrats v2, routines Process et cinq pilotes | 115 révisions v1 actives ; pilotes v2 non activés | Les fondations v2 et l'unification Process sont conservées. La révision pilote attendue est `d061-v2-pilot-2026-07-30-03`, sans activation ni généralisation par W6.0. |
| D-062 | `superseded` | Prestation marketing et commerciale dans Écosystème | retirée de l'architecture principale | Aucun service Demaa n'est injecté dans Process ou Solutions. L'avenir de `/services` est arbitré séparément. |
| D-063 | `validated` | Newsletter Structure | texte et formulaire actifs | Un même bloc est utilisé sous Ressources, sur la page Académie et sur `/sur-mesure`, jamais dans les cours. Le vocal reste différé. |
| D-064 placement | `superseded` | Emplacement de l'aide à l'organisation | retiré du parcours média | Aucun CTA commercial ou de diagnostic n'est rendu dans Process ou Solutions. Le contact général reste dans le footer. |
| D-064 copie | `superseded` | Texte de l'aide à l'organisation | retiré du parcours média | Le parcours Fillout n'est plus un élément des fiches Système. |
| Académie D-033/D-036 | `validated` | Navigation réciproque et catalogue Académie | publié | La navigation principale contient uniquement `Système métier` et `Académie`. Les contenus pédagogiques restent dans l'Académie. |
| Académie cours 3 à 5 | `deferred` | Drafts éditoriaux et assets non publics | hors release Systèmes | Aucun draft ne devient public sans publication réelle et gate dédié. |
| Vidéos | `deferred` | Production, casting et publication vidéo | chantier ultérieur | Les scripts, voix et assets locaux ne valent pas autorisation de publication. |
| Tiimora D-049 à D-060 | `deferred` | Intégration Demaa-Tiimora et retargeting | backlog distinct | Ce chantier ne doit ni orienter ni ralentir la base Systèmes/Services. |
| Services V1 | `superseded` | Marketplace de sept services | remplacée par les ADR 0004 à 0006 | `/services` publie le catalogue canonique défini par l'ADR 0006, composé dans les Systèmes selon une matrice explicite. |
| Solutions V1 | `validated` | Registre Firebase et interface par système | actif pour la France | Firebase est la source distante autoritaire ; les sections visibles restent conditionnelles à des placements pertinents. |
| D-072 | `validated` | Architecture publique France et retrait legacy | ADR 0003 | `demaa.co` est canonique ; navigation `Système métier / Académie` ; fiches `Process / Solutions / Ressources` ; redirection si un successeur existe, 404 sinon. |
| D-073 | `validated` | Services, Contenus, Académie et Ressources | ADR 0004, tarification et éligibilité Services supersédées par ADR 0006 | `/contenus`, Ressources réordonnées et architecture Services canonique ; l'ADR 0006 prévaut pour le catalogue, les prix et le contact. |
| D-075 | `validated` | Services clés France et contact WhatsApp | ADR 0006 | Six services canoniques, composition métier explicite, prix actuels et demande de contact WhatsApp manuelle. |
| D-076 | `validated` | Générateur de plan d'action, Système et Coaching | ADR 0008, ADR 0009 + contrat produit D-076 | `/` reçoit un grand champ libre ; une génération principale produit Actions, quatre piliers et un `systemId` parmi 115 slugs canoniques ; le Système se change sans IA ; Firebase devient la source persistante après sauvegarde. Coaching propose Sessions et Messages dans la même application. Pricing de la génération ouvert. |
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
- Le worker de livraison W5 est programmé immédiatement après chaque demande,
  avec un cron quotidien de reprise déclaré dans `vercel.json`. Son activation
  distante exige encore la configuration de `CRON_SECRET` et de
  `SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET`, puis validation de la supervision
  des échecs, reprises et files persistées.
- `docs/governance/release-manifest.json` reste une preuve W1 historique. Il ne
  sera régénéré que depuis le candidat exact W7/W8, jamais depuis W6.0.
