# Programme directeur Demaa — stabilisation et Pilotage d'entreprise

- Statut : `validated`
- Date : 2026-08-16
- Pilote produit et release : `MASTER DEMAA`
- Branche Production : `main`
- État Production vérifié : `8020e04` (programme 0 à 8 livré)

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
| Documentation D-084 | fusionnée par la PR 115 au commit `3ee6e0c` | Lot 0 livré |
| Suppression de « Dictée en cours… » et expérience Coach | fusionnées par la PR 113 et vérifiées en Production au commit `4f0a589` | Lot 5 livré |
| Runtime Plans | fusionné par la PR 110 et vérifié en Production au commit `6f9fed5` | Lot 1 livré |
| Pilotage Chiffres + Stratégie | fusionné par la PR 116 et vérifié en Production au commit `8aa1cab` | Lot 3 livré |
| Titre IA | fusionné par la PR 117 et vérifié en Production au commit `8020e04` | Lot 6 livré |

Ces unités n'ont pas été placées dans le même commit. Le gate d'isolation du
Lot 0 est franchi. Les Lots 1 à 7 ont été livrés dans des PR indépendantes,
chacun après ses tests, sa CI, son déploiement Vercel et son smoke test
Production. Le Lot 8 a ensuite contrôlé l'ensemble intégré.

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

### Lot 0 — Assainissement et gouvernance — livré

Responsable : MASTER DEMAA.

- isoler les changements locaux existants ;
- préparer une unité documentaire D-084 séparée ;
- attribuer la modification Dictée au Lot 5 ou à une micro-PR ;
- figer les responsables, branches, dépendances et gates ;
- attendre la validation du programme avant de resynchroniser le Google Sheet.

Gate : chaque modification est attribuée et isolée ; aucun commit ou PR ne
mélange documentation D-084, Dictée et runtime Plans.

### Lot 1 — Fiabilité Plans — P0 — livré en Production

Responsable : workstream Plans désigné par MASTER.

Développer uniquement les écarts réels :

- CTA unique lorsque l'index est vide ;
- `Retour à mes plans` conditionnel sur `/plans/new` ;
- conserver le profil limité à `Mes plans` et `Déconnexion` ;
- menu d'un plan, dans cet ordre exact : `Changer de plan`, `Nouveau plan`,
  `Partager`, `Renommer`, `Supprimer` ; ne jamais introduire
  `Ajouter un plan` ;
- fermeture immédiate, état `Ouverture…` et doubles clics bloqués ;
- file d'autosauvegarde réellement drainée et attendue avant navigation ;
- navigation bloquée après échec de sauvegarde, avec erreur visible et action
  `Réessayer` ;
- aucun retry aveugle d'un conflit `409` ;
- préchargement des routes cibles ;
- entreprise et appartenance résolues une fois ;
- plan et index compact chargés en parallèle ;
- index incluant `active`, `generating` et `failed` selon le contrat ;
- `loading.tsx`, erreur visible avec `Réessayer` lorsque le chargement du plan
  échoue, et vrais tests d'interaction/E2E sans perte.

L'ouverture de `/plans/new` ne crée jamais de document. Le plan n'est créé
qu'au déclenchement réel de la commande ; un abandon ne laisse aucun faux plan.
Le lien de retour est absent lors de la toute première création et présent dès
qu'au moins un plan existe, quelle que soit la provenance de navigation.

Gate : sauvegarde lente, sauvegarde en attente, échec réseau, conflit `409`,
changements successifs, retour arrière, mobile et PWA validés.

### Lot 2 — Sécurité administration — P0 — livré en Production

Responsable : MASTER ou workstream explicitement désigné.

- limiter GET et POST avant la comparaison du secret ;
- décider explicitement entre une clé commune nommée ou des clés séparées ;
- supprimer tout fallback silencieux ;
- documenter accès, rotation et révocation ;
- tester secret absent, invalide, trop court, limitation et non-cache.

La page reste `https://demaa.co/admin/coaching`, absente de la navigation et
`noindex`. Le secret est transmis uniquement dans un header, jamais dans une
URL. Les réponses privées restent `no-store`. La solution par secret est
transitoire ; un rôle Firebase `team_demaa` appartient à un futur lot distinct.

Ce lot peut avancer après le Lot 0 dans une branche ou un worktree séparé.

### Lot 3 — Pilotage d'entreprise : Chiffres + Stratégie — D-084 — livré en Production

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
- étendre `action-plan-app-context.ts` avec un type fermé
  `ActionPlanSection = "actions" | "figures" | "strategy"` et un
  `planSection` canonique ;
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

