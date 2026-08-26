# D-076 — Contrat produit du générateur de plan d'action

- Statut : `validated`
- Date de consolidation : 22 août 2026
- Propriétaires de décision : utilisatrice + Master Demaa
- Portée : entrée libre, génération IA V3, résultat, multi-plans,
  multi-systèmes, dictée, persistance, mesure d'usage et garde-fous
- Autorisation : implémentation MVP autorisée ; Preview, fusion et Production
  conservent leurs gates propres

## Rôle du document

Ce contrat est la source produit détaillée du générateur. L'ADR 0008 en fixe
les conséquences d'architecture. Les ADR 0003, 0004, 0006 et 0007 restent les
sources autoritaires des univers publics, des Services et des fiches Système,
sauf le point de l'ADR 0003 explicitement supersédé par l'ADR 0008.

Les choix non validés restent indiqués `open` ou `deferred` et ne doivent pas
être transformés en constante produit.

## Intention

### Promesse

> Qu’est-ce qui vous prend trop de temps aujourd’hui ?

Le produit aide un dirigeant à clarifier une situation réelle et à savoir quoi
faire ensuite. Il ne doit devenir ni un questionnaire préalable, ni une étude
théorique, ni un générateur de conseils génériques.

La formulation privilégie les tâches répétitives, doubles saisies, attentes,
validations, reprises et informations dispersées. Elle ne force pas une lecture
« processus » lorsque le problème réel porte sur la marge, les ventes, le
recrutement, la qualité, la trésorerie ou l'organisation.

### Cible de travail

La cible prioritaire est un dirigeant ou une dirigeante de TPE déjà engagé dans
une activité. Le moteur peut néanmoins traiter une situation de lancement si
le texte de l'utilisateur la décrit.

## Entrée unique

- Un seul grand champ libre précède la génération.
- Aucun questionnaire structuré n'est imposé avant le premier résultat.
- Des exemples ou un placeholder animé montrent le niveau de contexte utile.
- La personne peut écrire ou dicter.
- La voix est uniquement transcrite dans le champ ; l'utilisateur peut relire
  et corriger le texte avant de l'envoyer.
- Il n'existe aucun second moteur d'analyse du vocal.

La génération principale infère depuis le texte : activité, situation,
problème, objectif et Système métier pertinent.

## Génération principale

Le MVP utilise une seule opération de génération principale. L'appel de
réparation déterministe déjà gouverné reste autorisé lorsque la première sortie
échoue au schéma ou aux contrôles ; aucun appel autonome d'analyse, de matching
ou d'évaluation n'est ajouté en Production :

```text
texte libre final
→ génération IA principale
→ enveloppe JSON stricte { title, plan }
→ validation déterministe
→ rendu Actions
→ chargement déterministe du Système sélectionné
```

Il n'utilise par défaut ni chaîne multi-agent, ni options A/B/C, ni historique
conversationnel complet, ni recherche web.

### Catalogue léger des 115 activités

Le modèle reçoit le catalogue des 115 activités sous une forme légère :

- identifiant stable ;
- `slug` canonique ;
- libellé ;
- alias validés utiles à la détection.

La source actuelle est `src/lib/enterprise-annuaire.json`, exposée par
`src/lib/enterprise-annuaire.ts`. Les contenus complets d'Organisation,
Solutions et Ressources
des 115 Systèmes ne sont jamais envoyés ensemble au modèle.

La réponse contient un titre concis de 3 à 7 mots, validé et normalisé côté
serveur, ainsi qu'un plan contenant un `systemId` dont la valeur est l'un des
slugs canoniques du catalogue. Le titre reste hors du modèle métier
`ActionPlan` et aucun second appel IA n'est effectué pour le produire. En cas
de titre invalide, un fallback déterministe utilise la première action. Un
titre explicitement saisi par l'utilisateur reste prioritaire. L'application
charge ensuite uniquement le Système sélectionné depuis ses sources
canoniques existantes.

