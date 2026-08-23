# Handover — The Done Studio, générateur de projet

**Date :** 22 août 2026

**Statut historique au 22 août :** PAUSE — aucun démarrage sans GO explicite.

**Mise à jour au 23 août 2026 :** GO reçu et implémentation réalisée dans le
dépôt autonome The Done Studio. Sa Production est au commit `5275ecd`. Le
présent document reste la trace du passage de relais initial ; il ne constitue
plus une instruction de démarrage et n'autorise toujours aucun partage de
stockage, compte ou runtime avec Demaa.

**Projet source audité :** Demaa

**Référence source :** `origin/main` au commit `dbb8b723`

**Projet cible :** The Done Studio, dépôt autonome désormais audité et déployé

## 1. Objet du passage de relais

The Done Studio doit pouvoir reprendre les briques fiables construites dans
Demaa sans copier le produit Demaa ni reconstruire inutilement son moteur de
génération.

La cible produit est un parcours durable de construction de projet :

```text
Quel est votre projet ?
→ Stratégie proposée et expliquée
→ Plan d’action cohérent avec cette stratégie
→ Hypothèses et modèle économique renseignés par la personne
→ Repères de marché sourcés, dans un lot ultérieur
```

La Stratégie et le Plan d’action sont générés ensemble. Les montants financiers
ne sont jamais inventés par l’IA.

## 2. Règles canoniques déjà décidées

1. Le premier champ porte sur le projet ou l’idée, pas sur ce qui prend du
   temps dans l’entreprise.
2. Un seul appel IA produit une stratégie et un plan d’action cohérents.
3. La stratégie doit expliquer ses choix et distinguer les faits fournis, les
   hypothèses et les points à valider.
4. Le plan d’action découle de la stratégie ; il ne doit pas former une seconde
   proposition indépendante.
5. L’IA ne génère aucun chiffre d’affaires, coût, prix, volume client ou besoin
   de financement présenté comme une prévision fiable.
6. La personne renseigne ses hypothèses financières ; le logiciel effectue les
   calculs déterministes.
7. Les informations de marché ne sont publiées comme faits que si elles ont une
   source, une date, une géographie et un niveau de confiance.
8. La recherche de marché n’appartient pas au premier appel de génération. Elle
   constitue une action séparée, plus lente et potentiellement plus coûteuse.
9. Ne pas partager les collections Firestore de Demaa avec The Done Studio.
10. Ne pas importer les entreprises, membres, plans, chiffres ou cycles de
    Stratégie de Demaa sans décision de migration et consentement explicites.
11. Ne pas démarrer le code avant le GO d’Oumou et l’audit du dépôt cible.

## 3. V1 la plus simple

### 3.1 Entrée

Question principale :

> Quel est votre projet ?

La saisie libre peut préciser, sans rendre tous les champs obligatoires :

- le problème observé ;
- les clients envisagés ;
- l’offre ou la solution imaginée ;
- l’expérience du porteur de projet ;
- les ressources et contraintes ;
- le stade d’avancement.

### 3.2 Sortie générée

Contrat logique recommandé :

```ts
type ProjectBlueprint = {
  schemaVersion: 1;
  projectSummary: string;
  strategy: {
    targetCustomer: string;
    customerProblem: string;
    valueProposition: string;
    offer: string;
    businessModel: string;
    goToMarket: string;
    founderFitAndConstraints: string;
    risks: string[];
    assumptionsToValidate: string[];
  };
  actionPlan: ActionPlan;
};
```

Le nom et la structure définitive doivent être adaptés aux conventions du
projet cible après audit. `ActionPlan` peut réutiliser le contrat métier Demaa
si celui-ci reste pertinent, mais le contrat `ProjectBlueprint` ne doit pas
être ajouté au produit Demaa.

### 3.3 Interface V1

Quatre espaces suffisent :

1. Projet ;
2. Stratégie ;
3. Plan d’action ;
4. Modèle économique.

Ne pas ajouter dans la première V1 : annuaire d’outils, services Demaa,
Academy, Opportunités, chat, recommandations commerciales ou tableau de marché
complexe.

### 3.4 Modèle économique

La personne saisit au minimum :

- prix ou panier moyen ;
- nombre de clients ou ventes envisagé ;
- coûts variables ;
- charges fixes ;
- investissement initial ;
- trésorerie disponible.

Le moteur calcule sans IA :

