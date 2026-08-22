# ADR 0017 — Curation éditoriale des Solutions par système métier

- Décision : D-091
- Statut : validée pour cadrage
- Date : 22 août 2026
- Phase : fondation technique réalisée ; cinq pools de recherche Outils
  préparés ; validation métier, révision Firebase et publication non commencées

## Contexte

La section Outils est alimentée par plusieurs sources historiques : le registre
Firebase, son fallback Git, le répertoire canonique des outils, les `toolRefs`
de l'annuaire des 115 métiers et des sélections générées. Cette superposition a
produit une couverture publique trop faible et inégale.

L'audit indépendant du 22 août 2026 confirme :

- 115 systèmes métier publics ;
- 313 placements Logiciels visibles, soit 2,72 par système en moyenne, avec un
  minimum de 1 et un maximum de 5 ;
- 1 042 associations `toolRefs` locales, très inégalement réparties et jamais
  validées comme un ensemble publiable ; leur volume ne constitue ni une cible
  ni une preuve de pertinence ;
- 333 outils dans le répertoire, dont 325 actifs ;
- les volumes actuels ne mesurent ni la couverture des besoins prioritaires ni
  la qualité de la sélection ;
- l'ancien objectif uniforme de dix outils confondait un volume facile à
  compter avec la valeur réellement apportée au dirigeant.

D-068 à D-070 ont posé le contrat de preuve et l'idée d'un pilote. D-091 les
consolide et les supersède comme contrat d'exécution afin d'éviter un programme
concurrent.

## Décision

1. Chaque système métier publié présente un nombre variable d'outils ayant
   franchi le même seuil de preuve et de pertinence. Aucun minimum ou objectif
   uniforme ne doit conduire à ajouter un outil faible.
2. Les outils retenus doivent faire fonctionner le système métier dans son ensemble
   et couvrir ses besoins et étapes opérationnelles prioritaires. La sélection
   ne doit être ni une accumulation d'outils génériques, ni une liste de
   concurrents d'une même catégorie. Aucun quota d'ATS, CRM, ERP ou autre
   famille n'est imposé.
3. Les cartes existantes sont conservées sans badge, label éditorial, module
   « Aide au choix » ni nouveau composant d'explication. La qualité vient de la
   sélection, de l'ordre et des contenus existants : nom, catégorie,
   description, usage et limites.
4. Les cartes sont simplement classées par pertinence éditoriale pour le
   métier et ses problèmes prioritaires. Un outil généraliste d'appui ne doit
   pas être placé avant un logiciel métier central sans justification réelle.
5. Les 1 042 `toolRefs` constituent un corpus de départ, pas une vérité à
   importer. Chaque association doit être validée avant activation.
6. La vérification s'appuie en priorité sur les sites officiels et documente au
   minimum : cible, taille d'entreprise, disponibilité France, contraintes,
   prix ou intégrations utiles, source et date de revue.
7. Firebase reste la source autoritaire cible des recommandations tierces :
   ressources séparées des placements, rangs, justification, contraintes,
   preuves, dates, révisions immuables et pointeur actif. Les listes parallèles
   ne sont dépréciées qu'après parité vérifiée et rollback documenté.
8. Services reste le catalogue des services Demaa et de ses mises en relation
   canoniques. Il n'entre jamais dans la sélection Outils et ne devient pas un
   annuaire de fournisseurs externes. La séparation est déjà livrée dans
   l'application : la destination Services est distincte et son rail est filtré
   de Solutions. La section Services reste toutefois dans l'API et le DTO
   Système afin d'alimenter les recommandations contextuelles strictes des
   Actions ; elle ne doit pas être supprimée de
   `composeCanonicalServicesForSystem`.
9. Les autres sections conservent des règles propres, sans quota artificiel :
   un Fournisseur, Financement, dispositif d'Aide ou Réseau n'est affiché que
   si son adéquation est prouvée ; une rubrique vide est préférable à un
   fallback générique. Documents et Ressources restent hors quota.
10. Le pilote couvre cinq systèmes : agence de recrutement, SaaS, agence web,
    cabinet comptable et bâtiment. Ces cas servent à valider la méthode, jamais
    à créer des règles propres à un secteur. La qualité du pattern doit être
    validée avant la généralisation par lots aux 115 systèmes.
11. L'activation est atomique et distincte de l'audit. Elle exige une Preview,
    la parité Preview/Production, le contrôle du HTML accessible à Google et du
    JSON-LD, puis un GO PROD explicite.
12. Les pages publiques `/systemes/[slug]` et leur récapitulatif affichent encore
    Services dans Solutions. L'exécution devra les aligner sur la séparation
    déjà livrée dans l'application, sans retirer Services du payload contextuel,
    et vérifier tracking, SEO, JSON-LD et liens vers la destination canonique.
13. Les identifiants de placements déjà persistés dans les plans restent
    stables lorsque le rang éditorial change. Le rang est une propriété de
    présentation, pas l'identité. Tout nouveau placement D-091 reçoit un
    identifiant indépendant du rang et l'audit compare la révision active à la
    candidate.
