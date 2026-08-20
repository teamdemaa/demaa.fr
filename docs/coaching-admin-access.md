# Administration des échanges

La console interne des échanges est disponible sur `/admin/coaching`. Elle est
réservée à la Team Demaa, absente de la navigation publique et déclarée
`noindex`.

## Configuration

L'accès admin (`/admin/coaching`, `/admin/opportunites` et `/admin/demandes`) réutilise la
session client existante (`demaa_session`, la même connexion Google ou
email/mot de passe que le reste du site) plutôt qu'un secret séparé. L'autorité
la plus forte est la variable serveur `DEMAA_ADMIN_UIDS` (UID Firebase séparés
par des virgules). `DEMAA_ADMIN_EMAILS` reste un mécanisme de compatibilité,
mais uniquement pour une adresse dont Firebase confirme la vérification.
`getCurrentAdminIdentity` (`src/lib/admin-auth.server.ts`) applique ces règles.

Il n'y a plus de secret dédié par console : les mêmes listes d'UID et d'emails
vérifiés protègent les trois espaces admin.

## Accès

1. Se connecter normalement avec un compte dont l'UID figure dans
   `DEMAA_ADMIN_UIDS`, ou avec une adresse Firebase vérifiée figurant dans
   `DEMAA_ADMIN_EMAILS`.
2. Ouvrir `https://demaa.co/admin/coaching`, `/admin/opportunites` ou
   `/admin/demandes`.
3. La page vérifie la session côté serveur et redirige vers `/connexion` si
   le compte connecté n'est pas administrateur.

Les lectures et écritures sont privées, non mises en cache et limitées avant
la vérification de session. Les écritures exigent en plus une origine Demaa
valide.

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