- chiffre d’affaires projeté ;
- marge ;
- résultat ;
- seuil de rentabilité ;
- besoin de trésorerie ;
- durée de trésorerie disponible lorsque le calcul est possible.

Le produit doit afficher clairement qu’il s’agit d’hypothèses de travail, pas
d’un prévisionnel comptable officiel.

## 4. Repères de marché — lot ultérieur

Avant de construire une recherche externe, la V1 peut seulement afficher les
`assumptionsToValidate` produites avec la stratégie.

Un futur bouton « Rechercher des repères de marché » pourra produire :

- tendances observées ;
- acteurs et alternatives existants ;
- fourchettes de prix publiquement vérifiables ;
- comportements ou contraintes du marché ;
- signaux réglementaires pertinents.

Chaque repère doit conserver :

```ts
type MarketEvidence = {
  claim: string;
  sourceUrl: string;
  sourceTitle: string;
  publishedOrReviewedAt: string;
  geography: string | null;
  confidence: "low" | "medium" | "high";
};
```

Aucun TAM, chiffre sectoriel, prix ou concurrent ne doit être inventé ou
présenté sans source.

## 5. Briques Demaa réutilisables

### 5.1 Orchestration de génération

- `src/app/api/action-plans/generate/route.ts`
- `src/lib/action-plan-generation-execution.server.ts`
- `src/lib/action-plan-storage.server.ts`
- `src/lib/action-plan-generation-draft.client.ts`

À reprendre comme principes :

- identifiant de requête stable ;
- validation stricte de l’entrée ;
- statuts `generating`, `active`, `failed` ;
- idempotence ;
- lease de génération ;
- reprise après interruption ;
- nombre de tentatives borné ;
- journal d’usage IA ;
- validation et réparation du résultat ;
- persistance du résultat avant redirection.

Ne pas copier les dépendances Demaa à l’UID, à l’entreprise par défaut, aux
appartenances ou aux collections `action_plans`.

### 5.2 Contrat et rendu du plan

- `src/lib/action-plan-contract.ts`
- `src/components/ActionPlanExperience.tsx`
- composants d’actions utilisés par le plan sauvegardé ;
- tests de qualité et de réparation du plan.

Réutiliser le contrat et les composants à la granularité utile. Ne pas copier
le shell Demaa, la navigation Services/Academy/Opportunités, ni les
recommandations contextuelles commerciales.

### 5.3 Sauvegarde et concurrence

- `src/lib/action-plan-save-queue.client.ts`
- expected revision ;
- requêtes sérialisées ;
- flush réellement awaitable ;
- conservation du brouillon en cas d’échec ;
- absence de retry aveugle sur conflit.

### 5.4 Stratégie

- `src/components/CompanyStrategyPanel.tsx`
- `src/components/CompanyStrategyPillar.tsx`
- `src/components/CompanyStrategyHistory.tsx`
- `src/components/CompanyStrategyCycleDialog.tsx`
- `src/lib/company-pilotage-contract.ts`
- `src/lib/company-strategy.server.ts`

Réutilisable : accordéons, champs, limites, autosauvegarde, révisions,
conflits, historique et accessibilité.

À remplacer : questions centrées sur une entreprise existante, cycles
trimestriels obligatoires, stockage par entreprise Demaa et initialisation
entièrement manuelle. The Done Studio reçoit d’abord une stratégie générée à
partir du projet, que la personne valide et modifie.

### 5.5 Chiffres

- `src/components/CompanyFiguresPanel.tsx`
- `src/components/CompanyMetricEntryDialog.tsx`
- fonctions pures de `src/lib/company-pilotage-contract.ts`
- `src/lib/company-metrics.server.ts`

Réutilisable : saisie monétaire, formats, calculs simples, graphique,
validation, révisions et accessibilité.

À remplacer : modèle limité aux CA, charges et trésorerie réellement constatés,
devise EUR imposée, calendrier Europe/Paris et propriété par entreprise Demaa.
Le modèle cible porte sur des hypothèses et leurs scénarios.

## 6. Ce qu’il ne faut pas copier

- Firebase Authentication et le cookie client de Demaa sans audit ;
- la création automatique d’une entreprise et d’une appartenance ;
- les collections Firestore de Demaa ;
- les routes `/plans` de Demaa ;
- `CompanyPilotagePanel` comme shell complet ;
- la navigation et les textes Demaa ;
- les quatre piliers actuels sans revalidation produit ;
- les prix, services, outils et règles de marché Demaa ;
- les données Chiffres/Stratégie existantes ;
- un prompt géant comportant des conditions par produit.

