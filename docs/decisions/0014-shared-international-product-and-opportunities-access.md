# ADR 0014 — Produit international commun et accès Opportunités par lien

Date : 16 août 2026
Statut : validé, runtime non commencé
Décision : D-085

## Contexte

Les premiers cadrages de la bêta anglaise limitaient son périmètre au Plan
d'action, repoussaient Solutions et Académie, excluaient Échanger et prévoyaient
de réserver Opportunités aux entreprises clientes. Ces hypothèses ne permettent
pas de tester la proposition de valeur complète de Demaa et encouragent la
création de variantes fonctionnelles par langue.

La cible validée est un produit unique dont le comportement métier est commun
par défaut. Les différences de langue, de marché, de pays et de devise sont des
projections explicites, jamais des applications parallèles.

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

- `localeCode` détermine la langue de l'interface et du contenu ;
- `marketCode` détermine les fonctionnalités et le catalogue disponibles ;
- `countryCode` décrit la localisation de l'entreprise et les règles locales ;
- `currencyCode` détermine la devise et le format des prix.

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
américaine, ni USD. Le contexte est résolu centralement côté serveur. Le
navigateur ne constitue jamais l'autorité du marché ou des permissions métier.

La France reste sans préfixe. La bêta anglaise utilise `/en`.

Les nouveaux plans enregistrent explicitement leur langue et leur marché. Les
plans historiques qui ne possèdent pas encore ces champs sont lus comme
`fr/fr-fr` afin de préserver leur comportement ; aucun backfill global n'est
autorisé avant audit des documents et plan de migration idempotent.

## Périmètre English Beta

La bêta contient :

- Action Plan ;
- Solutions ;
- Academy ;
- Talk to us.

Elle ne contient pas :

- Opportunities ;
- Resources et modèles non internationalisés ;
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

Le premier périmètre réutilise des `systemId` universels pour SaaS, agences web,
marketing, SEO et acquisition, consultants indépendants et data/BI,
freelances B2B, studios branding/design et formation en ligne. Seuls leurs
libellés, alias et projections anglaises sont ajoutés.

### Solutions

Solutions affiche uniquement `Tools` et `Accompaniment`.

Les outils réutilisent le registre existant et une projection éditoriale par
langue et marché : `localeCode`, `marketCodes`, nom, description, usage,
contraintes et statut de publication localisés. Le serveur filtre par
`systemId + localeCode + marketCode`. Une carte anglaise ne peut jamais ouvrir
une fiche française et les caches sont isolés par langue et marché.

Les accompagnements utilisent le même catalogue, les mêmes modales, les mêmes
demandes et la même administration que la France. Seules les prestations
réalisables à distance et en anglais sont publiées : Business coaching,
Process automation, Targeted B2B prospecting et Paid acquisition uniquement si
la capacité réelle est validée.

Sont masqués : Expert-comptable, aides, financements, formalités et assistance
locales, prestations réglementées, partenaires non qualifiés et ressources
françaises.

Le CTA canonique est `Envoyer ma demande` en français et `Send my request` en
anglais. Il ne déclenche aucun paiement. Il conserve la prestation et sa
source, reprend le contexte après authentification, rattache la demande à
l'UID et à l'entreprise, utilise l'administration et les notifications
existantes et confirme un retour sous 24 à 48 heures.

La demande peut enregistrer `localeCode`, `marketCode`, `countryCode`,
`serviceSlug`, `systemId` et `sourcePage`. Aucun panier, checkout groupé,
paiement anglais, marketplace, portail partenaire, WhatsApp ou second back
office n'est créé.

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

Le contrat éditorial contient `courseId`, `localeCode`, `marketCodes`,
`contentVersion` et `publicationStatus`. La progression distingue au minimum
`courseId + localeCode + contentVersion`. Les contenus et caches ne retombent
jamais silencieusement sur le français.

## Opportunités

La réservation aux entreprises clientes est différée et n'est pas implémentée
dans ce programme.

La décision immédiate est :

1. retirer Opportunités des navbars desktop, mobile et PWA ainsi que des autres
   navigations générales ;
2. conserver `/opportunites` accessible directement à toute personne disposant
   du lien ;
3. conserver cartes, filtres, modales, soumissions et protections actuelles ;
4. ne pas ajouter de droit entreprise, abonnement obligatoire, `403`
   commercial, teaser Solutions ou entrée Profil ;
5. ne pas exposer Opportunities dans English Beta ;
6. appliquer `noindex` pendant cette phase contrôlée ;
7. limiter la réponse publique aux opportunités explicitement publiées et
   protéger côté serveur brouillons, soumissions et données privées.

La page conserve un retour normal vers le produit Demaa.

## Programmes différés

Restent au backlog sans bloquer cette décision : messagerie par sujets,
dossiers commerciaux avancés, CRM enrichi, notifications e-mail avancées,
panier, checkout groupé, WhatsApp, marketplace, portail partenaire, catalogue
US, adaptation réglementaire pays par pays, ressources anglaises complètes et
titre animé entreprise/agence/startup.

## Séquencement

Chaque étape est une PR autonome, testée, compatible avec la France et non
fusionnée sans GO explicite :

1. alignement documentaire ;
2. masquage de navigation Opportunités et accès direct conservé ;
3. fondation internationale cachée et `/en` sous flag/noindex ;
4. Action Plan anglais complet ;
5. Solutions, Accompaniment et Talk to us ;
6. Academy anglaise ;
7. recette English Beta intégrée puis activation publique sous GO séparé.

## Gates de recette

Les parcours partagés sont testés avec `fr/fr-fr` et
`en/global-en-beta`. La recette couvre TypeScript, ESLint, tests unitaires et
d'intégration, build Production, E2E desktop/mobile/PWA, clavier, lecteur
d'écran, auth e-mail/Google, génération et réouverture, demandes visibles dans
l'administration, Talk to us, huit cours, progression, caches, `html lang`,
canonical, `hreflang`, sitemap, absence d'Opportunities/Resources en anglais et
absence de fallback français.

La France ne doit subir aucune régression. Aucun runtime ne commence avant un
audit des écarts, des fichiers partagés, des migrations, des collisions et des
tests propres à chaque PR.
