# ADR 0020 — Produit public sans compte et administration Team Demaa

- Décision : D-094
- Statut : `validated`
- Date : 22 août 2026
- Portée : génération du plan, identité, persistance temporaire, e-mails,
  Diagnostic, formulaires publics, administration et retrait de Pilotage
- Autorisation : préparation par PRs autonomes autorisée ; aucune fusion sur
  `main`, activation Production ou suppression de données sans GO explicite

## Contexte

Tous les comptes client actuellement créés sont des comptes de test. Pour le
produit public français, demander un compte avant la première valeur ajoute un
coût disproportionné : Demaa doit permettre à un dirigeant de décrire sa
situation, générer son plan, le consulter puis choisir de le recevoir par
e-mail ou de demander un Diagnostic.

L'authentification reste nécessaire pour la Team Demaa et les surfaces
d'administration. Les modules Chiffres et Stratégie ne font plus partie de
l'expérience Demaa cible. Leur code et leurs données sont conservés pendant la
transition ; leur réutilisation éventuelle dans The Done Studio est gouvernée
par un handover séparé et ne crée aucun stockage commun.

## Décision

### 1. Parcours public canonique

```text
situation
→ génération publique durable
→ plan affiché
→ recevoir le plan par e-mail ou demander un Diagnostic
```

- aucun compte, mot de passe, Google ou entreprise technique n'est demandé au
  dirigeant ;
- le CTA reste `Créer mon plan d’action` ;
- le plan généré reste privé, non indexable et accessible uniquement au moyen
  d'un secret opaque ;
- l'e-mail n'est demandé qu'au moment d'envoyer le plan ou le Diagnostic ;
- recevoir un plan ne vaut jamais consentement à une newsletter.

### 2. Génération invitée durable

La route authentifiée existante n'est pas simplement rendue publique. Une
frontière invitée dédiée réutilise le moteur ActionPlan V4, ses validations,
réparations, identifiants de requête, leases, états et journal d'usage, mais pas
la propriété par UID ou entreprise.

Le stockage invité conserve au minimum : identifiant de job, empreinte du
secret d'accès, situation, locale de contenu, statut `generating|active|failed`,
résultat, révision, horodatages et expiration. Le secret brut n'est jamais
stocké. Il n'apparaît ni dans les logs, ni dans les métriques, ni dans une URL
publique. Une durée initiale de 24 heures est retenue ; l'e-mail contient le
plan lui-même afin de ne pas transformer ce stockage temporaire en compte
implicite.

Le serveur impose : validation stricte, idempotence, limite par adresse IP de
confiance, quota global quotidien d'usage IA, circuit breaker, taille maximale,
nombre de tentatives borné et comportement fail-closed lorsque les contrôles
durables indispensables ne sont pas disponibles.

### 3. E-mail du plan et Diagnostic

`Recevoir mon plan par e-mail` envoie un e-mail transactionnel et conserve
seulement les traces nécessaires à la livraison et à l'anti-abus. Aucun contact
n'est ajouté à une audience marketing sans consentement distinct.

`Demander un diagnostic` ouvre un formulaire court : e-mail obligatoire,
téléphone facultatif, message facultatif et consentement de contact. La demande
conserve un instantané du plan et de la situation, car le job invité expire.
Le dirigeant reçoit la réponse par e-mail ; aucune conversation ou boîte de
réception client n'est créée.

### 4. Administration séparée

Firebase Authentication est conservé uniquement pour la Team Demaa. La session
admin utilise une route, un cookie HttpOnly et une vérification d'autorisation
distincts. Elle valide l'UID ou l'e-mail dans l'allowlist admin avant de créer
le cookie et ne crée jamais de `company` ni de `company_membership`.

L'administration centralise les demandes par un read-model normalisé et des
adaptateurs sur les collections existantes. Elle ne migre pas aveuglément
`lead_requests`, `service_requests`, `solution_referrals`, Opportunités et les
autres sources vers une collection unique. Chaque source garde ses règles de
stockage, de rétention, d'idempotence et de livraison.

