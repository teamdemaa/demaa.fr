# ADR 0014 — Produit international commun et disponibilité par marché

Date : 16 août 2026
Statut : validé, socle partiel en Preview, activation publique en pause
Décision : D-085

## Contexte

Les premiers cadrages de la bêta anglaise limitaient son périmètre au Plan
d'action, repoussaient Solutions et Académie, excluaient Échanger et prévoyaient
de réserver Opportunités aux entreprises clientes. Ces hypothèses ne permettent
pas de tester la proposition de valeur complète de Demaa et encouragent la
création de variantes fonctionnelles par langue.

La cible validée est un produit unique dont le comportement métier est commun
par défaut. Les différences de langue, de marché, de pays et de devise sont des
projections explicites, jamais des applications parallèles. La reprise du
chantier le 20 août 2026 confirme également que les référentiels existants sont
les sources canoniques à étendre : 115 slugs métier, 37 familles Process, le
registre Solutions versionné, l'annuaire Outils, le catalogue Services et le
catalogue Ressources. Aucun catalogue international parallèle n'est créé.

Cette décision supersède, pour ce périmètre, les formulations indiquant :

- « English Beta = Action Plan uniquement » ;
- Solutions et Academy après la bêta initiale ;
- Échanger ou `Talk to us` absent de l'anglais ;
- Opportunités réservé immédiatement aux entreprises clientes ;
- `Envoyer ma demande` dépendant de la future messagerie par sujets ;
- un générateur, une API, une administration ou un système commercial propre à
  l'anglais.

## Décision d'architecture

Demaa reste une seule application. Toute évolution fonctionnelle s'applique à
toutes les langues et à tous les marchés, sauf exception limitée et documentée
avec un scope explicite :

```text
scope: locale=en
```

ou :

```text
scope: market=global-en-beta
```

Sans scope, l'évolution appartient au socle commun.

Sont communs par défaut : authentification, comptes, entreprises, membres,
génération, sauvegarde, autosauvegarde, navigation, erreurs, reprises,
Solutions, Académie, Échanger, demandes d'accompagnement, administration,
notifications, permissions, sécurité et accessibilité.

Le runtime doit utiliser :

- des composants partagés ;
- des contrats métier indépendants de la langue ;
- des dictionnaires de traduction ;
- une configuration centrale par marché ;
- des projections éditoriales localisées ;
- des tests communs exécutés avec plusieurs contextes.

Les identifiants canoniques existants sont conservés :

- le `slug` de `enterprise-annuaire.json` est le `systemId` produit ; le champ
  historique `id` de forme `e1`, `e2`, etc. n'est pas utilisé par les nouveaux
  contrats ;
- `métierId`, `familyId`, `processId`, `documentId` et `stepId` restent ceux du
  référentiel Process généré ;
- les outils utilisent le slug normalisé de l'annuaire Outils ;
- Solutions conserve `resourceSlug` et `placementId` ;
- Services conserve les slugs du catalogue canonique et continue d'être
  composé au rendu, sans être dupliqué pour chaque métier ou persisté 115 fois.

Les projections localisées et les règles de disponibilité ne peuvent pas créer
une nouvelle identité. Elles doivent référencer un identifiant canonique connu,
être versionnées et échouer fermées si leur contenu est incomplet.

Sont interdits : composant anglais copié, API anglaise parallèle, générateur
anglais séparé, deuxième système de demandes ou de conversations, conditions
`locale === "en"` dispersées et fallback silencieux vers du contenu français.

## Contexte international

Quatre dimensions sont distinctes :

```text
localeCode
marketCode
countryCode
currencyCode
```

- `localeCode` détermine la langue de l'interface active ;
- `marketCode` détermine les fonctionnalités et le catalogue disponibles ;
- `countryCode` décrit le pays d'établissement de l'entreprise et les règles
  locales applicables ;
- `currencyCode` détermine la devise d'affichage, de devis et de facturation.

La langue du contenu d'un plan est distincte de la locale de l'interface. Un
plan enregistre `contentLocaleCode` et `marketCodeAtCreation`. Changer la
langue des menus ne traduit jamais un plan existant et ne modifie jamais son
marché de création. Les commandes IA utilisent `contentLocaleCode`, pas la
locale courante de l'interface.

Configuration française initiale :

```text
localeCode: fr
marketCode: fr-fr
countryCode: FR lorsque connu
currencyCode: EUR
```

Configuration English Beta :

