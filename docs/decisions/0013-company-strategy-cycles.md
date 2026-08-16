# ADR 0013 — Pilotage d'entreprise : Chiffres et Stratégie par cycles

- Statut : `validated`
- Date : 2026-08-16
- Décision produit : D-084
- Complète : ADR 0008, ADR 0011 et ADR 0012

## Frontière de la décision

Le `Pilotage d'entreprise` réunit deux espaces rattachés à l'entreprise :
`Chiffres` pour le suivi mensuel et la nouvelle `Stratégie` manuelle par
cycles. Aucun des deux n'est stocké dans un plan. La nouvelle Stratégie ne
réactive pas la Stratégie historique des plans V3.

- `Plan d'action` reste limité aux Actions et à l'IA courante ;
- `Stratégie` est commune aux membres autorisés de l'entreprise ;
- un cycle est actif et les anciens cycles sont consultables en lecture seule ;
- aucune synchronisation automatique n'existe entre Plan d'action et
  Stratégie ;
- aucune réponse stratégique historique n'est migrée, affichée, copiée ou
  utilisée pour initialiser un cycle ;
- aucune donnée de Stratégie n'est envoyée à l'IA, aux prompts, aux commandes
  d'édition ou aux logs IA.

La navigation principale reste celle de D-082 : `Plan d'action`, `Solutions`,
`Académie`, `Opportunités`. Après la sauvegarde effective d'un plan généré ou
vierge, la vue Plan expose une sous-navigation commune : `Plan d'action`,
`Chiffres`, `Stratégie`. Elle n'apparaît jamais sur le formulaire public
initial. Changer ou supprimer un plan ne change ni ne supprime les données de
Pilotage de l'entreprise.

Le contexte URL accepte uniquement `section=actions|figures|strategy` lorsque
`view=plan`. L'absence de section ouvre `actions`; une section est ignorée hors
de la vue Plan et les paramètres incompatibles sont nettoyés. Un composant
propriétaire commun doit être réutilisé par l'expérience de génération et celle
des plans sauvegardés afin d'éviter toute duplication.

`action-plan-app-context.ts` expose un type fermé
`ActionPlanSection = "actions" | "figures" | "strategy"` et une valeur
`planSection`. Les panneaux et sélecteurs locaux ne sont pas dupliqués entre
`ActionPlanExperience.tsx` et `SavedActionPlanDetail.tsx`.

Le lecteur de compatibilité V1/V2/V3 peut continuer à accepter silencieusement
les anciens champs afin de ne pas casser les documents existants. Ces champs
ne sont ni rendus ni édités. Leur suppression physique exige un audit Firebase
et une autorisation séparée.

Le fonctionnement courant retire notamment `getActionPlanStrategyFields`, les
types de rendu historiques, `strategyOverrides` des nouveaux workspaces, la
Stratégie vide des nouveaux plans manuels, les contrôles Stratégie de
`isBlankManualActionPlan` et `strategyPillar` des nouvelles actions et
commandes. Les tests qui créent encore ces champs sont adaptés sans rendre
illisibles les documents V1/V2/V3 existants.

## Contrat fonctionnel validé — Chiffres

Les données mensuelles utilisent la collection `company_monthly_metrics`, avec
un document par entreprise et par période `YYYY-MM`. Chaque document contient
`schema_version: "1"`, `company_id`, `period`, `revenue_cents`,
`expenses_cents`, `cash_balance_cents`, `currency: "EUR"`, `revision`,
`created_by_uid`, `updated_by_uid`, `created_at` et `updated_at`. Les montants
sont stockés en centimes entiers : chiffre
d'affaires et charges sont nuls ou positifs ; la trésorerie peut être négative.
Le résultat de pilotage est dérivé (`CA - charges`) et n'est jamais stocké. Il
est présenté comme un indicateur de pilotage, pas comme un résultat comptable
officiel. Le volume et son unité restent hors V1.

Les lectures sont bornées par période et les mutations portent sur un mois.
Session Demaa, entreprise active et appartenance sont résolues côté serveur ;
aucun `companyId` du navigateur n'est accepté. Le format de période, les bornes,
les montants et `expectedRevision` sont validés, sans accès inter-entreprises.

Un sélecteur unique pilote récapitulatif et graphique : `Ce mois`, `3 mois`,
`6 mois`, `12 mois`, `Période…`, avec bornes mensuelles inclusives. Le
récapitulatif montre CA cumulé, charges cumulées, résultat cumulé et dernière
trésorerie renseignée — jamais une somme de trésoreries. Un mois incomplet
affiche `—` lorsque le calcul n'est pas fiable et le nombre de mois renseignés
sur la période. Une période d'un mois ne produit pas de fausse courbe.