### Résultat courant V4

Le schéma JSON est versionné. Il porte au minimum :

```text
version = "4"
systemId
actions[]
  id
  title
  objective
  channelOrTool
  steps[]
  support
    type
    label
    content
```

La V4 conserve le nettoyage de `why`, `estimatedMinutes`, `deliverable`,
`successCriterion` et `ethicalGuardrail`, ainsi que la lecture des supports
typés introduits en V3. Les anciens plans peuvent donc encore contenir
`checklist`, `table`, `brief` ou `template` sans migration destructive.

Une nouvelle génération IA peut seulement écrire un `message`, un `email` ou
un `script`, lorsqu'une action de communication, de prospection ou de relance
en a réellement besoin. Pour les tableaux, suivis, checklists, modèles et
processus, l'action pointe vers la ressource Demaa contextualisée plutôt que de
générer un contenu générique. `support: null` est donc valide, y compris pour
toutes les actions d'un plan.

Un support généré reste immédiatement utilisable et ne recopie pas simplement
les étapes. L'utilisateur peut toujours ajouter ou modifier manuellement un
support personnel dans l'éditeur d'action.

Le lecteur de persistance reste compatible avec les plans V1, V2, V3 et
`manual` :

- un plan V1 est normalisé en V2 en mémoire ;
- un plan V2 conserve ses champs et libellés historiques ;
- un plan V3 conserve sa stratégie et ses libellés historiques en stockage,
  sans les afficher ni les réécrire ;
- un plan manuel conserve ses champs éditables et peut rester vide ;
- aucun ancien document n'est silencieusement réétiqueté V4 ou réécrit dans
  Firebase à la lecture.

Chaque action contient les éléments nécessaires à son exécution. Le message ou
modèle prêt à l'emploi reste facultatif. Le nombre est adapté à la situation,
entre trois et cinq en V4. Les lecteurs historiques continuent d'accepter
jusqu'à sept actions pour ne pas invalider un ancien plan V1, V2 ou manuel.

### Focalisation opérationnelle D-093

Le prompt recherche d'abord les tâches et décisions qui consomment du temps,
créent de l'attente, provoquent des reprises ou dépendent excessivement du
dirigeant. Lorsqu'ils sont fournis, il tient compte de la fréquence, du volume,
des personnes, des outils, des ressaisies, des validations, des erreurs et du
résultat attendu.

La réponse la plus simple est recherchée dans l'ordre : supprimer, simplifier,
clarifier les responsabilités, standardiser ou documenter, déléguer, puis
automatiser. Un processus confus est d'abord observé et clarifié. Une donnée
manquante devient une première Action de mesure terrain plutôt qu'un chiffre ou
un fait inventé.

Le modèle n'invente et n'introduit aucune marque, logiciel, prestation ou nom
de prestataire. Une marque explicitement citée par l'utilisateur peut rester
un élément factuel du contexte, sans devenir automatiquement une
recommandation. `channelOrTool` peut nommer un canal ou une capacité générique.

Le plan contient trois ou quatre Actions par défaut. Une cinquième Action est
acceptée seulement lorsqu'elle poursuit un résultat distinct et nécessaire.

### Stratégie définitivement séparée du Plan d'action

La génération courante ne demande plus de stratégie à partir d'une
problématique ponctuelle. L'interface du Plan d'action ne rend ni onglet
`Stratégie`, ni cartes Alignement, Positionnement, Offre ou Promotion. La
nouvelle Stratégie définie par D-084 est un espace manuel rattaché à
l'entreprise, séparé des plans et de leur IA. Elle ne réactive, ne recopie et
n'initialise rien depuis les anciens champs stratégiques.

Les schémas et lecteurs historiques restent provisoirement tolérants afin de
ne pas casser les anciens plans, mais ces champs ne sont ni affichés ni édités.
Aucune migration destructive n'est créée avant un audit Firebase et une
autorisation séparée.