- utiliser la collection dédiée `company_monthly_metrics`, avec un document
  mensuel par entreprise et `YYYY-MM` ;
- chaque document contient exactement `schema_version: "1"`, `company_id`,
  `period`, `revenue_cents`, `expenses_cents`, `cash_balance_cents`,
  `currency: "EUR"`, `revision`, `created_by_uid`, `updated_by_uid`,
  `created_at` et `updated_at` ; les trois montants sont `number | null` ;
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
- créer au minimum `CompanyFiguresPanel.tsx` et
  `CompanyMetricEntryDialog.tsx` ;
- créer les couches métier `src/lib/company-pilotage-contract.ts`,
  `src/lib/company-metrics.server.ts` et
  `src/lib/company-strategy.server.ts` ; les agrégations et calculs financiers
  vivent dans une fonction pure testable, jamais dans un composant React ;
- conserver les endpoints authentifiés prévus par le contrat produit :
  `GET /api/company/pilotage/metrics?from=YYYY-MM&to=YYYY-MM` et
  `PUT /api/company/pilotage/metrics/[period]`, sauf adaptation Next.js 16
  documentée qui préserve exactement le même contrat métier ;
- tester agrégations 1, 3, 6, 10, 12 mois, périodes invalides, montants,
  révisions, autorisations, cohérence totaux/graphique et mobile/PWA.

La matrice API/Pilotage nomme explicitement : session absente, appartenance
inactive, tentative d'accès à une autre entreprise, rejet de tout `company_id`
client, création et mise à jour mensuelle, conflit de révision, mutation d'un
seul pilier et validation des douze réponses Stratégie.

Le récapitulatif et le graphique utilisent toujours la même période. Pour une
période personnalisée, début et fin sont des mois inclusifs — novembre 2025 à
août 2026 représente dix mois. Les mois incomplets affichent `—` lorsqu'un
calcul n'est pas fiable et une mention du type `5 mois renseignés sur 6` ; un
total incomplet n'est jamais présenté comme définitif. Le détail mensuel du
graphique indique le mois et les deux valeurs comparées au survol, au toucher
et au focus clavier, avec axes lisibles et sans débordement horizontal.

#### 3C — Stratégie

- isoler l'ancienne Stratégie du fonctionnement courant tout en gardant le
  lecteur V1/V2/V3 silencieux ;
- utiliser `company_strategies/{companyId}` et `cycles/{cycleId}` ;
- gérer cycle actif, archive, historique, `expectedRevision` et transactions ;
- quatre piliers et douze réponses ; exactement un pilier ouvert,
  `Alignement` par défaut ;
- créer `CompanyStrategyPanel.tsx`, `CompanyStrategyPillar.tsx`,
  `CompanyStrategyHistory.tsx` et `CompanyStrategyCycleDialog.tsx` ;
- exposer des mutations authentifiées dédiées pour initialiser le premier
  cycle, modifier le cycle actif avec `expectedRevision`, créer le cycle
  suivant et paginer l'historique ; une API HTTP conserve au minimum le
  préfixe `/api/company/pilotage/strategy`, sans accepter de `companyId`
  navigateur ;
- autosauvegarde sérialisée autour de 700 ms et flush awaitable ;
- brouillon conservé après erreur, `Réessayer` et `aria-live` ;
- annoncer la sauvegarde aux technologies d'assistance sans afficher
  durablement `Enregistré` ;
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

### Lot 4 — Consentement aux traceurs — P1 — livré en Production

Responsable : workstream dédié par MASTER.

- traiter le consentement, jamais l'authentification Firebase ;
- cookie fonctionnel versionné de 180 jours et `localStorage` miroir ;
- migrer le stockage local, restaurer automatiquement le stockage manquant
  depuis l'autre source et choisir la préférence valide la plus récente ;
- ne redemander le choix qu'après expiration ou changement de version ;
- mettre à jour la politique de cookies et ajouter les tests dédiés ;
- accepter une nouvelle demande de consentement pour une PWA d'une ancienne
  origine, sans migration cross-domain disproportionnée.

Les tests couvrent actualisation, fermeture et réouverture PWA,
connexion/déconnexion, Safari iPhone, stockage local indisponible, refus,
acceptation, préférences personnalisées, expiration, changement de version et
synchronisation cookie/miroir.

### Lot 5 — Échanger — P1 — livré en Production

Responsable : workstream Coaching désigné par MASTER.

- intégrer séparément la suppression du message Dictée ;
- retirer `Décrivez ce que vous souhaitez clarifier. Vous pourrez envoyer votre
  message après la connexion.` ;
