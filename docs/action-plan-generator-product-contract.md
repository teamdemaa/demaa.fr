# D-076 — Contrat produit du générateur de plan d'action

- Statut : `validated`
- Date de consolidation : 12 août 2026
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
→ rendu Actions + Stratégie
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
`src/lib/enterprise-annuaire.ts`. Les Process, Solutions et Ressources complets
des 115 Systèmes ne sont jamais envoyés ensemble au modèle.

La réponse contient un `systemId` dont la valeur est l'un des slugs canoniques
du catalogue. L'application
charge ensuite uniquement le Système sélectionné depuis ses sources
canoniques existantes.

### Résultat minimal V3

Le schéma JSON est versionné. Il porte au minimum :

```text
version = "3"
summary
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
  strategyPillar
strategy
  alignment
    direction
    startingPoint
    decisionRules
  positioning
  offer
  promotion
```

La V3 conserve le nettoyage V2 de `why`, `estimatedMinutes`, `deliverable`,
`successCriterion` et `ethicalGuardrail`, remplace `weeklyActions` par
`actions`, et remplace le support historique générique `readyToUse` par un
support typé. Les types autorisés sont `message`, `email`, `script`,
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

Le lecteur de persistance reste compatible avec les plans V1, V2 et `manual` :

- un plan V1 est normalisé en V2 en mémoire ;
- un plan V2 conserve ses champs et libellés historiques ;
- un plan manuel conserve ses champs éditables et peut rester vide ;
- aucun ancien document n'est silencieusement réétiqueté V3 ou réécrit dans
  Firebase à la lecture.

Chaque action contient les éléments nécessaires à son exécution. Le message ou
modèle prêt à l'emploi reste facultatif. Le nombre est adapté à la situation,
entre trois et cinq en V3. Les lecteurs historiques continuent d'accepter
jusqu'à sept actions pour ne pas invalider un ancien plan V1, V2 ou manuel.

### Quatre piliers conservés

1. **Alignement** : `direction` décrit le cap durable recherché,
   `startingPoint` le point de départ réellement connu (forces, ressources,
   contraintes et dépendances), et `decisionRules` les critères concrets pour
   accepter, prioriser ou refuser une action.
2. **Positionnement** : client précis, problème important, alternatives,
   faits et hypothèses explicites.
3. **Offre** : résultat, périmètre, prix, engagement et risques à clarifier.
4. **Promotion** : attirer, faciliter l'achat, fidéliser et renforcer la
   relation sans forcer.

Le MVP ne produit pas d'étude de marché automatique. Une information de marché
non fournie et non établie reste une hypothèse à vérifier, jamais un fait
inventé.

## Présentation du résultat

### Accueil

L'ordre principal est :

1. **À faire cette semaine** ;
2. **Stratégie**, avec les quatre piliers en dépliants.

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

### Onglet Système

- Le Système détecté est sélectionné par défaut.
- Une dropdown discrète permet de choisir l'un des 115 Systèmes.
- Le changement charge ses Process, Solutions et Ressources existants.
- Il ne déclenche aucun appel IA.
- Il ne réécrit pas la stratégie générée.

Le Système n'est donc pas une deuxième recommandation générée : il est le
contenu canonique existant chargé à partir du `systemId` courant.

Un plan sauvegardé peut mémoriser plusieurs Systèmes consultés. L'espace de
travail conserve leur liste sans doublon, le Système actif, ainsi que les
coches Process et sélections Solutions séparément pour chaque Système. Ajouter
ou sélectionner un Système ne déclenche pas d'appel IA et ne modifie pas la
Stratégie.

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
`Plan d’action / Système / Académie / Opportunités` est visible et utilisable
dès l'arrivée. Le visiteur peut donc consulter un Système, l'Académie ou les
Opportunités sans générer de plan et sans créer de compte. Ses choix Système
restent en mémoire de page jusqu'à une sauvegarde volontaire.

Les univers publics `/systemes` et `/academie`, leur navigation et leur SEO
restent accessibles. L'ADR 0008 ne transforme pas ces routes en espace privé.

### Après connexion

La même navigation applicative est conservée. Coaching reste accessible depuis
l'action compacte `Parler à un spécialiste`, conformément aux ADR 0009 et
0010, sans devenir un cinquième onglet.

`Coaching` désigne le produit. Dans l'interface, la personne qui accompagne est
toujours désignée comme un `spécialiste` : l'action de messagerie porte le
libellé `Écrire à un spécialiste`. Les termes `coach` et `votre coach` ne sont
pas utilisés comme libellés humains.

## Persistance

### Invité

- Le plan vit dans l'état de la page ou de la session courante.
- Aucun `localStorage` durable n'est une seconde source de vérité.
- Seul le slug du Système choisi est mémorisé dans ce navigateur pour éviter
  de redemander l'activité à chaque visite ; aucun contenu de plan, aucune
  situation et aucune donnée métier détaillée n'y sont stockés.
- Une actualisation ou une fermeture peut faire perdre le résultat.
- Le résultat est visible avant connexion.

### Après sauvegarde

- Firebase/cloud devient l'unique source persistante.
- Le compte sert dans le MVP à conserver et retrouver le plan.
- Le partage par lien reste différé jusqu'à validation d'un accès en lecture
  seule, révocable, limité et non indexable.
- Aucun miroir local durable concurrent n'est maintenu.

Pour un invité, la sauvegarde crée un plan temporaire `pending_claim` avec un
accès limité à trente jours par cookie HttpOnly et un secret non stocké en
clair. Le lien magique associe le jeton, l'e-mail normalisé et ce plan ; sa
consommation rattache atomiquement le plan à l'adresse vérifiée. Pour une
personne déjà connectée, la sauvegarde crée directement le plan actif puis
ouvre sa page persistée. Les modifications y sont enregistrées avec révision
optimiste et prolongent la durée de conservation depuis la dernière mise à
jour.

Lorsqu'une session connectée revient dans l'application sans demander une
nouvelle situation, `/plans` restaure le dernier plan sauvegardé. S'il n'en
existe aucun, l'application ouvre explicitement `/?new=1`. Le paramètre
`new=1` est donc réservé à la création volontaire d'un plan vierge et ne doit
jamais remplacer silencieusement un plan déjà enregistré.

Le lien magique est l'unique point d'établissement de l'identité e-mail dans
l'application. Une fois la session créée, les formulaires fonctionnels
(guides métier, Opportunités, Coaching, inscription et demandes) réutilisent
l'e-mail vérifié côté serveur et ne le redemandent pas. Un visiteur non
connecté qui déclenche l'une de ces actions passe d'abord par le lien magique,
puis revient directement à son intention dans l'application. Il n'existe pas
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

Le contrat de commande et l'application déterministe des opérations sont
préparés pour ajouter, modifier ou supprimer une action et modifier une réponse
de Stratégie. L'utilisatrice a explicitement autorisé le 12 août 2026 l'envoi
de l'enveloppe minimale suivante à Vercel AI Gateway et à son fournisseur :

- la commande rédigée par la personne ;
- les actions actuellement visibles et leurs modifications effectives ;
- les réponses actuellement visibles des quatre piliers de Stratégie.

Sont exclus de cette enveloppe : notes, e-mail, identité de compte ou de
session, situation source, historique, Systèmes sélectionnés, coches Process,
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

La première version de Coaching fait partie de l'application conformément à
l'ADR 0009 : Messages ouverts par défaut, Sessions et demandes coordonnées
manuellement. Restent
au backlog, sans modifier cette première version :

- une nouvelle frontière entre phase gratuite et phase payante ;
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
