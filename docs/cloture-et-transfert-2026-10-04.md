# Clôture DEMAA et préparation du transfert — 4 octobre 2026

## Périmètre
DEMAA : Studio, Projets, Apprentissages, Équipe et pages légales. Les cinq annuaires restent conservés mais retirés du sitemap et désindexés, détails compris. Les anciens modèles et solutions restent conservés pendant la transition.

Les textes SEO, l’identité structurée, les aperçus de partage et le manifest utilisent DEMAA. Le sitemap conserve des dates significatives stables. Le catch-all global des modales est remplacé par des sorties explicites vers les pages publiques : il masquait les routes introuvables dans le routeur déployé. La convention global-not-found gère désormais les URL sans route. Un contrôle HTTP après build vérifie les 404 et les pages publiques réelles.

## Projet destinataire
Une copie Git indépendante est préparée dans `../demaa-ressources`, nom provisoire, port 3014. Elle conserve les sources, données versionnées, assets, API, accès administrateur et dépendances partagées pour éviter de casser les parcours. Les pages Studio/Projets/Équipe/Apprentissages sont retirées de ce projet. Solutions et Modèles sont réactivés ; les annuaires sont accessibles depuis son interface. Les tâches cron de DEMAA ne sont pas dupliquées.

Le dépôt et le domaine de destination restent à définir. La prévisualisation locale utilise explicitement les données versionnées, uniquement en développement ; les paramètres privés exportés par Vercel sont masqués. Le backend Firebase du destinataire reste à configurer et valider, sans déplacement de données, import ou suppression. Aucune clé ou configuration privée ne doit être versionnée. Avant publication indépendante : configurer son identité Firebase, ses domaines Auth et les callbacks Google Drive, vérifier les droits puis les parcours de copie et d’administration sur une donnée de test autorisée.

Cette première copie conserve une base de dépendances large. L’extraction fine se fera après validation du destinataire. Aucun module partagé, aucun compte et aucun abonné ne sont supprimés de DEMAA avant cette validation.

## Retour arrière
Le tag `archive/production-before-studio-2026-10-04` est la référence durable de l’ancienne production. La branche de travail peut être supprimée automatiquement par GitHub après fusion et ne doit pas être considérée comme seule archive. Revenir à un déploiement Vercel précédent ou déployer le tag en cas de régression. Une nouvelle version finale est taguée après vérification de production.

## Contrôles à clôturer
- CI verte, build et audit des 13 URL restantes du sitemap.
- Statuts 404 effectifs et redirections des anciens catalogues.
- Contrôle desktop/mobile et mesure de performance, sans confondre temps de chargement mesuré et Core Web Vitals de terrain.
- Inscription réelle Resend et désinscription : nécessitent une adresse de test désignée. Ne pas ajouter une adresse arbitraire ni envoyer de campagne.
- Vérification Search Console si accès disponible ; aucun résultat d’indexation réel n’est déduit du seul sitemap.