14. L'enrichissement de la sélection Outils ne modifie pas le contrat des aides
    contextuelles dans les Actions : aucune recommandation générique, une au
    plus par Action et deux recommandations commerciales au plus par plan.
15. Les outils visibles et leurs rangs doivent provenir du même read-model
    publié dans l'API, l'application, les pages publiques et les données
    structurées. Le JSON-LD ne doit ni tronquer arbitrairement la liste à huit,
    ni mélanger Services au classement Outils.

## Contrôles bloquants

L'audit de données devra échouer si un système publié ne respecte pas tous les
points suivants :

- une sélection Logiciels non vide, variable et entièrement validée ;
- définition portée par les placements `software` sélectionnés et destinés au
  public dans la révision Firebase candidate, avec rangs continus de 1 à N ;
- couverture des besoins prioritaires du métier, sans homogénéité artificielle ;
- aucun doublon et rangs continus ;
- outil et ressource actifs, URL sûre et résoluble ;
- preuve officielle datée et date de prochaine revue ou d'expiration ;
- justification réellement contextualisée au métier ;
- limite ou prérequis réel, sans texte inventé ;
- aucune publication issue d'un simple remplissage de quota.
- stabilité des identifiants des placements conservés, indépendamment de leur
  nouveau rang ;
- absence de régression des plafonds et règles d'abstention des aides
  contextuelles dans les Actions.

Le contrôle porte sur les révisions Firebase candidate et active, pas seulement
sur `system-tool-recommendations.ts`. La révision finale ne contient que les
placements ayant franchi le seuil éditorial : les autres candidats restent hors
du registre activable. Avant le GO PROD, la publication Logiciels doit être
fail-closed explicitement — soit tous les placements retenus et leurs ressources
sont `published`, soit la section `software` rejoint les sections soumises au
publication gate. Les anciennes sélections de Services sont conservées ou
nettoyées explicitement afin qu'elles ne produisent pas un état trompeur
« Service déjà sélectionné ».

Les listes de produits utilisées pendant une recherche sont des pools à
expertiser, jamais des listes finales. L'agence de recrutement, par exemple,
doit couvrir ses besoins essentiels avec la combinaison la plus utile ; elle ne
doit pas recevoir automatiquement une liste homogène d'ATS.

## Séquencement

1. Geler un export de toutes les sources et définir leur autorité.
2. Fermer le contrat de preuve et l'audit automatisé fondé sur la couverture
   des besoins, sans mutation.
3. Aligner les pages Système publiques sur la séparation Services déjà livrée
   dans l'application, tout en conservant le payload contextuel.
4. Expertiser les cinq pilotes avec relecture contradictoire.
5. Recetter le read-model sur Preview, sans changer le pointeur actif.
6. Généraliser par lots métier et traiter les cas ambigus manuellement.
7. Vérifier les 115 pages, le HTML et le JSON-LD.
8. Activer une nouvelle révision Firebase atomiquement après GO PROD.
9. Déprécier les sources parallèles seulement après contrôle de parité et
   période de rollback.

Deux gates distincts sont obligatoires :

- `npm run audit:d091:pilot -- <candidate.json> [active-revision.json] [research.json]`
  contrôle les cinq systèmes pilotes à l'intérieur d'une révision candidate
  complète et vérifie que les outils réellement retenus couvrent les besoins
  déclarés dans le manifeste de recherche ; il ne peut jamais déplacer le
  pointeur actif ;
- `npm run audit:d091 -- <candidate.json> <active-revision.json> <research.json>`
  contrôle la révision finale complète des 115 systèmes et
  exige le manifeste métier complet avant toute activation.

Le manifeste historique `pilot-selections.v1.json` conserve l'ancien pool à dix
comme trace. `pilot-selections.v2.json` est la source éditoriale courante : il
relie chaque candidat à un ou plusieurs besoins prioritaires sans fixer de
volume final. Il doit d'abord être relu, puis seuls les candidats retenus sont
transformés en ressources et placements Firebase complets avant le gate pilote.

La révision active reste inchangée tant que les 115 systèmes n'ont pas chacun
une sélection complète au regard de leurs besoins prioritaires. Les cinq pilotes sont consultés via
un read-model candidate/Preview et ne déclenchent aucune activation partielle.
Les ressources outils encore absentes du registre Firebase sont créées et
validées avant leurs placements ; une association ne peut jamais créer
implicitement une ressource.

## Hors périmètre

- modification visuelle des cartes ;
- module d'aide au choix ou badges éditoriaux ;
- transformation des Services en fournisseurs ;
- règle propre à un secteur ou quota par catégorie d'outil ;
- nombre uniforme d'outils ou import destiné à remplir une liste ;
- activation anglaise ;
- import automatique de `toolRefs` ;
- publication d'un registre pendant la phase d'audit.
