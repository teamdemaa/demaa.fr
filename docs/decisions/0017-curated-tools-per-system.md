# ADR 0017 — Sélection éditoriale de dix outils par système métier

- Décision : D-091
- Statut : validée pour cadrage
- Date : 22 août 2026
- Phase : planifiée, non commencée ; aucune mutation de registre ni publication

## Contexte

La section Outils est alimentée par plusieurs sources historiques : le registre
Firebase, son fallback Git, le répertoire canonique des outils, les `toolRefs`
de l'annuaire des 115 métiers et des sélections générées. Cette superposition a
produit une couverture publique trop faible et inégale.

L'audit indépendant du 22 août 2026 confirme :

- 115 systèmes métier publics ;
- 313 placements Logiciels visibles, soit 2,72 par système en moyenne, avec un
  minimum de 1 et un maximum de 5 ;
- 1 042 associations `toolRefs` locales, dont 907 seulement après plafonnement
  à dix par système ; 243 associations validées restent donc à trouver pour
  atteindre la cible de 1 150 ;
- 333 outils dans le répertoire, dont 325 actifs ;
- aucun système n'atteint actuellement dix outils dans le snapshot public ou
  dans le snapshot enrichi ;
- les audits existants vérifient surtout la présence d'au moins un outil et un
  maximum de dix, sans garantir une sélection complète ni sa qualité.

D-068 à D-070 ont posé le contrat de preuve et l'idée d'un pilote. D-091 les
consolide et les supersède comme contrat d'exécution afin d'éviter un programme
concurrent.

## Décision

1. Chaque système métier publié doit présenter exactement dix outils pertinents.
   Le nombre dix est une cible de choix utilisateur, jamais une autorisation à
   compléter une liste avec des associations faibles.
2. Les dix outils doivent faire fonctionner le système métier dans son ensemble
   et couvrir ses besoins et étapes opérationnelles prioritaires. La sélection
   ne doit être ni une accumulation d'outils génériques, ni dix concurrents
   d'une même catégorie. Aucun quota d'ATS, CRM, ERP ou autre famille n'est
   imposé.
3. Les cartes existantes sont conservées sans badge, label éditorial, module
   « Aide au choix » ni nouveau composant d'explication. La qualité vient de la
   sélection, de l'ordre et des contenus existants : nom, catégorie,
   description, usage et limites.
4. Les dix cartes sont simplement classées par pertinence éditoriale pour le
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
   canoniques. Il n'entre jamais dans le quota Outils et ne devient pas un
   annuaire de fournisseurs externes.
9. Les autres sections conservent des règles propres, sans quota artificiel :
   Fournisseurs de 3 à 8 seulement si pertinents ; Financement de 2 à 5 ; Aides
   uniquement plausiblement applicables ; Réseaux de 2 à 5 ; documents et
   ressources sans quota.
10. Le pilote couvre cinq systèmes : agence de recrutement, SaaS, agence web,
    cabinet comptable et bâtiment. Ces cas servent à valider la méthode, jamais
    à créer des règles propres à un secteur. La qualité du pattern doit être
    validée avant la généralisation par lots aux 115 systèmes.
11. L'activation est atomique et distincte de l'audit. Elle exige une Preview,
    la parité Preview/Production, le contrôle du HTML accessible à Google et du
    JSON-LD, puis un GO PROD explicite.

## Contrôles bloquants

L'audit de données devra échouer si un système publié ne respecte pas tous les
points suivants :

- exactement dix placements Logiciels ;
- couverture des besoins prioritaires du métier, sans homogénéité artificielle ;
- aucun doublon et rangs continus ;
- outil et ressource actifs, URL sûre et résoluble ;
- preuve officielle datée et date de prochaine revue ou d'expiration ;
- justification réellement contextualisée au métier ;
- limite ou prérequis réel, sans texte inventé ;
- aucune publication issue d'un simple remplissage de quota.

Les listes de produits utilisées pendant une recherche sont des pools à
expertiser, jamais des listes finales. L'agence de recrutement, par exemple,
doit couvrir ses besoins essentiels avec la combinaison la plus utile ; elle ne
doit pas recevoir automatiquement dix ATS.

## Séquencement

1. Geler un export de toutes les sources et définir leur autorité.
2. Fermer le contrat de preuve et l'audit automatisé, sans mutation.
3. Expertiser les cinq pilotes avec relecture contradictoire.
4. Recetter le read-model sur Preview, sans changer le pointeur actif.
5. Généraliser par lots métier et traiter les cas ambigus manuellement.
6. Vérifier les 115 pages, le HTML et le JSON-LD.
7. Activer une nouvelle révision Firebase atomiquement après GO PROD.
8. Déprécier les sources parallèles seulement après contrôle de parité et
   période de rollback.

## Hors périmètre

- modification visuelle des cartes ;
- module d'aide au choix ou badges éditoriaux ;
- transformation des Services en fournisseurs ;
- règle propre à un secteur ou quota par catégorie d'outil ;
- activation anglaise ;
- import automatique de `toolRefs` ;
- publication d'un registre pendant la phase d'audit.