## 7. Architecture technique recommandée

Réutiliser l’orchestration, pas le produit source :

```text
Projet The Done Studio
├── contrat ProjectBlueprint
├── prompt et validation propres
├── stockage project-scoped
├── interface propre
└── moteur de génération durable
    ├── request id
    ├── idempotence
    ├── lease/reprise
    ├── validation/réparation
    └── journal d’usage
```

Si les deux dépôts doivent réellement maintenir le moteur ensemble, extraire
ultérieurement un petit package interne limité aux primitives de génération.
Ne pas créer ce package avant d’avoir comparé les stacks et versions des deux
projets. Si Demaa cesse définitivement d’utiliser les modules transférés, un
transplant documenté avec leurs tests est plus simple qu’une dépendance commune
permanente.

## 8. Identité et persistance dans The Done Studio

The Done Studio doit conserver une identité durable si la personne revient
mettre à jour son projet et ses chiffres. Ne pas appliquer automatiquement le
modèle public sans compte retenu pour Demaa.

Options à évaluer après audit du dépôt cible :

1. identité déjà présente dans The Done Studio ;
2. lien magique par e-mail ;
3. Firebase séparé avec comptes propres au projet.

Ne pas partager une entreprise technique Demaa entre les deux produits.

## 9. Ordre d’exécution après GO

### Lot 0 — Audit cible, sans code

- confirmer le dépôt et la branche de référence ;
- lire les règles du projet et la documentation du framework installé ;
- inventorier auth, base, design system, e-mail, IA et tests ;
- comparer les versions avec Demaa ;
- présenter les collisions et le plan final.

### Lot 1 — Contrats et génération durable

- `ProjectBlueprint` ;
- schémas d’entrée et de sortie ;
- prompt spécifique ;
- job durable, idempotence, reprise et journal IA ;
- tests serveur.

### Lot 2 — Expérience Projet, Stratégie et Plan

- saisie du projet ;
- écran de génération ;
- rendu de la stratégie ;
- rendu du plan d’action ;
- édition, sauvegarde et reprise ;
- cohérence entre stratégie et actions.

### Lot 3 — Modèle économique manuel

- hypothèses ;
- calculs déterministes ;
- scénarios éventuels ;
- graphique et accessibilité ;
- aucune valeur financière inventée par l’IA.

### Lot 4 — Repères de marché, séparé

- recherche sourcée ;
- preuves, dates, géographie et confiance ;
- cache et coûts bornés ;
- aucune activation sans recette éditoriale.

### Lot 5 — Recette

- interruptions et reprises ;
- cohérence stratégie/plan ;
- conflits de sauvegarde ;
- calculs financiers ;
- mobile, clavier et lecteur d’écran ;
- confidentialité et suppression ;
- Preview ;
- GO Production séparé.

## 10. Gates avant toute implémentation

> Mise à jour du 23 août 2026 : ces gates appartiennent au cadrage initial.
> Le GO, le dépôt, la branche et l'implémentation autonome ont depuis été
> fournis. The Done Studio est déployé indépendamment au commit `5275ecd`.
> Toute nouvelle évolution doit suivre les décisions du dépôt The Done Studio,
> sans réouvrir automatiquement les choix historiques ci-dessous.

Le chantier reste bloqué tant que les éléments suivants ne sont pas fournis ou
validés :

- GO explicite d’Oumou ;
- chemin ou URL du dépôt The Done Studio ;
- branche de référence ;
- décision d’identité ;
- décision de stockage ;
- devise et marchés initiaux ;
- périmètre exact de la V1 ;
- validation du contrat `ProjectBlueprint` ;
- règles de conservation et suppression.

## 11. Définition de fini de la V1

- une personne décrit son projet ;
- une seule génération crée stratégie et plan cohérents ;
- les hypothèses sont identifiées comme telles ;
- aucune valeur financière n’est inventée ;
- la stratégie et le plan sont éditables et retrouvables ;
- le modèle économique calcule uniquement à partir des saisies ;
- interruptions, doublons et conflits sont gérés ;
- aucun code ou stockage Demaa n’est couplé au produit cible ;
- tests et Preview sont verts ;
- aucun déploiement sans GO Production.