Le MVP ne produit pas d'étude de marché automatique. Une information de marché
non fournie et non établie reste une hypothèse à vérifier, jamais un fait
inventé.

## Présentation du résultat

### Accueil

La surface principale affiche directement les Actions. Aucun espace vide ni
onglet inactif n'est laissé à la place de la Stratégie masquée.

Chaque action reste directement exécutable. La première lecture est courte ;
les étapes et modèles se déplient à la demande.

### Plusieurs plans sauvegardés

Une même identité peut conserver plusieurs plans sans créer de portail
concurrent :

- chaque plan possède un titre éditable ;
- un sélecteur compact permet de passer d'un plan sauvegardé à un autre ;
- `Nouveau plan`, `Renommer` et `Supprimer` restent des actions explicites ;
- la suppression est révisionnée et ne réutilise pas un document actif ;
- le dernier plan sauvegardé reste le retour par défaut de la session.

Ces contrôles vivent dans l'interface unique de l'application. Ils ne
réintroduisent ni page publique `Mon espace`, ni page publique `Mes plans`.

### Vue Solutions

- Le Système détecté est sélectionné par défaut.
- Une dropdown discrète permet de choisir l'un des 115 Systèmes.
- Le changement charge uniquement ses Solutions dans l'application.
- Les routines Organisation et les modèles Ressources restent dans les banques
  canoniques du Système ; lorsqu'ils correspondent avec une confiance
  suffisante à une Action, ils sont affichés directement dans son panneau de
  détail, sans appel IA et sans dupliquer les données.
- Il ne déclenche aucun appel IA.
- Il ne réécrit pas les Actions générées.

Le Système n'est donc pas une deuxième recommandation générée : il est le
contenu canonique existant chargé à partir du `systemId` courant.

Un plan sauvegardé peut mémoriser plusieurs Systèmes consultés. L'espace de
travail conserve leur liste sans doublon, le Système actif, ainsi que les
sélections Solutions séparément pour chaque Système. Ajouter
ou sélectionner un Système ne déclenche pas d'appel IA et ne modifie pas les
Actions.

## Dictée centralisée

La dictée repose sur un seul adaptateur client partagé. Il centralise le cycle
de vie du microphone, la langue, les transcriptions intermédiaires, l'arrêt,
l'annulation, les erreurs et le retour au clavier. Les différents champs
réutilisent ce même contrat au lieu de maintenir des implémentations
concurrentes. La voix reste transformée en texte relisible ; aucun audio n'est
envoyé ou conservé par Demaa dans ce lot.

## Navigation et compatibilité publique

### Avant connexion

La navigation française visible est
`Solutions / Application métier / Organiser`. La racine ouvre Solutions par
défaut. Le visiteur choisit son activité avant de voir les outils, ressources
et autres rails publiés pour ce métier. `Application métier` présente
l’accompagnement et des réalisations anonymisées ; `Organiser` ouvre
directement la bibliothèque de processus. Les anciennes URLs utilisant
`view=system`, `view=solutions` ou `view=plan&planTab=solutions` restent
acceptées par redirection. Tout nouveau lien applicatif vers les Solutions
utilise `/solutions/[métier]` et conserve les contextes utiles. Les routes
publiques `/systemes` ne sont pas renommées.

Les univers publics `/systemes` et `/academie`, leur navigation et leur SEO
restent accessibles. L'ADR 0008 ne transforme pas ces routes en espace privé.
Une fiche publique Système propose une entrée explicite `Ouvrir dans Demaa`.
Dans l'application, la vue, le Système, la solution ouverte, le
contenu Académie ou l'Opportunité sélectionnée sont encodés dans une URL
partageable et restaurés par navigation arrière. L'URL publique canonique
reste indexable ; l'URL applicative conserve le contexte de travail.