```text
localeCode: en
marketCode: global-en-beta
countryCode: nullable
currencyCode: défini séparément
```

La langue anglaise ne déduit ni États-Unis, ni droit américain, ni fiscalité
américaine, ni USD. Le contexte est résolu centralement côté serveur à partir
de l'entreprise et des configurations validées. Ni le navigateur, ni un
`companyId`, un marché, un pays ou une devise envoyés seuls par le client ne
constituent une autorité métier. Les routes de lecture et de mutation
revérifient la session, l'entreprise et l'appartenance avant d'appliquer ce
contexte.

La France reste sans préfixe. La bêta anglaise utilise `/en`.

Les nouveaux plans enregistrent explicitement leur langue et leur marché. Les
plans historiques qui ne possèdent pas encore ces champs sont lus comme
`fr/fr-fr` afin de préserver leur comportement ; aucun backfill global n'est
autorisé avant audit des documents et plan de migration idempotent.

## Résolution de la langue

Demaa conserve une seule identité Firebase, une seule entreprise et un seul
espace de plans pour toutes les langues.

La locale de l'interface est résolue dans cet ordre :

1. route explicitement localisée ;
2. choix manuel enregistré ;
3. préférence `preferred_locale_code` du membre connecté ;
4. cookie du visiteur ;
5. langue du navigateur lors de la première visite ;
6. français par défaut.

`/` reste la route française canonique et `/en` la route anglaise canonique.
Une route explicitement ouverte n'est jamais remplacée silencieusement par une
autre langue. Lors de la première visite, la langue du navigateur peut proposer
l'anglais, mais ne force pas une redirection depuis une URL explicitement
française.

Après un choix manuel, la préférence est enregistrée dans un cookie puis, pour
un membre connecté, dans son profil. L'authentification conserve la locale et
un `returnTo` interne validé. Un parcours Google commencé sous `/en` doit
revenir dans le contexte anglais, jamais à la racine française.

Le runtime possède déjà une préférence membre dans la collection
`member_preferences`. Son identifiant de document est dérivé du UID Firebase ;
le document contient notamment `schema_version`, `member_uid`,
`preferred_locale_code`, `created_at` et `updated_at`. Ce contrat réel est
conservé et étendu si nécessaire : aucune collection concurrente
`customer_preferences` n'est créée. Le document ne duplique ni e-mail ni
identité Firebase, ne place pas la préférence sur l'entreprise et ne la
rattache pas à une seule appartenance. Sa rétention et sa suppression suivent
le membre.

La locale active contrôle l'interface autour d'un plan ;
`contentLocaleCode` contrôle la langue du contenu et des commandes IA. Les
routes `latest` ouvrent le dernier plan accessible sans filtrer les plans d'une
autre langue. `Mes plans` / `My plans` réunit tous les plans accessibles et
indique leur langue d'origine avec un repère `FR` ou `EN`.

Les responsabilités restent séparées :

- `preferred_locale_code` appartient au membre ;
- `countryCode`, `marketCode` et `currencyCode` appartiennent à l'entreprise ;
- `contentLocaleCode` et `marketCodeAtCreation` appartiennent au plan pour
  préserver son historique.

Les e-mails liés à une demande ou une conversation utilisent la langue de
cette demande ou conversation. Les e-mails génériques utilisent la préférence
du membre.

Les champs `contentLocaleCode` et `marketCodeAtCreation` appartiennent à
l'enveloppe Firestore et à l'index du plan, jamais au JSON métier produit par
l'IA. Ils sont initialisés à la création puis conservés pendant les écritures.

Dans Firestore, le nom persistant est `preferred_locale_code` pour la
préférence membre, `country_code`, `market_code` et `currency_code` pour
l'entreprise, puis
`content_locale_code` et `market_code_at_creation` pour le plan. Les champs
entreprise restent optionnels pour les documents historiques et aucun backfill
des plans n'est requis pour lire les valeurs françaises par défaut.

Les caches de contenus et de projections sont indexés par `localeCode` et
`marketCode`, puis par `systemId`, `courseId` ou `contentVersion` lorsqu'ils
s'appliquent. Le cache Académie global et les caches Système qui ne connaissent
que le slug ne peuvent pas être partagés entre marchés.

La PWA reste une seule application et réutilise les mêmes icônes et le même
runtime. Ses manifestes sont toutefois projetés par locale afin que le point
d'entrée français reste `/` et le point d'entrée anglais `/en`. Aucun manifeste
anglais ne doit ramener silencieusement l'utilisateur à la racine française.