- afficher pendant une clarification le dépliant fermé
  `Besoin d'un accompagnement régulier ?` ;
- une fois ouvert, présenter l'accompagnement mensuel, deux rendez-vous
  individuels de 60 minutes, le suivi entre les rendez-vous,
  `750 € HT / mois` et `Découvrir Coach business` ;
- après clôture, conserver uniquement le CTA de fin ;
- maintenir la promesse canonique : deux rendez-vous individuels de 60 minutes
  et suivi entre les rendez-vous ;
- garder le dépliant fermé par défaut, sans ouverture automatique, avec
  `aria-expanded`, clavier et animation discrète ;
- valider dictée, envoi, accessibilité, mobile, PWA et tests.

### Lot 6 — Titre IA — P2 — livré en Production

Responsable : workstream Plans/IA, après la fusion du Lot 3 complet. Les
sous-lots 3A à 3D ne sont pas fusionnés séparément.

- enveloppe IA `{ title, plan }`, titre hors du modèle `ActionPlan` ;
- validation et normalisation serveur, 3 à 7 mots et environ 60 caractères ;
- fallback sur la première action ;
- titre utilisateur explicite préservé ;
- aucun appel IA dédié supplémentaire.

Pendant la génération, afficher `Plan en cours de création`. Le titre est
centré sur le problème ou le résultat et n'utilise pas la formule
`Plan d'action pour…`. Une fois validé, il est identique dans le plan,
`Mes plans`, `Changer de plan` et le partage, tout en restant renommable.
Exemples de forme attendue : `Retrouver une marge rentable`,
`Structurer le suivi des chantiers`, `Développer les ventes récurrentes` ou
`Sortir le dirigeant de l'opérationnel`.

### Lot 7 — Barre du titre — P2 — livré en Production

Responsable : workstream Plans/UI, après le Lot 1.

- hauteur tactile minimale de 44 px ;
- réduire le padding vertical, conserver le padding horizontal et réduire
  légèrement la marge inférieure ;
- centrer parfaitement les trois points avec le titre ;
- titres longs, clavier, mobile et PWA.

### Lot 8 — Recette et release transverse — terminé

Pilote : MASTER DEMAA.

Chaque PR est vérifiée seule avant sa fusion dans `main` : TypeScript, ESLint,
build, tests, Preview et E2E desktop/mobile/PWA. Chaque fusion implique une
publication Production et exige donc smoke test et rollback identifié. La
recette D-084 couvre ensemble socle commun, Chiffres et Stratégie ; Titre IA
est vérifié ultérieurement dans sa propre PR.

La recette transverse couvre explicitement : retour vers `Mes plans` depuis
tous les accès à `Nouveau plan`, changement sans perte avec sauvegarde lente,
échec et `409`, consentement persistant, dictée et envoi, lecture et réponse
administrateur, agrégations et graphique Chiffres, cycles/concurrence/historique
Stratégie, génération et nommage, focus clavier, mobile/PWA et logs runtime.

## Décisions produit fermées

Les décisions produit D-084 sont fermées : sous-navigation Pilotage et contexte
URL, modèle et calculs Chiffres, comportement de l'accordéon Stratégie, douze
questions et exemples, période calendaire, création et archivage, rétention,
pagination, concurrence, résolution inline des conflits et suppression par
entreprise. Il n'existe pas de cinquième destination principale.

## Hors périmètre explicite du programme

La relecture de l'historique MASTER ne réactive pas les sujets déjà livrés,
supersédés ou volontairement différés. Ce programme ne modifie pas :

- l'architecture Firebase et le parcours Google stabilisés en Production ;
- les icônes, le manifeste ou les fichiers PWA appartenant à d'anciens lots ;
- les expériences Académie, Solutions ou Opportunités hors régression causée
  par un lot de ce programme ;
- les invitations multi-membres, les rôles avancés, le portail Partenaire ou
  le futur rôle Firebase `team_demaa` ;
- un paiement automatique, un checkout public ou une migration de stockage
  entre anciennes origines PWA ;
- le volume et son unité dans Chiffres V1 ;
- la migration, l'affichage ou la réactivation de l'ancienne Stratégie V3 ;
- la resynchronisation du Google Sheet avant stabilisation et validation des
  documents locaux.

Le programme 0 à 8 est livré et vérifié en Production au commit `8020e04`.
Pilotage a été fusionné comme une seule unité complète par la PR 116 ; Titre IA
a suivi dans la PR autonome 117. La suite n'est pas un reliquat de ce
programme : tout nouveau chantier historique ou différé exige un nouveau GO.
