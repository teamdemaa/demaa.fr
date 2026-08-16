# Programme directeur Demaa — stabilisation et Pilotage d'entreprise

- Statut : `working`
- Date : 2026-08-16
- Pilote produit et release : `MASTER DEMAA`
- Branche Production : `main`
- Base de référence avant changements locaux : `2e5cac0`

## Objectif

MASTER DEMAA pilote les priorités, dépendances, responsabilités, branches,
gates, backlog et releases. Les lots techniques restent isolés, réversibles et
portés par une seule branche et une seule PR chacun. La tâche
`Vérifier la stratégie et le backlog` possède seule l'exécution technique de
D-084 Pilotage d'entreprise : Chiffres et Stratégie.

Ce programme n'autorise aucun changement runtime par lui-même. Chaque lot
runtime exige un GO explicite d'Oumou et l'attribution de son workstream.

## État local à préserver

| Unité | État | Lot propriétaire |
| --- | --- | --- |
| Documentation D-084 | locale, non stagée | Lot 0, unité documentaire dédiée |
| Suppression de « Dictée en cours… » et test | locale, indépendante | Lot 5 ou micro-PR dédiée |
| Runtime Plans | aucun changement local attribué au programme | Lot 1 après GO |

Ces unités ne doivent jamais être placées dans le même commit. Tant qu'elles
coexistent dans le checkout partagé sans branches ou worktrees dédiés, le gate
du Lot 0 n'est pas franchi.

## Politique de branches, PR et Production

Chaque lot possède une branche et une PR distinctes. Aucun fichier ne doit être
modifié simultanément par deux workstreams sans ordre de rebase annoncé par
MASTER.

`main` déclenche automatiquement la Production Vercel. Chaque PR fusionnée doit
donc être autonome, production-ready et compatible avec les données déjà
présentes. Les lots indépendants Plans, Administration, Consentement et
Échanger peuvent être fusionnés séparément après leur gate propre ; ils n'ont
pas à attendre une release globale.

Les sous-lots Pilotage 3A à 3D sont des étapes internes d'une même branche et
d'une même PR. La fondation 3A ne doit pas être fusionnée seule si elle laisse
un stockage, une API ou un contrat incomplet ou inutilisé. D-084 est fusionné
uniquement lorsque fondation, interface, compatibilité, tests et E2E sont
ensemble publiables. Titre IA reste une PR ultérieure autonome.

## Ordre canonique

```text
Lot 0 → Lot 1 → Lot 3 Pilotage complet → Lot 6
          └────→ Lot 7
Lot 0 → Lot 2
Lot 0 → Lot 4
Lot 0 → Lot 5
Chaque vague → Lot 8
```

La tâche Pilotage ne commence pas l'implémentation avant le gate du Lot 1.

## Lots

### Lot 0 — Assainissement et gouvernance — bloquant

Responsable : MASTER DEMAA.

- isoler les changements locaux existants ;
- préparer une unité documentaire D-084 séparée ;
- attribuer la modification Dictée au Lot 5 ou à une micro-PR ;
- figer les responsables, branches, dépendances et gates ;
- attendre la validation du programme avant de resynchroniser le Google Sheet.

Gate : chaque modification est attribuée et isolée ; aucun commit ou PR ne
mélange documentation D-084, Dictée et runtime Plans.

### Lot 1 — Fiabilité Plans — P0

Responsable : workstream Plans désigné par MASTER.

Développer uniquement les écarts réels :

- CTA unique lorsque l'index est vide ;
- `Retour à mes plans` conditionnel sur `/plans/new` ;
- ordre cohérent du menu ;
- fermeture immédiate, état `Ouverture…` et doubles clics bloqués ;
- file d'autosauvegarde réellement drainée et attendue avant navigation ;
- navigation bloquée après échec de sauvegarde ;
- aucun retry aveugle d'un conflit `409` ;
- préchargement des routes cibles ;
- entreprise et appartenance résolues une fois ;
- plan et index compact chargés en parallèle ;
- index incluant `active`, `generating` et `failed` selon le contrat ;
- `loading.tsx` et vrais tests d'interaction/E2E sans perte.