Le compte e-mail et mot de passe conserve un `returnTo` sûr adapté au parcours :
plan, équipe Demaa, Opportunité ou accès générique. Google utilise le même
endpoint de session et le même mécanisme de retour.

### Après connexion

La même navigation applicative est conservée. La conversation reste accessible
depuis l'action compacte `Diagnostic`, conformément à l'ADR 0018, sans devenir
un cinquième onglet.

La surface porte le titre `Quel problème rencontrez-vous ?` et précise
`Décrivez ce qui vous bloque. L’équipe Demaa vous répond ici.` Elle ne rend
aucune recommandation, promotion ou action Coach business : Coach business
reste uniquement dans Services.

## Persistance

### Avant connexion

- La personne peut écrire ou dicter sa situation et préparer un plan vierge.
- La génération ne commence pas avant l'authentification.
- Au clic sur `Créer mon plan d’action`, seuls la situation et un identifiant
  idempotent sont conservés dans `sessionStorage`, pendant 2 heures au maximum,
  afin de reprendre le parcours après e-mail/mot de passe ou Google.
- Aucun contenu généré, aucune autorisation et aucun plan complet ne sont
  stockés dans le navigateur.
- Le slug du Système choisi peut rester mémorisé pour éviter de redemander
  l'activité à chaque visite.

### Après authentification

- Firebase/cloud devient l'unique source persistante.
- Le serveur crée d'abord le plan dans l'entreprise active avec l'état
  `generating`, puis le passe à `active` lorsque le résultat est enregistré.
- Une génération interrompue passe à `failed` et peut être reprise avec la même
  demande, sans créer un second document.
- Les états `generating` et `failed` restent visibles dans `Mes plans` afin
  qu'une fermeture de page ne donne jamais l'impression d'avoir perdu le plan.
- Le partage par lien reste différé jusqu'à validation d'un accès en lecture
  seule, révocable, limité et non indexable.
- Aucun miroir local durable concurrent n'est maintenu.

Au clic sur `Créer mon plan d’action`, une personne non connectée voit d'abord
la modale d'accès. Après création ou reprise de session, l'écran vert de
progression apparaît pendant que le serveur génère et persiste le plan. Le plan
actif est ensuite ouvert depuis son URL canonique. Les modifications y sont
enregistrées avec révision optimiste. Le plan vierge reste le seul parcours
pouvant commencer temporairement avant une modification utile.

Lorsqu'une session connectée revient dans l'application sans demander une
nouvelle situation, `/plans/latest` ouvre l'entrée la plus récente. S'il
n'existe aucun plan, cette route ouvre directement `/plans/new`. `/plans`
reste l'historique authentifié, y compris les générations en cours ou
interrompues, et conserve un état vide explicite lorsqu'il est ouvert depuis le
menu du profil.

L'identité primaire est un compte e-mail et mot de passe Firebase, matérialisé
par un cookie de session Firebase natif et son UID. Demaa ne reçoit ni ne
stocke le mot de passe. Google utilise exactement la même session. L'UID reste
l'identité racine des conversations et brouillons. Les plans sont rattachés à
l'entreprise par défaut et leur autorisation exige une appartenance active à
cette entreprise ; `owner_uid` reste uniquement une trace de compatibilité.
Une fois la session Firebase créée, les formulaires fonctionnels
(guides métier, Opportunités, Coaching, inscription et demandes) réutilisent
l'e-mail de la session côté serveur et ne le redemandent pas. Un visiteur non
connecté qui déclenche l'une de ces actions passe d'abord par l'un de ces
parcours vérifiés, puis revient directement à son intention dans l'application.
Il n'existe pas de portail parallèle `Mon espace` ; `Mes plans` est une vue
authentifiée de l'application unique.

