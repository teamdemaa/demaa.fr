# D-094 — Inventaire runtime avant implémentation

- Base auditée : `origin/main` `dbb8b723`
- Date : 22 août 2026
- Nature : lecture seule ; aucune route ou donnée modifiée

## Génération et plans

| Élément courant | Dépendance actuelle | Cible D-094 |
| --- | --- | --- |
| `POST /api/action-plans/generate` | session, UID, entreprise et appartenance | nouvelle frontière invitée temporaire ; ne pas retirer l'autorisation de la route historique |
| `/api/action-plans`, `/api/action-plans/[id]` | propriété entreprise | conserver pour rollback puis retirer du parcours public |
| `/api/action-plans/[id]/generate` et `/generation` | plan sauvegardé authentifié | ne pas réutiliser comme API publique |
| `ActionPlanExperience` | brouillon, modale auth, génération puis plan | conserver temporairement pour rollback ; le nouveau `GuestActionPlanExperience` reste une machine d'état séparée et doit devenir l'unique shell après retrait autorisé du parcours historique |
| `action_plans` | `company_id`, `owner_uid`, `created_by_uid` | ne pas écrire de job invité dans cette collection |

Primitives réutilisables : contrat ActionPlan V4, exécution de génération,
validation/réparation, identifiant de requête, lease, reprise, ledger d'usage et
normalisation du résultat.

## Identité et administration

| Élément courant | Risque | Cible D-094 |
| --- | --- | --- |
| `/api/auth/session` | appelle `ensureDefaultCompanyForIdentity` | réservé à l'historique client pendant rollback |
| `CUSTOMER_SPACE_COOKIE=demaa_session` | partagé par client et admin | cookie admin distinct |
| `admin-auth.server.ts` | lit le cookie client | DAL admin indépendant |
| `/admin/opportunites`, `/admin/coaching`, `/admin/demandes` | session client autorisée par `DEMAA_ADMIN_EMAILS` | session Team Demaa sans provisioning entreprise |
| anciens secrets admin | encore présents selon environnement | retrait après validation de la nouvelle session, pas avant |

## Formulaires et demandes

### Déjà publics ou session facultative

- `/api/newsletter-subscribe` ;
- `/api/academy-live-registration` ;
- `/api/service-callback-request` ;
- `/api/systeme-kit/request` ;
- les parcours publics d'aide comptable et Fillout existants.

### À convertir sans compte

- `/api/structure-problem` : le corps contient déjà l'e-mail mais la route
  utilise encore celui de la session ;
- `/api/opportunity-submissions` : le brouillon est public, la soumission
  finale doit demander un e-mail explicite ;
- profil prestataire : utiliser un contact explicite validé ;
- `/api/solution-referral` : conserver l'e-mail saisi au lieu de l'écraser par
  celui de la session ;
- préférence de locale : cookie public, sans persistance membre obligatoire.

### À retirer ou remplacer

- `/api/coaching-request`, `/api/coaching-draft` et `/api/admin/coaching` :
  remplacés par le Diagnostic ponctuel et sa réponse e-mail ;
- `/api/coaching-recommendation-request` : Services reste la source canonique ;
- `/api/systeme-kit/notify` : doublonne le parcours public
  `/api/systeme-kit/request`.

## Collections de demandes

- `lead_requests` : source normalisée existante avec idempotence, contacts,
  consentements, attribution, livraison et rétention ;
- `service_requests` et `solution_referrals` : collections spécialisées avec
  maintenance existante ;
- Opportunités : données et administration spécialisées ;
- `coaching_conversations`, `coaching_message_drafts` et
  `customer_coaching_access` : historique à conserver pendant rollback puis à
  inventorier avant suppression.

Le read-model admin agrège ces sources. Il ne les fusionne pas physiquement.

## Pilotage et interface

- `COMPANY_STRATEGY_VISIBLE` masque déjà Stratégie ;
- Chiffres reste actuellement visible et demande une session à l'écriture ;
- `CompanyPilotagePanel`, les routes `/api/company/pilotage/*`, les contrats et
  les collections restent en place pendant la transition ;
- `Navbar` expose encore Connexion/Mes plans ;
- les routes `/plans`, `/plans/new`, `/plans/latest` et `/plans/[id]` restent
  authentifiées ;
- l'accueil redirige encore une session existante vers son dernier plan ;
- Diagnostic repose encore sur une conversation liée à l'UID.

## Sécurité à réutiliser ou corriger

- `service-request-security.server.ts` sait résoudre une IP Vercel de confiance
  et peut servir de base au limiteur invité ;
- le limiteur générique actuel peut échouer ouvert lorsque Firestore est
  indisponible : il ne convient pas seul à une génération IA publique ;
- `ai-usage-ledger.server.ts` sait journaliser une empreinte IP sans UID ;
- aucun secret invité ne doit être un identifiant Firestore prédictible ou une
  valeur présente dans une URL analytique ;
- le quota global quotidien doit empêcher qu'une rotation d'IP contourne le
  budget de sécurité.

## Données et suppressions

L'utilisatrice indique que tous les comptes actuels sont des comptes de test.
Cette qualification ne remplace pas un inventaire technique. Avant suppression
il faut résoudre exactement : comptes Firebase, entreprises, appartenances,
plans, index, métriques, stratégies, conversations et demandes ; présenter les
cibles puis obtenir une autorisation destructive explicite.
