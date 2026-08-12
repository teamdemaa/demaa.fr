# ADR 0002 - Registre des décisions actives

- Statut : `validated`
- Date : 31 juillet 2026
- Mise à jour d'état : 12 août 2026, candidat Plan V3 et gouvernance IA

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
| Académie D-033/D-036 | `superseded` | Ancienne navigation réciproque et catalogue Académie | remplacé par D-077 et ADR 0004 | L'ancienne navigation limitée à `Système métier / Académie` ne guide plus l'application. Les contenus restent canoniques ; l'Académie affiche `Cours / Cas concrets` et conserve `Webinaires` masqué jusqu'à publication réelle. |
| Académie cours 3 à 5 | `deferred` | Drafts éditoriaux et assets non publics | hors release Systèmes | Aucun draft ne devient public sans publication réelle et gate dédié. |
| Vidéos | `deferred` | Production, casting et publication vidéo | chantier ultérieur | Les scripts, voix et assets locaux ne valent pas autorisation de publication. |
| Tiimora D-049 à D-060 | `deferred` | Intégration Demaa-Tiimora et retargeting | backlog distinct | Ce chantier ne doit ni orienter ni ralentir la base Systèmes/Services. |
| Services V1 | `superseded` | Marketplace de sept services | remplacée par les ADR 0004 à 0006 | `/services` publie le catalogue canonique défini par l'ADR 0006, composé dans les Systèmes selon une matrice explicite. |
| Solutions V1 | `validated` | Registre Firebase et interface par système | actif pour la France | Firebase est la source distante autoritaire ; les sections visibles restent conditionnelles à des placements pertinents. |
| D-072 | `validated` | Architecture publique France et retrait legacy | ADR 0003, libellé public complété par D-076 | `demaa.co` est canonique ; navigation publique Système métier / Académie ; les fiches conservent le slug technique `process` mais l'affichent comme `Organisation`, puis `Solutions / Ressources` ; redirection si un successeur existe, 404 sinon. |
| D-073 | `validated` | Services, Contenus, Académie et Ressources | ADR 0004, tarification et éligibilité Services supersédées par ADR 0006 | `/contenus`, Ressources réordonnées et architecture Services canonique ; l'ADR 0006 prévaut pour le catalogue, les prix et le contact. |
| D-075 | `validated` | Services clés France et contact WhatsApp | ADR 0006 | Six services canoniques, composition métier explicite, prix actuels et demande de contact WhatsApp manuelle. |
| D-076 | `validated` | Générateur de plan d'action, Système et spécialiste | ADR 0008, ADR 0009 + contrat produit D-076 | La promesse exacte est « Qu’est-ce qui freine votre entreprise ? » Une génération principale produit Actions et un `systemId` parmi 115 slugs canoniques ; la Stratégie est temporairement masquée et non générée, tandis que les anciens plans restent lisibles sans migration destructive. Le Système se change sans IA ; Firebase devient la source persistante après sauvegarde. Les URLs applicatives restaurent et partagent la vue, le Système et le contenu ouvert sans retirer les routes publiques indexables. `Parler à un spécialiste` propose Messages puis Formules : Échanges avec Demaa à 149 EUR HT/mois et une carte Pilotage mensuel avec sélecteur 1 session à 350 EUR ou 2 sessions à 550 EUR HT/mois. Aucun paiement n'est déclenché dans cette version. |
| D-077 | `validated` | Plan vierge, Opportunités, navigation et identité applicatives | ADR 0010 | L’application affiche et rend utilisable `Plan d’action / Système / Académie / Opportunités` dès l'arrivée, conserve Coaching via `Parler à un spécialiste`, permet un plan vierge sans IA et réutilise les sources canoniques Opportunités, Team Demaa et `lead_requests` sans stockage parallèle. Le lien magique établit l'identité e-mail ; la session est ensuite réutilisée sans ressaisie et sans expérience `Mon espace` ou `Mes plans`. |
| D-078 | `deferred` | Comptes possédant plusieurs entreprises | backlog post-lancement | Prévoir une identité `accountId`, des entreprises isolées côté serveur, des plans et progressions rattachés à une entreprise et une migration non destructive de `owner_email`. Le profil entreprise reste facultatif et aucun rôle ou système d'invitation n'est inclus. |
| D-079 | `working` | Plan V4, multi-plans, multi-systèmes, dictée et mesure IA | candidat local, ADR 0011 | V4 génère uniquement Actions + `systemId`, conserve les supports typés déterministes et lit V1/V2/V3/manual sans migration destructive. La Stratégie V3 reste isolée, masquée et non transmise par la commande courante. Une identité peut gérer plusieurs plans et chaque plan plusieurs Systèmes. Le microphone est centralisé. Le ledger conserve uniquement des métriques sans contenu. L'envoi de la commande et des actions visibles à Vercel AI Gateway reste autorisé ; notes, identité, situation source, historique et données Système restent exclus. |
| D-080 | `working` | Identité progressive Google et lien magique | candidat local à configurer | La session Demaa et l'e-mail vérifié restent canoniques. Google via Firebase Auth est une option plus directe, masquée tant que sa configuration publique, son fournisseur et ses domaines autorisés ne sont pas prêts. Le lien magique reste le repli universel ; aucun second compte, mot de passe ou portail parallèle n'est créé. |
| D-081 | `working` | Application installable PWA sans stockage hors ligne | candidat local | Demaa expose un manifeste et des icônes installables, avec thème blanc et shell `standalone`. Aucun service worker, cache d'API, copie locale de plan ou modification hors ligne n'est ajouté ; Firebase reste l'unique source persistante après sauvegarde. |
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
