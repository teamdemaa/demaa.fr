# Administration des échanges

La console interne des échanges est disponible sur `/admin/coaching`. Elle est
réservée à la Team Demaa, absente de la navigation publique et déclarée
`noindex`.

## Configuration

L'accès admin (`/admin/coaching`, `/admin/opportunites` et `/admin/demandes`) utilise une
session Team indépendante (`demaa_admin_session`) créée depuis
`/admin/connexion`. La connexion Firebase Google ou email/mot de passe est
réutilisée, mais la session client `demaa_session` n'accorde aucun accès admin.
L'autorité
la plus forte est la variable serveur `DEMAA_ADMIN_UIDS` (UID Firebase séparés
par des virgules). `DEMAA_ADMIN_EMAILS` reste un mécanisme de compatibilité,
mais uniquement pour une adresse dont Firebase confirme la vérification.
`getCurrentAdminIdentity` (`src/lib/admin-auth.server.ts`) applique ces règles.

Il n'y a plus de secret dédié par console : les mêmes listes d'UID et d'emails
vérifiés protègent les trois espaces admin.

## Accès

1. Ouvrir `/admin/connexion` et se connecter avec un compte dont l'UID figure dans
   `DEMAA_ADMIN_UIDS`, ou avec une adresse Firebase vérifiée figurant dans
   `DEMAA_ADMIN_EMAILS`.
2. Ouvrir `https://demaa.co/admin/coaching`, `/admin/opportunites` ou
   `/admin/demandes`.
3. La page vérifie la session Team côté serveur et redirige vers
   `/admin/connexion` si
   le compte connecté n'est pas administrateur.

La création de cette session n'appelle jamais le provisioning d'entreprise ou
d'appartenance client. Le cookie est `HttpOnly`, signé par Firebase, limité à
12 heures et revérifié avec contrôle de révocation à chaque accès. Les lectures
et écritures sont privées, non mises en cache et limitées avant
la vérification de session. Les écritures exigent en plus une origine Demaa
valide.

Pour une recette sur un alias Vercel Preview stable, le nom d'hôte doit être
déclaré à la fois dans les domaines Firebase Preview autorisés, dans
`NEXT_PUBLIC_FIREBASE_AUTHORIZED_DOMAINS` et dans la liste serveur fermée
`DEMAA_PREVIEW_HOSTS`. Cette dernière n'est prise en compte que lorsque
`VERCEL_ENV=preview` ; elle n'autorise jamais globalement les domaines
`*.vercel.app`.

Recette du 20 août 2026 : les trois pages ont été ouvertes en Production avec
une session Google autorisée. `DEMAA_ADMIN_EMAILS` est configurée dans Vercel
Production et Preview ; `DEMAA_ADMIN_UIDS` doit être privilégiée dès que l'UID
administrateur a été relevé. Les anciens secrets `OPPORTUNITIES_ADMIN_SECRET` et
`COACHING_ADMIN_SECRET`, devenus inutiles, ont été retirés de Production.

## Exploitation

- Retirer immédiatement un UID de `DEMAA_ADMIN_UIDS` (et, le cas échéant, son
  email de `DEMAA_ADMIN_EMAILS`) révoque son accès
  admin à la prochaine requête, sans affecter les autres comptes.
- Ne jamais communiquer un accès admin à un partenaire ou un spécialiste
  externe. Tout administrateur autorisé doit être ajouté explicitement par son
  UID Firebase à `DEMAA_ADMIN_UIDS` ; l'email vérifié reste uniquement le
  mécanisme de compatibilité documenté plus haut.
