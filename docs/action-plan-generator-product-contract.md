# D-076 — Contrat produit du générateur de plan d'action

- Statut : `validated`
- Date de consolidation : 10 août 2026
- Propriétaires de décision : utilisatrice + Master Demaa
- Portée : entrée libre, génération IA, résultat, sélection du Système métier,
  persistance et garde-fous
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

> Décrivez votre situation. Repartez avec un plan d'action concret.

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

### Résultat minimal

Le schéma JSON est versionné. Il porte au minimum :

```text
version
summary
systemId
systemReason
weeklyActions[]
  id
  title
  objective
  channelOrTool
  steps[]
  readyToUse
  strategyPillar
strategy
  alignment
  positioning
  offer
  promotion
assumptions[]
```

La V2 retire `why`, `estimatedMinutes`, `deliverable`, `successCriterion` et
`ethicalGuardrail` du contrat généré. Le lecteur de persistance accepte les
plans V1 déjà sauvegardés et les normalise en mémoire sans réécriture forcée du
document Firebase.

Chaque action contient les éléments nécessaires à son exécution. Le message ou
modèle prêt à l'emploi reste facultatif. Le nombre est adapté à la situation,
généralement trois à cinq ; la borne technique de sept protège le coût et la
lisibilité sans imposer une réduction artificielle à trois actions.

### Quatre piliers conservés

1. **Alignement** : entreprise souhaitée, limites, valeurs, priorités et
   renoncements.
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

### Onglet Système

- Le Système détecté est sélectionné par défaut.
- Une dropdown discrète permet de choisir l'un des 115 Systèmes.
- Le changement charge ses Process, Solutions et Ressources existants.
- Il ne déclenche aucun appel IA.
- Il ne réécrit pas la stratégie générée.

Le Système n'est donc pas une deuxième recommandation générée : il est le
contenu canonique existant chargé à partir du `systemId` courant.

## Navigation et compatibilité publique

### Avant connexion

La homepage du générateur affiche seulement la marque Demaa et
`Se connecter` avant le résultat. Les onglets applicatifs ne sont pas affichés
sur cette entrée anonyme.

Les univers publics `/systemes` et `/academie`, leur navigation et leur SEO
restent accessibles. L'ADR 0008 ne transforme pas ces routes en espace privé.

### Après connexion

La navigation applicative affiche Plan d'action, Système, Académie et un repère
Coaching. Ce dernier reste un espace annoncé : le Coaching est exclu
du MVP et aucune capacité, aucun délai ni aucun prix n'y est promis.

## Persistance

### Invité

- Le plan vit dans l'état de la page ou de la session courante.
- Aucun `localStorage` durable n'est une seconde source de vérité.
- Une actualisation ou une fermeture peut faire perdre le résultat.
- Le résultat est visible avant connexion.

### Après sauvegarde

- Firebase/cloud devient l'unique source persistante.
- Le compte sert dans le MVP à conserver et retrouver le plan.
- Le partage par lien reste différé jusqu'à validation d'un accès en lecture
  seule, révocable, limité et non indexable.
- Aucun miroir local durable concurrent n'est maintenu.

Pour un invité, la sauvegarde crée un plan temporaire `pending_claim` avec un
TTL d'une heure et un secret non stocké en clair. Le lien magique associe le
jeton, l'e-mail normalisé et ce plan ; sa consommation rattache atomiquement le
plan à l'adresse vérifiée. Pour une personne déjà connectée, la sauvegarde crée
directement le plan actif puis ouvre sa page persistée. Les modifications y
sont enregistrées avec révision optimiste et prolongent la durée de
conservation depuis la dernière mise à jour.

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
| Persistance invitée durable dans `localStorage` | Mémoire page/session |
| Chaîne multi-agent par défaut | Une génération principale |

## Arbitrages ouverts

- pricing et frontière gratuite/payante ;
- modèle et fournisseur après mesure sur des cas représentatifs ;
- valeurs exactes des quotas et du plafond budgétaire ;
- suppression, export et partage révocable ;
- durée de conservation définitive au-delà de la politique actuelle.

Ces arbitrages ne bloquent pas le prototype et le moteur Preview lorsqu'ils
sont implémentés derrière des limites conservatrices réversibles.

## Backlog explicitement différé

Le Coaching constitue un produit distinct et n'entre pas dans ce MVP. Son
cadrage ultérieur doit couvrir ensemble :

- phase gratuite et phase payante ;
- capacité humaine réelle et promesse de délai ;
- messagerie ;
- appels ou autres canaux ;
- droits, confidentialité et conservation des échanges ;
- tarification et limites de service.

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
- `/systemes`, `/academie` et les fiches publiques existantes restent intactes.