## Périmètre English Beta

### Amendement du 20 août 2026 — pause et parité métier

`/en` reste derrière un flag serveur, absent de l'ouverture publique et en
`noindex` avant un nouveau GO explicite. Sa présence technique en Preview ne
constitue pas une activation commerciale. L'implémentation Preview partielle a
révélé des variantes parallèles dans Academy, Services et Pilotage. Elles
doivent être remplacées par les mêmes structures fonctionnelles que le
français, uniquement localisées.

La cible métier est également corrigée : l'anglais doit couvrir les mêmes
métiers de petites entreprises que le français. La liste initiale centrée sur
SaaS, agences digitales, consultants et activités en ligne est supersédée.
Les 115 slugs de l'annuaire français et les 37 `familyId` du référentiel
Process sont les seules identités canoniques. Une matrice explicite de
projections et de disponibilité peut ne publier qu'un sous-ensemble validé
pendant une Preview, mais elle ne peut ni inventer un métier anglais, ni changer
son `systemId`, ni déduire sa disponibilité de la seule langue.

Le libellé commercial anglais est `Services`, jamais `Accompaniment`.
Chiffres et Stratégie partagent les données entreprise entre langues. Academy
conserve la même structure, les mêmes leçons, visuels, quiz et actions.
`Business Processes` n'appartient pas à la première bêta : traduire la carte ne
suffirait pas, car la fonctionnalité dépend de 526 processus et de milliers
d'étapes opérationnelles. Elle restera masquée jusqu'à publication complète et
validée de leurs projections. Le prix économique reste référencé en EUR puis
converti dans une structure tarifaire de marché ; le taux, sa date, la devise,
le montant arrondi et le montant proposé sont verrouillés lors du devis. Aucun
prix n'est stocké dans une traduction, aucun remplacement de chaîne n'effectue
une conversion et aucune majoration ne résulte uniquement de l'anglais.

La bêta cible contient, après fermeture de ces gates :

- Action Plan ;
- Solutions ;
- Academy ;
- Talk to us.

Elle ne contient pas :

- Opportunities ;
- Resources, Business Processes et modèles non internationalisés ;
- aides, financements et formalités françaises ;
- fournisseurs ou partenaires strictement français.

Aucun onglet vide ou « bientôt disponible » n'est affiché.

### Action Plan

Les textes d'entrée canoniques sont :

```text
What’s holding your business back?
Clarify your priorities and build a more profitable business that depends less on you.
Create my action plan
```

Le parcours, les statuts, le schéma `ActionPlan`, l'idempotence, les contrôles
qualité, la propriété entreprise et la reprise sont identiques au français.
Le moteur partagé reçoit au minimum `localeCode`, `marketCode` et la liste
serveur `supportedSystemIds`. Il génère en anglais naturel dans le même appel et
ne duplique aucun processus métier.

Le périmètre réutilise les slugs universels du catalogue français des petites
entreprises. Les libellés, descriptions et alias anglais sont des projections
référençant ces slugs. Les processus conservent les `métierId`, `familyId`,
`processId`, `documentId` et `stepId` existants. Aucun `systemId` anglais
parallèle n'est autorisé.

### Solutions

Solutions affiche `Tools` et `Services`. Aucune section Resources n'est rendue
dans la première bêta.

Les outils réutilisent l'annuaire Outils, ses slugs normalisés et les placements
du registre Solutions existant. Les textes sont des projections éditoriales
localisées ; la disponibilité marché/pays est un contrat séparé et n'est jamais
stockée dans la traduction. Le serveur filtre par
`systemId + localeCode + marketCode + countryCode`. Une carte anglaise ne peut
jamais ouvrir une fiche française et les caches sont isolés par langue, marché,
révision et contenu.

Le registre Solutions Firebase et son fallback Git restent une seule lignée
versionnée. Un adaptateur de lecture conserve les révisions historiques et les
interprète comme françaises pour `fr-fr`; aucune donnée anglaise n'est inférée.
Une évolution de schéma doit publier atomiquement identités, projections et
disponibilités sous une nouvelle révision avant de déplacer le pointeur actif.

