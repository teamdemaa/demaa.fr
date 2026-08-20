# Administration des échanges

La console interne des échanges est disponible sur `/admin/coaching`. Elle est
réservée à la Team Demaa, absente de la navigation publique et déclarée
`noindex`.

## Configuration

L'accès admin (`/admin/coaching`, `/admin/opportunites` et `/admin/demandes`) réutilise la
session client existante (`demaa_session`, la même connexion Google ou
email/mot de passe que le reste du site) plutôt qu'un secret séparé. Un compte
est administrateur si son email figure dans la variable serveur
`DEMAA_ADMIN_EMAILS` (liste séparée par des virgules), vérifiée par
`getCurrentAdminIdentity` (`src/lib/admin-auth.server.ts`).

Il n'y a plus de secret dédié par console : la même liste d'emails protège les
trois espaces admin.

## Accès

1. Se connecter normalement sur le site avec un compte figurant dans
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
Production et Preview. Les anciens secrets `OPPORTUNITIES_ADMIN_SECRET` et
`COACHING_ADMIN_SECRET`, devenus inutiles, ont été retirés de Production.

## Exploitation

- Retirer immédiatement un email de `DEMAA_ADMIN_EMAILS` révoque son accès
  admin à la prochaine requête, sans affecter les autres comptes.
- Ne jamais communiquer un accès admin à un partenaire ou un spécialiste
  externe autrement qu'en ajoutant son email à cette liste.
