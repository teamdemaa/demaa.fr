# ADR 0013 — Stratégie d'entreprise par cycles

- Statut : `working`
- Date : 2026-08-16
- Décision produit : D-084
- Complète : ADR 0008, ADR 0011 et ADR 0012

## Frontière de la décision

La nouvelle `Stratégie` est un espace manuel rattaché à l'entreprise. Elle ne
réactive pas la Stratégie historique des plans V3 et ne fait pas partie du
Plan d'action.

- `Plan d'action` reste limité aux Actions et à l'IA courante ;
- `Stratégie` est commune aux membres autorisés de l'entreprise ;
- un cycle est actif et les anciens cycles sont consultables en lecture seule ;
- aucune synchronisation automatique n'existe entre Plan d'action et
  Stratégie ;
- aucune réponse stratégique historique n'est migrée, affichée, copiée ou
  utilisée pour initialiser un cycle ;
- aucune donnée de Stratégie n'est envoyée à l'IA, aux prompts, aux commandes
  d'édition ou aux logs IA.

Le lecteur de compatibilité V1/V2/V3 peut continuer à accepter silencieusement
les anciens champs afin de ne pas casser les documents existants. Ces champs
ne sont ni rendus ni édités. Leur suppression physique exige un audit Firebase
et une autorisation séparée.

## Contrat fonctionnel validé

Chaque cycle contient quatre piliers, avec trois réponses manuelles par pilier.
Chaque réponse est limitée à environ 500 caractères.

### Alignement

`Vos ambitions, vos forces et votre rôle.`

1. Qu'est-ce que vous voulez que cette entreprise vous apporte ?
2. Qu'est-ce que vous faites particulièrement bien, et comment le savez-vous ?
3. Qu'est-ce que vous voulez continuer à faire vous-même, et qu'est-ce qui
   doit fonctionner sans vous ?

Exemples réservés aux champs vides : `revenu, liberté, stabilité, impact,
équipe` pour la première réponse, `résultats obtenus, retours reçus, demandes
récurrentes` pour la deuxième et `décisions, relation client, production,
management, délégation` pour la troisième. Ces exemples ne deviennent jamais
des valeurs enregistrées.

### Positionnement

`Pour qui et avec quel angle ?`

1. Qui voulez-vous servir en priorité ?
2. Quel problème important résolvez-vous pour eux ?
3. Qu'est-ce qui distingue votre manière de résoudre ce problème ?

### Offre

`Quel résultat est vendu et comment gagne-t-on de l'argent ?`

1. Quel résultat concret le client vient-il chercher ?
2. Que comprend exactement l'offre ?
3. À quel prix et comment est-elle facturée ?

La troisième réponse peut réunir le prix et le mode de facturation : abonnement,
forfait, journée, commission ou autre.

### Promotion

`Comment attirer, convertir et fidéliser ?`

1. Comment les bons clients vous découvrent-ils ?
2. Qu'est-ce qui les aide à passer à l'achat ?
3. Comment entretenez-vous la relation pour favoriser le réachat et la
   recommandation ?

## Hiérarchie d'interface validée

- quatre plis uniquement, avec exactement un pli ouvert à tout moment ;
- `Alignement` est ouvert par défaut ; cliquer sur un autre pilier transfère
  l'ouverture et cliquer sur le pilier actif ne ferme pas tous les plis ;
- un pli fermé montre le nom et sa phrase de cadrage ; un pli ouvert conserve
  ces éléments puis montre les trois questions ;
- le nom est vert Demaa et de graisse moyenne ; le cadrage reste plus petit,
  gris secondaire et de graisse normale ;
- les questions sont foncées et de graisse moyenne ; les réponses sont de
  graisse normale ;
- questions et champs sont alignés à gauche, avec environ 18 à 20 px entre le
  cadrage et la première question ;
- une réponse ne devient jamais un titre ou un résumé ;
- aucune carte imbriquée, modale d'édition ou paire permanente
  `Annuler / Enregistrer` ;
