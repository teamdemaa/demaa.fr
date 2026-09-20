# Projet Vercel sini

État du 20 septembre 2026 : projet Vercel `sini` créé dans l'équipe
`hiteamdemaa-2292s-projects`, ID `prj_wRqomdIAFRFgp1CqxapGoSdAThZA`.
Le worktree sini est relié localement à ce projet, et non à `demaa-fr`.
La liaison `.vercel` et le fichier `.env.local` restent ignorés par Git ;
ne jamais committer de jeton ou recopier les variables de demaa.

- Preset Next.js, Node 22, commande de build `npm run build:vercel`.
- Premier déploiement : `dpl_EnKpKoPXAJPFYTNAFr1FiLNKRYwg`, état READY.
  Vercel l'a classé en production parce qu'il s'agit du premier déploiement,
  même sans `--prod`. Aucun domaine personnalisé n'est associé.
- Alias Vercel : `https://sini-three.vercel.app/`.
- Déploiement public du 20 septembre 2026 :
  `dpl_EeicQZxEu8XSGNpgrbxJRKi93xKz`, état READY, avec les alias
  `https://gosini.fr` et `https://www.gosini.fr`.
  Le DNS Squarespace utilise le préréglage Vercel : `@` pointe vers
  `216.198.79.1` et `www` vers `cname.vercel-dns.com`.
- Aperçu protégé du 20 septembre 2026 après séparation des API :
  `dpl_4oMmDNKerie3uuJ8mRnH1hSHKfHV`, état READY, URL
  `https://sini-dfbup1488-hiteamdemaa-2292s-projects.vercel.app/`.
  Ce déploiement est une Preview, **pas** une mise en production de l'alias.
  Vérification distante : `/` répond 200 avec `noindex`, l'ancienne API
  `/api/systeme-kit/request` répond 404, `/api/reprise-interest` répond 503,
  `robots.txt` interdit l'indexation et l'accès anonyme demande une connexion
  Vercel. Build et 1 735 tests locaux réussis.
- La protection Vercel est retirée uniquement pour rendre le domaine de
  production accessible publiquement. Les formulaires restent bloqués tant
  que leurs services de réception ne sont pas configurés.
- `robots.txt` interdit l'indexation ; les métadonnées des parcours sini
  portent `noindex`. Les anciennes pages demaa répondent 404/noindex.
- Aucun cron demaa n'est configuré ; leurs URL sont bloquées par le proxy.
- Les variables de production `SINI_SITE_URL` et `SITE_URL` valent
  `https://gosini.fr`, et `SINI_CANONICAL_HOST` vaut `gosini.fr`.
  Les formulaires et e-mails réels ne sont pas opérationnels. Les six API des
  parcours sini répondent 503 tant que `SINI_FORMS_ENABLED=true` et leurs
  prérequis ne sont pas configurés. Les anciennes API, pages admin et parcours
  d'authentification de demaa répondent 404 ; leur code est conservé.

Pour ouvrir les formulaires, prévoir un domaine HTTPS propre à sini et
configurer `SINI_SITE_URL` et `SITE_URL` avec la même origine que
`SINI_CANONICAL_HOST`,
`LEAD_NOTIFICATION_EMAIL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, ainsi qu'un
projet Firebase distinct de `demaa-dde32` avec ses identifiants de service.
Après vérification de ces éléments, activer `SINI_FORMS_ENABLED=true` et
tester chaque parcours de bout en bout. Tant que ce verrou est fermé, aucun
formulaire public de sini ne peut utiliser le repli `demaa.fr` hérité du code.
- Le projet n'est pas connecté à Git : la prévisualisation actuelle est un
  instantané du worktree non committé. Les prochaines modifications locales
  ne seront pas déployées automatiquement.

Avant d'ouvrir les formulaires : vérifier l'adresse de réception,
configurer l'expéditeur Resend, isoler les données Firebase et tester les
parcours. L'indexation reste désactivée jusqu'à une revue éditoriale explicite
des opportunités et des contenus publics.