La résolution est déterministe et échoue fermée : valider le métier, la
publication de la ressource et du placement, appliquer les exclusions puis les
inclusions marché/pays, exiger une projection publiée dans la locale, composer
les Services canoniques, filtrer les sections publiques, dédupliquer et enfin
conserver le classement éditorial. Les règles de famille peuvent aider à
générer des placements traçables, mais aucun second moteur d'héritage global,
famille et métier ne doit reconstruire le catalogue à chaque rendu.

Les services étendent le catalogue canonique existant et utilisent les mêmes
slugs, modales, demandes et administration que la France. Aucun catalogue
anglais, aucune persistance par métier et aucun DTO Services parallèle ne sont
créés. Seules les prestations
réalisables à distance et en anglais sont publiées : Business coaching,
Process automation and AI, Targeted B2B prospecting et Paid acquisition
uniquement si la capacité réelle est validée. `Business application` reste
masquée tant que Demaa ne peut pas assurer cadrage, livraison et support en
anglais. `Process automation and AI` reste une seule prestation : l'IA est
intégrée à l'automatisation et ne crée pas une offre parallèle. Les forfaits et
le parcours de demande suivent D-089 sans contrat anglais parallèle.

Sont masqués : Expert-comptable, aides, financements, formalités et assistance
locales, prestations réglementées, partenaires non qualifiés et ressources
françaises.

Le CTA canonique est `Envoyer ma demande` en français et `Send my request` en
anglais. Il ne déclenche aucun paiement. Il conserve la prestation et sa
source, reprend le contexte lorsqu'une authentification est nécessaire,
rattache la demande à l'UID et à l'entreprise lorsqu'ils sont disponibles,
utilise l'administration et les notifications existantes et confirme un retour
sous 24 à 48 heures.

La demande peut enregistrer `localeCode`, `marketCode`, `countryCode`,
`currencyCode`, `serviceSlug`, `systemId` et `sourcePage`, mais le serveur
recalcule les données d'entreprise qui font autorité. Aucun panier, checkout groupé,
paiement anglais, marketplace, portail partenaire, WhatsApp ou second back
office n'est créé. Pour `scope: market=global-en-beta`, cette absence de
WhatsApp supersède uniquement le canal de contact France défini par D-075 et
l'ADR 0006 : la demande anglaise passe par l'identité e-mail existante et le
suivi administratif partagé. Le formulaire et le suivi WhatsApp manuel restent
inchangés pour `scope: market=fr-fr`.

Les prix Services et forfaits restent des données structurées hors des textes
localisés. Le resolver de marché part d'un montant économique canonique,
applique une conversion et un arrondi explicitement configurés, puis produit un
prix d'affichage ou de devis traçable. Un prix indicatif n'engage pas un montant
de facturation ; seul le devis validé verrouille devise, taux, date et montant.

### Talk to us

`Talk to us` réutilise la conversation Échanger, ses brouillons, sa dictée, ses
statuts, son administration, ses notifications, la clarification gratuite et
la clôture. Le contexte ajoute langue, marché, pays connu et source afin que la
Team réponde dans la bonne langue.

La future architecture de sujets/dossiers reste différée et ne bloque pas la
bêta anglaise.

### Academy

Academy réutilise la même API, le même lecteur, les quiz, la progression, les
caches et les composants. Elle publie uniquement huit fondamentaux validés :
Cash flow, Revenue and profit, Pricing, Marketing and sales, Turning enquiries
into customers, Delegation, Building a clear offer et Delivering consistently.

Le contrat éditorial canonique contient `courseId`, les mêmes `lessonId`,
`visualId`, `quizId` et `actionId`, puis des projections localisées assorties de
`contentVersion`, `marketCodes` et `publicationStatus`. La parité porte sur
l'ordre, le nombre de leçons, les visuels, les quiz et les actions ; une
Academy anglaise simplifiée ou parallèle est interdite. Les contenus et caches
ne retombent jamais silencieusement sur le français.

Le runtime conserve déjà la progression Académie dans `localStorage`, avec une
clé fondée sur `localeCode + contentVersion + courseId`. Cette persistance est
préservée telle quelle pendant ce chantier. Le `courseId` stable reste distinct
du slug localisé ; aucune fusion, migration ou mise en commun de la progression
entre langues n'est introduite dans la première bêta. Une éventuelle identité
de progression commune aux langues fera l'objet d'une décision produit
distincte après validation du curriculum canonique.

### Recommandations contextuelles

Les recommandations d'outils, services, processus ou ressources ne sont pas
dans le chemin critique de la bêta anglaise. Le résolveur français existant
reste conservateur et continue de s'abstenir lorsqu'il ne possède pas assez de
contexte. Aucun nom de produit ou prestataire ne doit être inventé par l'IA.