Gate : sauvegarde lente, sauvegarde en attente, échec réseau, conflit `409`,
changements successifs, retour arrière, mobile et PWA validés.

### Lot 2 — Sécurité administration — P0

Responsable : MASTER ou workstream explicitement désigné.

- limiter GET et POST avant la comparaison du secret ;
- décider explicitement entre une clé commune nommée ou des clés séparées ;
- supprimer tout fallback silencieux ;
- documenter accès, rotation et révocation ;
- tester secret absent, invalide, trop court, limitation et non-cache.

Ce lot peut avancer après le Lot 0 dans une branche ou un worktree séparé.

### Lot 3 — Pilotage d'entreprise : Chiffres + Stratégie — D-084

Responsable exclusif : tâche `Vérifier la stratégie et le backlog`. Une seule
branche et une seule PR complète sont publiées. Chiffres avait été omis lors
d'une consolidation intermédiaire ; son périmètre est restauré et la décision
top-level `/strategie` est supersédée.

#### 3A — Socle commun Pilotage

- conserver la navigation principale D-082 : `Plan d'action`, `Solutions`,
  `Académie`, `Opportunités` ;
- après sauvegarde réelle d'un plan, exposer la sous-navigation commune
  `Plan d'action`, `Chiffres`, `Stratégie`, jamais sur le formulaire public ;
- utiliser `section=actions|figures|strategy`, avec `actions` par défaut,
  section ignorée hors `view=plan` et paramètres incompatibles nettoyés ;
- créer un composant propriétaire commun aux expériences plan généré et plan
  sauvegardé, sans duplication ;
- résoudre entreprise et appartenance une seule fois côté serveur et ne jamais
  faire confiance à un `companyId` du navigateur ;
- garder Chiffres et Stratégie indépendants du plan : changement ou suppression
  d'un plan sans effet sur le Pilotage ;
- étendre suppression d'entreprise, confidentialité, audit des collections et
  maintenance aux deux domaines ;
- garantir qu'aucun contenu Pilotage n'entre dans l'IA.

#### 3B — Chiffres

- stocker un document mensuel par entreprise et `YYYY-MM`, schéma 1, devise
  EUR, montants en centimes, révision, audit UID et timestamps ;
- CA et charges nuls ou positifs ; trésorerie négative autorisée ; résultat
  dérivé `CA - charges`, jamais stocké et explicitement non comptable ;
- lectures bornées par période et mutation explicite d'un mois avec
  `expectedRevision` ; aucun autosave ni accès inter-entreprises ;
- sélecteur unique `Ce mois / 3 / 6 / 12 mois / Période…` pilotant totaux et
  graphique ; bornes personnalisées inclusives ;
- cumuler CA, charges et résultat, mais utiliser seulement la dernière
  trésorerie renseignée ; ne jamais additionner les trésoreries ;
- signaler les mois incomplets et masquer les calculs non fiables ; ne pas
  produire de fausse courbe sur un seul mois ;
- comparer `CA / Charges`, `CA / Trésorerie` ou
  `Résultat / Trésorerie`, avec détail survol, toucher et clavier ;
- saisir explicitement mois, CA, charges et trésorerie dans un formulaire
  prérempli `Ajouter / Mettre à jour` ;
- tester agrégations 1, 3, 6, 10, 12 mois, périodes invalides, montants,
  révisions, autorisations, cohérence totaux/graphique et mobile/PWA.

#### 3C — Stratégie

- isoler l'ancienne Stratégie du fonctionnement courant tout en gardant le
  lecteur V1/V2/V3 silencieux ;
- utiliser `company_strategies/{companyId}` et `cycles/{cycleId}` ;
- gérer cycle actif, archive, historique, `expectedRevision` et transactions ;
- quatre piliers et douze réponses ; exactement un pilier ouvert,
  `Alignement` par défaut ;
- autosauvegarde sérialisée autour de 700 ms et flush awaitable ;
- brouillon conservé après erreur, `Réessayer` et `aria-live` ;
- fusion automatique des réponses différentes et conflit inline sur la même
  réponse avec `Garder ma version` ou `Utiliser la version récente`, sans retry
  aveugle ;
- premier cycle créé par commande idempotente ; fenêtre de trois mois
  calendaires calculée en `Europe/Paris`, sans TTL, cron ni rollover ;