La session applicative est échangée uniquement par `/api/auth/session` : le
serveur vérifie le jeton Firebase récent, garantit l'entreprise technique et
l'appartenance propriétaire active, puis seulement pose le cookie HttpOnly.
Google utilise une popup bornée sur desktop et le callback dédié `/auth/google`
sur mobile/PWA ; une popup bloquée ou sans réponse propose cette redirection au
nouvel essai. Aucun consommateur global ne s'exécute dans le layout. Le reverse
proxy recommandé pour un hébergement hors Firebase sert le helper sur le
domaine canonique pour `/__/auth/*` ; la configuration du SDK est fournie
explicitement par l'application.

## Marketing et prospection éthiques

La prospection n'est pas interdite. Elle peut être proposée lorsqu'elle répond
réellement au problème ou à l'objectif.

Toute action de reach-out doit :

- cibler des personnes pertinentes et expliquer pourquoi elles le sont ;
- être personnalisée ;
- donner quelque chose d'utile avant de demander ;
- respecter le canal, le temps et le refus ;
- limiter strictement les relances puis s'arrêter ;
- exclure les envois massifs génériques, le harcèlement, la pression et la
  fausse urgence.

Le moteur ne force pas ce levier si partenariat, recommandation, contenu,
fidélisation ou amélioration du parcours d'achat est plus pertinent.

L'absence de recherche web automatique n'interdit ni une action terrain de
découverte, ni une prospection commerciale ciblée.

## Coûts et robustesse

Les optimisations autorisées ne doivent pas réduire la valeur du résultat :

- une génération principale ;
- catalogue léger cacheable ;
- chargement du seul Système utile ;
- changement de Système sans IA ;
- prompt statique cacheable ;
- JSON strict et validateurs déterministes ;
- réparation ciblée d'une section défaillante ;
- transcription seulement lorsque la voix est utilisée ;
- mesure du modèle, des tokens, de la latence, du coût et des reprises ;
- idempotence, limite de concurrence et coupe-circuit côté serveur.

Le pricing demeure `open`. Le prix de 5 EUR par génération est explicitement
rejeté. Le futur prix doit être ancré sur la valeur du plan, pas sur le coût des
tokens.

### Ledger d'usage IA

Chaque appel IA effectivement exécuté écrit un événement de mesure append-only
contenant uniquement : type d'opération, sujet pseudonymisé lorsque possible,
modèle, durée, nombres de tokens, nombre de requêtes et réparations, et date.
Ce ledger permet de calculer et contrôler le coût sans journaliser le contenu.
Il ne contient jamais la situation, le prompt, la commande, le plan, les
supports, les notes, l'adresse e-mail en clair ni l'identité de session. Une
indisponibilité du ledger est signalée opérationnellement mais ne transforme
pas le contenu utilisateur en log de secours.

## Génération depuis un plan vierge

Un plan manuel encore entièrement vierge peut afficher une barre permettant de
décrire une situation. Cette barre déclenche le même parcours de génération
durable que le formulaire initial : elle ne constitue pas une commande
d'édition.

Dès qu'un plan contient une action ou un contenu à conserver, la barre
disparaît. Les actions sont alors modifiées directement dans leur interface.
Il n'existe plus de route, de contrat ni d'appel IA permettant d'ajouter,
modifier ou supprimer des actions à partir d'une commande libre après la
génération.

## Décisions rejetées

| Proposition | Règle active |
| --- | --- |
| Questionnaire en quatre champs avant génération | Un grand champ libre |
| Prix ferme de 5 EUR | Pricing ouvert |
| Trois actions maximum | Nombre adapté à la situation |
| Stratégie intégrée au Plan d'action | Plan limité aux Actions ; Stratégie manuelle séparée dans le Pilotage d'entreprise |
| Prospection interdite | Prospection ciblée et éthique possible |
| Étude de marché automatique | Hors MVP |
| Contenu complet des 115 Systèmes envoyé au modèle | Catalogue léger uniquement |
| Changement de Système avec régénération | Chargement déterministe sans IA |
| Analyse métier séparée du vocal | Transcription dans le champ |
| Plan invité durable dans `localStorage` | Plan en mémoire page/session ; seul le slug du Système choisi est mémorisé localement |
| Chaîne multi-agent par défaut | Une génération principale |