Les comparaisons sont `CA / Charges`, `CA / Trésorerie` et
`Résultat / Trésorerie`. Le détail mensuel est accessible au survol, au toucher
et au clavier, sans débordement mobile. La saisie mensuelle est explicite, sans
autosauvegarde : mois, CA, charges, trésorerie et action `Ajouter` ou
`Mettre à jour`, avec préremplissage des valeurs existantes.

L'implémentation crée au minimum `CompanyFiguresPanel.tsx` et
`CompanyMetricEntryDialog.tsx`. Le contrat HTTP prévu expose une lecture bornée
`GET /api/company/pilotage/metrics?from=YYYY-MM&to=YYYY-MM` et une mutation
mensuelle `PUT /api/company/pilotage/metrics/[period]`. Une adaptation aux
conventions exactes de Next.js 16 est permise seulement si elle conserve les
mêmes validations, autorisations et garanties métier.

La couche métier comprend `src/lib/company-pilotage-contract.ts`,
`src/lib/company-metrics.server.ts` et `src/lib/company-strategy.server.ts`.
Les agrégations financières vivent dans une fonction pure et testable, jamais
dans les composants React.

## Contrat fonctionnel validé — Stratégie

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
- l'implémentation crée `CompanyStrategyPanel.tsx`,
  `CompanyStrategyPillar.tsx`, `CompanyStrategyHistory.tsx` et
  `CompanyStrategyCycleDialog.tsx` ;
- les lectures et mutations authentifiées dédiées utilisent le préfixe
  `/api/company/pilotage/strategy` lorsqu'elles sont exposées en HTTP ; elles
  couvrent initialisation idempotente, modification avec `expectedRevision`,
  nouveau cycle atomique et historique paginé, sans `companyId` client ;
- l'en-tête présente `Stratégie` avec `Nouveau cycle`, puis le cycle actif avec
  `Historique des cycles` ;
- un seul trait suit la ligne du cycle et un séparateur apparaît seulement
  entre les piliers ; aucun trait ne traverse du texte ;
- sur mobile, `Nouveau cycle` peut devenir `+` avec un nom accessible, les
  cadrages reviennent naturellement sur deux lignes et les questions ne sont
  pas rapetissées.

## Contraintes minimales d'architecture

Le contrat détaillé, le stockage, les handlers et l'implémentation appartiennent
à la tâche unique `Vérifier la stratégie et le backlog`. Le chantier Pilotage
devra au minimum garantir :

- une résolution unique de l'entreprise et de l'appartenance côté serveur ;
- un stockage mensuel Chiffres distinct du stockage des cycles Stratégie ;
- une suppression d'entreprise qui nettoie les deux domaines ;
- l'absence totale de Chiffres et Stratégie dans le périmètre IA ;
- une autorisation fondée sur l'entreprise et une appartenance active ;
- un cycle actif et un historique borné ou paginé en lecture seule ;
- une sauvegarde automatique sérialisée avec révision attendue ;
- une résolution explicite des conflits, sans retraitement aveugle d'un `409` ;
- la conservation locale du brouillon et une action `Réessayer` après échec ;
- l'annonce accessible des sauvegardes sans statut `Enregistré` affiché
  durablement ;
- l'archivage de l'ancien cycle et l'activation du nouveau dans une seule
  opération atomique ;
- le refus serveur de toute modification d'un cycle archivé ;
- l'absence totale de données Stratégie dans le périmètre IA.

La matrice de tests couvre explicitement session absente, appartenance inactive,
autre entreprise refusée, rejet d'un `company_id` client, création et mise à
jour d'un mois, conflit de révision, mutation d'un seul pilier et validation des
douze réponses Stratégie.

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

Cette ADR seule ne constituait pas une livraison. Son implémentation complète a
ensuite été fusionnée par la PR 116 au commit `8aa1cab`, avec stockage, API,
interface, maintenance, confidentialité et tests réunis dans la même unité
publiable.

## Décisions consolidées

La décision antérieure de créer `/strategie` comme cinquième destination
principale est supersédée : elle avait été prise sans le périmètre Chiffres.
D-082 reste la navigation principale en Production comme dans la cible. Le
Pilotage est une sous-navigation de la vue Plan et n'existe qu'après sauvegarde
d'un plan. Le programme retient aussi un premier cycle Stratégie créé
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
`Vérifier la stratégie et le backlog` a livré l'architecture et
l'implémentation complètes de Chiffres et Stratégie dans la PR 116. Les gates
serveur, interface, concurrence, suppression, desktop, mobile et PWA ont été
franchis avant la promotion Production. Aucune seconde implémentation
concurrente ne doit être créée.
