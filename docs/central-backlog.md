# Backlog central Demaa

Dernière consolidation : 20 août 2026.

Backlog de pilotage :
[Demaa — Backlog maître](https://docs.google.com/spreadsheets/d/19uwK54Pd2XiPzPM8OBvNkFSaSHYsJO_IHk8ZxzvvmQY/edit).

Le Google Sheet a été resynchronisé le 16 août 2026 avec D-083 à D-088,
DEC-023/024, le runtime de référence `8020e04` et la tête documentaire
`10a9067`. Les décisions postérieures sont conservées dans ce document ; le
Sheet reste à réaligner lors d'une prochaine passe documentaire dédiée. Aucun
chantier ne doit être déclaré livré avant sa recette réelle.

Ce document remplace les listes d'actions dispersées dans les chats Demaa. Il
distingue ce qui est déjà livré, ce qui est prêt mais non publié et ce qui reste
à réaliser.

Plan directeur actif :
[`Programme stabilisation et Stratégie — 16 août 2026`](governance/program-director-2026-08-16.md).
Il fixe l'ordre des lots, leurs responsables, les branches/PR et les gates de
release. Aucun lot runtime n'est autorisé par ce lien sans GO explicite.

## État courant Production — 20 août 2026

- Au démarrage du présent chantier documentaire, `main` et `origin/main`
  pointent sur `260ad7d`. Les références `8020e04`, `ae5029d`, `a47d844` et
  `f0b4d75` restent des checkpoints historiques du programme de stabilisation,
  de sa clôture documentaire et du handover ; elles ne sont plus présentées
  comme la tête courante.
- Les PR 110 à 118 ont été fusionnées séparément et vérifiées en Production :
  fiabilité des plans, sécurité de l'administration Coaching, consentement aux
  traceurs, expérience Échanger, barre du titre, documentation D-084,
  Pilotage, Titre IA et clôture documentaire du programme 0 à 8.
- L'application conserve un seul domaine canonique et des groupes de routes
  distincts pour le marketing, l'application, l'authentification et
  l'administration.
- L'authentification Firebase e-mail/mot de passe et Google partage la même
  session Demaa. Sur `demaa.co`, Google utilise immédiatement la redirection
  afin d'éviter les blocages de popup ; local et Preview peuvent conserver la
  popup desktop. Le parcours Production a été vérifié jusqu'à la création du
  contexte entreprise et au retour vers `/plans/new` pour un compte sans plan.
- Le périmètre Plan d'action V4 reste `Actions + systemId`. Le Pilotage
  d'entreprise D-084 est livré : Chiffres et Stratégie sont rattachés à
  l'entreprise, séparés des plans et exclus du périmètre IA.
- Depuis la PR 145, les trois consoles internes utilisent la session Demaa et
  `DEMAA_ADMIN_EMAILS`. Leur accès authentifié a été vérifié en Production ;
  les anciens secrets dédiés ont été retirés de Vercel.
- `/en` n'est pas publié en Production. L'implémentation anglaise partielle
  reste un prototype de Preview et ne constitue ni une bêta publique ni un
  catalogue validé.

## Lecture canonique du backlog

Les statuts exécutables sont ceux des sections placées avant les journaux
historiques :

- **Livré** : présent sur `origin/main` et vérifié en Production ;
- **Validé, non commencé** : décision fermée, audit préalable encore requis ;
- **Planifié** : ordre et gates connus, runtime non autorisé implicitement ;
- **Différé** : conservé sans date ni déclenchement automatique ;
- **Supersédé** : ancienne décision conservée uniquement pour traçabilité.

Les cases non cochées des sections explicitement nommées « historique »,
« ancien », « candidat local » ou « cadrage » ne constituent pas une liste de
travail active. Une action n'est exécutable que si elle est reprise dans une
section canonique courante avec un GO explicite. Cette règle évite de
réintroduire Plan V4, l'ancienne Stratégie, l'ancien portail, les anciens lots
d'authentification ou d'autres chantiers déjà livrés ou supersédés.

## D-085 — Produit international commun — Preview partielle en pause

Référence : [ADR 0014](decisions/0014-shared-international-product-and-opportunities-access.md).

D-085 supersède les anciens cadrages « English Beta = Action Plan uniquement »,
« Solutions et Academy après la bêta », « Échanger absent de l'anglais » et
« Opportunités réservé immédiatement aux entreprises clientes ».

### Architecture commune

- [x] Une seule identité Firebase, une seule session Demaa, une seule
  entreprise et les mêmes espaces Plans, Chiffres et Stratégie sont partagés
  entre les langues.
- [x] `/` est la route française canonique et `/en` la route anglaise. Le
  choix manuel, le cookie de locale, la préférence connectée et les
  `returnTo` internes Google/e-mail existent déjà ; `/en` reste derrière un
  flag serveur et `noindex` tant que la bêta n'est pas validée.
- [x] Les plans enregistrent déjà `content_locale_code` et
  `market_code_at_creation`; la langue de l'interface ne traduit pas leur
  contenu et `latest` ne filtre pas par langue.
- [x] La préférence du membre est stockée dans
  `member_preferences/{uid}`. Ne pas créer le document concurrent
  `customer_preferences` cité dans un ancien audit.
- [ ] Mutualiser les écrans encore dupliqués ou simplifiés en anglais. Un
  comportement partagé ne doit avoir qu'un composant, un contrat et une API ;
  les différences passent par des projections et configurations centrales,
  jamais par des conditions `locale === "en"` dispersées.
  - [x] Accueil Plan, Mes plans, Nouveau plan, dernier plan et plan enregistré
    délèguent aux mêmes loaders et écrans partagés ; les routes FR/EN ne
    conservent que métadonnées, locale et flag anglais.
  - [x] Les destinations applicatives visibles proviennent d'une matrice
    centrale locale/marché ; les routes anglaises ne portent plus leurs propres
    tableaux `visibleViews`.
  - [x] La reprise d'un plan après authentification conserve le contexte
    profond (`view`, section Pilotage, système, ressource et cours) et le
    catalogue courant utilise le marché de l'entreprise, distinct de la langue
    durable du plan.
  - [x] Les libellés génériques Solutions utilisent un dictionnaire typé
    partagé et le libellé anglais public est `Services`, jamais
    `Accompaniment`.
  - [x] Pilotage réutilise désormais les mêmes composants et les mêmes données
    d'entreprise en français et en anglais. Les libellés, questions, erreurs,
    dates et montants EUR sont projetés par un dictionnaire typé ; aucun second
    stockage Chiffres/Stratégie n'a été créé.
  - [ ] La fiche Service commerciale complète, les textes métier de Talk to us
    et Academy restent volontairement dans les lots 4, 5 et 6 : les mutualiser
    ici masquerait leurs écarts de contrat, de prix ou de contenu.
- [ ] Déclarer le scope de chaque évolution : `shared` par défaut, ou
  explicitement `locale`, `market` ou `country`. La traduction choisit les
  mots ; elle n'accorde aucune permission et ne décide ni du catalogue, ni du
  pays, ni de la devise.

Le contexte doit rester séparé en deux couches :

```text
Interface et contenu
  localeCode              route, libellés et formats
  preferredLocale         préférence du membre
  contentLocaleCode       langue durable du plan

Contexte commercial résolu côté serveur
  marketCode              catalogue et prestations disponibles
  countryCode             contraintes géographiques/réglementaires
  currencyCode            devise commerciale/de devis
```

- [ ] Ne plus déduire automatiquement `marketCode` et `currencyCode` de
  `localeCode`. Un membre anglophone d'une entreprise française peut utiliser
  `en + fr-fr + FR + EUR` ; la bêta globale peut utiliser
  `en + global-en-beta` avec un pays nullable.
- [ ] Faire porter à l'entreprise `marketCode`, `countryCode` et sa devise de
  référence comptable. Résoudre côté serveur le marché et la devise
  commerciale applicables à une offre ; ne jamais faire autorité d'une valeur
  envoyée par le navigateur.
  - [x] Les surfaces Plans authentifiées résolvent désormais leur entreprise
    active via un adaptateur serveur indépendant du stockage mono-entreprise
    actuel, puis composent la locale d'interface avec le marché, le pays et la
    devise de cette entreprise. Un contexte absent ou invalide échoue
    explicitement et le DTO international n'expose aucun identifiant interne.
    Le contexte visiteur est une configuration serveur explicite et les caches
    Système/Academy exigent désormais `localeCode + marketCode` : aucun cache
    client ne reconstruit le marché à partir de la seule langue.
  - [ ] Étendre la même autorité serveur aux offres, demandes de service,
    conversations, prix et notifications dans leurs lots dédiés ; ces routes
    ne doivent plus accepter le navigateur comme autorité commerciale.
- [ ] Conserver l'ordre de résolution de locale : route explicite, choix
  manuel, `member_preferences`, cookie visiteur, langue du navigateur lors de
  la première visite, français. Une route explicitement ouverte n'est jamais
  remplacée silencieusement.
- [ ] Utiliser `contentLocaleCode` pour la génération et les commandes IA. Les
  e-mails de demande/conversation suivent la langue de cette demande ; les
  e-mails génériques suivent `preferredLocale`.
- [ ] Interdire tout fallback français silencieux sous `/en`, tout identifiant
  métier anglais parallèle et toute API, identité, entreprise, conversation,
  administration ou stockage anglais distinct.

### English Beta

**Décision de pause du 20 août 2026.** Ne pas activer publiquement `/en` et ne
pas promouvoir l'implémentation Preview actuelle. Avant toute reprise, revoir
le positionnement et les projections métier : la cible anglaise doit servir
les mêmes métiers de petites entreprises que le produit français, et non un
segment séparé de « digital businesses ». Les identifiants métier restent
communs ; leur traduction et leur disponibilité sont des projections du même
catalogue, pas un second catalogue produit. Cette décision supersède la liste
initiale limitée à SaaS, agences digitales, consultants et activités en ligne.

Le catalogue canonique réel comprend **115 métiers actifs** et réutilise les
**37 familles métier existantes**. Ces identifiants et familles sont la source
commune : l'anglais ajoute des projections publiées et des alias, jamais des
métiers parallèles. Les dix métiers numériques de la Preview actuelle ne sont
qu'un prototype à retirer comme périmètre commercial ; la cible est la même
population de petites entreprises qu'en français.

La reprise exige une matrice explicite
`systemId × familyId × localeCode × marketCode × publicationStatus`. Les
héritages globaux, familiaux et spécifiques restent explicables et sont filtrés
par le marché/pays, puis par la disponibilité de la projection locale.

La cible complète est :

```text
Action Plan + Key figures + Strategy
+ Solutions (Tools + Services)
+ Academy
+ Talk to us
+ My plans + authentification
```

Elle exclut de la **première bêta** Opportunities, Resources/Business
Processes, les recommandations contextuelles d'outils ou services, les
modèles, aides, financements, formalités locales et partenaires strictement
français. Business Processes est pertinent mais volumineux et très marqué par
le contexte français actuel : il fera l'objet d'un lot ultérieur, après la
parité du cœur. Les recommandations restent désactivées en anglais tant que le
résolveur français n'est pas validé métier.

- [ ] Réutiliser le parcours Action Plan français, son schéma, ses statuts, sa
  propriété entreprise, sa reprise et le même appel IA, avec génération en
  anglais naturel et `systemId` universels.
  - [x] Remplacer le prototype parallèle de dix métiers numériques par une
    projection anglaise des **115 slugs canoniques**, dans le même ordre que le
    catalogue français. Chaque projection publiée porte un libellé, des alias
    et une version éditoriale ; les contrôles vérifient la bijection avec les
    115 métiers actifs et leurs 37 familles existantes. Aucun identifiant
    anglais parallèle, aucune nouvelle famille et aucun second catalogue n'ont
    été introduits. `/en` reste désactivé et `noindex` : cette couverture
    technique ne vaut pas encore validation éditoriale ni GO public.
- [ ] Publier `Tools` avec projections anglaises validées et filtrage serveur
  par métier/famille, marché, pays et langue.
- [x] Employer le libellé naturel `Services`, jamais `Accompaniment`, et
  publier uniquement les prestations réellement
  réalisables à distance en anglais.
- [x] Conserver une seule prestation `Automatisation des processus et IA`
  (`Process automation and AI` en anglais) : l'IA est un levier intégré à
  l'automatisation, jamais une carte ou une offre d'accompagnement séparée.
- [x] Utiliser `Envoyer ma demande` / `Send my request` avec le même formulaire
  et la même API. En anglais, le contact passe par la session et l'e-mail du
  membre ; aucun numéro WhatsApp obligatoire. Le serveur retrouve l'identité,
  l'entreprise, la disponibilité marché/pays et le forfait autorisé avant de
  créer la demande. Il refuse tout service ou forfait indisponible et ne fait
  jamais confiance à `marketCode`, `countryCode`, prix ou `companyId` envoyés
  seuls par le client. `localeCode` reste uniquement une intention de
  présentation. Le marché et la devise proviennent de l'entreprise connectée ;
  un visiteur utilise la configuration serveur de l'entrée produit. Le parcours
  anglais exige la session et utilise son e-mail, sans champ téléphone.
- [x] Réutiliser Échanger comme `Talk to us`, avec les mêmes conversations,
  brouillons, statuts, dictée, administration, notifications et règles de
  clarification gratuite. Les libellés passent par un dictionnaire typé et la
  mutation résout marché/pays depuis l'entreprise authentifiée : les valeurs
  envoyées par le navigateur ne font plus autorité.
- [ ] Réutiliser Academy et publier les huit fondamentaux anglais validés avec
  caches séparés par langue, marché et version.
- [ ] Rendre Academy structurellement paritaire avec le français : mêmes cours,
  ordre, leçons, visuels, quiz et actions, avec uniquement les textes localisés.
- [ ] Ne pas modifier la progression Academy pendant ce chantier. Conserver le
  comportement persistant actuel indexé par
  `courseId + localeCode + contentVersion`; ne partager, migrer ou fusionner
  une progression entre langues qu'après une décision produit distincte.
- [x] Localiser Chiffres et Stratégie et exposer les mêmes données d'entreprise
  dans les deux langues, sans stockage parallèle ni restriction française.
- [ ] Ne laisser apparaître aucun texte, écran, fiche ou contenu français comme
  fallback dans le parcours anglais.

### Gates de reprise de l'anglais

1. **Architecture et catalogue métier** : séparation locale/marché/pays/devise
   validée côté serveur ; 115 `systemId` et 37 familles réutilisés sans doublon,
   avec projections anglaises complètes pour le périmètre publié.
2. **Services** : partager fiches, forfaits, prix et demandes ; afficher
   `Services`, jamais une modale anglaise simplifiée parallèle.
3. **Pilotage** : rendre Chiffres et Stratégie disponibles en anglais avec les
   mêmes données entreprise.
4. **Academy** : supprimer le catalogue anglais raccourci et les visuels
   génériques au profit d'une structure canonique traduite.
5. **Demandes et prix** : mêmes contrats et validations serveur, contact par
   session/e-mail, aucun service indisponible et aucun prix fourni par le
   navigateur accepté comme autorité.
6. **Surfaces communes** : mutualiser les pages Plans, localiser PWA,
   confidentialité, erreurs et e-mails sans fallback français.
7. **Recette publique** : E2E FR/EN de parité, Google, mobile/PWA, demandes,
   données partagées et absence de français, puis GO Production explicite.

### Prix internationaux

- [x] Ne jamais modifier un prix à partir de la seule langue d'interface.
- [ ] Séparer la devise comptable de l'entreprise de la devise commerciale de
  l'offre ou du devis. Conserver une valeur économique canonique en EUR et une
  table de prix marché numérique, indépendante des dictionnaires.
- [ ] Pour un prix converti, résoudre côté serveur devise, taux, date du taux,
  règle d'arrondi et montant. `1 500 EUR` ne devient jamais nominalement
  `1 500 USD`; le snapshot du devis/demande conserve montant, devise, taux et
  date pendant sa validité.
- [ ] Documenter l'arrondi et réviser les grilles converties ; ne pas stocker
  prix ou taux dans les dictionnaires de traduction.
- [ ] Ne pas appliquer de majoration liée à l'anglais pendant la bêta. Une
  différence commerciale par marché exigera une décision tarifaire distincte.
  Tant qu'aucune politique de change n'est approuvée, afficher et facturer en
  EUR plutôt que d'improviser une conversion.

### Accompagnement — Automatisation des processus et IA

Référence : D-089 et [ADR 0015](decisions/0015-packaged-automation-and-business-application.md).

Alignement France livré avant les projections anglaises :

- [x] Conserver le slug, la route et les attributions existants
  `automatisation-processus` ; ne créer ni deuxième prestation IA, ni migration
  de demande, ni nouvelle catégorie.
- [x] Remplacer le nom public par `Automatisation des processus et IA`, puis
  mettre à jour catalogue, cartes, modale, SEO, données structurées,
  notifications et tests qui affichent le nom.
- [x] Promesse courte recommandée : réduire les tâches manuelles grâce à des
  workflows fiables et à des usages IA ciblés, intégrés aux outils existants.
- [x] Description recommandée : simplifier d'abord le processus, automatiser
  les étapes répétitives, puis intégrer l'IA uniquement lorsqu'elle apporte un
  gain concret, avec validation humaine, tests et documentation.
- [x] Livrables à cadrer : analyse et priorisation du processus ; intégrations,
  automatisations et usages IA validés ; tests, points de contrôle humains,
  documentation et prise en main.
- [x] Exclusions à rendre explicites : refonte indistincte de tous les
  processus, licences et consommations d'outils ou de modèles tiers, promesse
  d'autonomie totale de l'IA ou résultat métier garanti sans mesure préalable.
- [x] Remplacer le prix 500 EUR HT/jour par les forfaits validés
  Automatisation essentielle à 1 500 EUR HT et Automatisation avancée + IA à
  3 000 EUR HT, avec les limites de D-089.
- [x] Ajouter `Application métier` immédiatement après Automatisation, avec le
  forfait essentiel à 4 500 EUR HT et le forfait avancé à 7 500 EUR HT. Conserver
  `/sur-mesure` comme unique page canonique et supprimer toute occurrence
  publique de l'ancien prix 2 500 EUR.
- [x] Faire consommer une seule source de forfaits au catalogue, aux modales,
  à `/sur-mesure`, aux données structurées et aux notifications ; ne pas créer
  de page SEO concurrente `/services/application-metier`.
- [x] Retirer les montants et mentions d'avantage de toutes les cartes
  Accompagnement. Afficher les prix dès le haut des modales/fiches, sans
  séparateur qui traverse ou masque le texte.
- [x] Conserver l'éligibilité de ces deux prestations à l'avantage
  accompagnement mensuel de 12 %, vérifié côté serveur, sans paiement ni
  checkout.
- [x] Remplacer le CTA `Être recontacté(e)` par `Envoyer ma demande` et étendre
  le contrat/API avec `packageSlug`, `localeCode`, `marketCode` et une source
  de page validée. `packageSlug` est obligatoire uniquement pour les deux
  prestations à forfaits. Le serveur retrouve le montant et refuse tout
  forfait qui n'appartient pas au service.
- [x] Retirer ou revalider contractuellement le support à 110 EUR/heure, la
  maintenance à 99 EUR/mois et les promesses absolues RGPD, propriété et
  hébergement de l'ancienne page `/sur-mesure`.
- [x] Ajouter ensuite la projection anglaise `Process automation and AI` au
  même service, avec disponibilité par marché et aucune fiche française en
  fallback.

Gate : nom, promesse, livrables, exclusions, forfaits et avantage cohérents sur
la carte, la modale, `/sur-mesure`, la demande reçue par la Team et la projection
anglaise, sans changement du slug Automatisation ni régression des placements
par Système.

### Opportunités — décision historique supersédée par la réactivation du 18 août

- [x] Retirer Opportunités des navbars desktop, mobile et PWA ainsi que des
  navigations générales.
- [x] Conserver `/opportunites` accessible directement aux personnes possédant
  le lien, avec `noindex` pendant cette phase contrôlée.
- [x] Préserver cartes, filtres, modales, soumissions et protections serveur
  actuelles.
- [x] Ne créer ni droit client supplémentaire, ni abonnement obligatoire, ni
  `403` commercial, ni teaser Solutions, ni entrée Profil.
- [x] Ne pas publier Opportunities dans English Beta.
- [x] Différer la réservation aux entreprises clientes jusqu'à une décision et
  un lot distincts.
- [x] Normaliser les anciennes URLs `/?view=opportunities` vers
  `/opportunites` et reprendre les intentions/brouillons d'authentification sur
  cette route canonique plutôt que dans une vue applicative cachée.

#### Réactivation — 18 août 2026

- [x] Republier `/opportunites` sur les surfaces de découverte publiques :
  lien footer (« Collaborer avec Demaa ») et entrée sitemap restaurés, `noindex`
  retiré de la page.
- [x] Restaurer l'onglet applicatif intégré, en 4ᵉ position après Académie :
  `ActionPlanNavbar` (largeur de grille dynamique via `visibleViews`, plus
  besoin de `grid-cols-4` en dur), `ActionPlanExperience`,
  `SavedActionPlanDetail`, `opportunityId` dans `ActionPlanAppContext`. Le
  panneau (`OpportunitiesPanel`, recréé) réutilise directement
  `PublicOpportunitiesClient` sans titre visible (juste recherche + filtres,
  un `<h2>` `sr-only` pour l'accessibilité).
- [x] Renommage « Académie » → « Ressources » testé un temps puis annulé
  (18 août 2026) : en vue de formations payantes à venir, « Académie » porte
  mieux la valeur perçue qu'un libellé générique « Ressources ». Le libellé
  reste `Académie` / `Academy`.
- [ ] Toujours exclue d'English Beta : `(english)/en/**` passe explicitement
  `visibleViews={["plan", "solutions", "academy"]}`, donc l'onglet Opportunités
  n'apparaît pas côté anglais. `OpportunitiesPanel` accepte un prop
  `localeCode` (fr/en) pour son propre texte, mais `PublicOpportunitiesClient`
  et ses dialogues (soumission, profil prestataire) restent entièrement en
  français — leur localisation est un chantier à part, non commencé.
- [x] `COMPANY_STRATEGY_VISIBLE` passé à `true` (18 août 2026), sur décision
  explicite du fondateur plutôt qu'après la surveillance production 24-48h
  initialement prévue (point 1 de « Prochaine action » ci-dessous, non
  complété avant activation). Constante désormais exportée depuis
  `action-plan-app-context.ts` et importée par `CompanyPilotagePanel.tsx` au
  lieu d'être dupliquée dans les deux fichiers. Chiffres était déjà visible
  (non gated par ce flag) ; seule Stratégie était masquée.
- [x] Après usage en prod (19 août 2026) : le pilier `alignment_3` de
  `COMPANY_STRATEGY_PILLARS` (`src/lib/company-pilotage-contract.ts`) passe
  de « Qu'est-ce que vous voulez continuer à faire vous-même, et qu'est-ce
  qui doit fonctionner sans vous ? » à « Avec quelles contraintes
  composez-vous en ce moment : temps, argent, énergie ? ». Décision explicite
  du fondateur : le framework Stratégie doit rester générique et réutilisable
  par n'importe quelle entreprise, indépendamment de ce que Demaa vend —
  connaître ses contraintes (temps, argent, énergie) est plus universel que
  la question de délégation, qui présuppose un objectif de croissance sans
  soi non partagé par toutes les entreprises. Le `framing` du pilier passe de
  « Vos ambitions, vos forces et votre rôle. » à « Vos ambitions, vos forces
  et vos contraintes. » pour rester cohérent. ADR 0013 non modifiée (registre
  historique de la décision D-084 initiale) ; ce changement de contenu est
  documenté ici plutôt que par réécriture de l'ADR.
- [ ] Corollaire : le thème « rôle/délégation » (qu'est-ce qui doit
  fonctionner sans vous) ne figure plus dans aucune des 12 questions
  Stratégie. À surveiller si ce thème doit être réintroduit ailleurs (Plan
  d'action, Académie) — non tranché.
- [x] Affinement de 2 questions (19 août 2026), après relecture croisée avec
  une proposition externe (structure Alignment/Positioning/Offer/Promotion) :
  - `positioning_3` : « Qu'est-ce qui distingue votre manière de résoudre ce
    problème ? » devient « Que fait le client aujourd'hui à la place, et
    qu'est-ce qui distingue votre manière de résoudre ce problème ? » —
    ajoute le point de comparaison (l'alternative actuelle du client) avant
    de juger la différenciation.
  - `offer_3` : « À quel prix et comment est-elle facturée ? » devient « À
    quel prix, comment est-elle facturée, et est-ce validé ou encore une
    hypothèse ? » — distingue un prix déjà testé par de vraies ventes d'un
    prix encore théorique.
  - La question `alignment_3` (contraintes) proposée dans la même relecture
    externe n'a pas été reprise ailleurs qu'ici : elle correspondait déjà à
    ce qui venait d'être décidé et livré juste avant (cf. note ci-dessus).

### État réel du code au 20 août 2026

Déjà livré et à préserver :

- [x] types et résolution initiale `localeCode/marketCode/countryCode`, cookie
  de locale, `member_preferences`, routes `/en` sous flag/noindex et reprise
  authentification/Google avec `returnTo` localisé ;
- [x] `content_locale_code` et `market_code_at_creation` dans l'enveloppe du
  plan ; lecture legacy française des plans antérieurs ; `latest` commun ;
- [x] clés de cache Académie et Système incluant déjà la locale et le marché ;
- [x] identité, session, entreprise, appartenance, stockage Plans,
  Chiffres/Stratégie, conversations et demandes partagés ;
- [x] progression Academy persistante et versionnée par locale ;
- [x] Preview anglaise partielle permettant d'auditer les écarts, sans GO
  public.

Écarts confirmés à fermer :

- [ ] le résolveur associe encore trop directement `en` à
  `global-en-beta` et `fr` à `fr-fr`; accepter notamment `en + fr-fr` et
  résoudre marché/pays/devise côté serveur à partir de l'entreprise et de la
  configuration commerciale ;
- [ ] l'entreprise est encore initialisée avec des valeurs France/EUR par
  défaut et la devise applicative est trop étroitement limitée à EUR ; faire
  évoluer ces contrats sans migration destructive ni confiance dans le client ;
- [ ] la génération anglaise est limitée à dix activités numériques et les
  combinaisons de contexte invalides peuvent retomber silencieusement sur le
  français ; utiliser les 115 métiers/37 familles et échouer explicitement si
  une projection publiée manque ;
- [x] Chiffres et Stratégie partagent leurs données d'entreprise ; leurs
  libellés, formats et validations visibles sont localisés sans second stockage.
  La devise métier reste volontairement EUR pour ce lot et est formatée selon
  la locale de l'interface ; la tarification multidevise reste dans le lot 5 ;
- [ ] Academy anglaise utilise un catalogue simplifié (moins de leçons,
  visuels génériques et actions absentes) ; la reconstruire à partir de la
  structure canonique française sans changer la progression existante ;
- [x] les fiches Services anglaises et françaises utilisent désormais le même
  composant et les mêmes slugs/forfaits. Une projection locale complète, une
  matrice de disponibilité et un prix numérique EUR sont résolus côté serveur ;
  la demande retrouve le service, le forfait, le marché et la devise autorisés,
  ignore le contexte commercial du navigateur et utilise l'e-mail de session
  en anglais. Les e-mails client localisés restent dans le lot transverse ;
- [x] les pages Accueil Plan, Mes plans, Nouveau plan, dernier plan et plan
  enregistré délèguent aux mêmes loaders et écrans métier ; les surfaces
  commerciales Services, Pilotage et Academy encore simplifiées sont suivies
  séparément dans leurs lots dédiés ;
- [ ] PWA, confidentialité, erreurs, e-mails, `html lang`, canonical,
  `hreflang`, sitemap et tests anti-fallback restent à aligner.

Les anciens constats disant qu'aucune couche i18n, préférence membre,
progression Academy ou donnée de langue sur les plans n'existait sont donc
supersédés. Aucun backfill global n'est requis avant un audit ciblé ; toute
lecture legacy reste déterministe et toute migration éventuelle idempotente.

Avant chaque runtime : actualiser `origin/main`, inventorier les worktrees et
les changements non committés, lire la documentation Next.js 16 installée,
confirmer les collisions, migrations et index, puis présenter le diff et les
tests de la PR. Cette section ne vaut pas GO code.

### Séquencement D-085

Chaque PR est autonome, compatible avec la France, vérifiée en Preview et non
fusionnée sans GO explicite. Ordre canonique **0 → 7** :

0. **Contrat documentaire et audit** : doctrine partagée, état livré/restant,
   inventaire des duplications et conditions de locale, aucune modification
   runtime.
1. **Fondation internationale** : séparation locale/contexte commercial,
   résolution serveur, dictionnaires typés, feature/publication matrix, caches
   et compatibilité legacy ; aucun changement visuel.
2. **Écrans partagés** : shell, authentification, Plan, Mes plans/Nouveau plan,
   dernier plan, plan enregistré et chrome Solutions. Supprimer les copies
   anglaises au lieu de les synchroniser manuellement, sans fusionner les deux
   machines d'état légitimes que sont la génération d'un nouveau plan et
   l'autosauvegarde d'un plan existant. Pilotage, la fiche Service complète,
   les textes métier de Talk to us et Academy restent respectivement dans les
   lots 4, 5 et 6.
3. **Catalogue métier et génération** : 115 `systemId`, 37 familles,
   projections/alias anglais, résolution métier et génération partagée. Dix
   métiers peuvent valider l'architecture en Preview, mais la bêta publique
   attend la couverture publiée complète.
4. **Parité du cœur** : Action Plan, Key figures, Strategy, reprise,
   autosauvegarde, My plans, Talk to us et e-mails contextuels, avec les mêmes
   données d'entreprise.
5. **Solutions, Services et prix** : Tools, projections, disponibilités,
   formulaire session/e-mail, validation serveur, prix/devis et notifications.
   Business Processes et recommandations restent hors de cette première bêta.
6. **Academy paritaire** : structure canonique, traductions intégrales,
   visuels/quiz/actions identiques, caches localisés ; progression inchangée.
7. **Transverse, recette et activation** : PWA, confidentialité, SEO,
   accessibilité, formats, E2E intégrés, Preview interne puis petit groupe de
   testeurs. Le retrait du flag/noindex et l'activation SEO exigent un GO
   Production séparé.

Gates minimales avant activation publique :

- mêmes composants, contrats, statuts et API en français et en anglais ;
- tests au minimum en `fr + fr-fr`, `en + fr-fr` et
  `en + global-en-beta`, dont auth e-mail/Google et `returnTo` sous `/en` ;
- même entreprise, mêmes Plans, Chiffres et Stratégie dans les deux interfaces,
  avec badge de langue du plan et aucune traduction automatique ;
- 115 métiers canoniques et 37 familles, sans identifiant anglais parallèle ;
- marché, pays, disponibilité, devise et prix résolus/validés côté serveur ;
- aucun fallback français silencieux, y compris erreurs, e-mails, contenus
  longs et fiches Services ;
- Academy paritaire en cours/leçons/visuels/quiz/actions, cache isolé et
  progression actuelle préservée ;
- prix numériques hors dictionnaires, conversion explicite et snapshot de
  devis/demande ;
- E2E desktop, mobile, PWA, clavier et lecteur d'écran ; build, TypeScript,
  ESLint et tests de structure/parité verts ;
- `/en` reste flaggé et `noindex` jusqu'au GO public explicite.

### Décision de livraison resserrée du 17 août 2026

Pour préserver la stabilité de la Production et terminer d'abord la proposition
commerciale France, la vague immédiatement publiable est volontairement
limitée à trois PR, dans cet ordre :

1. alignement documentaire D-085/D-089 ;
2. forfaits France Automatisation des processus et IA / Application métier ;
3. retrait d'Opportunités des navigations, avec `/opportunites` accessible par
   lien et les parcours historiques de détail/authentification préservés.

Les lots Fondation internationale, Action Plan anglais, Solutions/Talk to us,
Academy anglaise et recette English Beta restent planifiés mais sont remis au
backlog après cette vague. Ils ne doivent ni être fusionnés partiellement, ni
activer `/en`, tant que leurs remarques de revue, leur recette cumulative, leur
politique de confidentialité anglaise et leur E2E Google authentifié ne sont
pas fermés. Cette pause ne supersède pas D-085 : elle en modifie uniquement le
calendrier de livraison.

## Programmes différés préservés

### R — Recommandations contextuelles d'outils dans les Actions

Ce lot reste séparé de l'internationalisation et ne bloque pas la vague France.
Il réutilisera le registre `SolutionPlacement` et remplacera uniquement la
résolution des recommandations d'outils ; les aides Organisation et
Accompagnement conservent pour l'instant leur moteur local conservateur. Les
recommandations contextuelles de modèles sont masquées tant que leur intention
explicite et leur règle d'abstention ne sont pas validées.

État au 17 août 2026 : le pilote `cabinet-comptable` est préparé, mais ni
validé métier ni activable. Les artefacts versionnés sont :

- [`handoff.md`](research/action-plan-tool-recommendations/handoff.md) ;
- [`cabinet-comptable-pilot.v1.json`](research/action-plan-tool-recommendations/cabinet-comptable-pilot.v1.json).

Ils couvrent onze capacités, Tiimora, Pennylane et Silae, ainsi que dix
scénarios de recommandation ou d'abstention. La dépendance technique à la pile
internationale est satisfaite ; l'activation publique de `/en` reste une gate
distincte et ne rend pas ces placements France éligibles au marché anglais.
Les blocages restant à fermer sont : relecture métier contradictoire,
confirmation des relations commerciales Pennylane/Silae, transparence du
statut Demaa/ODEMA de Tiimora, preuve sécurité/traitement des données Tiimora,
puis implémentation et tests du résolveur serveur.

Stabilisation France livrée le 20 août 2026, sans activer ce futur résolveur :

- aucun outil nouveau n'est proposé à partir d'un simple mot-clé générique ;
  l'outil doit déjà être sélectionné dans Solutions, utilisé ou explicitement
  nommé dans l'Action ;
- une Action ne reçoit jamais plus d'une aide commerciale Outil ou
  Accompagnement et un plan n'en reçoit jamais plus de deux au total ;
- ces plafonds sont des limites de sécurité, jamais des quotas à remplir : en
  cas de doute, aucune recommandation n'est affichée ;
- les recommandations de modèles sont masquées dans les Actions, sans retirer
  les modèles de Ressources ni casser les plans historiques ;
- Kiute Pro est masqué et exclu des sélections curées tant que son accès HTTPS
  reste invalide ; l'URL officielle de Maliora a été corrigée et les dates de
  revue de Maliora et Nomad ont été actualisées.

Attribution transverse des sorties vers les outils, préparée dans une micro-PR
autonome après cette stabilisation :

- les URL officielles restent brutes dans les catalogues ; un constructeur
  unique ajoute au rendu `utm_source=demaa`, `utm_medium=referral` et
  `utm_campaign=solutions`, sans PII et sans redirecteur serveur ;
- le même lien instrumenté couvre l'annuaire, les fiches, les tarifs, Solutions,
  le récapitulatif système et la sortie issue d'une recommandation d'Action ;
- l'origine `action_recommendation` est une valeur URL bornée, jamais stockée
  dans le plan, Firestore ou l'IA ;
- l'événement interne `tool_outbound_clicked` reste conditionné au consentement
  Analytics et n'accepte que des slugs bornés, une surface et la campagne ;
- aucun code affilié n'est inventé : un futur paramètre éditeur devra être
  officiel, versionné dans le catalogue et validé séparément.

- [ ] Introduire une résolution serveur versionnée, sans seconde source de
  vérité, avec `recommendationResolutionVersion: 1` même lorsque la liste de
  recommandations est vide.
- [ ] Enregistrer dans le snapshot `placementId`, sa version,
  `actionContentFingerprint` et `countryCodeAtResolution` afin de pouvoir
  expliquer et reproduire la recommandation.
- [ ] Ne jamais recalculer l'éligibilité dans le navigateur et masquer un
  snapshot devenu obsolète après une modification matérielle de l'Action.
- [ ] Tester d'abord le moteur avec des fixtures et en dark launch : les outils
  réels restent `a_verifier` jusqu'à validation métier distincte.
- [ ] Conserver un maximum de deux outils pertinents et ne jamais remplacer les
  modèles opérationnels ou accompagnements quand ils répondent mieux à
  l'Action.
- [ ] Préparer contrats, tests d'étanchéité par entreprise, observabilité et
  activation progressive dans une PR runtime autonome, après stabilisation de
  la pile internationale.

#### R.1 — Recommandations de modèles dans les Actions

Le moteur lexical actuel peut proposer un modèle financier à partir de mots
généraux comme `marge`, `budget`, `paiement` ou `rentabilité`, même lorsque
l'Action ne demande pas de produire ou de mettre à jour un support chiffré.

- [x] Masquer temporairement les recommandations de modèles dans les Actions,
  sans retirer les modèles de Ressources ni casser les plans historiques.
- [ ] Ne réactiver un modèle que lorsque l'Action exprime un livrable explicite
  (`créer`, `remplir`, `mettre à jour`, `suivre`) et une capacité propre au
  modèle ; un simple concept financier ou commercial ne suffit pas.
- [ ] Définir des intentions versionnées par modèle et une règle d'abstention,
  plutôt que d'augmenter uniquement le seuil du score lexical.
- [ ] Tester au minimum les faux positifs sur marge, prix, rentabilité et
  paiements, ainsi que les vrais positifs prévisionnel, CRM et tableau de
  pilotage.

Critère de réactivation : chaque modèle affiché correspond à un support que
l'Action demande réellement de créer ou de maintenir ; en cas de doute, aucune
recommandation n'est affichée.

### M — Échanger par sujets et continuité client

Planifié après la bêta, sans bloquer `Talk to us`. L'objectif est de
centraliser clarification, demandes commerciales, propositions et continuité
de l'accompagnement sans reproduire Slack, Fiverr ou une messagerie temps réel.

#### M.1 — Fondation invisible

- [ ] Créer derrière un flag un modèle `sujet + messages` compatible avec la
  conversation existante.
- [ ] Employer `sujet` ou `échange` côté client et `dossier` côté
  administration.
- [ ] Conserver au minimum entreprise, créateur, type, service éventuel,
  statut, responsable interne, dates et dernière activité.
- [ ] Fermer avant code la visibilité entre membres d'une même entreprise ;
  recommandation : propriété entreprise, trace `created_by_uid` et
  autorisation explicite des membres actifs.
- [ ] Adapter silencieusement la clarification existante en sujet
  `Clarification initiale`, sans perte de messages, brouillons,
  recommandations ou statut gratuit.
- [ ] Attacher le statut de clarification gratuite à ce sujet uniquement, pas
  à toute la messagerie.
- [ ] Sérialiser les écritures, garantir l'idempotence et empêcher l'accès
  inter-entreprises.

Gate M.1 : aucune différence visible en Production et lecture intégrale de la
conversation historique.

#### M.2 — Interface client

- [ ] Afficher une liste compacte de sujets et la conversation sélectionnée.
- [ ] Desktop : liste à gauche, conversation à droite. Mobile/PWA : liste puis
  ouverture du sujet.
- [ ] Créer automatiquement un sujet pour une clarification ou une demande
  d'accompagnement ; ne jamais demander à l'utilisateur de créer un canal.
- [ ] Conserver `En attente`, `En cours`, `Proposition prête` et `Terminé`.
- [ ] Garder dictée, historique, brouillon, reprise après authentification,
  clavier, focus et accessibilité.
- [ ] Autoriser clôture et réouverture sans créer de doublon.

Gate M.2 : clarification existante utilisable de bout en bout sur desktop,
mobile et PWA avant d'ajouter les demandes commerciales.

#### M.3 — Demandes d'accompagnement

- [ ] Conserver les cartes comme espace de découverte et renommer
  `Votre sélection` en `Solutions enregistrées` afin d'éviter l'idée d'un
  panier.
- [ ] Le CTA `Envoyer ma demande` existe indépendamment de M ; lorsque M est
  prêt, rattacher la demande existante au sujet sans créer un second parcours.
- [ ] Demander la connexion uniquement au moment de l'envoi et reprendre
  automatiquement le contexte après authentification.
- [ ] Transmettre silencieusement service, Système et source, puis créer un
  sujet portant le nom de l'accompagnement.
- [ ] Afficher dans le sujet une carte de contexte structurée et poursuivre
  qualification et prestation dans le même sujet.
- [ ] Ne créer ni panier, ni canaux, ni checkout groupé dans ce lot.
- [ ] Garder Sous-traitance de formalités juridiques en
  `recommendation_only`. Assistante administrative est déjà une mise en
  relation publique, mais reste facturée directement par la professionnelle.
- [ ] Conserver Expert-comptable, Formalités d'entreprise et autres frais de
  tiers en facturation directe par le professionnel ; ne jamais attribuer à
  Demaa leurs honoraires, budgets média, logiciels, frais administratifs ou
  débours.

Gate M.3 : carte d'accompagnement → authentification éventuelle → sujet créé →
contexte intact → réponse client possible, sans paiement implicite.

### A — Administration des dossiers et notifications

Différé après M.3.

#### A.1 — Administration

- [ ] Étendre l'administration existante, sans deuxième dashboard, avec liste
  de dossiers, recherche minimale, statut, service, entreprise, dernière
  activité et responsable interne.
- [ ] Permettre de répondre, attribuer ou transférer, joindre une proposition,
  clôturer et rouvrir.
- [ ] Conserver le même sujet côté client pendant le passage du commercial à
  la personne chargée de l'accompagnement ; les transferts internes restent
  invisibles pour le client.
- [ ] Enregistrer l'identité réelle de chaque auteur et journaliser les
  changements sensibles.
- [ ] Vérifier les autorisations côté serveur et limiter les accès avant
  comparaison du secret tant que l'identité Team Demaa n'a pas remplacé le
  mécanisme transitoire.

Gate A.1 : demande client → dossier admin → attribution → réponse → affichage
dans le bon sujet, avec refus inter-entreprises et inter-dossiers.

#### A.2 — Notifications e-mail

- [ ] Envoyer un e-mail uniquement lorsqu'une nouvelle réponse Team Demaa est
  disponible et éviter doublons ou tempêtes de notifications.
- [ ] Utiliser l'e-mail comme notification, jamais comme copie complète ni
  nouvelle source de conversation.
- [ ] Renvoyer vers le sujet exact après authentification.
- [ ] Prévoir préférences, désinscription des notifications non essentielles,
  reprise sur erreur et journal de livraison.
- [ ] Valider d'abord que le parcours fonctionne entièrement sans e-mail ; la
  notification reste une amélioration séparée.

Gate A.2 : réponse admin → un seul e-mail → lien vers le bon sujet → historique
complet dans Demaa.

Restent également différés : CRM avancé, panier, checkout groupé, marketplace,
portail partenaire, paiement automatique de commission, catalogue US,
adaptation réglementaire pays par pays, ressources anglaises complètes et
titre animé entreprise/agence/startup.

## Clôture administrative de la release 0 à 8

Le runtime est livré. Les actions restantes ne sont pas des correctifs produit :

- [x] Fusionner une PR documentaire contenant D-085 et le présent nettoyage,
  sans runtime : PR 119, fusionnée le 16 août 2026.
- [x] Resynchroniser ensuite le Google Sheet maître avec D-084, D-085, les lots
  0 à 8, la référence runtime `8020e04` et la tête `main` obtenue après fusion
  de la PR documentaire : D-083 à D-088 et DEC-023/024 ajoutés.
- [x] Préserver tout changement local attribué, puis réaligner le checkout
  principal sur `origin/main` et obtenir un worktree propre.
- [x] Retirer les worktrees et branches des lots fusionnés après vérification
  de leur propreté.
- [ ] Rejouer une dernière recette authentifiée Production : Google, dernier
  plan, Mes plans, changement de plan, Chiffres, Stratégie, déconnexion,
  reconnexion et données retrouvées. Google, la création de session Demaa,
  l'état vide de Mes plans, la déconnexion et la reconnexion ont été vérifiés
  avec le compte Team. Ce compte ne possède aucun plan : `/plans/latest`
  redirige correctement vers `/plans/new`. Le parcours dépendant d'un plan
  reste à vérifier avec des données existantes, sans fabriquer de données de
  Production pour la recette.
- [ ] Surveiller pendant 24 à 48 heures les erreurs Firebase/session,
  génération, sauvegarde, conflits, Pilotage et Vercel 5xx. Le contrôle initial
  ne remonte aucun 5xx. Une génération antérieure sur un ancien déploiement a
  échoué au contrôle qualité IA puis a suivi le parcours prévu `failed`, sans
  crash HTTP ; le déploiement `10a9067` ne remonte aucune erreur.

Le futur parcours de suppression effective d'une entreprise reste différé :
aucune interface ou API de suppression n'existe aujourd'hui. Lorsqu'il sera
créé, il devra appeler le nettoyage Pilotage déjà testé. Le départ d'un membre
ne supprime jamais les données de l'entreprise.

## État de clôture historique — 12 août 2026

Cette section conserve l'état du 12 août comme journal. L'état courant du 16
août placé juste au-dessus le remplace et guide désormais les décisions de
déploiement.

- La release runtime Production vérifiée est `cdcb415`. Le correctif isolé
  `0919acf` sur `codex/global-audit-release` est prêt sur une Preview Vercel,
  mais n'est pas encore fusionné dans `main`. Le checkout local principal
  reste volontairement à réaligner après préservation de ses documents locaux.
- `https://demaa.co` est le domaine canonique ; `demaa.fr` redirige vers lui.
- Les 115 fiches Système ont pour route canonique `/systemes/[slug]` ; les
  anciens espaces `/kit-operationnel`, `/systemes-operationnels` et
  `/kit-systeme` redirigent en permanent en conservant les paramètres.
- Les 115 Systèmes exposent `Organisation / Solutions / Ressources` ; le slug
  interne historique de l'onglet Organisation reste `process`. Firebase est
  la source distante active des Solutions.
- Les Services canoniques sont publiés et composés au rendu dans les
  Systèmes, sans duplication dans Firebase. La surface publique Solutions
  affiche uniquement `Outils` et `Services` ; Fournisseurs, Financement,
  Aides, Réseaux et Modèles restent conservés dans le référentiel interne.
- `/contenus/facturation-electronique` est publié comme article et diaporama ;
  les deux présentations universelles ne sont plus rendues dans les Ressources
  des Systèmes.
- Les guides métier sont retirés de Ressources pour simplifier l'application ;
  leurs données historiques restent conservées. Académie présente
  temporairement uniquement les `Cours`, sans onglet puisqu'une seule section
  est publique. Les Tutoriels (`case-study`) et Webinaires restent conservés
  avec leurs routes mais masqués jusqu'à réactivation explicite.
- Les parcours guide, newsletter, Structure, Rejoindre Team Demaa, callback
  Services, Levier, Opportunités, sauvegarde de plan et authentification Firebase ont été
  testés en Production. L'envoi direct à la boîte Gmail opérationnelle est
  validé avec SPF, DKIM et DMARC. `team@demaa.fr` est une boîte distincte, pas
  un alias ; sa réception opérationnelle doit être vérifiée séparément dans
  Google Workspace.
- Le runtime Firebase Production utilise l'identité sans clé
  `demaa-prod-app@demaa-dde32.iam.gserviceaccount.com`, limitée à
  `roles/datastore.user` et au rôle personnalisé minimal de création et de
  lecture des sessions Firebase Auth, et empruntable uniquement par le projet
  Vercel Demaa.
- `SLACK_WEBHOOK_URL`, le secret de rate limit, l'identité Firebase et la
  variable Levier sont classés Sensitive en Production. Le test Levier final a créé son lead,
  envoyé la notification Slack et accepté la livraison e-mail sans exposer le
  lien Google Sheets au navigateur.

## Séquence de stabilisation clôturée — 16 août 2026

Cette séquence a remplacé celle du 15 août et décrit la stabilisation désormais
fusionnée. Elle ne réactive aucun lot produit différé et ne constitue plus une
liste d'actions à exécuter.

1. Conserver un seul domaine canonique, `https://demaa.co`. La séparation entre
   site public, application, authentification et administration est réalisée
   par des groupes de routes Next.js sans modifier les URL et sans créer
   `app.demaa.co`.
2. Le layout racine ne contient plus de pied de page ni de consommateur Google.
   Seul le groupe marketing rend le pied de page ; application,
   authentification et administration ne peuvent donc plus l'afficher par
   accident ou par une règle CSS de masquage.
3. `/api/auth/session` est l'unique API de session : `POST` échange le jeton
   Firebase, garantit l'entreprise et l'appartenance active avant de poser le
   cookie HttpOnly ; `GET` contrôle explicitement le contexte entreprise ;
   `DELETE` déconnecte. Une indisponibilité de ce contexte ne doit jamais être
   rendue comme une liste vide de plans.
4. E-mail/mot de passe et Google utilisent la même modale progressive et la
   même API. Sur le domaine Production canonique, Google utilise directement
   `/auth/google` afin de ne pas dépendre d'une popup ; local et Preview
   conservent la popup desktop. Le reverse
   proxy de l'option 3 recommandée par Firebase sert uniquement `/__/auth/*`
   depuis le helper Firebase ; la configuration de l'application reste fournie
   explicitement au SDK.
5. La génération reste strictement postérieure à l'authentification. Seuls la
   situation et l'identifiant idempotent sont conservés temporairement ; la
   reprise canonique est `/plans/new?resume=generation`, puis le plan durable
   passe de `generating` à `active` ou `failed` côté serveur.
6. Pour une session active, `/` et le logo ouvrent `/plans/latest`. Le dernier
   plan est ouvert directement ; sans plan, `/plans/new` est ouvert. `/plans`
   reste uniquement l'historique. Les anciennes routes `/mon-espace` sont des
   redirections permanentes et leur runtime a été retiré.
7. Avant promotion : suite complète, TypeScript, ESLint, validation des
   données, build, contrôle PWA et E2E desktop/mobile des parcours e-mail,
   Google, génération, dernier plan, historique, safe areas et dictée.
8. Le contrôle OAuth Production a été franchi : le parcours Google réel a été
   validé dans Chrome sur `demaa.co`. L'audit du 16 août confirme Google et
   e-mail/mot de passe actifs, `demaa.co` autorisé, l'anti-énumération actif et
   une politique Firebase de 8 caractères en mode `ENFORCE`.

## Séquence d'exécution historique — 15 août 2026

Cette séquence est conservée uniquement comme journal. La séquence de
stabilisation du 16 août ci-dessus est la seule liste à utiliser pour préparer
le prochain merge. Les checklists datées et les anciens lots conservés plus bas
ne déclenchent aucune action par eux-mêmes.

1. Le candidat intégré est porté par la PR 105. Sa recette locale couvre 217
   fichiers et 1 187 tests, TypeScript, ESLint, données, Académie, PWA, audit
   npm, build de 430 pages et l'isolation Firestore Emulator. La Preview a
   validé e-mail/mot de passe, ouverture Google, entreprise/appartenance,
   création, autosauvegarde, rechargement et restauration du plan. Production
   et les DNS restent intacts pendant la propagation du domaine.
2. Les sept derniers documents d'authentification historique ont été supprimés
   le 15 août après autorisation explicite : six `customer_magic_links` et une
   `customer_session`. Le post-audit confirme zéro document dans les deux
   collections et zéro document actif Plans/Entreprises/Appartenances en
   Production.
3. L'optimisation Académie est fermée : cache mémoire, Promise partagée,
   préchargement idle, import direct de l'index et réouverture immédiate sans
   loader ont été validés. L'API et le catalogue n'ont pas été modifiés.
4. D-082 est intégré au candidat : navigation principale Solutions, Actions
   directement dans le Plan et Ressource processus imprimable. Il ne reste
   aucun sous-onglet Actions/Solutions dans le Plan.
5. Les données de recette synthétiques ont été supprimées après confirmation
   destructive séparée : le compte Auth Production, le compte Auth Preview et
   son unique plan, son entreprise et son appartenance. Le contrôle immédiat a
   confirmé l'absence des cinq cibles et les permissions temporaires ont été
   retirées.
6. Garder le MVP Réseau Partenaire au cadrage jusqu'à validation de la fenêtre
   d'attribution, des clients existants, du conflit entre les avantages de 12 %,
   de la convention d'apport et du règlement des commissions.
7. Ne déclencher ni console spécialiste ni portail partenaire tant qu'un
   intervenant extérieur ne doit pas se connecter et agir lui-même dans Demaa.

## Mise à jour canonique du 9 août 2026

Cette section et les ADR 0003, 0004, 0006, 0014 et 0015 remplacent les décisions
historiques incompatibles plus bas dans ce document. D-085/ADR 0014 prévaut
pour le socle international, la résolution de langue et le périmètre
`global-en-beta`. D-089/ADR 0015 prévaut pour le nom, les forfaits et le
parcours de demande des accompagnements Automatisation/Application métier.
Pour le catalogue et le contact France non modifiés par D-089, l'ADR 0006
prévaut. Pour les Contenus, l'Académie et les Ressources, l'ADR 0004 prévaut.
L'absence de WhatsApp dans l'English Beta est une exception explicitement
limitée à `scope: market=global-en-beta` ; elle ne retire pas le suivi WhatsApp
manuel du marché France.

- `demaa.co` est le domaine canonique du lancement France, sans préfixe de
  locale. L'internationalisation reste différée.
- La navigation applicative contient `Plan d'action`, `Solutions`, `Académie`
  et `Opportunités`, dans cet ordre. `Plan d'action` affiche directement les
  actions et ne contient plus de sous-onglets. Les anciennes URLs `view=system`
  et `view=plan&planTab=solutions` restent acceptées ; les nouveaux liens
  utilisent `view=solutions` et conservent le contexte Système.
  La vue Solutions présente `Outils`, `Accompagnement`, puis `Ressources`.
  Organisation et Ressources restent sur les fiches publiques et alimentent
  de manière déterministe les aides affichées dans les Actions. La messagerie
  spécialiste est accessible par l'action `Échanger` sans
  onglets commerciaux. Une première clarification est offerte par UID et
  clôturée manuellement par la Team Demaa. Le Coach business est présenté
  comme l'accompagnement régulier distinct.
- Une fiche Système contient `Organisation`, `Solutions` et `Ressources`.
- Huit accompagnements publics existent après livraison de D-089 : Coach
  business, Expert-comptable, Formalités d'entreprise, Automatisation des
  processus et IA, Application métier, Gestion des réseaux sociaux, Publicité
  en ligne et Prospection ciblée. L'IA appartient à la prestation
  d'automatisation et ne crée pas un accompagnement distinct. `/sur-mesure`
  reste la page canonique d'Application métier. Expert-comptable est absent
  des systèmes comptables. Formalités est absente des systèmes comptables,
  cabinets d'avocats et notaires. Deux prestations externes restent accessibles
  uniquement par recommandation privée de la Team Demaa.
- Les Services utilisent le même formulaire de contact minimal (entreprise et
  numéro WhatsApp), avec attribution silencieuse du service et du Système
  métier, stockage sécurisé puis notification Slack. Le suivi WhatsApp reste
  manuel : aucune API WhatsApp ni message automatique n'est promis.
- Ressources contient les modèles et documents contextualisés en grille
  verticale. Sa première carte, `Processus métier`, ouvre une liste imprimable
  limitée aux processus du métier ; elle ne répète ni les Outils, ni les
  Accompagnements, ni les autres Ressources. Les contenus pédagogiques et
  éditoriaux globaux restent dans l'Académie.
- Firebase est la source distante autoritaire pour Solutions et le réseau de
  prestataires lorsque l'environnement est configuré.
- Opportunités et Rejoindre Team Demaa sont intégrés à l'expérience
  applicative unique. Les routes canoniques historiques restent disponibles
  ou redirigent lorsqu'un successeur exact existe ; elles ne doivent pas
  réintroduire un second shell applicatif.
- Les anciennes pages globales Modèles/Ressources sont retirées. Une URL connue
  redirige vers son cours ou sa fiche Système ; seul un chemin sans successeur
  répond 404/noindex. La matrice canonique est
  `docs/legacy-route-retirement-matrix.md`.
- Les endpoints, destinations privées et révisions historiques de livraison
  restent intacts pendant le retrait des pages publiques.
- `/services` publie les huit offres canoniques sous le libellé public
  Accompagnement après D-089. `/sur-mesure` reste la page canonique détaillée
  d'Application métier, sans deuxième offre ou prix parallèle.

### Lots restant réellement au backlog

- [x] Livrer le MVP D-076 : grand champ libre, génération JSON
  unique, Actions + `systemId`, sélection déterministe parmi les 115
  Systèmes, puis sauvegarde Firebase. L'ADR 0008 et
  `docs/action-plan-generator-product-contract.md` sont les références ;
  `/systemes` et `/academie` publics restent inchangés.
- [x] Livrer la première version de `Échanger` : conversation
  asynchrone écrite ou dictée, historique persistant et brouillon conservé
  pendant l'authentification. Aucun onglet Formules n'est exposé dans cette
  surface. Une première clarification est offerte et la Team Demaa la clôture
  manuellement avec sa réponse finale.
- [x] Publier une carte `Coach business` dans Services, avec matching guidé et
  un accompagnement mensuel unique à 750 EUR HT/mois incluant deux sessions
  individuelles de 60 minutes et un suivi écrit entre les séances. Le CTA
  `Être rappelé(e)` transmet une intention sans connexion ni paiement public ;
  la Team qualifie ensuite le besoin et le matching.
- [x] Livrer D-077 : entrée `Commencer avec un plan vierge`, navigation
  `Plan d’action / Opportunités / Académie`, sous-onglets `Actions / Solutions`
  dans le Plan, Coaching accessible par
  `Échanger`, Opportunités au sens large et sauvegarde invitée
  sans secret exposé au JavaScript. Cette composition de navigation est
  historique et remplacée par D-082 / ADR 0012 ; les autres éléments de
  l’ADR 0010 restent actifs.
- [x] Unifier l'identité des parcours applicatifs : le compte Firebase e-mail
  et mot de passe est le parcours principal ; une session connectée alimente
  côté serveur les guides métier, Opportunités, Coaching, inscriptions et
  demandes sans redemander l'adresse. Après connexion, reprendre directement
  l'intention autorisée dans l'application, sans portail parallèle `Mon
  espace`. `Mes plans` reste l'index compact et canonique des plans.
- [x] Activer D-080 : compte e-mail et mot de passe Firebase principal, Google
  facultatif, un endpoint de session et un cookie Firebase Admin natif. Plans,
  conversations et brouillons partent de l'identité UID ; les plans exigent en
  plus l'entreprise et l'appartenance active définies par D-078. L'e-mail de la
  session sert de contact sans devenir une clé d'autorisation. Aucun accès
  historique ni migration par adresse e-mail n'est conservé.
- [x] Intégrer D-081 : manifeste PWA, icônes 192/512/maskable,
  lancement `standalone`, thème blanc et invitation d'installation uniquement
  après un résultat. Garder `/sw.js` et `/offline` en 404 : aucun cache d'API,
  plan hors ligne ou deuxième source persistante dans ce lot. La recette
  automatisée est couverte ; la dictée et les safe areas doivent encore être
  vérifiées sur une PWA réellement installée avant promotion Production.
- [x] Restaurer le dernier plan après connexion et à l'ouverture normale de
  l'application. `/plans/latest` ouvre l'entrée la plus récente, y compris une
  génération en cours ou interrompue ; `/plans` liste les plans et
  `/plans/new` ouvre explicitement une nouvelle situation. L'absence de plan
  affiche un état vide sans boucle de redirection.
- [x] Livrer D-078 par transition compatible : Firebase UID reste l'identité,
  sans collection `accounts`. Le socle contient uniquement `companies` et
  `company_memberships`. Une entreprise sans nom et une appartenance `owner`
  sont créées transactionnellement au premier plan authentifié. Les plans
  reçoivent `company_id`, `created_by_uid` et `updated_by_uid` ; `owner_uid`
  est conservé comme trace de compatibilité mais n'autorise plus aucun accès.
  Liste, ouverture, modification et suppression exigent désormais une
  entreprise active et une appartenance active correspondant à `company_id`.
  Le rapport Firebase du 15 août 2026 a trouvé zéro plan à migrer, zéro conflit
  et zéro document sans propriétaire. Le backfill reste disponible en dry-run
  et exige projet, nombre et empreinte exacts avant toute écriture. Les tests
  couvrent l'isolation inter-entreprises et la suspension d'une appartenance.
  Aucun sélecteur, rôle supplémentaire, invitation ou gestion d'équipe dans ce
  lot. Le nom d'entreprise reste facultatif et ne bloque jamais l'ouverture du
  plan.
- [x] Permettre un nom d'organisation facultatif dans l'administration des
  Opportunités et ne l'afficher que lorsqu'il est explicitement publié.
- [ ] Synchroniser de manière contrôlée les champs facultatifs enrichis des
  Opportunités déjà présentes dans Firebase (`cadence`, `startTiming` et
  `expectations`). La Preview du 12 août 2026 expose encore les anciens
  documents pour les trois Opportunités publiées, alors que le snapshot local
  contient leurs détails complets. Préparer un plan de migration idempotent,
  afficher le diff par document et exiger la confirmation du projet et de
  l'empreinte avant écriture ; ne jamais écraser une modification éditoriale
  plus récente effectuée depuis l'administration.
- [x] Empêcher temporairement une réponse Firebase moins complète d'effacer à
  l'écran les champs enrichis du snapshot local, sans écrire dans Firebase.
- [x] Permettre de soumettre une Opportunité depuis le `+` de la recherche :
  saisie complète avant connexion, brouillon serveur repris après connexion,
  identité de session, idempotence et statut `draft` jusqu'à publication admin.
- [x] Afficher les Opportunités en lignes compactes pleine largeur : titre et
  description limités à deux lignes, trois tags dédupliqués maximum alignés en
  bas, même modale et même comportement de sélection sur desktop et mobile.
- [ ] Cadrer ensuite les évolutions Coaching : capacité humaine, notifications
  de réponse, réservation, confidentialité, durée de conservation et
  limites du service. L'historique Messages, sa persistance et la réponse sous
  24 à 48 h appartiennent déjà à la première version.
- [ ] Recetter le candidat local Coach business. Services contient une carte
  unique à 750 EUR HT/mois, sans sélecteur ni tarification par séance. Le prix
  couvre l'accompagnement mensuel, qui inclut deux sessions individuelles de
  60 minutes et un suivi écrit entre les séances. Un accompagnement mensuel actif ouvre 12 % sur
  les autres prestations directement facturées par Demaa, après contrôle
  serveur et avec exclusion du Coach, des partenaires, budgets et frais tiers.
  - [x] Inclure un suivi écrit entre les séances, limité aux priorités
    travaillées, sans promettre un accès illimité.
  - Définir les délais de réponse, les limites raisonnables d'usage et les
    règles de report.
  - Auditer la soutenabilité de l'hypothèse interne `50 % Demaa / 50 %
    réalisation humaine` sur les montants HT réellement encaissés, sans
    afficher cette répartition au client.
  - Contractualiser avec chaque spécialiste une rémunération claire couvrant
    le spécialiste principal et, si nécessaire, les expertises complémentaires.
  - Dimensionner la capacité humaine, les indisponibilités, les remplacements,
    la confidentialité et l'escalade avant toute mise en vente.
  - Le parcours public reste exclusivement une demande de rappel : aucun
    Checkout, paiement automatique ou abonnement n'est déclenché depuis le
    site. La Team qualifie puis contractualise l'accompagnement hors de ce
    parcours public.
  - Le portail de facturation, l'automatisation d'un abonnement et sa projection
    par webhooks signés restent différés. Avant leur éventuelle activation,
    configurer l'identité fiscale, la TVA, les objets et secrets live, puis
    valider le webhook en Preview et une transaction live contrôlée.
  - L'administration et le suivi opérationnel restent à cadrer avant vente.
  - Tester sur une cohorte pilote puis mesurer charge réelle, délai de réponse,
    marge, satisfaction et rétention avant le `GO` public.
- [x] Conserver avant et après connexion la navigation applicative unique
  `Plan d’action / Solutions / Académie / Opportunités`, sans sous-onglets dans
  le Plan. Les anciennes URLs `view=system` et
  `view=plan&planTab=solutions` restent compatibles et sont normalisées en
  `view=solutions` pour les nouveaux liens ; les
  routes `/systemes` restent inchangées. Coaching reste le
  produit accessible par `Échanger`; la surface s'intitule
  `Échanger avec l'équipe Demaa`. Aucun onglet `Accueil`, portail parallèle
  `Mon espace` ou profil obligatoire n'est créé. `Mes plans` reste une vue
  authentifiée de l'application unique.
- [x] Plan V4 de D-079 livré : génération limitée
  aux Actions et au `systemId`, supports typés selon les règles déterministes,
  et lecture non destructive des plans V1, V2, V3 et `manual`. La Stratégie
  historique reste définitivement masquée, non éditée et non générée. Le
  contrat D-084 validé crée un Pilotage d'entreprise séparé ; il ne réactive
  aucun champ stratégique des plans.
- [x] Multi-plans livré dans l'application unique : titre, sélecteur,
  nouveau plan, renommage, suppression révisionnée et retour au dernier plan.
- [ ] Recetter les Systèmes sauvegardés par plan : liste sans doublon, Système
  actif, coches d'Organisation et sélections Solutions isolées par Système, sans appel
  IA lors du changement.
- [ ] Recetter l'adaptateur microphone centralisé sur les champs concernés,
  avec erreurs accessibles, retour clavier et absence de conservation audio.
- [ ] Vérifier le ledger d'usage IA : métriques techniques et sujet
  pseudonymisé uniquement ; aucun prompt, situation, commande, plan, support,
  note ou e-mail en clair.
- [x] Retirer la commande IA d'édition après génération. La barre restante est
  limitée au plan manuel entièrement vierge et déclenche le parcours de
  génération durable existant. La route, le moteur, le contrat d'opérations et
  l'événement de ledger propres à la commande ont été supprimés.
- [x] D-084 — Pilotage d'entreprise `Chiffres + Stratégie` livré selon l'ADR
  0013 par la PR 116. Le périmètre Chiffres, omis lors d'une consolidation
  intermédiaire, a été restauré. D-082 reste la navigation principale cible.
  Après sauvegarde d'un plan, la vue Plan expose la sous-navigation commune
  `Plan d'action / Chiffres / Stratégie`, pilotée par
  `section=actions|figures|strategy` et jamais visible sur le formulaire public.
  Les deux domaines appartiennent à l'entreprise : changer ou supprimer un plan
  ne les modifie pas. Chiffres stocke par mois CA, charges et trésorerie en
  centimes, dérive le résultat, applique `expectedRevision`, agrège uniquement
  des périodes bornées et ne cumule jamais la trésorerie. Le cadrage Stratégie
  conserve intégralement les quatre piliers, douze questions, cycles de trois
  mois calendaires Europe/Paris sans expiration, premier cycle automatique,
  nouveau cycle vide, historique paginé par 10, exactement un pli ouvert avec
  Alignement par défaut, champs sans placeholders, archives avec l'entreprise et
  conflits inline sans écrasement. Aucun contenu Pilotage n'est transmis à
  l'IA. Aucune ancienne réponse V3 n'est migrée, affichée, recopiée ou supprimée
  physiquement. Chiffres et Stratégie ont été fusionnés ensemble comme une
  seule unité complète et publiable.
- [x] Resynchroniser le Google Sheet maître avec D-084, le registre de
  décisions et l'état Production du 16 août. D-084, D-085 et la clôture du
  programme 0 à 8 y sont alignés avec la tête `10a9067`.
- [x] Figer la gamme : une première clarification offerte, puis `Coach
  business` à 750 EUR HT/mois pour un accompagnement régulier incluant deux
  sessions individuelles et un suivi écrit entre les séances. Un
  accompagnement mensuel actif ouvre 12 % sur les autres prestations Demaa
  éligibles, sans cumul et après vérification serveur.
- [ ] Cadrer le partage sécurisé d'un plan sauvegardé : accès en lecture seule,
  consentement, lien révocable, durée et protection contre l'indexation. Le MVP
  permet déjà de sauvegarder et retrouver un plan, mais ne crée aucun lien
  public tant que ces règles ne sont pas validées.
- [x] Le catalogue France compte désormais neuf accompagnements. Automatisation
  des processus et IA est en premier, suivie d'Application métier. Assistante
  administrative est une mise en relation publique ; seule la sous-traitance de
  formalités juridiques reste réservée aux recommandations de la Team Demaa.
- [x] D-083, lot 1 : limiter la surface publique Solutions à `Outils` et
  `Services`, sans suppression ni déplacement de données. Le filtre public
  s'applique après la composition pour empêcher Financement et Aides d'être
  réinjectés dans les pages, récapitulatifs ou réponses API publiques.
- [ ] D-083, lots 2 à 4 : maintenir l'accompagnement sous responsabilité de la
  Team Demaa, clarifier le référentiel interne et préparer progressivement les
  dossiers d'accompagnement sans créer de profil Coach.
- [ ] D-083, lots 5 et 6 : conserver l'accès spécialiste comme lot
  conditionnel. Le déclencher seulement lorsqu'un intervenant extérieur doit
  se connecter et répondre lui-même dans Demaa, après les prérequis Firebase,
  Git et sécurité détaillés dans le cadrage ci-dessous.
- [x] Créer `/contenus` et publier la fiche Facturation électronique comme
  article et diaporama avant la future vidéo.
- [x] Simplifier Ressources : retirer les guides métier de la surface active,
  puis retirer le Tableau de pilotage opérationnel devenu redondant avec
  Chiffres. Processus métier, prévisionnel financier et CRM restent publics ;
  les anciens liens du tableau restent résolubles sans nouvelle exposition.
- [x] Limiter temporairement Académie aux seuls `Cours`, sans onglet. Les
  Tutoriels techniques `case-study`, leurs slugs et leurs routes restent
  conservés mais masqués, comme les Webinaires.
- [x] Optimiser le retour dans Académie avec un cache client mémoire, une
  Promise de chargement partagée et un préchargement non bloquant au repos.
  Conserver l'API, le payload actuel et le cache Système sans modification ;
  le contrat détaillé et la recette sont définis ci-dessous.
- [ ] D-082 — Rendre le lecteur Académie stable et adapté au viewport. P0 à
  traiter après l'audit des cours existants et avant la production de nouveaux
  cours. Aucun développement n'est autorisé avant la relecture de
  `AcademyCoursePlayer` et de ses conteneurs, la mesure des hauteurs de
  navigation, puis la validation explicite d'un plan d'implémentation et de ses
  compromis responsive. Le contrat détaillé et les critères de recette sont
  définis ci-dessous.
- [ ] Réactiver les `Tutoriels` de l'Académie par la bascule
  `academyTutorials`, avec retour automatique de la navigation de sections et
  recette desktop/mobile.
- [ ] Réactiver l'onglet `Webinaires` de l'Académie seulement
  après validation des créneaux, recette desktop/mobile et bascule explicite de
  `academyLiveTrainings` dans `src/lib/public-editorial-visibility.ts`.
- [ ] Réactiver les « Cas concrets » dans les Ressources des six Systèmes
  concernés seulement après validation éditoriale, recette des liens et bascule
  explicite de `systemContextualCaseStudies`. Les relations et routes sont
  conservées pendant le masquage.
- [ ] Cadrer puis livrer le MVP Réseau Partenaire à double sens : lien
  d'apporteur opaque, page Demaa contextualisée, attribution serveur,
  réduction client de 12 % sur les seules prestations Demaa éligibles et
  commission manuelle de 8 % après encaissement. Le portail partenaire complet,
  les paiements automatiques et le CRM restent différés.
- [x] Curater le premier lot Fournisseurs pour Cabinet comptable et Cabinet de
  conseil : Orus, Alan, Swile et Amazon Business, en `draft`, relation
  `unknown`, avec conditions d'éligibilité explicites.
- [ ] Étendre les Fournisseurs aux autres familles de métiers après validation
  du premier lot ; aucun acteur universel par défaut.
- [ ] Poursuivre l'enrichissement éditorial du catalogue Solutions sans réduire
  artificiellement les choix : conserver toutes les recommandations placées
  et pertinentes, afficher uniquement les détails réellement renseignés dans
  la modale, et compléter progressivement description, usage, justification,
  contraintes, tarif et interaction. Ne jamais inventer un champ manquant ni
  masquer une recommandation utile uniquement parce que sa fiche riche reste
  à compléter. Formation, expert-comptable et recrutement restent exclus des
  ajouts transverses conformément à l'arbitrage produit.
- [x] Cadrage international historique supersédé par D-085. Conserver
  `Systèmes` comme libellé court en français, `Systèmes métier` comme nom
  développé et `Business systems` en anglais, jamais la traduction littérale
  `Operational systems`. D-085 fixe désormais le socle commun, le périmètre
  English Beta et le séquencement exécutable.
- [ ] Produire les guides annoncés et les vidéos Restaurant sans créer de
  nouvelles routes publiques avant disponibilité réelle.
- [ ] Activer le vocal de Structure uniquement avec stockage privé,
  transcription et politique de suppression validés.

#### D-083 — Solutions publiques simples et accompagnement progressif

Décision courante : la simplification `Outils + Services` ne crée aucun profil
Coach. La Team Demaa reste l'opérateur unique des échanges tant que le volume
peut être traité manuellement. Les coachs extérieurs ne reçoivent ni la clé
d'administration globale, ni un accès direct aux conversations.

**Lot 1 — Surface publique Solutions — P0 — terminé localement**

- [x] Afficher publiquement uniquement `Outils` et `Services`.
- [x] Masquer Fournisseurs, Financement, Aides, Réseaux et Modèles sans
  supprimer leurs données.
- [x] Ne déplacer aucune carte Fournisseur dans Services.
- [x] Filtrer les réponses publiques après la composition afin qu'aucune
  catégorie privée ne puisse être réinjectée.
- [x] Appliquer le même contrat aux fiches Système, au récapitulatif et à
  l'API utilisée par le Plan d'action.

**Lot 2 — Accompagnement Team Demaa — P0/P1 — transitoire**

- [ ] Conserver `Échanger` pour le dirigeant, limité à ses conversations.
- [ ] Maintenir le traitement des demandes dans l'administration Team Demaa.
- [ ] Coordonner manuellement tout intervenant extérieur et restituer sa
  réponse au dirigeant sans lui ouvrir l'administration.

**Lot 3 — Référentiel interne — P1**

- [ ] Conserver Fournisseurs, aides, financements, réseaux et partenaires dans
  une couche privée consultable par la Team Demaa.
- [ ] Ajouter progressivement pays, langue, zone, validité et conditions.
- [ ] Garantir que ces métadonnées privées ne sont jamais renvoyées par les
  endpoints publics.

**Lot 4 — Dossiers d'accompagnement — P2**

- [ ] Enrichir les conversations avec statut, service concerné, système
  métier, pays, priorité, responsable, prochaine action et historique des
  attributions.
- [ ] Utiliser initialement la Team Demaa comme responsable unique.

**Lot 5 — Accès spécialiste — conditionnel, non déclenché**

Lorsque le besoin réel d'assigner des accompagnements à des intervenants
extérieurs qui se connectent eux-mêmes sera confirmé, créer une adhésion
interne, pas un second profil client :

```text
Membre interne
├── rôle : team_demaa | specialist
├── spécialités : business_coach, finance, marketing…
├── statut : invité | actif | suspendu
└── dossiers attribués
```

- [ ] Autoriser `team_demaa` sur tous les dossiers et toutes les ressources.
- [ ] Limiter `specialist` aux seuls dossiers explicitement attribués.
- [ ] Maintenir `customer` sur ses seules conversations.
- [ ] Enregistrer l'identité réelle de chaque auteur et vérifier toutes les
  autorisations côté serveur.

**Lot 6 — Console spécialiste et attribution — après le Lot 5**

- [ ] Invitation sécurisée, dossiers attribués et contexte strictement utile.
- [ ] Liste des accompagnements assignés et fiche mission minimale, sans
  conversation globale, plan d'action complet ni données administratives.
- [ ] Journal d'activité et révocation immédiate des accès.

La messagerie prestataire-client, la recherche dans les ressources internes,
le profil prestataire self-service, l'attribution multiple et
l'internationalisation complète restent hors de ce MVP.

**Cadrage du MVP administration clients et accès intervenants — validé pour le
backlog, non commencé**

Ce cadrage remplace toute lecture implicite selon laquelle il suffirait de
réutiliser l'administration Coaching et son secret partagé. Le MVP réutilise
Firebase Auth, le cookie `demaa_session` et l'application dirigeant, mais toutes
les autorisations sensibles sont recalculées côté serveur dans une DAL marquée
`server-only`.

**Gate 0 — prérequis obligatoires avant tout développement**

- [ ] Terminer, vérifier et commiter le chantier actif d'authentification,
  clarification gratuite, Plans, Solutions et Académie avant de créer le
  worktree du MVP.
- [ ] Partir d'un SHA propre dans une branche et un worktree dédiés ; ne jamais
  développer ce MVP dans le worktree d'un autre chat.
- [x] Prouver sur une Preview que l'identité Vercel possède les permissions
  Firebase Auth minimales nécessaires aux cookies de session, à leur contrôle
  de révocation et à `getUser` / `getUserByEmail`. Preuve du 15 août 2026 :
  création de session e-mail/mot de passe, entreprise/appartenance et plan
  persistés dans `demaa-preview-2026` avec le rôle sans clé minimal.
- [x] Conserver le contrôle de fraîcheur `auth_time`, la politique de mot de
  passe Firebase et les domaines Google autorisés validés par le chantier
  d'authentification en cours. Les variables Web publiques et l'identité
  serveur Preview ciblent désormais le même projet isolé.
- [ ] Créer puis vérifier le compte Firebase administrateur et configurer
  `DEMAA_ADMIN_UIDS` côté serveur, avec correspondance exacte des UID et refus
  par défaut.

**Modèle de données corrigé**

- [ ] Rendre `client_profiles` obligatoire, avec un document indexé par UID
  Firebase et les champs minimaux `display_name`, `company_name`, `activity`,
  `country`, `status`, `created_by_uid`, `created_at` et `updated_at`.
- [ ] Permettre à un profil client existant de n'avoir encore aucun
  accompagnement ; le bouton `Ajouter un client` crée ce profil uniquement
  après résolution du compte par `getUserByEmail`.
- [ ] Définir la `dernière activité` du MVP comme le maximum des dates de mise à
  jour de ses accompagnements et documenter le statut dérivé de la liste.
- [ ] Séparer les types d'accompagnement en offre Demaa, expertise canonique et
  accompagnement personnalisé ; ne pas faire passer une offre interne pour un
  identifiant du catalogue d'expertises.
- [ ] Ajouter aux accompagnements les dates utiles à la fiche mission, au
  minimum `starts_at`, `assigned_at`, `created_at` et `updated_at`. Utiliser le
  libellé constant `Team Demaa` comme référente tant qu'aucune gestion de
  plusieurs référentes n'est nécessaire.
- [ ] Garantir l'unicité d'un membre par e-mail normalisé avec une réservation
  transactionnelle dédiée, par exemple
  `workspace_member_email_claims/{sha256(email_normalise)}` ; une requête
  Firestore suivie d'une création ne suffit pas contre les accès concurrents.
- [ ] Figer les transitions `invited -> active -> suspended` et distinguer
  explicitement révocation d'invitation, désassignation, réassignation et
  suspension du membre.
- [ ] Faire de l'assignation, de la réassignation, de l'activation, de la
  suspension et de leur événement d'audit une seule transaction atomique.

**Invitation sans fuite de jeton**

- [ ] Générer au moins 32 octets aléatoires, conserver uniquement le hash
  SHA-256 et ne placer le secret ni dans un chemin ni dans une query.
- [ ] Utiliser `/invitation#token=...`, puis conserver temporairement le secret
  dans `sessionStorage` pendant la connexion ; `returnTo` reste
  `/invitation` sans secret.
- [ ] Accepter l'invitation uniquement par `POST` avec protections Host,
  Origin, limite de taille, rate limit, session Firebase, adresse correspondante
  et vérification atomique de l'expiration, la révocation et l'usage unique.
- [ ] Ajouter à `CustomerSpaceAccessForm` un mode explicite de vérification
  d'e-mail prestataire qui envoie la vérification Firebase avant la déconnexion
  du SDK client. Un compte mot de passe non vérifié ne devient jamais actif.
- [ ] Réutiliser le membre et l'invitation encore valides, réémettre seulement
  après expiration ou révocation, et ne jamais créer une nouvelle invitation
  pour un membre déjà actif.
- [ ] Exclure réellement `/invitation` de Vercel Analytics, Google Analytics,
  Meta Pixel et de toute attribution ; vérifier aussi l'absence de requêtes
  réseau de mesure après une navigation interne.
- [ ] Appliquer `Referrer-Policy: no-referrer`, `Cache-Control: private,
  no-store`, `robots: noindex, nofollow` et l'origine canonique HTTPS.

**DAL, DTO et révocation immédiate**

- [ ] Centraliser `requireAdminIdentity`, `requireActiveProviderIdentity`, les
  lectures administratrices, les lectures prestataires et la lecture support
  dans une DAL `server-only` conforme au guide Next.js 16 local.
- [ ] Recalculer l'adhésion active et l'assignation à chaque lecture sensible ;
  ne jamais mettre en cache inter-requêtes une décision d'autorisation.
- [ ] Utiliser `clientUid`, `memberId` et `assignedMemberId` seulement pour
  identifier la ressource, puis vérifier la relation en base. Aucun rôle ou UID
  envoyé par le navigateur ne constitue une preuve.
- [ ] Limiter le DTO prestataire au nom d'affichage client, au titre, au brief,
  au statut, à la date de début et au contact Team Demaa. Exclure e-mail client,
  autres accompagnements, autres intervenants, paiements, conversations et
  plan complet.
- [ ] Étendre la validation stricte de `returnTo` uniquement à `/invitation`,
  `/intervenant/accompagnements` et aux identifiants de mission conformes.

**Contexte dirigeant administratrice réellement en lecture seule**

- [ ] Ne pas monter `SavedActionPlanDetail` propriétaire tel quel avec quelques
  boutons masqués : il contient autosave, `pagehide`, `PATCH`, `DELETE`,
  génération et mutations du workspace.
- [ ] Extraire une vue de présentation partagée et conserver deux contrôleurs :
  propriétaire mutable et administratrice lecture seule. Le contrôleur support
  n'importe ni callback ni hook de mutation.
- [ ] Faire naviguer le sélecteur de plans support exclusivement dans
  `/admin/clients/[clientUid]/plans/[planId]` et vérifier côté serveur que
  `owner_uid === clientUid` avant de construire le DTO.
- [ ] Masquer `Échanger` et rendre Opportunités et Solutions non mutables dans
  le contexte support. Ne jamais utiliser l'UID administrateur comme UID du
  client et ne jamais modifier le cookie pour impersonner le client.
- [ ] Conserver sans changement les vérifications `owner_uid` des routes
  clientes ; une administratrice appelant directement un endpoint client pour
  le plan observé doit rester refusée.

**Audit, rétention et absence de mutation par GET**

- [ ] Rendre `actor_uid` nullable pour un refus non authentifié, ajouter un
  résultat explicite et limiter les métadonnées à une liste blanche sans e-mail,
  cookie, secret, jeton ni contenu client.
- [ ] Journaliser les mutations métier dans leur transaction. Pour l'ouverture
  réussie d'un contexte support, utiliser un `POST` authentifié et idempotent ;
  ne pas écrire dans Firestore pendant le rendu GET d'une page.
- [ ] Utiliser les logs opérationnels nettoyés pour les refus de lecture et
  réserver les événements Firestore aux événements auditables sans créer une
  possibilité de remplissage illimité.
- [ ] Définir une durée de conservation et une tâche de nettoyage pour les
  invitations expirées et les événements d'audit contenant des identifiants.

**Ordre de livraison après Gate 0**

1. Modèles, validateurs, réservations uniques, DAL, DTO, indexes et tests
   Firestore Emulator.
2. Administration Clients, profils, accompagnements, annuaire minimal,
   assignation, désassignation, réassignation et suspension.
3. Invitation, vérification d'e-mail, reprise après connexion et activation
   atomique.
4. `Mes accompagnements`, fiche mission, deep links et révocation immédiate.
5. Refactor séparé du contexte dirigeant support en lecture seule.
6. Remplacement du seul libellé public `Services` par `Accompagnements`, sans
   renommer les routes, clés et collections techniques.
7. Recette sécurité, accessibilité, responsive, Preview et smoke test Firebase
   réel avant toute proposition de merge.

**Recette minimale supplémentaire**

- [ ] Tester les transactions concurrentes avec Firestore Emulator : double
  création du même e-mail, double acceptation, réassignations concurrentes et
  audit atomique.
- [ ] Tester qu'aucun `PATCH`, `DELETE`, génération, autosave ou requête
  `pagehide` n'est émis par le contexte support.
- [ ] Tester la navigation après expiration de session, le `returnTo` interne,
  la conservation sûre du fragment d'invitation et l'absence du jeton dans les
  URL, logs, analytics et réponses d'erreur.
- [ ] Tester par inspection des DTO qu'un intervenant A ne reçoit aucune donnée
  de l'intervenant B ni aucune donnée client hors mission.
- [ ] Effectuer un E2E Preview e-mail/mot de passe avec adresse vérifiée,
  invitation valide, expiration, révocation, suspension, réassignation et accès
  direct à une ancienne URL.
- [ ] Ne pas considérer les checks d'une PR verte comme preuve pour des fichiers
  encore non commités ou non déployés dans cette Preview.

#### Optimisation Académie — cache client et préchargement non bloquant

Priorité : P0. Ce lot améliore uniquement le temps d'ouverture et de retour
dans Académie. Il ne modifie ni l'API, ni le catalogue, ni le lecteur, ni les
règles éditoriales.

**Cache client dédié**

- [x] Créer `src/lib/action-plan-academy-payload.client.ts`, sur le principe du
  cache Système existant, avec une seule valeur mémorisée et une seule Promise
  mémorisée pendant le chargement.
- [x] Exposer exactement `loadActionPlanAcademyPayload()`,
  `readCachedActionPlanAcademyPayload()` et
  `invalidateActionPlanAcademyPayload()`.
- [x] Faire retourner directement la Promise mémorisée par le loader afin que
  deux appels simultanés partagent strictement la même Promise et la même
  requête. Mettre le payload en cache uniquement après une réponse valide et
  retirer la Promise en attente dans un `finally`.
- [x] Ne pas attacher d'`AbortController` à la requête partagée : le démontage
  d'un panneau ne doit pas annuler le chargement utilisé par un préchargement
  ou un autre panneau. La protection contre une mise à jour après démontage
  reste locale au composant.

**Intégration dans l'expérience**

- [x] Dans `ActionPlanAcademyPanel`, initialiser l'état depuis
  `readCachedActionPlanAcademyPayload()`, remplacer le `fetch` direct par le
  loader partagé et retirer `cache: "no-store"`.
- [x] Réutiliser immédiatement le payload lors du remontage. Le bouton
  `Réessayer` est la seule action qui invalide le cache ; il efface l'erreur et
  l'état local avant de relancer un chargement propre.
- [x] Précharger en arrière-plan après le premier rendu de
  `ActionPlanExperience` et `SavedActionPlanDetail`, avec
  `requestIdleCallback` et annulation correspondante lorsque disponible, puis
  un fallback `setTimeout` / `clearTimeout`. Une erreur de préchargement reste
  silencieuse et une ouverture ultérieure doit pouvoir retenter la requête.
- [x] Importer `AcademyIndexClient` directement dans le panneau. Conserver
  seulement `AcademyCoursePlayer` en import dynamique, car il n'est utile qu'à
  l'ouverture d'un cours.
- [ ] Mesurer le bundle avant/après l'import direct afin de confirmer que le
  gain d'ouverture ne dégrade pas de manière disproportionnée le chargement du
  plan. Le cache de données reste le mécanisme principal qui supprime le loader
  au retour dans Académie.
- [x] Conserver le payload actuel d'environ 94 Ko, chargé une seule fois en
  arrière-plan puis gardé en mémoire. Ne pas modifier `/api/action-plan/academy`
  et ne pas découper les cours dans ce lot.
- [x] Ne modifier ni `action-plan-system-payload.client.ts`, ni son API, ni son
  comportement de cache.

**Tests et recette**

- [x] Prouver par test unitaire que deux ouvertures successives d'Académie effectuent un seul
  `fetch`.
- [x] Prouver que deux chargements simultanés reçoivent la même Promise et ne
  déclenchent qu'une requête.
- [x] Prouver que le cache hydrate immédiatement un panneau remonté, sans
  loader intermédiaire.
- [x] Prouver que `Réessayer` invalide le cache, puis recharge un payload neuf.
- [ ] Prouver qu'un échec du préchargement ne crée pas d'erreur visible et
  qu'une ouverture manuelle retente le chargement.
- [x] Conserver un test de non-régression explicite du cache Système métier.
- [x] En E2E desktop et mobile, intercepter
  `/api/action-plan/academy`, ouvrir Académie, revenir au plan puis rouvrir
  Académie : aucun loader ne réapparaît et une seule requête est observée.

#### MVP Réseau Partenaire — double sens, sans portail complet

Priorité : P1, après fermeture du lot applicatif courant. L'objectif est de
livrer le résultat commercial minimal : Demaa peut orienter une demande vers
un partenaire pertinent et un partenaire peut orienter son client vers Demaa.
Il ne s'agit pas encore de construire l'espace partenaire complet des mockups.

**Règles commerciales figées avant développement**

- [ ] Référencer en interne trois rôles : `coach`, `expert_accountant` et
  `administrative_assistant`. Un expert-comptable présenté au client doit être
  inscrit à l'Ordre.
- [ ] Accorder 12 % au client uniquement sur une prestation éligible,
  directement facturée par Demaa. Accorder 8 % à l'apporteur seulement après
  encaissement réel par Demaa.
- [ ] Calculer la commission sur le montant HT réellement encaissé après la
  réduction client, hors TVA, remboursement, budget média, logiciel, frais de
  tiers et débours.
- [ ] Exclure explicitement les honoraires et prestations facturés directement
  par un expert-comptable ou un autre partenaire, ainsi que Coach business,
  Assistance administrative et les recommandations externes tant que ces
  prestations ne sont pas facturées par Demaa.
- [ ] Ne jamais cumuler l'avantage partenaire avec l'avantage d'un abonnement
  mensuel. Un résolveur serveur choisit l'avantage applicable et conserve sa
  source, au lieu d'empiler plusieurs réductions.
- [ ] Prévoir l'annulation ou la reprise proportionnelle d'une commission en
  cas de remboursement total ou partiel.

**Données et attribution fonctionnelle**

- [ ] Créer une fiche partenaire interne avec identifiant stable, rôle,
  expertise, nom public, statut `active | suspended`, code d'apporteur opaque,
  dates et audit. Aucun annuaire public n'est créé.
- [ ] Utiliser une URL permanente opaque, par exemple `/p/p_7K4P9M`, et non un
  slug contenant le nom ou l'e-mail. Le nom affiché est résolu côté serveur.
- [ ] Séparer cette attribution contractuelle de `lead-attribution`, des UTM et
  du consentement analytics. Le lien partenaire est une donnée fonctionnelle
  de premier niveau, validée et signée côté serveur, puis documentée dans la
  politique cookies/confidentialité.
- [ ] Figer la règle d'attribution : le premier partenaire valide avant la
  création du compte ou de la demande est conservé ; il n'est pas écrasé par
  un autre lien. Toute correction administrative est explicite et auditée.
- [ ] Rendre le code révocable et rotatif. Refuser un code inconnu, suspendu ou
  expiré, sans révéler l'existence d'un partenaire privé.
- [ ] Enregistrer côté serveur au minimum `partner_id`, `partner_role`,
  `referral_code_id`, `referred_customer_uid`, `lead_id`, `service_slug`,
  `attributed_at`, `conversion_status`, les montants en centimes HT,
  `paid_at`, `refunded_at` et les champs d'audit.
- [ ] Ne jamais accepter du navigateur un rôle, un montant éligible, une
  réduction, une commission ou un identifiant partenaire comme preuve.

**Parcours client et catalogue**

- [ ] Afficher une page Demaa légère et contextualisée : nom du partenaire,
  `Clarifier ma situation`, `Créer mon plan d'action` et
  `Voir les accompagnements`, avec la mention discrète `Partenaire × Demaa`.
- [ ] Réutiliser les parcours Demaa existants et conserver l'attribution lors
  de la création du compte, de la clarification ou de la demande de rappel.
- [ ] Masquer dans le catalogue contextualisé l'expertise principale du
  partenaire afin qu'il ne recommande pas un concurrent direct.
- [ ] Distinguer clairement les prestations Demaa éligibles à 12 % des mises en
  relation gratuites vers un tiers. Assistance administrative peut être
  recommandée contextuellement, mais ne doit pas être présentée comme une
  prestation Demaa éligible tant que le tiers facture directement.
- [ ] Ne transmettre aucune coordonnée ou information client au partenaire sans
  consentement explicite, contextualisé et journalisé.

**Administration minimale et sens Demaa vers partenaire**

- [ ] Dans l'administration, afficher le partenaire apporteur, la demande, la
  prestation, son éligibilité, les 12 % client, les 8 % potentiels et le montant
  réellement encaissé servant de base.
- [ ] Faire valider manuellement la commission par la Team après encaissement ;
  aucun paiement automatique de commission dans le MVP.
- [ ] Séparer les états de conversion
  `visited | lead_submitted | qualified | quote_sent | accepted | active |
  cancelled` des états de commission
  `not_eligible | pending_payment | pending_validation | validated | cancelled |
  clawback`.
- [ ] Dans l'autre sens, permettre à la Team de proposer manuellement une
  mise en relation avec un partenaire depuis les outils de clarification et de
  recommandation existants. Le partenaire ne reçoit que la demande consentie,
  jamais l'accès aux conversations ou au catalogue interne complet.

**Tests d'acceptation**

- [ ] Refuser les codes invalides, expirés, révoqués ou suspendus et empêcher
  l'écrasement d'une attribution existante.
- [ ] Empêcher l'attribution rétroactive silencieuse d'un compte ou d'une
  demande existante.
- [ ] Vérifier le masquage de l'expertise du partenaire et l'absence d'accès au
  catalogue privé.
- [ ] Vérifier 12 % uniquement sur les prestations Demaa éligibles, sans cumul,
  et 8 % sur le HT réellement encaissé après réduction.
- [ ] Vérifier remboursement, annulation et reprise de commission.
- [ ] Vérifier que le navigateur ne peut forger ni montant, ni rôle, ni
  partenaire et qu'un partenaire ne voit aucune donnée d'un autre partenaire.
- [ ] Vérifier le consentement avant tout partage de données client.

**Hors MVP**

- [ ] Différer le tableau de bord partenaire, les liens par client, le paiement
  automatique des commissions, la synchronisation comptable, le CRM complet,
  le catalogue personnalisable, la messagerie partenaire-client et le portail
  d'un spécialiste externe. Les trois mockups restent la référence de phase 2,
  pas le périmètre de ce premier lot.

#### D-082 — Lecteur Académie stable et adapté au viewport

Priorité : P0. Ordre obligatoire : après l'audit des cours existants et avant
la production des nouveaux cours.

Objectif : faire tenir chaque étape d'un cours Académie dans le viewport sur les
écrans courants, sans obliger l'utilisateur à faire défiler le document pour
retrouver le bouton de navigation.

Expérience attendue :

- conserver un en-tête stable avec retour, titre, étape et progression ;
- garder l'action principale toujours visible en bas et utiliser autant que
  possible le libellé `Continuer` ;
- ne remplacer que la zone centrale lors du changement d'étape, sans remontée
  de page ni mouvement important ;
- autoriser, uniquement en secours sur les très petits écrans ou avec le zoom
  d'accessibilité, le défilement de la zone centrale ;
- ne tronquer ni rendre inaccessible aucun contenu.

Contrat de conception :

1. Construire le lecteur en trois zones : en-tête fixe, contenu adaptatif et
   navigation fixe.
2. Empêcher le défilement du document pendant la lecture d'un cours.
3. Retirer le défilement animé déclenché entre les écrans et replacer
   instantanément la zone de contenu en haut à chaque changement d'étape.
4. Utiliser une hauteur stable tenant compte du lecteur autonome, du lecteur
   intégré à l'application, des barres de navigation et du navigateur mobile.
5. Limiter les animations à un fondu discret et respecter
   `prefers-reduced-motion`.
6. Réserver l'espace des réponses et explications de quiz afin d'éviter les
   sauts de mise en page.

Responsive :

- sur desktop, utiliser davantage la largeur, proposer deux colonnes lorsque
  pertinent — texte à gauche, visuel ou méthode à droite —, conserver
  `À retenir` sous l'ensemble et réduire les grandes marges verticales sur les
  écrans peu hauts ;
- sur mobile, utiliser une colonne compacte, conserver une typographie lisible
  et des boutons d'au moins 44 px, réduire les espacements avant la taille du
  texte, permettre une icône pour `Précédent` et garder `Continuer` toujours
  visible.

Budget éditorial par écran : une seule idée, un titre court, un paragraphe
principal concis, quatre éléments maximum dans un visuel, un enseignement à
retenir en une ou deux lignes, ainsi que des réponses et explications de quiz
concises. Une leçon trop longue doit être raccourcie ou divisée en deux étapes,
jamais coupée automatiquement.

Cas particuliers et navigation :

- réduire la hauteur de l'introduction, n'afficher que les titres du programme
  sans toutes les descriptions longues et garder visibles durée, quiz et bouton
  `Commencer` ;
- utiliser `Commencer` pour l'introduction, `Continuer` pour une leçon, un
  récapitulatif et un quiz répondu, puis l'action du cours ou
  `Retour à l'Académie` à la fin ;
- déterminer explicitement, dans le plan préalable, le comportement du quiz
  avant qu'une réponse soit sélectionnée.

Recette minimale : 1440 × 900, 1366 × 768, 390 × 844, 375 × 667, 360 × 640,
320 × 568 et zoom navigateur à 200 %.

Critères d'acceptation :

- aucun défilement de page sur les viewports courants ;
- navigation toujours visible et en-tête/pied du lecteur stables ;
- aucun texte tronqué ni saut brutal après une réponse au quiz ;
- défilement interne accessible sur les écrans exceptionnellement petits ;
- comportement identique dans l'Académie autonome et intégrée ;
- navigation clavier et lecteurs d'écran préservés.

Gate avant implémentation : relire `AcademyCoursePlayer` et ses conteneurs,
identifier précisément la hauteur occupée par chaque navigation, présenter le
plan d'implémentation et les compromis responsive, puis attendre sa validation.
La présente inscription au backlog n'autorise aucune modification du code.

### Internationalisation — lot différé, à ouvrir avant le deuxième pays

Ce chantier est volontairement au backlog. Le lancement France reste sans
préfixe de locale sur `demaa.co` et aucune route publique n'est modifiée dans le
lot de fermeture actuel.

#### Contrat de données à préparer

- [ ] Ajouter des identifiants stables et indépendants de la langue pour les
  Systèmes, Services, ressources, fournisseurs et réseaux.
- [ ] Ajouter explicitement `countryCode`, `localeCode` et `marketCode` aux
  catalogues et placements localisables ; ne jamais déduire le pays uniquement
  de la langue ou de l'adresse IP.
- [ ] Séparer le noyau universel d'un Système (processus et structure) de ses
  variantes locales : obligations, prix, fiscalité, acteurs, fournisseurs,
  réseaux professionnels et preuves éditoriales.
- [ ] Permettre une disponibilité et un classement des Solutions par marché :
  un outil ou fournisseur français ne doit pas être affiché automatiquement en
  Côte d'Ivoire ou aux États-Unis.
- [ ] Prévoir prix, devise, taxe, date de vérification et expiration par marché,
  sans réutiliser silencieusement une donnée française.

#### Routes, SEO et navigation

- [ ] Choisir et documenter le format d'URL international avant migration
  (`/{locale-pays}/...` recommandé pour les nouveaux marchés), tout en
  conservant les URL françaises actuelles jusqu'au plan de redirections.
- [ ] Préparer canoniques, `hreflang`, sélecteur pays/langue, sitemaps par
  locale et redirections permanentes sans créer de pages traduites vides.
- [ ] Traduire les libellés de présentation, pas les identifiants internes :
  `Systèmes métier` en français, `Business systems` en anglais.
- [ ] Remplacer progressivement le segment historique `kit-operationnel`
  seulement avec une matrice de redirections testée ; ne pas casser les URL
  françaises existantes pour anticiper l'international.

#### Contenu et gouvernance

- [ ] Qualifier chaque contenu comme universel, traduit ou localisé. Les règles
  juridiques et financières exigent une version locale sourcée et datée.
- [ ] Définir un workflow traduction → relecture humaine → validation marché →
  publication, avec fallback explicite plutôt qu'une traduction automatique
  publique non relue.
- [ ] Décliner YouTube d'abord en français et en anglais : même trame
  pédagogique, métadonnées et voix localisées, sans dupliquer les pages SEO si
  le contenu n'est pas réellement disponible.
- [ ] Ouvrir un pays pilote seulement lorsque ses Systèmes prioritaires, ses
  Solutions locales et ses obligations ont un propriétaire éditorial et une
  couverture testée.

#### Critères d'ouverture du chantier

- France stable en Production et audits de couverture verts ;
- choix du premier pays et de la langue cible validé ;
- matrice des différences réglementaires et commerciales disponible ;
- contrat de données et stratégie d'URL validés avant toute duplication de
  contenu ou ajout de préfixe.

## Mise à jour canonique du 30 juillet 2026

Cette section remplace les états historiques plus bas lorsqu'ils divergent.

- D-061 est terminé en code et en staging, mais reste inactif côté Google
  Drive. Le commit
  `dfa036ade6e1c95b0157665a7ed2dc6d0e9df851` prépare cinq pilotes
  versionnés, leur compilateur protégé, la conservation de la révision demandée
  dans les leads et l'interface `Routines essentielles`.
- La Preview D-061 est
  `https://demaa-6so67lebp-hiteamdemaa-2292s-projects.vercel.app`.
  Les cinq pilotes affichent 8/8/8/8/9 routines ; les 110 autres systèmes
  restent sur la présentation v1. Aucun classeur Drive v2, aucun aperçu v2 et
  aucun support clé n'a été créé ou activé.
- La mention `Dans le système` devient strictement conditionnelle : elle ne
  s'affiche que si le support réel, son format et sa révision privée sont
  validés. Aucun espace réservé ne doit être rendu dans le cas contraire.
- D-046 reste l'historique du bloc `Diagnostic offert` livré en staging, mais
  son placement sous les trois onglets est remplacé avant Production par
  D-064.
- D-064 est désormais P0 et doit placer un unique appel gratuit de 30 minutes
  uniquement à la fin de Process. Il ne doit jamais apparaître sous Outils ou
  Écosystème.
- D-063 est complémentaire de D-064 : la newsletter Structure est réservée à
  la fin d'Outils et d'Écosystème, jamais sous Process. D-063 dépend de D-064
  afin d'éviter un état transitoire incohérent.
- D-062 et D-063 restent des évolutions ultérieures. D-062 intégrera la
  prestation marketing-vente dans Écosystème après arbitrage du wording, sans
  prix inventé ni doublon avec l'appel gratuit.
- D-065 couvre l'activation contrôlée des paires Drive v2 des cinq pilotes ;
  D-066 la création de 4 à 6 supports clés réels par pilote ; D-067 la
  généralisation aux 115 systèmes seulement après la recette des pilotes.
- D-068 à D-070 couvrent l'audit de pertinence de toutes les recommandations
  d'outils pour les 115 systèmes. L'onglet Outils actuel reste inchangé tant
  que le contrat d'audit, le pilote représentatif et la généralisation ne sont
  pas validés. Aucune recommandation future ne peut être publiée sans preuve
  datée reliant l'outil au métier, au processus et au problème réellement
  résolu.
- D-071 conserve au chaud la piste `Value stack Services`. Cette piste reste
  différée et non validée définitivement : elle ne remplace ni le prix, ni le
  contenu, ni les écrans de la maquette Services canonique actuelle avant une
  reprise et un GO explicites.
- D-037 doit repartir du candidat D-061, intégrer D-064 et produire une
  nouvelle Preview canonique avant toute décision de Production. La Production
  reste interdite sans `GO PROD` explicite.

## Mise à jour canonique du 29 juillet 2026

Cette section remplace les états historiques plus bas lorsqu'ils divergent.

- Le chantier Systèmes D-044/D-045/D-046 est terminé en staging sur le SHA
  `3ddd6e7e7aa752e62863562297d44d75cf5c3888`.
- Sa Preview canonique est
  `https://demaa-7liy6ycxc-hiteamdemaa-2292s-projects.vercel.app`.
- La page système affiche désormais le bouton clair `Voir le système`, une
  modale unique aperçu vers formulaire, les Process repliés et numérotés, la
  mention passive `Dans le système` et le bloc `Diagnostic offert` relié au
  Fillout canonique.
- Les cinq masters de cours avec la voix Oumou sont terminés localement. Ils
  utilisent le profil motion stable, conservent les informations essentielles
  dans une safe zone centrale 4:3 et sont harmonisés autour de -16 LUFS.
- Les trois miniatures des cours 3, 4 et 5 sont validées et figées localement.
  Elles ne sont pas encore copiées dans le site public.
- Le candidat combiné Systèmes + Académie est prêt en staging sur le SHA
  `82b95bdada34c85c0b19a7af611e53edd655f5c1`. Ce commit vide de
  rafraîchissement possède exactement le même arbre produit que
  `1fb091dcfcfcae1dc48439d46df10df71070df94`.
- Sa Preview canonique est
  `https://demaa-5hwo4r2rm-hiteamdemaa-2292s-projects.vercel.app`.
- Le registre privé des copies Systèmes est présent dans cette Preview et reste
  scoped uniquement à la Preview. Aucune valeur privée n'est documentée ici et
  aucun scope Production n'a été créé.
- Seuls les deux cours disposant déjà de vrais IDs YouTube restent publics. Les
  cours 3, 4 et 5 existent comme brouillons SEO serveur et sont absents des
  routes, du HTML, du JavaScript client, du JSON-LD et des sitemaps.
- Le soft-404 global préexistant est accepté comme risque faible : l'interface
  affiche une page introuvable, `noindex` et `no-store` sont présents, et aucune
  donnée de brouillon n'est exposée. Aucun changement risqué n'est apporté au
  proxy, au slot modal ou au loading racine.
- Les Cas concrets et JUSTE restent gelés au backlog.
- Le nouveau chantier d'acquisition
  `Cabinet comptable → système gratuit Demaa → Tiimora` est inscrit sous les
  IDs D-049 à D-060. Il reste intégralement au statut backlog : aucune
  instrumentation, campagne, collecte, page SEO, modification Tiimora ou
  Production n'est autorisée sans un GO séparé.
- La prochaine étape nécessite une validation humaine des cinq masters, puis
  des uploads YouTube contrôlés. Chaque brouillon sera ensuite promu avec son
  véritable ID vidéo.
- La Production reste strictement interdite sans `GO PROD` explicite.

## Mise à jour canonique du 28 juillet 2026

Cette section décrit l'état historique du 28 juillet. Le Google Sheet était
alors la source de vérité opérationnelle ; les décisions datées du 16 août en
haut de ce document et le registre ADR les remplacent désormais lorsqu'elles
divergent :

- Le candidat staging prêt à publier est le SHA
  `5d5379ecc79f4dbe96801b62b9c8119ac6119f21`, déploiement Preview
  `dpl_7N7gwt3RxczcU5fgKUnw2fNdwZeA`.
- La Production reste inchangée. Elle nécessite un `GO PROD` distinct, le
  registre privé Production et un smoke test avec possibilité de rollback.
- D-012 Écosystème est terminé en staging. Le lot validé comprend quatre
  groupes, des cartes carrées sans CTA et des modales réutilisées.
- Sur une page système, la navbar affiche `Découvrir l'Académie`, jamais
  `Trouver mon système`. Sur l'Académie, elle affiche `Trouver mon système`.
- D-024 est rouvert pour remplacer la phrase longue sur les supports par la
  micro-mention `Dans le système`, affichée sous le nom du support.
- D-044 ajoutera un bouton clair `Voir le système` ouvrant une modale unique
  avec la démonstration et la demande de copie gratuite.
- D-045 simplifiera les Process : familles et processus repliés, numéros comme
  repères, aucune grande icône et supports passifs.
- D-046 ajoutera le bloc compact `Diagnostic offert` et le CTA
  `Demander mon diagnostic`. Le CTA réutilisera exclusivement le lien et le
  comportement Fillout canoniques existants. Aucun nouveau formulaire, lien,
  prix ou paiement n'est créé.
- La voix des cinq cours est la voix personnelle Oumou
  `9HTNhnzaWIkUTIhaJhPM`, vitesse ElevenLabs native `1,15`, stabilité `0,86`,
  similarité `0,78`, style `0`, speaker boost activé et sans seconde
  accélération.
- D-042 commence par des extraits A/B courts pour corriger les transitions
  tremblantes. Aucun master long n'est autorisé avant validation.
- Les masters restent en 16:9, avec toutes les informations essentielles dans
  une safe zone centrale compatible avec un recadrage 4:3. Aucun 9:16 n'est
  produit maintenant.
- La priorité éditoriale est de terminer cinq cours. Les Cas concrets, JUSTE et
  la taxonomie publique associée restent reportés.
- Aucune délégation, modification, écriture, génération ou publication n'est
  lancée avant validation du plan puis `GO`. Toute Production exige en plus un
  `GO PROD`.

## Décisions produit désormais retenues

- `/` reste la page d'accueil des systèmes opérationnels.
- Les 115 démonstrations restent accessibles sans formulaire.
- La copie personnelle et modifiable devient gratuite.
- Le CTA public est `Recevoir ma copie modifiable`.
- Sous les CTA, afficher uniquement `Gratuit · Envoyé par e-mail`.
- Le formulaire demande uniquement le prénom et l'adresse e-mail.
- Son texte est :
  `Nous vous envoyons le lien permettant de créer votre copie personnelle dans Google Drive.`
- L'API ne renvoie jamais le lien Google Drive au navigateur. Le lien `/copy`
  est envoyé uniquement par e-mail.
- La livraison du document et le consentement aux e-mails marketing sont deux
  finalités séparées.
- L'ordre des onglets est `Process → Outils → Écosystème`.
- L'onglet Écosystème contient des liens directs vers des ressources externes :
  aucun formulaire, aucun matching et aucune mise en relation par Demaa.
- Afficher de une à trois recommandations pertinentes par besoin, sans compléter
  artificiellement jusqu'à trois.
- Demaa ne promet ni conseil humain, ni abonnement, ni accompagnement inclus
  dans le système gratuit.
- Stripe n'a plus aucun rôle dans la distribution des systèmes opérationnels
  gratuits.
- Les cours existants restent sur `/cours` et ne sont pas déplacés.
- Une nouvelle page `/academie` présentera uniquement des vidéos courtes et
  pratiques, dans une interface simple centrée sur la recherche.
- La home conserve la recherche de système comme action principale et ajoute
  un lien secondaire `Découvrir l'Académie`.
- Dans la navbar des pages système, remplacer `Trouver mon système` par
  `Découvrir l'Académie` lorsque la route `/academie` sera disponible.

## État confirmé

### Déjà en production

- La home présente les systèmes opérationnels.
- Les 115 métiers sont publiés.
- Chaque métier possède une démonstration et une copie modifiable distinctes.
- Les pages système proposent actuellement Process et Outils.
- L'ancien endpoint gratuit `/api/systeme-kit/request` existe encore, mais
  retourne volontairement `410 Gone`.
- L'achat à 49 € est encore présent dans le code et le wording, mais indisponible
  en production faute de configuration Stripe live.
- `/cours` contient actuellement trois ressources au format slides, avec sa
  propre recherche et ses pages détaillées.
- Aucune page `/academie` ni aucun catalogue vidéo dédié n'existe encore.
- En production, `/structuration` renvoie encore une 404/noindex.
- `/kits-operationnels` duplique encore la home.

### Prêt mais non publié

- Le commit `1e7df59` contient les 115 miniatures recadrées sur les
  démonstrations préremplies.
- Il est sur `codex/systemes-operationnels-rollout`, un commit devant
  `origin/main`.
- Ce lot a déjà passé les tests, audits, lint, TypeScript, build et contrôles
  visuels desktop/mobile lors de sa préparation.
- L'ancienne landing complète a été restaurée uniquement dans le workspace local
  sur `/structuration`. La route, son composant et le déblocage dans le proxy ne
  sont ni commités, ni poussés, ni déployés.
- Cette restauration locale a passé TypeScript, lint et les contrôles visuels ;
  la home locale est restée inchangée.
- Trois illustrations pilotes pour un futur contenu sur la trésorerie sont
  prêtes dans `creative/course-1-first-three`. Elles attendent une validation de
  direction artistique avant la production des 13 illustrations restantes.
  Ce travail appartient aux cours existants et ne doit pas être absorbé par
  l'Académie vidéo.
- Le parcours gratuit complet est terminé et recetté localement : endpoint de
  demande, interface, validation serveur, idempotence, livraison par e-mail et
  suppression du tunnel Stripe. Une demande réelle Bâtiment à
  `ou.gory@gmail.com` a reçu une réponse `{"ok":true}` sans lien, l'e-mail a été
  livré par Resend, son lien `/copy` a créé une copie Google Sheets personnelle
  et la même demande répétée n'a déclenché aucun second envoi. Les contrôles
  lint, TypeScript, données, tests, build et analytics avec consentement refusé
  puis accepté ont réussi. Aucun commit, push, Preview ou déploiement n'a été
  effectué.
- Le storyboard définitif du cours Trésorerie est terminé : 16 séquences avec
  narration, exemples, intentions visuelles et transitions, plus un handoff
  complet pour le lot d'illustrations.
- Un prototype vidéo Académie est en cours dans
  `studio/academy-video-prototype/`, sans import dans le site : moteur Remotion,
  neuf séquences, rendu muet 1080p de 4 min 05, miniature et chaîne de
  synchronisation automatique. Il attend la configuration locale
  d'ElevenLabs, le choix de la voix, le rendu sonorisé et la validation humaine.
- Le workspace contient désormais trois zones strictement séparées du lot de
  publication des systèmes : `/structuration`, `creative/` et `studio/`.

## Ordre d'exécution

### P0 — Remplacer l'achat par la copie gratuite

Objectif : rendre le nouveau parcours utilisable de bout en bout avant toute
nouvelle acquisition payante.

- [x] Remplacer le prix et le bouton d'achat par
  `Recevoir ma copie modifiable`.
- [x] Afficher `Gratuit · Envoyé par e-mail`.
- [x] Ajouter la modale prénom + adresse e-mail avec le texte retenu.
- [x] Conserver `Voir la démonstration` sans formulaire.
- [x] Réactiver et moderniser `/api/systeme-kit/request`.
- [x] Valider côté serveur le prénom, l'e-mail et le métier demandé.
- [x] Utiliser le registre serveur des 115 copies modifiables.
- [x] Conserver anti-spam, rate limiting, déduplication et attribution UTM.
- [x] Enregistrer le lead et l'état de livraison.
- [x] Envoyer le lien `/copy` par e-mail uniquement.
- [x] Retourner seulement une confirmation de réussite au navigateur.
- [x] Rendre l'envoi idempotent pour empêcher les doublons.
- [x] Réactiver les nouvelles tentatives en cas d'échec d'envoi.
- [x] Afficher une erreur réessayable si l'envoi immédiat échoue.
- [x] Adapter l'e-mail :
  - objet métier explicite ;
  - bouton `Créer ma copie dans Google Drive` ;
  - lien complet de secours ;
  - aucune mention de paiement.
- [x] Afficher après envoi :
  `C'est envoyé. Le lien vient d'être envoyé à votre adresse e-mail. Pensez à vérifier vos courriers indésirables.`
- [x] Ne pas rendre le consentement marketing nécessaire à la livraison et le
  garder séparé si une séquence commerciale est ajoutée ultérieurement.
- [x] Ne jamais déduire ce consentement du consentement cookies.

Critères de fin :

- une adresse valide reçoit le bon système ;
- une fausse adresse n'obtient aucun lien dans la réponse ;
- une double soumission ne crée pas deux livraisons ;
- un échec d'envoi est suivi et retenté ;
- aucun prix ou paiement n'apparaît dans le parcours.

### P0 — Supprimer Stripe des systèmes opérationnels

Dernier arbitrage : le document étant gratuit et envoyé par e-mail, Stripe n'est
plus utile dans ce produit. Il ne doit pas rester dans le parcours public ni être
conservé pour une hypothétique offre future.

- [x] Vérifier une seule fois s'il existe une commande Stripe live réellement
  payée à conserver. Les éléments actuels indiquent que les clés live n'ont pas
  été configurées et que l'achat public était désactivé.
- [x] En l'absence de commande live, supprimer directement :
  - `/api/checkout/operational-system` ;
  - `/commande/systeme-operationnel/succes` ;
  - le traitement Stripe du webhook ;
  - les commandes et types serveur liés au paiement ;
  - la configuration et la documentation Stripe de cette offre.
- [x] Confirmer qu'aucune ancienne commande live ne nécessite d'archivage ou de
  maintien manuel. Ne pas maintenir tout le
  tunnel de paiement pour une hypothèse non vérifiée.
- [x] Retirer la dépendance `stripe` du projet si aucun autre produit réel ne
  l'utilise après le nettoyage.
- [x] Renommer `paid-operational-system-assets` avec un nom neutre orienté
  copies modifiables.
- [x] Retirer le prix et les mentions de paiement des métadonnées, e-mails,
  tests, audits, documentation, CGV et supports marketing concernés.

Critère de fin : le produit gratuit n'importe, n'affiche et n'appelle plus
Stripe. Une éventuelle ancienne preuve de commande reste archivée sans conserver
un tunnel inutilisé.

### P0 — Aligner la promesse publique (D-024)

- [ ] Remplacer `Modèle disponible dans le système` par
  `Support associé indiqué dans le système`.
- [ ] Vérifier les 526 mentions de supports pour ne pas laisser croire que
  526 fichiers autonomes sont déjà fournis.
- [x] Remplacer partout l'ancienne promesse à 49 € par :
  `Démonstration accessible librement · Copie gratuite envoyée par e-mail`.
- [x] Mettre à jour les événements analytiques : la conversion principale
  devient la livraison réussie de la copie.

### P0 — Valider et publier le nouveau parcours

- [x] Conserver et valider les miniatures du commit `1e7df59` dans le lot local.
- [x] Couvrir Bâtiment/Plomberie, Restaurant, Agence marketing, Pharmacie et un
  métier au nom long dans les audits, avec recette interactive sur Bâtiment et
  l'intitulé long.
- [x] Tester desktop et mobile.
- [x] Tester adresse valide, adresse invalide, double soumission, rate limit,
  échec d'envoi et reprise (cas réels pour l'envoi/idempotence, cas d'erreur et
  de reprise couverts par les tests automatisés sans provoquer volontairement
  une panne du fournisseur).
- [x] Auditer les 115 couples démonstration/copie.
- [x] Lancer tests, audits de données, lint, TypeScript et build de production.
- [ ] Déployer d'abord en Preview et effectuer un smoke test réel.
- [ ] Déployer en production.
- [x] Vérifier une réception réelle d'e-mail et le comportement analytics en
  local avec consentement refusé puis accepté.
- [ ] Refaire un smoke test e-mail et analytics sur la Preview, puis en
  production après autorisation.

### P0 — Intégrer et préparer la publication (D-022)

- [ ] Terminer D-024 avant de figer le lot de publication.
- [ ] Définir le lot Git exact en excluant `/structuration`, `creative/`,
  `studio/` et les autres changements locaux sans rapport.
- [ ] Créer un commit contrôlé, le pousser et ouvrir la Preview uniquement
  après autorisation explicite.
- [ ] Rejouer sur la Preview le parcours e-mail, le lien `/copy`,
  l'idempotence et le consentement analytics.
- [ ] Examiner les journaux et corriger uniquement les défauts confirmés.
- [ ] Demander une autorisation de production séparée après le smoke test
  Preview réussi.

### P1 — Créer l'Académie vidéo

Objectif : ajouter une bibliothèque vidéo simple, distincte des cours existants,
pour permettre à un dirigeant de chercher rapidement une réponse pratique.

- [ ] Créer une nouvelle route `/academie`.
- [ ] Conserver `/cours` et `/cours/[slug]` inchangés.
- [ ] Créer un registre vidéo séparé des `CourseEntry`, avec au minimum :
  - identifiant et slug ;
  - intention de recherche et mot-clé principal ;
  - titre ;
  - title SEO, meta-description et H1 uniques ;
  - description courte ;
  - catégorie ;
  - tags et mots-clés ;
  - durée ;
  - identifiant ou URL YouTube ;
  - miniature ;
  - date de publication ;
  - date de mise à jour ;
  - résumé indexable ;
  - FAQ ;
  - systèmes opérationnels liés.
- [ ] Ajouter un en-tête `Académie Demaa` et une grande barre de recherche.
- [ ] Ajouter des filtres très simples par sujet, sans transformer la page en
  plateforme de formation complexe.
- [ ] Afficher une grille de cartes inspirée d'une bibliothèque YouTube :
  miniature, durée, titre et sujet.
- [ ] Standardiser toutes les miniatures et le lecteur en 16:9. Dans les
  miniatures, réserver une zone fixe au titre à gauche et à l'illustration
  détourée à droite, avec centrage vertical constant. Palette validée :
  `vert forêt + vert clair` uniquement, sans marron. Interdire les rectangles
  gris ou opaques intégrés aux illustrations.
- [ ] Ouvrir chaque vidéo sur une vraie page SEO autonome
  `/academie/[slug]`, et non dans un simple lecteur YouTube.
- [ ] Pour chaque fiche, fournir une URL, un `title`, une meta-description et
  un H1 uniques, une canonical, une miniature indexable et les dates de
  publication et de mise à jour.
- [ ] Rendre la vidéo visible immédiatement, puis publier un contenu éditorial
  original qui répond clairement à l'intention : réponse courte, points
  essentiels, exemple chiffré, actions à retenir et FAQ.
- [ ] Ajouter les données structurées pertinentes (`VideoObject`, `Article`
  et `BreadcrumbList`) sans déclarer ce que la page ne contient pas.
- [ ] Ajouter des liens internes vers les vidéos connexes et les systèmes
  opérationnels réellement associés. Ne pas afficher de bloc
  `Script de la vidéo` ni de longue transcription sous le lecteur.
- [ ] Charger le lecteur YouTube uniquement après interaction, sans lecture
  automatique, en mode confidentialité renforcée.
- [ ] Vérifier l'impact cookies et mettre à jour la politique de confidentialité
  si le lecteur ou la mesure d'audience le nécessite.
- [ ] Prévoir des sous-titres dans le lecteur si la vidéo en propose, sans
  reproduire le script ou la transcription dans la page.
- [ ] Prévoir les états recherche vide, aucune vidéo et vidéo indisponible.
- [ ] Ajouter sous la recherche principale de la home un lien secondaire
  `Découvrir l'Académie`, sans concurrencer `Trouver le système opérationnel`.
- [ ] Sur toutes les pages `/systemes/[slug]`, remplacer le CTA de
  navbar `Trouver mon système` par `Découvrir l'Académie` et le faire pointer
  vers `/academie`, y compris sur mobile. Ne pas publier ce changement avant
  que la route existe.
- [ ] Ajouter l'Académie au footer, au sitemap standard, au sitemap vidéo et
  aux métadonnées.
- [ ] Mailler les fiches depuis le catalogue Académie, les pages métiers et
  les contenus liés, sans créer de liens artificiels.
- [ ] Mesurer au minimum :
  - clic home → Académie ;
  - recherches ;
  - ouvertures de vidéos ;
  - lectures démarrées ;
  - clics vidéo → système opérationnel.
- [ ] Définir le premier catalogue éditorial avant publication :
  sujets, intentions distinctes, titres, catégories, URL YouTube et ordre
  d'affichage. Commencer par les deux masters déjà produits.
- [ ] Vérifier desktop, mobile, recherche clavier, lecteur et SEO.

Critère de fin : la home mène à une page vidéo autonome, recherchable et rapide,
sans déplacer les cours existants ni créer de compte, de progression ou de
paiement.

### P1 — Auditer et spécialiser les process métiers (D-026 et D-027)

Constat sur le pilote `Création de contenu` :

- le système contient 19 processus et 74 étapes répartis dans 6 piliers ; les
  quatre processus visibles correspondent à un pilier, pas au système complet ;
- les étapes sont cohérentes pour une agence ou un studio qui vend des
  prestations de contenu : briefs clients, périmètre vendu, validation,
  facturation et marge projet ;
- le libellé `Création de contenu` reste ambigu pour une personne qui s'attend
  à un système de créateur indépendant ;
- le cycle éditorial est trop concentré dans
  `Planifier, produire et contrôler les livrables`. Idéation, recherche,
  publication, distribution, réutilisation et apprentissage éditorial doivent
  être évalués comme processus distincts ;
- aucun doublon strict ou processus manifestement inutile n'a été identifié
  dans ce pilote, mais plusieurs titres restent génériques parce qu'ils sont
  partagés au niveau de la famille `Agences digitales & création`.

D-026 — Clarifier et spécialiser `Création de contenu` :

- [ ] Décider si la cible est une agence/studio, un créateur indépendant ou les
  deux.
- [ ] Recommandation : renommer l'existant
  `Agence / studio de création de contenu`, puis créer un système distinct
  `Créateur de contenu indépendant` seulement si cette cible est retenue.
- [ ] Pour la cible indépendante, couvrir explicitement : positionnement et
  ligne éditoriale, backlog d'idées, recherche et vérification des sources,
  production multiformat, publication et distribution, réutilisation,
  communauté, partenariats et sponsoring, revenus plateformes, droits et
  mentions commerciales, analyse de performance et continuité d'activité.
- [ ] Pour la cible agence/studio, conserver les bons processus actuels mais
  découper le cycle éditorial lorsque cela améliore réellement l'exécution.
- [ ] Vérifier les titres, propriétaires, récurrences, supports associés et
  affichage mobile avant validation.

D-027 — Auditer les 115 systèmes sans réécriture aveugle :

- [ ] Construire une matrice de couverture par famille et par pilier sur les
  37 familles, 526 processus et 8 510 étapes.
- [ ] Contrôler d'abord un métier représentatif de chaque famille, puis les
  exceptions métier réellement spécialisées.
- [ ] Détecter les incohérences de persona, les titres trop génériques, les
  doublons sémantiques, les trous de couverture et les étapes non actionnables.
- [ ] Vérifier en particulier que le nom public du système correspond aux rôles,
  clients, revenus, obligations et outils décrits dans ses étapes.
- [ ] Produire une liste de corrections justifiées et priorisées avant de
  modifier les registres ou les feuilles sources.

Critère de fin : chaque système annonce clairement sa cible et présente des
processus actionnables, non redondants et suffisamment spécialisés, sans
uniformiser artificiellement les 115 métiers.

### P1 — Finaliser le prototype vidéo Académie (D-023)

- [x] Isoler le prototype du site dans `studio/academy-video-prototype/`.
- [x] Figer un script de neuf séquences sur la différence entre rentabilité et
  trésorerie.
- [x] Construire le moteur Remotion et vérifier les neuf écrans.
- [x] Produire un rendu muet 1080p de 4 min 05 et une miniature.
- [x] Préparer la génération ElevenLabs et le recalage automatique sur les
  horodatages.
- [x] Configurer la clé ElevenLabs uniquement dans le fichier local ignoré.
- [x] Générer l'audio, les sous-titres et deux MP4 synchronisés :
  - `cours-gestion-tresorerie-final.mp4` — 3 min 18,2 s ;
  - `cours-chiffre-affaires-benefice-final.mp4` — 3 min 31,7 s.
- [ ] Faire valider humainement compréhension, rythme, voix et exactitude des
  chiffres sur les deux masters avant toute industrialisation.
- [ ] Après validation, uploader les masters sur YouTube via le compte de
  l'utilisateur ou une session Chrome déjà connectée, sans partager
  d'identifiants, puis reporter les deux URL dans D-019.
- [ ] Vérifier la licence Remotion, les droits commerciaux de la voix et
  l'information sur la voix synthétique avant publication.
- [ ] Utiliser ensuite les deux vidéos comme pilotes éditoriaux de D-019 et du
  gabarit SEO D-031, sans intégrer le studio au site.

Le prototype n'est pas un déploiement de l'Académie. Le fichier `.env.example`
est actuellement couvert par le motif racine `.env*` et devra être traité
explicitement si le studio est un jour versionné, sans jamais ajouter
`.env.local`, l'audio, `node_modules/` ou les rendus intermédiaires.

### P0 — Sécuriser le stockage du studio (D-029)

- [ ] Conserver impérativement les deux masters, les sources et les fichiers
  nécessaires à leur reproduction.
- [ ] Après validation des masters, inventorier les anciens rendus verticaux,
  les segments, les images de contrôle et les caches régénérables.
- [ ] Supprimer uniquement les sorties obsolètes explicitement approuvées ;
  aucune suppression automatique ou globale.
- [ ] Recontrôler l'espace disque avant tout nouveau rendu lourd. L'audit du
  27 juillet 2026 ne trouvait qu'environ 1,6 Gio disponibles.

### P1 — Publier la référence visuelle Académie (D-030)

- [ ] Uploader sur Drive la maquette canonique
  `academy-version-vert-light.jpg` et son `README.md`.
- [ ] Ajouter le lien partageable à D-017.
- [ ] Marquer les versions verticales et marron comme archives non canoniques.

### P1 — Industrialiser le SEO des fiches vidéo (D-031)

- [ ] Figer un gabarit d'acceptation sur les deux premières vidéos.
- [ ] Vérifier pour chaque `/academie/[slug]` : intention distincte, URL,
  title, meta-description, H1, canonical, vidéo visible immédiatement,
  miniature indexable, dates, contenu original, FAQ et liens internes.
- [ ] Valider `VideoObject`, `Article` et `BreadcrumbList` lorsqu'ils sont
  pertinents.
- [ ] Générer et auditer le sitemap standard et le sitemap vidéo.
- [ ] Contrôler l'absence de contenu dupliqué, de script brut et de longue
  transcription.

### P1 — Ajouter l'onglet Écosystème

- [ ] Ajouter l'onglet stable `ecosysteme` après Process et Outils.
- [ ] Construire un agrégateur serveur à partir des annuaires existants :
  aides, financements, fournisseurs, formations, recrutement, réseaux,
  assurances et cabinets.
- [ ] Classer les recommandations par confiance :
  sélection métier, puis secteur, puis générique seulement si elle est solide.
- [ ] Réutiliser les piliers métier comme ossature, avec des titres visibles
  orientés action.
- [ ] Afficher de une à trois cartes directes par besoin.
- [ ] Ne pas utiliser les mots `partenaire` ou `service Demaa` sans relation
  réelle.
- [ ] Ne pas dupliquer dans Écosystème les logiciels déjà affichés dans Outils.
- [ ] Ajouter les avertissements nécessaires pour aides et financements.
- [ ] Tester d'abord Plomberie/Bâtiment, Restaurant, Agence marketing et une
  activité réglementée.
- [ ] Valider la curation et le mobile avant généralisation aux 115 métiers.

Critère de fin : l'utilisateur atteint directement la ressource externe, sans
formulaire, transmission de coordonnées ou promesse de mise en relation.

### P1 — Nettoyer les routes

- [ ] Rediriger `/kits-operationnels` vers `/` après audit SEO et analytics.
- [ ] Conserver pour l'instant les anciennes routes individuelles
  `/systemes/[slug]`.
- [ ] Relire la landing `/structuration` restaurée localement et décider si elle
  doit rester un prototype, être réécrite ou être abandonnée.
- [ ] Si elle est conservée, aligner son offre, son tarif, ses CTA, ses
  métadonnées, son sitemap et ses liens avec le nouveau modèle gratuit.
- [ ] Refaire les contrôles puis seulement décider d'un commit et d'un
  déploiement.

Décision recommandée pour `/structuration` : ne pas publier telle quelle la
version locale à 1 500 €, car elle promet un accompagnement humain devenu
incohérent. La conserver localement comme base visuelle est sans risque ; toute
publication demande d'abord une décision produit et une réécriture.

### P2 — Reprendre l'acquisition après la mise en production

Google Ads :

- [ ] Vérifier le résultat du nouvel examen des deux annonces modifiées.
- [ ] Garder la campagne en pause tant que les annonces ne sont pas approuvées.
- [ ] Ne pas recréer de compte, domaine ou campagne pour contourner le refus.
- [ ] Si le refus `Site infecté / Contournement des systèmes` persiste,
  contacter l'assistance avec les preuves Search Console, Safe Browsing,
  accessibilité robot et absence de redirection trompeuse.
- [ ] Faire pointer la conversion sur la livraison réussie de la copie gratuite.

Meta Ads :

- [ ] Terminer la vérification Meta par clé d'accès.
- [ ] Finaliser le portefeuille, le compte publicitaire Demaa et le dataset
  existant sans déplacer les actifs.
- [ ] Configurer la conversion de livraison réussie.
- [ ] Préparer créations, audiences, budget et garde-fous.
- [ ] Ne lancer la première campagne qu'après validation du parcours gratuit en
  production.

### P0 à P3 — Acquisition Cabinets comptables vers Tiimora (D-049 à D-060)

Statut : **backlog et coordination uniquement**. Aucun lot ci-dessous n'est
autorisé en implémentation, campagne, envoi, staging ou Production sans GO
distinct. Le funnel ne doit pas dépendre d'un fichier ou d'une liste non
finalisée.

#### Contrat stratégique

- Demaa est le média et le moteur d'acquisition destiné aux TPE et à leurs
  écosystèmes métier.
- Les systèmes opérationnels gratuits sont le produit d'entrée.
- Demaa peut distribuer des outils tiers et des outils édités par ODEMA.
  Tiimora est l'outil maison destiné aux cabinets comptables.
- Funnel cible :
  `email B2B personnalisé depuis team@demaa.fr`
  → `système Cabinet comptable sur Demaa`
  → `démonstration ou demande de copie`
  → `exposition contextuelle et transparente à Tiimora`
  → `retargeting Tiimora des seuls visiteurs consentants et pertinents`
  → `conversion mesurée sur Tiimora`.
- Demaa capte les intentions informationnelles liées aux problèmes et aux
  processus. Tiimora capte les intentions commerciales liées au logiciel.
  Aucun contenu ne doit être dupliqué entre les deux domaines.
- L'annuaire des experts-comptables sert les dirigeants qui cherchent un
  cabinet et l'acquisition EM2A. Ce trafic ne rejoint jamais par défaut les
  audiences Tiimora.

#### Architecture d'audience à préserver

- **Tiède** : visite consentie de la page du système `cabinet-comptable`.
- **Intéressée** : consultation de la démonstration, ouverture du formulaire ou
  demande de copie.
- **Chaude** : ouverture de l'onglet Outils, visite de la fiche Tiimora ou clic
  sortant vers Tiimora.
- **Exclusions** : visiteurs provenant uniquement de
  `/annuaire-experts-comptables/**`, clients et inscrits Tiimora, refus
  publicitaire et conversions déjà accomplies.
- Fenêtres indicatives à confirmer avant activation :
  chaude 7 à 30 jours, intéressée 30 à 60 jours, tiède 30 à 90 jours.
- Les emails froids n'utilisent aucun pixel d'ouverture. Les URL utilisent des
  UTM de cohorte et de contenu, jamais un identifiant personnel.

#### Lots, priorités et dépendances

| ID | Priorité | Lot | Dépend de | État |
|---|---|---|---|---|
| D-049 | P0 | Figer le contrat de mesure et les frontières Demaa/Tiimora/EM2A | — | Backlog |
| D-050 | P0 | Instrumenter les sorties vers les outils sur Demaa | D-049 | En cours |
| D-051 | P0 | Créer la destination Tiimora et la mesure cross-domain consentie | D-049 | Backlog |
| D-052 | P0 | Ajouter les passerelles Tiimora et la transparence commerciale | D-049, D-050, D-051 | Backlog |
| D-053 | P0 | Ajouter l'opt-in marketing facultatif et la recette consentement | D-049 | Backlog |
| D-054 | P1 | Corriger et normaliser l'annuaire Cabinets comptables | D-049 | Backlog |
| D-055 | P1 | Enrichir et vérifier les huit cabinets du pilote | D-054 | Backlog |
| D-056 | P1 | Préparer le pilote outbound de huit cabinets | D-050 à D-055 | Backlog |
| D-057 | P2 | Créer le cluster SEO informationnel Demaa | D-049 | Backlog |
| D-058 | P2 | Créer les pages SEO commerciales Tiimora | D-049, D-051 | Backlog |
| D-059 | P3 | Construire le reporting, les exclusions et la gouvernance | D-050, D-051, D-053 | Backlog |
| D-060 | P3 | Recetter le funnel complet et décider de son ouverture | D-050 à D-059 | Backlog |

#### D-049 — Contrat de mesure et séparation des acquisitions

- [ ] Documenter la nomenclature commune des événements, UTM, sources,
  campagnes, contenus, conversions et fenêtres d'audience.
- [ ] Séparer explicitement l'acquisition Tiimora via le système
  `cabinet-comptable` de l'acquisition EM2A via
  `/annuaire-experts-comptables/**`.
- [ ] Interdire la PII dans GA4, Meta, les UTM et les propriétés d'événements.
- [ ] Définir les propriétaires des métriques, les durées de conservation, les
  exclusions, la recette et le rollback.

Critère d'acceptation : une spécification unique permet à Demaa et Tiimora
d'utiliser les mêmes noms sans mélanger les audiences ni les finalités.

#### D-050 — Instrumentation Demaa des sorties vers les outils

- [x] Ajouter l'événement consenti `tool_outbound_clicked` sur toutes les
  sorties d'outils canoniques.
- [ ] Ajouter, seulement si leur usage produit est confirmé, les événements
  `system_tools_tab_opened` et `tool_detail_viewed` ; ne pas créer de métrique
  uniquement pour remplir un tableau de bord.
- [x] Limiter les propriétés du clic sortant à des valeurs non personnelles et
  bornées : `system_slug`, `tool_slug`, surface et campagne.
- [x] Conserver les événements existants `kit_open`,
  `system_copy_form_opened`, `system_copy_form_submitted` et `generate_lead`.
- [x] Identifier un outil, dont Tiimora lorsqu'il devient éligible, sans
  transmettre de prénom, email, requête libre,
  URL privée ou identifiant individuel.
- [x] Tester le refus et l'acceptation du consentement sur l'événement sortant ;
  la recette globale du retrait reste mutualisée avec le contrat D-049.

Critère d'acceptation : les URL attribuent agrégément Demaa sans donnée
personnelle ; l'événement interne du parcours
`système ou Action → Outils → fiche → clic sortant` n'est émis que lorsque le
consentement Analytics l'autorise.

#### D-051 — Destination et mesure Tiimora

- [x] Réutiliser les UTM contrôlés du constructeur transverse pour tout futur
  lien Demaa vers Tiimora, sans dupliquer les URL dans le catalogue.
- [ ] Concevoir une page publique Tiimora adaptée à la conversion des cabinets,
  au lieu d'envoyer automatiquement vers une entrée d'application.
- [ ] Installer sur Tiimora une CMP et Consent Mode compatibles avec le contrat
  D-049.
- [ ] Configurer GA4 cross-domain Demaa/Tiimora et, seulement après validation
  juridique et technique, le dataset ou pixel publicitaire commun nécessaire.
- [ ] Définir les conversions Tiimora : visite de la landing, demande de
  démonstration ou d'essai, début d'inscription et inscription terminée.
- [ ] Exclure les convertis des audiences publicitaires.

Critère d'acceptation : une session consentie peut être attribuée de Demaa à une
conversion Tiimora sans exposer de PII ni déclencher de marketing avant
consentement.

#### D-052 — Passerelles contextuelles et transparence

- [ ] Ajouter dans le succès de demande de copie une passerelle secondaire et
  non agressive :
  `Mettre en œuvre la gestion des demandes, documents et validations avec Tiimora`.
- [ ] Préserver le succès transactionnel, la fermeture de la modale et
  l'absence de lien Drive dans l'interface.
- [ ] Appliquer sur les fiches d'outils un libellé exact selon la relation :
  `Outil édité par l'équipe Demaa/ODEMA`, `Partenaire rémunéré` ou
  `Sélection éditoriale sans rémunération`.
- [ ] Ne jamais présenter Tiimora comme une recommandation indépendante si
  l'outil appartient à la même équipe.

Critère d'acceptation : Tiimora est proposé au bon moment, sans détourner la
livraison gratuite et avec une relation commerciale parfaitement lisible.

#### D-053 — Opt-in marketing et conformité du consentement

- [ ] Ajouter au formulaire de copie une case marketing facultative, séparée,
  non précochée et jamais nécessaire à la livraison.
- [ ] Transmettre `marketingConsent` au contrat API existant et conserver la
  preuve, la date, la source et le retrait.
- [ ] Ne synchroniser vers Resend que les personnes ayant explicitement accepté.
- [ ] Rendre le refus aussi simple que l'acceptation et le retrait effectif.
- [ ] Vérifier qu'aucun traceur publicitaire ne part avant consentement et
  qu'aucune PII n'entre dans GA4 ou Meta.

Critère d'acceptation : copie transactionnelle, mesure d'audience et prospection
marketing restent trois finalités distinctes et vérifiables.

#### D-054 — Fiabilisation de l'annuaire Cabinets comptables

- [ ] Normaliser la région, la ville, la taille, les outils et les sources.
- [ ] Corriger les variantes `Île-de-France`, `Ile-de-France` et les villes
  franciliennes sans région.
- [ ] Auditer le fallback qui force actuellement `isOecVerified: true` pour
  tous les cabinets ; ne plus afficher `Vérifié OEC` sans preuve réelle.
- [ ] Conserver pour chaque preuve sa source et sa date de vérification.
- [ ] Ne pas utiliser les données corrigées pour modifier les audiences EM2A
  ou Tiimora avant validation de D-049.

Critère d'acceptation : aucun cabinet n'est présenté comme vérifié, équipé ou
éligible au pilote sans source consultable.

#### D-055 — Enrichissement du pilote de huit cabinets

- [ ] Vérifier individuellement : GHM Consulting, A2P Expertise et Audit, 2PN,
  Altyma Experts, Team Up, Philix, LFE2C et Vizaa.
- [ ] Rechercher sans inventer : site, fiche Google Maps, présence et avis,
  preuve d'effectif inférieur à 10, email professionnel, nom et rôle du
  contact, preuve Pennylane, source et date.
- [ ] Distinguer donnée confirmée, donnée contradictoire et donnée absente.
- [ ] Retirer du pilote tout candidat ne respectant pas les critères prouvés.

Critère d'acceptation : les huit lignes sont sourcées ou explicitement marquées
incomplètes ; aucune déduction commerciale n'est présentée comme un fait.

#### D-056 — Pilote outbound Cabinets comptables

- [ ] Préparer trois variantes d'email personnalisées :
  relances et pièces, ouverture/onboarding de dossier, validations et
  traçabilité.
- [ ] Utiliser comme CTA principal la consultation gratuite du système Cabinet
  comptable. Ne pas vendre Tiimora dans le premier email.
- [ ] Envoyer depuis `team@demaa.fr` avec identité Demaa, origine des
  coordonnées, opposition ou désinscription simple, liste repoussoir et
  fréquence maîtrisée.
- [ ] Utiliser des URL de cohorte, par exemple
  `utm_source=outbound&utm_medium=email&utm_campaign=cabinets_idf_moins10&utm_content=relances_pieces`.
- [ ] N'ajouter ni pixel d'ouverture ni token individuel.
- [ ] Figer avant envoi les critères du pilote : délivrabilité, réponses,
  clics agrégés, démonstrations, demandes de copie, visites Tiimora consenties
  et conversions.
- [ ] Ne lancer aucune extension avant l'analyse des huit premiers cabinets.

Critère d'acceptation : le pilote est légalement et techniquement prêt, mais
reste non envoyé jusqu'à un GO campagne distinct.

#### D-057 — Cluster SEO informationnel Demaa

- [ ] Utiliser la page `cabinet-comptable` comme pilier et créer des contenus
  originaux sur :
  relance des pièces clients, onboarding ou ouverture d'un dossier, suivi des
  échéances fiscales, traçabilité des validations client, pilotage de la charge
  collaborateurs et rentabilité des dossiers.
- [ ] Réutiliser les processus réels du système, notamment :
  `Ouvrir et tenir un dossier client`,
  `Gérer les échéances et relances`,
  `Tracer les validations et décisions`,
  `Piloter la charge lors d'un point mensuel` et
  `Suivre la rentabilité des dossiers`.
- [ ] Résoudre d'abord le problème, lier ensuite le système et sa copie
  gratuite, puis présenter Tiimora seulement lorsqu'il matérialise réellement
  le processus.
- [ ] Ajouter liens internes, données structurées pertinentes, canonical,
  sitemap, FAQ utile et CTA cohérents.
- [ ] Ne jamais transformer le trafic TPE de l'annuaire de cabinets en audience
  Tiimora par défaut.

Critère d'acceptation : chaque page répond à une intention informationnelle
distincte et ne duplique aucune page commerciale Tiimora.

#### D-058 — Pages SEO commerciales Tiimora

- [ ] Prévoir des pages publiques distinctes pour :
  logiciel de suivi client pour cabinet comptable, portail client
  expert-comptable, collecte de documents ou pièces comptables, suivi des
  demandes clients, onboarding client, traçabilité, signature et validation
  des dossiers.
- [ ] Ajouter captures produit, bénéfices vérifiables, preuve, démonstration ou
  essai, CTA et métadonnées commerciales.
- [ ] Réserver à Tiimora l'intention logiciel et achat ; ne pas recopier les
  explications de processus publiées par Demaa.

Critère d'acceptation : les pages Tiimora convertissent une intention
transactionnelle tout en restant éditorialement distinctes du cluster Demaa.

#### D-059 — Reporting et gouvernance

- [ ] Construire un dashboard par source, campagne, contenu et fenêtres
  7/30/90 jours.
- [ ] Afficher l'entonnoir :
  landing système → démonstration → formulaire ouvert → copie demandée
  → fiche Tiimora → clic Tiimora → conversion Tiimora.
- [ ] Documenter les exclusions, la rétention, le consentement, les responsables
  des données, les contrôles périodiques et le rollback.
- [ ] Prévoir l'audit périodique des preuves d'outils, d'effectifs et de
  vérification OEC.

Critère d'acceptation : chaque indicateur possède une définition, une source, un
responsable et une action associée, sans fusionner les tunnels EM2A et Tiimora.

#### D-060 — Recette de bout en bout et ouverture

- [ ] Tester le parcours complet en staging avec consentement accepté, refusé
  puis retiré.
- [ ] Vérifier les événements, UTM, exclusions, conversions, absence de PII,
  absence de traceur avant consentement et séparation EM2A/Tiimora.
- [ ] Tester le rollback et l'absence de régression du formulaire de copie,
  de l'email transactionnel et de l'annuaire.
- [ ] Soumettre séparément les décisions de lancement outbound, retargeting et
  Production ; aucun GO ne vaut automatiquement pour les trois.

Critère global de sortie : un prospect peut partir d'un email Demaa, arriver
sur le système Cabinet comptable, consulter la démonstration ou demander la
copie, découvrir Tiimora de façon transparente, être retargeté seulement s'il
a consenti et appartient à la bonne audience, puis convertir sur Tiimora avec
une attribution cross-domain vérifiable. Le trafic TPE de l'annuaire reste
séparé pour EM2A.

#### Chevauchements et ownership à résoudre avant implémentation

- D-050 et D-053 prolongent les contrats analytics, attribution, consentement
  et livraison déjà utilisés par le parcours de copie. Ils doivent préserver
  les invariants de D-005/D-007 et les tests D-009.
- D-052 touche la modale unique et son succès livrés par D-044 ; son
  propriétaire devra repartir du candidat Systèmes/Académie canonique, jamais
  d'une ancienne branche.
- D-050 et D-052 touchent l'onglet Outils et les modales partagées avec
  D-012 Écosystème. Aucun CTA ne doit être ajouté directement aux cartes
  carrées de l'Écosystème.
- D-054/D-055 chevauchent l'annuaire Experts-comptables et ses données
  fallback. Ils ne doivent modifier ni le positionnement EM2A ni les audiences
  sans l'arbitrage D-049.
- D-057 doit coordonner le maillage de la page système avec les audits métiers
  D-026/D-027 et ne pas modifier aveuglément les 115 systèmes.
- D-058 appartient au projet Tiimora et nécessite un lot séparé dans son dépôt.
- D-059 doit réutiliser la nomenclature UTM et le modèle first/last touch
  existants au lieu de créer un second système d'attribution.
- D-060 est bloqué tant que D-050 à D-059 ne sont pas validés en staging. La
  Production reste interdite sans `GO PROD`.

### P0 à P2 — Évolution des systèmes et classeurs v2 (D-061 à D-067)

| ID | Priorité | Lot | Dépend de | État |
|---|---|---|---|---|
| D-061 | P0 | Piloter les classeurs v2 et les Routines essentielles sur cinq métiers | D-032, D-044, D-045, D-046 | En staging, assets v2 inactifs |
| D-062 | P2 | Intégrer la prestation marketing-vente dans Écosystème | D-012, D-044, D-061, D-064 | À faire ensuite |
| D-063 | P2 | Afficher la newsletter Structure uniquement sous Outils et Écosystème | D-061, D-064 | À faire ensuite |
| D-064 | P0 | Réserver un appel gratuit de 30 minutes uniquement sous Process | D-044, D-045, D-046, D-061 | À faire avant release |
| D-065 | P0 | Créer, valider et activer les paires Drive v2 des cinq pilotes | D-061 | Bloqué par validation |
| D-066 | P1 | Produire 4 à 6 supports clés réels par pilote | D-061 | Backlog |
| D-067 | P1 | Généraliser les classeurs v2 aux 115 systèmes | D-065, D-066 | Bloqué par recette pilotes |

#### D-061 — Pilotes classeurs v2 et Routines essentielles

- [x] Préparer un schéma, des profils, une factory, un compilateur et une CLI
  strictement limités à Bâtiment, Restaurant, Agence marketing, Pharmacie et
  Assistant administratif externalisé.
- [x] Conserver les 74 contenus sources de chaque pilote et les projeter en
  8 à 12 routines dirigeantes traçables vers leurs processus et étapes sources.
- [x] Reconstruire l'ordre v2 :
  `Synthèse → Prévisionnel financier → Actions → Équipe → Écosystème → Calendrier marketing → Process`.
- [x] Corriger les hypothèses financières génériques, supprimer tout faux
  historique `Réel` et garder les champs vides lorsque les entrées minimales
  manquent.
- [x] Versionner `workbookVersion` et `assetRevision` dans la livraison et
  préserver la révision historique pendant les doublons, retries et rollbacks.
- [x] Sceller le plan d'application avec l'identité du classeur, les
  métadonnées, le préflight frais et les empreintes du batch.
- [x] Déployer et recetter le code en Preview sur le SHA
  `dfa036ade6e1c95b0157665a7ed2dc6d0e9df851`.
- [ ] Créer ou modifier les classeurs Google Drive v2.
- [ ] Activer une révision v2 publique ou privée.
- [ ] Généraliser le changement au-delà des cinq pilotes.

Critère d'acceptation de cette phase : le code staging est reproductible,
retry-safe et compatible avec un rollback ; les cinq révisions v2 restent
inactives tant que D-065 n'est pas validé.

#### D-062 — Prestation marketing-vente dans Écosystème

- [ ] Arbitrer le libellé exact entre construction et automatisation du système
  marketing-vente.
- [ ] Ajouter une carte carrée sans CTA direct dans Écosystème et réutiliser la
  modale de service existante.
- [ ] Réutiliser la landing `/systeme-marketing` sans dupliquer sa logique.
- [ ] Ne pas inventer de prix et rendre la relation Demaa/ODEMA transparente.
- [ ] Vérifier qu'aucun bloc ne duplique l'appel gratuit D-064.
- [ ] Recetter desktop, mobile, clavier, fermeture, attribution et analytics
  sans PII.

Critère d'acceptation : la prestation est découvrable depuis Écosystème dans le
format des autres cartes, sans concurrencer Process ni créer une seconde
source de vérité commerciale.

#### D-063 — Newsletter Structure

- [x] Remplacer l'ancien bloc « La lettre Demaa » par un composant partagé
  `StructureNewsletterBlock` utilisant `/api/newsletter-subscribe`.
- [x] Réutiliser exactement le même encart en bas de Ressources, de la page
  principale Académie et de l'offre publique `/sur-mesure`, sans l'ajouter aux
  cours ou leçons. La route historique `/structuration` reste retirée du public.
- [x] Conserver une inscription directe e-mail + `S'abonner`, sans modale, et
  un lien secondaire `Proposer ma problématique`.
- [x] Enregistrer les propositions écrites dans Firebase avec un consentement
  versionné et envoyer une notification interne Slack.
- [x] Préciser que l'équipe contacte l'entreprise avant publication et que
  toutes les propositions ne seront pas traitées.
- [ ] Activer le vocal uniquement après mise en place d'un stockage privé,
  d'une transcription et d'une suppression automatique sous 30 jours.

Critère d'acceptation : une seule newsletter propriétaire Demaa, un composant
identique aux trois emplacements validés, aucune répétition dans les cours, et
aucun enregistrement vocal tant que son cycle de vie sécurisé n'est pas prêt.

#### D-064 — Appel gratuit sous Process

- [ ] Repositionner le bloc issu de D-046 uniquement à la fin de Process.
- [ ] Le retirer d'Outils et d'Écosystème.
- [ ] Réutiliser `SystemDiagnosticCta`,
  `OrganisationSessionBookingButton` et le Fillout canonique, sans nouvelle
  URL ni nouveau formulaire.
- [ ] Utiliser :
  - titre : `Un point de blocage dans votre organisation ?` ;
  - texte :
    `Parlez pendant 30 minutes avec un spécialiste pour identifier ce qui dépend encore trop de vous et définir la prochaine étape de structuration.` ;
  - CTA : `Réserver mon appel gratuit`.
- [ ] Vérifier l'occurrence unique, l'attribution, le responsive,
  l'accessibilité et l'absence de doublon avec D-062/D-063.

Critère d'acceptation : un seul appel gratuit est proposé dans Process ; aucun
CTA de diagnostic n'est rendu dans Outils ou Écosystème.

#### D-065 — Activation Drive v2 des cinq pilotes

- [ ] Créer de nouvelles paires démo/modifiable et leurs aperçus sans écraser
  les 115 fichiers v1.
- [ ] Relire et sceller le préflight Drive juste avant chaque application.
- [ ] Valider les cinq classeurs, leurs formules, les entrées éditables, les
  routines, les versions et les révisions.
- [ ] Enregistrer les révisions privées sans exposer d'identifiant ou d'URL
  dans Git, le navigateur ou les logs publics.
- [ ] Tester une demande, un doublon, un retry historique, une bascule v1 vers
  v2 et un rollback vers v1.

Critère d'acceptation : les cinq paires complètes sont activables et
restaurables atomiquement ; aucune demande historique ne change de révision.

#### D-066 — Supports clés des cinq pilotes

- [ ] Produire seulement 4 à 6 supports réels et utiles par pilote.
- [ ] Utiliser Google Docs pour les procédures principalement textuelles et
  Google Sheets pour les tableaux ou suivis récurrents.
- [ ] Mutualiser un support uniquement lorsque son objectif, ses champs et son
  usage sont réellement identiques.
- [ ] Définir propriétaire, format, fréquence de révision et source avant
  activation.
- [ ] Afficher `Dans le système` uniquement lorsque le support et sa révision
  sont enregistrés et validés.

Critère d'acceptation : chaque mention publique correspond à un asset réel,
maintenable et résoluble par la révision demandée.

#### D-067 — Généralisation aux 115 systèmes

- [ ] Analyser les résultats des cinq pilotes avant de modifier un autre
  métier.
- [ ] Généraliser par famille métier, avec contrôles financiers, éditoriaux,
  réglementaires et mobiles.
- [ ] Préserver les révisions v1 pendant toute la migration.
- [ ] Tester les 115 démonstrations, copies, aperçus, routes et livraisons.
- [ ] Prévoir un rollback par pointeur, jamais par écrasement de fichiers.

Critère d'acceptation : les 115 systèmes possèdent une révision v2 contrôlée,
sans perte de données, fausse promesse de support ou rupture des anciennes
demandes.

### P0 à P1 — Pertinence des recommandations d'outils (D-068 à D-070)

Constat de départ : les recommandations visibles dans l'onglet Outils reposent
sur plusieurs sources qui doivent être auditées ensemble :

- les `toolRefs` propres à chaque entrée de `enterprise-annuaire.json` ;
- l'ordre éditorial de `system-tool-recommendations.ts` ;
- les éventuels `recommendedToolSlugs` explicites ;
- le catalogue local et sa surcouche Firestore ;
- le repli actuel qui peut marquer automatiquement comme recommandés les trois
  premiers outils métier lorsqu'aucune sélection explicite n'est disponible.

L'inventaire technique constaté au 30 juillet 2026 comprend 115 systèmes,
334 fiches d'outils et 1 046 associations `toolRefs`. Ces volumes sont une
photographie d'audit, pas une cible à conserver artificiellement.

| ID | Priorité | Lot | Dépend de | Propriétaire futur | État |
|---|---|---|---|---|---|
| D-068 | P0 | Figer le contrat de preuve et produire la matrice complète outil × système × processus | D-012, D-061 | Référent catalogue Outils Demaa + relecteur métier indépendant | Backlog |
| D-069 | P0 | Auditer un pilote représentatif et arbitrer chaque recommandation | D-068 | Référent catalogue, experts métier ponctuels, QA éditoriale | Backlog |
| D-070 | P1 | Généraliser l'audit aux 115 systèmes et préparer une activation contrôlée | D-069 | Référent catalogue + QA données/produit | Bloqué par le pilote |

#### D-068 — Contrat de preuve et matrice de pertinence

- [ ] Produire un export en lecture seule des 115 systèmes, de leurs
  `toolRefs`, recommandations explicites et curées, outils exclus, rangs
  affichés et fiches du catalogue résolues.
- [ ] Construire une matrice versionnée
  `outil × système × processus/problème`, sans modifier le catalogue produit.
  Chaque ligne doit au minimum porter :
  `systemSlug`, `processId` ou besoin couvert, `toolSlug`, problème résolu,
  profil d'entreprise adapté, pays/langue, prix et accessibilité, rang proposé,
  justification contextuelle, sources et date de vérification.
- [ ] Distinguer explicitement la taille et la maturité visées : indépendant,
  TPE sans équipe structurée, TPE avec équipe, PME ou organisation déjà
  équipée. Une solution trop lourde, trop chère ou trop technique pour la cible
  ne doit pas être recommandée par défaut.
- [ ] Vérifier la disponibilité en France, la langue, les conditions d'accès,
  le modèle tarifaire, les coûts de mise en place et les dépendances nécessaires.
- [ ] Contrôler le statut de chaque fiche : sélection éditoriale indépendante,
  partenaire rémunéré, outil édité par Demaa/ODEMA, ou relation inconnue à
  clarifier. Une relation commerciale ne constitue jamais une preuve de
  pertinence.
- [ ] Exiger au moins une source officielle datée pour la fonction et le prix,
  puis, lorsque le risque le justifie, une source officielle sur la sécurité,
  le traitement des données, le RGPD, la localisation ou les sous-traitants.
- [ ] Tester l'URL, les redirections et la disponibilité réelle ; signaler les
  produits arrêtés, renommés, fusionnés, obsolètes ou non accessibles au marché
  français.
- [ ] Rechercher les doublons fonctionnels et éditoriaux, les variantes du même
  produit et les outils répétés sans justification entre processus.
- [ ] Auditer le wording public : promesse factuelle, problème réellement
  résolu, limites, prérequis et absence de superlatif ou de bénéfice inventé.
- [ ] Formaliser la règle bloquante :
  `aucune recommandation sans preuve métier, produit et source datée`.
  Une ligne insuffisamment prouvée reste `à vérifier` ou `non recommandable` ;
  elle ne doit jamais être complétée par défaut pour atteindre un quota.
- [ ] Définir cinq verdicts contrôlés :
  `recommander`, `alternative`, `conserver sans mise en avant`, `à vérifier`,
  `retirer`, avec auteur, date, justification et prochaine revue.

Critère d'acceptation : la matrice permet de retracer chaque recommandation
affichable jusqu'à un métier, un processus ou problème concret, une cible
d'entreprise et des preuves datées. Aucun changement de `toolRef`, Firestore,
UI, staging ou Production n'est inclus dans D-068.

#### D-069 — Pilote représentatif

- [ ] Sélectionner 10 à 12 systèmes couvrant au minimum : métier réglementé,
  artisanat/terrain, commerce, restauration, e-commerce, activité de conseil,
  service externalisé, association et entreprise utilisant un logiciel métier
  central.
- [ ] Inclure obligatoirement `cabinet-comptable` afin de contrôler Tiimora,
  Pennylane et Silae, leur ordre, leur complémentarité, leur transparence
  commerciale et leur adéquation aux processus réels.
- [ ] Pour chaque pilote, partir des processus et problèmes prioritaires avant
  de regarder les outils déjà présents, afin d'éviter de justifier a posteriori
  une sélection historique.
- [ ] Comparer les outils selon la cible et non selon leur notoriété : effort
  d'installation, compétences requises, coût total, intégrations, réversibilité,
  support, sécurité et capacité à résoudre le problème sans suréquiper la TPE.
- [ ] Soumettre les résultats à une relecture contradictoire : un propriétaire
  catalogue et un relecteur métier ne partageant pas la sélection initiale.
- [ ] Produire pour chaque système une fiche de décision avec : outils retenus,
  alternatives, retraits proposés, ordre recommandé et justification courte
  qui pourra être comprise par un dirigeant pressé.
- [ ] Mesurer le taux de recommandations conservées, déclassées, remplacées,
  non prouvées ou retirées, puis corriger le contrat D-068 avant généralisation.
- [ ] Recetter un export ou prototype hors production ; l'onglet Outils public
  reste strictement inchangé pendant le pilote.

Préparation disponible : le dossier
[`docs/research/action-plan-tool-recommendations/`](research/action-plan-tool-recommendations/)
formalise déjà le cas `cabinet-comptable`, onze capacités et dix scénarios.
Son statut reste `préparation uniquement` : les trois outils conservent le
verdict d'activation `à vérifier` jusqu'à la relecture contradictoire et à la
fermeture des blocages commerciaux, sécurité et runtime listés dans le dossier.

Critère d'acceptation : 100 % des recommandations du pilote possèdent un verdict
contradictoire et une preuve suffisante ; aucune recommandation n'est ajoutée
pour remplir artificiellement une liste de trois.

#### D-070 — Généralisation aux 115 systèmes

- [ ] Généraliser par familles métier, jamais par remplacement global aveugle.
- [ ] Auditer les 115 systèmes et toutes leurs associations d'outils dans la
  matrice D-068, avec reprise manuelle des cas ambigus ou réglementés.
- [ ] Vérifier l'ordre final dans son contexte : l'outil le plus pertinent pour
  le processus prioritaire vient avant une alternative plus générale ou plus
  complexe.
- [ ] Transformer le repli automatique actuel en règle contrôlée : aucune mise
  en avant implicite des trois premiers outils métier sans verdict validé.
- [ ] Produire des tests de données empêchant une recommandation sans preuve,
  une URL invalide, un outil caché/déprécié, une source trop ancienne selon la
  fréquence définie, un doublon ou une relation commerciale non déclarée.
- [ ] Prévoir un cycle de révision : propriétaire, date de dernière revue,
  fréquence, déclencheurs exceptionnels (arrêt produit, incident sécurité,
  changement tarifaire majeur, retrait du marché français).
- [ ] Préparer un lot d'activation séparé, réversible et recetté sur Preview.
  Aucun résultat de l'audit ne modifie automatiquement `toolRefs`, Firestore ou
  l'ordre public.
- [ ] Vérifier les 115 pages en desktop, mobile et clavier après une éventuelle
  activation, puis demander un `GO PROD` distinct.

Critère d'acceptation : chaque recommandation des 115 systèmes est justifiée
dans la matrice, à jour, adaptée à la cible et reliée à un problème réel. Les
outils non prouvés ne sont pas recommandés et l'activation reste indépendante
de l'audit.

#### Chevauchements et frontières D-068 à D-070

- **D-012 / Écosystème** : cet audit porte uniquement sur l'onglet Outils. Il
  ne modifie ni les groupes, ni les cartes, ni les modales de l'ancien
  Écosystème. La migration future vers Services reste un chantier séparé.
- **Services** : une prestation réalisée par Demaa n'est pas un outil tiers.
  Les accompagnements du catalogue canonique ne doivent pas entrer dans la
  matrice Outils ; toute relation ou intégration technique peut être citée
  comme prérequis, jamais comme recommandation commerciale automatique.
- **Tiimora / D-049 à D-060** : Tiimora est audité avec le même niveau de
  preuve que les autres outils. Son statut ODEMA/Demaa doit être transparent.
  D-068 à D-070 n'activent ni instrumentation, retargeting, passerelle,
  cross-domain, landing Tiimora ou campagne.
- **D-061** : les processus et routines peuvent servir à contextualiser le
  problème résolu, mais l'audit n'active aucun classeur v2 et ne modifie aucune
  révision Drive.
- **Onglet Outils actuel** : il est gelé pendant D-068 et D-069. Toute
  modification de données ou d'ordre public fait l'objet d'un lot d'activation
  séparé après validation de D-070.

### P3 — Value stack Services différée (D-071)

| ID | Priorité | Lot | Dépend de | Propriétaire futur | État |
|---|---|---|---|---|---|
| D-071 | P3 | Cadrer puis tester une présentation en value stack des sept Services | Capacité réelle, coûts et marges, périmètres, identité contractuelle, juridique et parcours Services validés | Responsable offres Services + finance + juridique + propriétaire UX | Backlog différé |

#### D-071 — Value stack Services

Direction conservée pour une reprise ultérieure, sans validation commerciale
définitive :

- offre pilote : `Site vitrine` à `1 350 € HT` ;
- résultat envisagé : conception personnalisée d'un site vitrine comprenant
  jusqu'à cinq pages ;
- bonus envisagés, uniquement s'ils peuvent être réellement produits :
  - 100 cartes de visite ;
  - signatures d'e-mail pour l'équipe ;
  - optimisation de la page LinkedIn de l'entreprise ;
  - optimisation d'un profil LinkedIn personnel.

Cette valeur, ce prix et ces bonus sont des hypothèses de cadrage. Ils ne
modifient pas le `Site vitrine essentiel` à `950 € HT` ni aucune carte, modale
ou matrice de la maquette Services canonique actuelle.

- [ ] Vérifier le besoin réel auquel répond chaque bonus. Ne conserver que des
  éléments directement utiles à la mise en ligne, à la crédibilité ou à la
  prise de contact ; ne pas empiler des cadeaux décoratifs pour augmenter
  artificiellement la valeur perçue.
- [ ] Définir précisément les cinq pages possibles, le niveau de conception
  personnalisée, les contenus fournis par le client, les révisions, les
  intégrations, l'hébergement, la maintenance, les délais et les exclusions.
- [ ] Définir pour les cartes de visite la conception, l'impression, la
  livraison, le pays couvert, les délais, les frais et le nombre de versions.
- [ ] Définir le nombre de signatures d'e-mail incluses, les logiciels
  compatibles et la responsabilité d'installation.
- [ ] Définir ce que signifie `optimisation LinkedIn`, les accès nécessaires,
  les livrables, les limites et l'absence de promesse de portée ou de résultat
  commercial.
- [ ] Calculer le coût réel de production, la capacité mensuelle, le temps de
  coordination, les achats externes, la marge minimale et la fiscalité avant de
  confirmer `1 350 € HT`.
- [ ] Valider l'identité contractuelle et commerciale de l'opérateur, les
  conditions de vente, la propriété intellectuelle, les droits sur les
  contenus et images, la protection des accès clients et les responsabilités.
- [ ] Étendre ensuite la même méthode aux six autres Services : pour chacun,
  définir des bonus directement utiles, un prix ou une fourchette indicative à
  revalider, les coûts, la marge, la capacité et les exclusions. Aucun bonus
  générique ne doit être recopié d'une offre à l'autre sans lien avec le
  résultat attendu.
- [ ] Utiliser, si la direction est reprise, une structure courte adaptée aux
  dirigeants pressés :
  `résultat attendu → ce qui est inclus → prix ou fourchette → CTA unique`.
- [ ] Comparer cette proposition à l'offre canonique actuelle avant tout
  changement : compréhension, crédibilité, charge de production, marge et
  capacité à tenir la promesse.
- [ ] Soumettre un nouveau plan et une nouvelle maquette à validation
  explicite. L'implémentation, le paiement et la Production nécessitent des GO
  séparés.

Critères de reprise :

1. un propriétaire de production et une capacité mensuelle sont confirmés pour
   le site et chacun des bonus ;
2. le coût complet, la marge cible et le prix sont vérifiés ;
3. les inclusions, exclusions, délais, révisions et responsabilités sont
   contractualisables ;
4. les contraintes juridiques, RGPD, propriété intellectuelle, accès LinkedIn,
   impression et livraison sont validées ;
5. la value stack reste plus simple à comprendre que l'offre canonique et ne
   crée aucune promesse que Demaa ne peut tenir ;
6. une validation utilisatrice explicite autorise seulement ensuite la mise à
   jour de la maquette.

Critère d'acceptation : une matrice validée couvre les sept Services avec un
résultat concret, des inclusions et bonus utiles, un prix ou une fourchette
économiquement soutenable, les limites et un CTA unique. Tant que ces éléments
ne sont pas confirmés, D-071 reste documenté sans effet sur le produit.

#### Correction de la release D-037 et historique D-046

- D-046 reste `Terminé en staging` comme historique de l'implémentation du
  diagnostic. Son placement sous les trois onglets est explicitement
  supersédé par D-064 avant Production.
- D-037 reste P0 et `À faire ensuite`. Il dépend désormais de
  D-009, D-032, D-034, D-036, D-061 et D-064.
- Le prochain candidat release part du SHA D-061, intègre D-064 et reçoit une
  nouvelle Preview canonique. D-062 et D-063 ne bloquent pas cette release.
- Avant Production, décider explicitement si le site part avec les assets Drive
  v1 actifs ou attend D-065. Ne jamais présenter les cinq classeurs v2 comme
  publiés tant qu'ils restent inactifs.
- Toute Production exige toujours un `GO PROD` distinct, le registre privé
  Production et un smoke test avec rollback disponible.

### P2 — Finaliser le contenu Trésorerie

- [x] Figer le script et le storyboard des 16 séquences.
- [x] Fournir au lot Illustrations le fil rouge, les chiffres de référence et
  l'intention visuelle de chaque séquence.
- [ ] Valider les trois pilotes déjà présents dans
  `creative/course-1-first-three`.
- [ ] Après validation explicite, produire les 13 illustrations restantes
  uniquement dans `creative/`.
- [ ] Contrôler la cohérence de la série complète avec le storyboard avant
  toute intégration dans les cours.

### P2 — Rationaliser les assets créatifs avant Git (D-025)

- [ ] Choisir la variante canonique entre `pilot`, `pilot-v2`, `pilot-v3`,
  `course-1-first-three` et `course-1-emotion-pilot`.
- [ ] Décider quels sources, PNG, SVG, planches, ZIP et rapports doivent être
  conservés ou versionnés.
- [ ] Ne rien supprimer automatiquement : les variantes appartiennent au
  travail créatif utilisateur.
- [ ] Exclure `creative/` de D-022 tant que ce tri et la validation visuelle ne
  sont pas terminés.

## Hors backlog

- Recréer les 115 métiers : déjà terminé.
- Fabriquer 526 fichiers de support séparés : non recommandé pour ce lancement.
- Restaurer l'ancien onglet de services humains : abandonné.
- Ajouter un formulaire ou une mise en relation dans Écosystème : abandonné.
- Remettre les outils avant les process : décision écartée.
- Modifier de nouveau la home pour y placer les systèmes : déjà fait.
- Déplacer les cours existants dans l'Académie : décision écartée.
- Ajouter une plateforme LMS, des comptes apprenants, une progression ou des
  paiements dans l'Académie V1 : hors périmètre.

## Prochaine action

Le programme 0 à 8 est fusionné, déployé et recetté. `8020e04` reste son dernier
commit runtime et `a47d844` la tête Production documentaire courante. Il ne
reste aucun lot runtime ouvert dans ce programme.

Ordre recommandé :

1. terminer la surveillance Production de 24 à 48 heures et, dès qu'un compte
   possédant des plans est disponible, rejouer sans créer de données
   artificielles le parcours authentifié Plan → Chiffres → Stratégie →
   reconnexion ;
2. fusionner la PR documentaire D-085/D-089 contenant la résolution de langue
   et la décision de livraison resserrée, puis resynchroniser le Google Sheet ;
3. livrer la PR Accompagnement France D-089 afin que le catalogue, les modales,
   `/sur-mesure` et les demandes partagent les mêmes forfaits ;
4. retirer ensuite Opportunités des navigations tout en conservant
   `/opportunites` directement accessible et `noindex` ;
5. arrêter la vague Production après la recette de ces trois PR ; conserver au
   backlog la fondation internationale cachée, Action Plan anglais,
   Solutions/Talk to us, Academy et la recette intégrée jusqu'à un nouveau GO.

Les programmes Échanger par sujets, administration enrichie, Réseau Partenaire,
invitations multi-membres, suppression d'entreprise, paiement et marketplace
restent différés. Ils ne doivent pas interrompre D-085 sans signal utilisateur,
obligation opérationnelle ou risque de sécurité nouveau.