Une évolution ultérieure pourra faire produire une capacité canonique par
l'IA, puis la résoudre côté serveur selon le métier, la famille, le marché, le
pays, le catalogue validé et la projection locale. Cette évolution possède sa
propre recette de pertinence. Elle reste désactivée en anglais tant que le
pilote français correspondant n'est pas validé et ne bloque ni la
mutualisation des écrans, ni Action Plan, ni Academy.

## Opportunités

La décision historique du 16 août consistant à masquer Opportunités dans les
navigations et à conserver un accès par lien a été exécutée, puis supersédée
par la réactivation française du 18 août 2026. Dans le produit français,
Opportunités est de nouveau une destination applicative en quatrième position
et `/opportunites` est une page publique indexable. Cartes, filtres, modales,
soumissions et protections serveur existantes sont conservés.

La réservation aux entreprises clientes reste différée. Aucun droit
commercial, abonnement obligatoire ou `403` supplémentaire n'est introduit.
La disponibilité d'Opportunities est désormais une règle centrale de marché :
active pour `fr-fr`, inactive pour `global-en-beta`. L'anglais ne doit ni
afficher l'onglet, ni publier la route ou les contenus français par fallback.
Cette différence ne doit pas être codée comme une condition opportuniste dans
la navbar.

## Programmes différés

Restent au backlog sans bloquer cette décision : Business Processes et
ressources anglaises complètes, recommandations contextuelles anglaises,
messagerie par sujets,
dossiers commerciaux avancés, CRM enrichi, notifications e-mail avancées,
panier, checkout groupé, WhatsApp, marketplace, portail partenaire, catalogue
US, adaptation réglementaire pays par pays et titre animé
entreprise/agence/startup.

## Séquencement

Chaque étape est une PR autonome, testée, compatible avec la France et non
fusionnée sans GO explicite :

1. audit et contrats : figer les 115 slugs, les 37 familles, les identifiants
   Process/Solutions/Outils/Services et la matrice de publication ;
2. fondation internationale cachée : résolution serveur du contexte,
   projections et disponibilités typées, adaptateurs legacy, caches isolés et
   `/en` sous flag/noindex ;
3. mutualisation des écrans et API consommateurs sans traduction massive, en
   prouvant un comportement français inchangé ;
4. projections métier, Services et Outils puis parité Action Plan, Chiffres,
   Stratégie, My plans et Talk to us ;
5. Academy canonique et traductions complètes, en préservant la persistance de
   progression existante sans la fusionner entre langues ;
6. e-mails, confidentialité, PWA, metadata, formats et accessibilité ;
7. recette English Beta intégrée puis testeurs anglophones ;
8. activation publique et SEO uniquement sous GO séparé.

Business Processes et les recommandations contextuelles restent des lots
ultérieurs indépendants. Ils ne conditionnent pas l'ouverture de cette première
bêta.

## Gates de recette

Les parcours partagés sont testés avec `fr/fr-fr` et
`en/global-en-beta`. La recette couvre TypeScript, ESLint, tests unitaires et
d'intégration, build Production, E2E desktop/mobile/PWA, clavier, lecteur
d'écran, auth e-mail/Google, génération et réouverture, demandes visibles dans
l'administration, Talk to us, huit cours, progression, caches, `html lang`,
canonical, `hreflang`, sitemap, absence d'Opportunities/Resources en anglais et
absence de fallback français. Elle couvre également la priorité de résolution
de locale, la persistance du choix manuel, le retour Google sous `/en`,
`latest` à travers plusieurs langues, l'indicateur `FR`/`EN`, l'absence de
traduction automatique d'un plan et l'usage de `contentLocaleCode` par l'IA et
les notifications contextuelles.

Les tests structurels vérifient aussi la bijection entre les 115 slugs de
l'annuaire et les 115 métiers du référentiel Process, l'appartenance de chaque
métier à une des 37 familles connues, l'absence d'identifiant anglais parallèle,
la complétude des projections publiées, l'indépendance entre traduction et
disponibilité, la compatibilité de lecture des révisions Solutions historiques,
les prix structurés hors dictionnaires et le refus de tout contenu français
sous `/en`.

La France ne doit subir aucune régression. Aucun runtime ne commence avant un
audit des écarts, des fichiers partagés, des migrations, des collisions et des
tests propres à chaque PR.
