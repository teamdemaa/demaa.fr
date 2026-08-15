# D-076 — Contrat produit du générateur de plan d'action

- Statut : `validated`
- Date de consolidation : 13 août 2026
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

> Qu’est-ce qui freine votre entreprise ?

Le produit aide un dirigeant à clarifier une situation réelle et à savoir quoi
faire ensuite. Il ne doit devenir ni un questionnaire préalable, ni une étude
théorique, ni un générateur de conseils génériques.

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

Le MVP utilise une seule opération de raisonnement principale :

```text
texte libre final
→ génération IA principale
→ JSON strict du plan + systemId
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

La réponse contient un `systemId` dont la valeur est l'un des slugs canoniques
du catalogue. L'application
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
`successCriterion` et `ethicalGuardrail`, ainsi que les actions et supports
typés introduits en V3. Les types autorisés sont `message`, `email`, `script`,
`checklist`, `table`, `brief` et `template`.

Le choix du type est déterministe par nature d'action :

- communication, prospection ou relance : `message`, `email` ou `script` ;
- contrôle, audit ou analyse : `checklist`, `table` ou `template` ;
- organisation ou pilotage : `table`, `checklist` ou `template` ;
- création d'offre ou de contenu : `brief`, `template` ou `checklist`.

Un support est immédiatement utilisable et ne recopie pas simplement les
étapes. Le plan contient au moins un support concret ; `support: null` reste
possible uniquement lorsqu'un support répéterait sans valeur les tâches déjà
affichées.

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

### Stratégie temporairement retirée du Plan d'action

La génération courante ne demande plus de stratégie à partir d'une
problématique ponctuelle. L'interface ne rend ni onglet `Stratégie`, ni cartes
Alignement, Positionnement, Offre ou Promotion. Cette simplification ne
supprime pas définitivement la Stratégie du produit : les schémas et lecteurs
historiques restent isolés afin de pouvoir réactiver ultérieurement un contrat
stratégique explicitement validé. Aucune migration destructive n'est créée
pour les quelques anciens plans.

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

La homepage conserve le grand champ comme entrée principale, mais la navigation
`Plan d’action / Opportunités / Académie` est visible et utilisable dès
l'arrivée. Le visiteur peut consulter les Actions ou les Solutions depuis les
deux sous-onglets du Plan, ainsi que les Opportunités ou l'Académie, sans
générer de plan et sans créer de compte. Les anciennes URLs utilisant
`view=system` restent acceptées, mais tout nouveau lien applicatif vers les
Solutions utilise `view=plan&planTab=solutions` et conserve le contexte
`system`, `systemTab` et `resource`. Les routes publiques `/systemes` ne sont
pas renommées. Les fiches publiques conservent
`Organisation / Solutions / Ressources`, tandis que la vue intégrée n'affiche
que Solutions. Ses choix Système restent en mémoire
de page jusqu'à une sauvegarde volontaire.

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

La même navigation applicative est conservée. Coaching reste accessible depuis
l'action compacte `Échanger`, conformément aux ADR 0009 et
0010, sans devenir un cinquième onglet.

La surface porte le titre `Échanger avec l’équipe Demaa`. La copie précise que
l'équipe mobilise le spécialiste adapté ; les termes `coach` et `votre coach`
ne sont pas utilisés comme libellés humains.

## Persistance

### Invité

- Le plan vit dans l'état de la page ou de la session courante.
- Aucun `localStorage` durable n'est une seconde source de vérité.
- Seul le slug du Système choisi est mémorisé dans ce navigateur pour éviter
  de redemander l'activité à chaque visite ; aucun contenu de plan, aucune
  situation et aucune donnée métier détaillée n'y sont stockés.
- Une actualisation ou une fermeture pendant la génération ou l'accès peut
  faire perdre le résultat non sauvegardé.
- Le résultat généré reste en mémoire et n'est révélé qu'après la création ou
  la reprise d'un accès. Un plan vierge peut encore être préparé avant cette
  étape.

### Après sauvegarde

- Firebase/cloud devient l'unique source persistante.
- Le compte sert dans le MVP à conserver et retrouver le plan.
- Le partage par lien reste différé jusqu'à validation d'un accès en lecture
  seule, révocable, limité et non indexable.
- Aucun miroir local durable concurrent n'est maintenu.

Pendant la génération, l'invité voit uniquement l'écran de progression et les
questions éditoriales. Lorsque le résultat est prêt, un écran d'accès compact
est présenté avant toute révélation. Après création ou reprise de session, la
sauvegarde crée directement le plan actif puis ouvre sa page persistée. Les
modifications y sont enregistrées avec révision optimiste. Le plan vierge reste
le seul parcours pouvant commencer temporairement avant une modification utile.

Lorsqu'une session connectée revient dans l'application sans demander une
nouvelle situation, `/plans` restaure le dernier plan sauvegardé. S'il n'en
existe aucun, l'application ouvre explicitement `/?new=1`. Le paramètre
`new=1` est donc réservé à la création volontaire d'un plan vierge et ne doit
jamais remplacer silencieusement un plan déjà enregistré.

L'identité primaire est un compte e-mail et mot de passe Firebase, matérialisé
par un cookie de session Firebase natif et son UID. Demaa ne reçoit ni ne
stocke le mot de passe. Google utilise exactement la même session. L'UID est
l'unique clé d'autorisation des plans, conversations et brouillons. Une fois la session Firebase créée, les formulaires fonctionnels
(guides métier, Opportunités, Coaching, inscription et demandes) réutilisent
l'e-mail de la session côté serveur et ne le redemandent pas. Un visiteur non
connecté qui déclenche l'une de ces actions passe d'abord par l'un de ces
parcours vérifiés, puis revient directement à son intention dans l'application. Il n'existe pas
d'expérience publique distincte `Mon espace` ou `Mes plans`.

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

## Commande IA sur un plan existant — activée sous enveloppe minimale

Le contrat de commande et l'application déterministe des opérations permettent
d'ajouter, modifier ou supprimer une action. L'utilisatrice a explicitement
autorisé le 12 août 2026 l'envoi
de l'enveloppe minimale suivante à Vercel AI Gateway et à son fournisseur :

- la commande rédigée par la personne ;
- les actions actuellement visibles et leurs modifications effectives ;

La Stratégie n'étant plus visible ni générée dans le contrat courant, aucune
donnée stratégique n'est transmise par cette commande.

Sont exclus de cette enveloppe : notes, e-mail, identité de compte ou de
session, situation source, historique, Systèmes sélectionnés, coches
d'Organisation,
sélections Solutions et catalogue des 115 activités. Les opérations retournées
sont validées et appliquées déterministiquement ; le mode démo n'effectue aucun
appel externe. Le ledger conserve uniquement les métriques techniques.

Si la commande est ultérieurement activée, le ledger n'enregistrera que ses
métriques d'usage ; jamais le texte de commande, le prompt ou le contenu du
plan.

## Décisions rejetées

| Proposition | Règle active |
| --- | --- |
| Questionnaire en quatre champs avant génération | Un grand champ libre |
| Prix ferme de 5 EUR | Pricing ouvert |
| Trois actions maximum | Nombre adapté à la situation |
| Un seul pilier stratégique développé | Quatre piliers visibles |
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
conformément à l'ADR 0009 : une conversation écrite ou vocale simple, sans
onglets Messages/Formules. Chaque UID Firebase dispose d'une première
clarification offerte, clôturée manuellement par la Team Demaa avec sa réponse
finale. L'offre `Coach business` est présentée séparément dans Services : son
sélecteur affiche 1 session à 350 EUR ou 2 sessions à 550 EUR HT/mois. Son CTA
`Être rappelé(e)` transmet une intention sans connexion ni paiement public.
La Team Demaa qualifie ensuite le besoin, le matching et le rythme avec le
dirigeant.

Un accompagnement mensuel actif ouvre 12 % de réduction sur les autres
prestations directement facturées par Demaa. Coach business est confirmé par
Stripe ; une relation Expert-comptable est confirmée manuellement par la Team
Demaa. Les avantages ne se cumulent pas. Les honoraires de partenaires ou
d'experts-comptables, les budgets média, logiciels et frais de tiers restent
exclus. Le droit est vérifié côté serveur à partir de l'UID avant devis ou
paiement.
Restent
au backlog, sans modifier cette première version :

- les limites raisonnables d'usage et la capacité opérationnelle ;
- les évolutions de capacité humaine et de promesse de délai ;
- les nouveaux canaux ou formats de messagerie ;
- les évolutions de droits, confidentialité et conservation des échanges ;
- les évolutions de tarification et de limites de service ;
- le multi-tenant et le sélecteur d'entreprise ;
- l'enrichissement facultatif du profil entreprise.

## Critères d'acceptation MVP

- Aucun questionnaire ne précède le premier résultat.
- Le moteur choisit un `systemId` parmi les 115 slugs canoniques.
- Le résultat comporte des actions exécutables et les quatre piliers.
- Le changement de Système ne consomme aucune génération et ne change pas la
  stratégie.
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
- La dictée utilise l'adaptateur microphone partagé et ne conserve aucun audio.
- Le ledger ne contient aucun prompt, commande ou contenu de plan.
- La commande IA n'envoie que l'enveloppe externe minimale explicitement
  autorisée ; elle reste inactive en mode démo.
- `/systemes`, `/academie` et les fiches publiques existantes restent intactes.
