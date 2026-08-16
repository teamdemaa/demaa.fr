# Administration des échanges

La console interne des échanges est disponible sur `/admin/coaching`. Elle est
réservée à la Team Demaa, absente de la navigation publique et déclarée
`noindex`.

## Configuration

L’API `/api/admin/coaching` utilise exclusivement la variable serveur sensible
`COACHING_ADMIN_SECRET`. Cette clé doit comporter au moins 24 caractères et être
configurée séparément dans chaque environnement Vercel autorisé.

La clé `OPPORTUNITIES_ADMIN_SECRET` protège uniquement l’administration des
opportunités. Il n’existe aucun fallback entre les deux consoles.

## Accès

1. Ouvrir directement `https://demaa.co/admin/coaching`.
2. Saisir la clé Coaching dans le champ « Clé d’administration ».
3. Cliquer sur « Ouvrir ».

La clé est transmise dans l’en-tête privé `x-demaa-admin-secret`. Elle ne doit
jamais être placée dans une URL, un journal, un ticket ou un document partagé.
Elle reste uniquement dans l’état mémoire de la page et doit être ressaisie
après un rechargement.

Les lectures et écritures sont privées, non mises en cache et limitées avant la
comparaison de la clé. Les écritures exigent en plus une origine Demaa valide.

## Exploitation

- Révoquer et remplacer immédiatement la clé en cas de doute sur sa
  confidentialité.
- Vérifier après rotation que `COACHING_ADMIN_SECRET` est présente dans Vercel
  Production avant de supprimer l’ancienne valeur.
- Ne jamais communiquer cette clé à un partenaire ou à un spécialiste externe.
- Le futur accès par rôle Firebase `team_demaa` fera l’objet d’un lot séparé.