- stocker `startMonth` et `endMonth` en `YYYY-MM`, `createdAt` en UTC ;
- nouveau cycle vide, historique read-only paginé par 10, archives conservées
  tant que l'entreprise existe ;
- valider contrats, sécurité, accessibilité, concurrence et tests serveur/UI.

#### 3D — Intégration et recette Pilotage

- affichage seulement après sauvegarde d'un plan généré ou vierge ;
- accès direct authentifié à `figures` et `strategy` via le contexte URL ;
- shell identique dans les deux expériences ;
- changement et suppression de plan sans effet sur les données entreprise ;
- suppression d'entreprise nettoyant Chiffres et Stratégie ;
- aucune réécriture des anciennes stratégies V3 ;
- aucun contenu Pilotage envoyé à l'IA ;
- E2E desktop, mobile, PWA, réseau et concurrence.

Gate : agrégations Chiffres exactes, archives Stratégie non modifiables, aucune
donnée Pilotage dans l'IA, les prompts, les commandes ou les logs, concurrence
et échec réseau validés.

Le Pilotage appartient à l'entreprise. Déconnexion, suppression du compte d'un
membre ou départ d'un membre ne suppriment ni Chiffres ni cycles. La suppression
effective de l'entreprise nettoie les métriques, la racine Stratégie et ses
cycles via le workflow de maintenance. La politique de confidentialité décrit
cette règle.

### Lot 4 — Consentement aux traceurs — P1

Responsable : workstream dédié par MASTER.

- traiter le consentement, jamais l'authentification Firebase ;
- cookie fonctionnel versionné de 180 jours et `localStorage` miroir ;
- migrer le stockage local et choisir la préférence valide la plus récente ;
- mettre à jour la politique de cookies et ajouter les tests dédiés ;
- accepter une nouvelle demande de consentement pour une PWA d'une ancienne
  origine, sans migration cross-domain disproportionnée.

### Lot 5 — Échanger — P1

Responsable : workstream Coaching désigné par MASTER.

- intégrer séparément la suppression du message Dictée ;
- retirer le texte répétitif ;
- afficher le dépliant Coach fermé pendant une clarification ;
- après clôture, conserver uniquement le CTA de fin ;
- maintenir la promesse canonique : deux rendez-vous individuels de 60 minutes
  et suivi entre les rendez-vous ;
- valider accessibilité, mobile, PWA et tests.

### Lot 6 — Titre IA — P2

Responsable : workstream Plans/IA, après 3A.

- enveloppe IA `{ title, plan }`, titre hors du modèle `ActionPlan` ;
- validation et normalisation serveur, 3 à 7 mots et environ 60 caractères ;
- fallback sur la première action ;
- titre utilisateur explicite préservé ;
- aucun appel IA dédié supplémentaire.

### Lot 7 — Barre du titre — P2

Responsable : workstream Plans/UI, après le Lot 1.

- hauteur tactile minimale de 44 px ;
- alignement visuel ;
- titres longs, clavier, mobile et PWA.

### Lot 8 — Recette et release transverse

Pilote : MASTER DEMAA.

Chaque PR est vérifiée seule avant sa fusion dans `main` : TypeScript, ESLint,
build, tests, Preview et E2E desktop/mobile/PWA. Chaque fusion implique une
publication Production et exige donc smoke test et rollback identifié. La
recette D-084 couvre ensemble socle commun, Chiffres et Stratégie ; Titre IA
est vérifié ultérieurement dans sa propre PR.

## Décisions produit fermées

Les décisions produit D-084 sont fermées : sous-navigation Pilotage et contexte
URL, modèle et calculs Chiffres, comportement de l'accordéon Stratégie, douze
questions et exemples, période calendaire, création et archivage, rétention,
pagination, concurrence, résolution inline des conflits et suppression par
entreprise. Il n'existe pas de cinquième destination principale.

Le seul gate avant le lancement de tout nouveau runtime est le Lot 0 : isoler
les changements documentaires D-084 et Dictée. Après ce gate, chaque workstream
suit encore l'ordre de dépendance du programme ; D-084 attend donc la fusion et
la recette du Lot 1 Plans avant de commencer son implémentation.
