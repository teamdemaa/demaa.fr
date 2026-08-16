# Programme directeur Demaa — stabilisation et Stratégie

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
D-084 Stratégie.

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

Les sous-lots Stratégie 3A et 3B sont des étapes internes d'une même branche et
d'une même PR. La fondation 3A ne doit pas être fusionnée seule si elle laisse
un stockage, une API ou un contrat incomplet ou inutilisé. D-084 est fusionné
uniquement lorsque fondation, interface, compatibilité, tests et E2E sont
ensemble publiables. Titre IA reste une PR ultérieure autonome.

## Ordre canonique

```text
Lot 0 → Lot 1 → Lot 3A → Lot 3B → Lot 6
          └────→ Lot 7
Lot 0 → Lot 2
Lot 0 → Lot 4
Lot 0 → Lot 5
Chaque vague → Lot 8
```

La tâche Stratégie ne commence pas l'implémentation avant le gate du Lot 1.

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

### Lot 3 — Stratégie D-084

Responsable exclusif : tâche `Vérifier la stratégie et le backlog`.

#### 3A — Fondation

- isoler l'ancienne Stratégie du fonctionnement courant tout en gardant le
  lecteur V1/V2/V3 silencieux ;
- créer les contrats dédiés ;
- utiliser `company_strategies/{companyId}` puis la sous-collection
  `cycles/{cycleId}` ;
- vérifier l'appartenance d'entreprise ;
- gérer cycle actif, archive, historique, `expectedRevision` et transactions ;
- couvrir suppression, confidentialité et maintenance ;
- valider les tests serveur.

#### 3B — Expérience

- route `/strategie`, immédiatement après `Plan d'action` dans la navigation
  principale ; D-082 reste la réalité de Production jusqu'à la fusion complète
  de D-084 ;
- recetter les cinq destinations sur desktop, mobile et PWA ;
- quatre piliers et douze réponses ;
- exactement un pilier ouvert à tout moment, `Alignement` ouvert par défaut ;
  cliquer sur un autre pilier transfère l'ouverture et cliquer sur le pilier
  actif ne ferme pas l'ensemble ;
- autosauvegarde sérialisée autour de 700 ms ;
- flush réellement awaitable avant Nouveau cycle ou navigation ;
- brouillon conservé après erreur, `Réessayer` et `aria-live` ;
- conflit résolu à partir de la base, de la version locale et de la version
  serveur : fusion automatique des réponses différentes ; si la même réponse
  diverge, aucun écrasement, brouillon local conservé et choix inline
  `Garder ma version` ou `Utiliser la version récente` ;
- `Garder ma version` renvoie explicitement la valeur contre la dernière
  révision serveur, sans retry aveugle ; le conflit et sa résolution sont
  annoncés de manière accessible ;
- premier cycle créé automatiquement par une commande idempotente, jamais par
  une lecture GET à effet de bord ;
- fenêtre de trois mois calendaires calculée en `Europe/Paris` : mois civil de
  création puis les deux mois suivants ;
- stocker `startMonth` et `endMonth` en `YYYY-MM` ainsi que `createdAt` en UTC,
  puis rendre les libellés en français ;
- la fenêtre n'est ni un TTL ni une expiration : le cycle reste actif jusqu'à
  la création manuelle d'un nouveau cycle ;
- autoriser plusieurs cycles créés le même mois, archiver l'ancien et afficher
  aussi leur date de création pour les distinguer ;
- aucun cron ni rollover automatique ; nouveau cycle vide ;
- historique en lecture seule paginé par 10 ;
- cycles archivés conservés tant que l'entreprise existe, sans TTL ni
  suppression automatique liée à leur âge ;
- données actives et index chargés en parallèle après une seule résolution de
  l'appartenance ;
- `loading.tsx`, desktop, mobile, PWA, accessibilité et E2E.

Gate : aucune donnée Stratégie dans l'IA, les prompts, les commandes ou les logs
IA ; archives non modifiables ; concurrence et échec réseau validés.

La Stratégie appartient à l'entreprise. Déconnexion, suppression du compte d'un
membre ou départ d'un membre ne suppriment aucun cycle. La suppression effective
de l'entreprise supprime sa racine Stratégie et ses cycles via le workflow de
maintenance. Si la suppression du seul propriétaire entraîne celle de
l'entreprise, cette suppression d'entreprise déclenche le nettoyage. La
politique de confidentialité doit décrire cette règle.

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
recette D-084 couvre ensemble fondation et interface ; Titre IA est vérifié
ultérieurement dans sa propre PR.

## Décisions produit fermées

Les décisions produit D-084 sont fermées : route et navigation, comportement
de l'accordéon, douze questions et exemples, période calendaire, création et
archivage, rétention, pagination, concurrence, résolution inline des conflits
et suppression par entreprise.

Le seul gate avant le lancement de tout nouveau runtime est le Lot 0 : isoler
les changements documentaires D-084 et Dictée. Après ce gate, chaque workstream
suit encore l'ordre de dépendance du programme ; D-084 attend donc la fusion et
la recette du Lot 1 Plans avant de commencer son implémentation.