## Arbitrages ouverts

- pricing et frontière gratuite/payante ;
- modèle et fournisseur après mesure sur des cas représentatifs ;
- valeurs exactes des quotas et du plafond budgétaire ;
- suppression, export et partage révocable ;
- durée de conservation définitive au-delà de la politique actuelle.

Ces arbitrages ne bloquent pas le prototype et le moteur Preview lorsqu'ils
sont implémentés derrière des limites conservatrices réversibles.

## Extensions explicitement différées

La première version de l'accès à l'équipe Demaa fait partie de l'application
conformément à l'ADR 0009 : une conversation écrite ou dictée simple, sans
onglets Messages/Formules. Chaque UID Firebase dispose d'une première
clarification offerte, clôturée manuellement par la Team Demaa avec sa réponse
finale. L'offre `Coach business` est présentée séparément dans Services comme
un accompagnement mensuel unique à 750 EUR HT/mois. Elle inclut deux rendez-vous
individuels de 60 minutes et un suivi entre les rendez-vous sur les sujets
travaillés. Son CTA `Être rappelé(e)` transmet une intention sans connexion ni
paiement public. La Team Demaa qualifie ensuite le besoin et le matching avec
le dirigeant ; aucun accès illimité n'est promis.

Le catalogue ne publie ni n'applique d'avantage mensuel en pourcentage. Les
prix affichés et les conditions du devis constituent l'unique référence
commerciale.
Restent
au backlog, sans modifier cette première version :

- les limites raisonnables d'usage et la capacité opérationnelle ;
- les évolutions de capacité humaine et de promesse de délai ;
- les nouveaux canaux ou formats de messagerie ;
- les évolutions de droits, confidentialité et conservation des échanges ;
- les évolutions de tarification et de limites de service ;
- plusieurs entreprises par compte, le sélecteur d'entreprise et la collaboration ;
- l'enrichissement facultatif du profil entreprise.

## Critères d'acceptation MVP

- Aucun questionnaire ne précède le premier résultat.
- Le moteur choisit un `systemId` parmi les 115 slugs canoniques.
- Le résultat comporte des actions exécutables et un `systemId` canonique ; il
  ne contient aucune donnée de Stratégie.
- Le changement de Système ne consomme aucune génération et ne modifie pas les
  Actions.
- Aucun contenu détaillé des 114 autres Systèmes n'est chargé inutilement.
- Aucun fait de marché n'est inventé.
- La prospection éventuelle respecte les garde-fous éthiques.
- Aucun résultat invité n'est persisté durablement sans action de sauvegarde.
- Firebase est l'unique source persistante après sauvegarde.
- Le coût, la latence et les erreurs sont observables côté serveur.
- Les plans V1, V2 et manuels restent lisibles sans migration destructive.
- Les supports V3 sont typés et suivent les règles déterministes du contrat.
- Plusieurs plans et plusieurs Systèmes peuvent être conservés sans mélanger
  leurs états.
- Chaque compte dispose d'une entreprise par défaut et d'une appartenance
  `owner`; les plans sont autorisés par cette appartenance active, jamais par
  l'adresse e-mail ou par le seul champ historique `owner_uid`.
- La dictée utilise l'adaptateur microphone partagé et ne conserve aucun audio.
- Le ledger ne contient aucun prompt, commande ou contenu de plan.
- Aucun plan déjà généré ou commencé n'affiche de barre de commande IA.
- La barre d'un plan manuel vierge utilise uniquement le parcours de génération
  initial déjà authentifié et mesuré.
- `/systemes`, `/academie` et les fiches publiques existantes restent intactes.