La V1 admin permet au minimum : liste bornée et paginée, source, type, contact,
date, statut, détail, attribution disponible, état de livraison et lien vers
la surface spécialisée lorsqu'elle existe. Les réponses humaines sont envoyées
par e-mail. La synchronisation des réponses entrantes par e-mail reste hors
périmètre.

### 5. Formulaires publics

Les formulaires destinés aux dirigeants ne dépendent plus d'une session
client. Lorsque l'e-mail est nécessaire, il est demandé explicitement et
validé côté serveur. Les routes existantes déjà publiques sont conservées.
Les routes encore liées à l'UID sont soit converties avec le même contrat
anti-abus, soit retirées si elles doublonnent un parcours public existant.

L'avantage commercial mensuel de 12 % ne peut plus être déduit automatiquement
d'un UID client ; la Team le vérifie lors de la qualification. Les textes
contractuels et de confidentialité doivent refléter cette règle.

### 6. Interface Demaa

- retirer `Connexion`, Google, création de compte, Profil, `Mes plans` et les
  routes client de la navigation publique ;
- retirer Diagnostic conversationnel et son historique côté dirigeant ;
- masquer Chiffres et Stratégie dans Demaa ;
- conserver Plan, Solutions, Services, Académie et Opportunités selon leurs
  décisions françaises courantes ;
- conserver les données historiques et lecteurs compatibles pendant la
  période de rollback ;
- ne pas publier les plans personnalisés dans le sitemap ou l'indexation.

### 7. Frontières avec les autres chantiers

- D-091 reste la prochaine priorité éditoriale après stabilisation du parcours
  public. Il ne modifie ni la génération invitée ni l'administration.
- D-085 English Beta reste en pause et ne doit pas être rebasée ou fusionnée
  avant décision de reprise ; sa conception actuelle dépend du modèle compte.
- The Done Studio est un autre produit. Son handover autorise la réutilisation
  de principes et composants après audit, jamais le partage des collections
  Demaa.

## Compatibilité et nettoyage

Le retrait se fait en deux temps : d'abord couper les entrées et écrire les
nouveaux parcours ; ensuite retirer le code et les données devenus réellement
orphelins après observation. Les comptes, plans, entreprises, appartenances,
conversations, métriques et stratégies de test ne sont supprimés qu'après un
inventaire exact et une autorisation destructive séparée.

## Séquencement

1. documentation, inventaire et frontières ;
2. session admin indépendante ;
3. génération invitée derrière un flag désactivé ;
4. e-mail du plan et Diagnostic ;
5. conversion des formulaires et read-model admin ;
6. bascule de l'interface publique ;
7. recette puis activation progressive ;
8. nettoyage différé après période de rollback.

## Critères d'acceptation

1. un visiteur génère et consulte un plan sans compte ;
2. aucune génération ne dépend d'un UID, d'une entreprise ou d'une
   appartenance ;
3. un secret invité ne fuit jamais dans les logs, analytics ou URL publique ;
4. les limites par IP, le budget global et l'idempotence sont testés ;
5. l'e-mail du plan n'inscrit jamais à une audience marketing ;
6. un Diagnostic arrive dans l'administration et peut recevoir une réponse par
   e-mail ;
7. l'admin reste inaccessible sans identité autorisée et ne provisionne aucune
   entreprise ;
8. Chiffres, Stratégie, chat client, Connexion et Mes plans disparaissent du
   parcours public sans destruction prématurée des données ;
9. les anciens liens n'exposent aucune donnée et aboutissent à une redirection
   ou un état explicite ;
10. tests unitaires, intégration, E2E desktop/mobile/PWA, accessibilité, build,
    Preview et smoke sont verts ;
11. aucune PR n'est fusionnée et aucune donnée n'est supprimée sans le GO
    correspondant.