- l'en-tête présente `Stratégie` avec `Nouveau cycle`, puis le cycle actif avec
  `Historique des cycles` ;
- un seul trait suit la ligne du cycle et un séparateur apparaît seulement
  entre les piliers ; aucun trait ne traverse du texte ;
- sur mobile, `Nouveau cycle` peut devenir `+` avec un nom accessible, les
  cadrages reviennent naturellement sur deux lignes et les questions ne sont
  pas rapetissées.

## Contraintes minimales d'architecture

Le contrat détaillé, le stockage, les handlers et l'implémentation appartiennent
à la tâche unique `Vérifier la stratégie et le backlog`. Le chantier devra au
minimum garantir :

- une autorisation fondée sur l'entreprise et une appartenance active ;
- un cycle actif et un historique borné ou paginé en lecture seule ;
- une sauvegarde automatique sérialisée avec révision attendue ;
- une résolution explicite des conflits, sans retraitement aveugle d'un `409` ;
- la conservation locale du brouillon et une action `Réessayer` après échec ;
- l'archivage de l'ancien cycle et l'activation du nouveau dans une seule
  opération atomique ;
- le refus serveur de toute modification d'un cycle archivé ;
- l'absence totale de données Stratégie dans le périmètre IA.

Les cycles archivés sont conservés tant que l'entreprise existe. Aucun TTL ou
nettoyage automatique fondé sur l'âge du cycle n'est autorisé. L'historique est
paginé par 10.

La résolution de concurrence conserve la base, la version locale et la version
serveur. Les réponses modifiées de part et d'autre sur des champs différents
sont fusionnées automatiquement. Si la même réponse diverge, le brouillon local
reste intact et un conflit inline propose `Garder ma version` ou
`Utiliser la version récente`. Garder la version locale la renvoie explicitement
contre la dernière révision serveur ; aucun retry aveugle n'est permis. Le
conflit et sa résolution sont annoncés de façon accessible.

La Stratégie appartient à l'entreprise. Déconnexion, départ ou suppression du
compte d'un membre ne suppriment pas les cycles. La suppression effective de
l'entreprise supprime la racine Stratégie et ses cycles via le workflow de
maintenance ; si la suppression du seul propriétaire entraîne celle de
l'entreprise, ce même workflow réalise le nettoyage. La politique de
confidentialité doit être alignée.

Aucun code, stockage, API, composant ou test de cette fonctionnalité n'est
considéré livré par la présente ADR.

## Décisions consolidées

Le programme directeur retient la route `/strategie`, immédiatement après
`Plan d'action` dans la navigation cible. D-082 reste la navigation Production
jusqu'à la fusion complète du lot. Il retient aussi un premier cycle créé
automatiquement par une commande idempotente, un nouveau cycle vide et un
historique en lecture seule paginé par 10.

La période est une fenêtre de trois mois calendaires : mois civil contenant la
création en `Europe/Paris`, puis les deux mois suivants. `startMonth` et
`endMonth` sont stockés en `YYYY-MM`, `createdAt` en UTC et les libellés sont
rendus en français. La fenêtre n'expire jamais le cycle : il reste actif
jusqu'à la création manuelle du suivant. Plusieurs cycles dans un même mois
sont autorisés et distingués par leur date de création. Aucun cron ou rollover
automatique n'est créé.

Les décisions produit sont fermées. L'implémentation doit appliquer le
comportement d'accordéon, le dernier exemple Alignement, la rétention liée à
l'entreprise, la résolution inline des conflits et le workflow de suppression
décrits ci-dessus. L'alignement de la politique de confidentialité fait partie
du lot D-084, pas d'un arbitrage produit restant.

## Coordination

`MASTER DEMAA` conserve cette décision, le backlog et le registre. La tâche
`Vérifier la stratégie et le backlog` possède seule l'architecture détaillée,
la branche et l'implémentation du stockage jusqu'à la recette. Aucune seconde
implémentation ne doit être commencée en parallèle. La fonctionnalité ne peut
être marquée `livrée` qu'après implémentation, recette et décision de promotion.
