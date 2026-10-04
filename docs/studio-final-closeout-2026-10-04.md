# Clôture du Studio DEMAA — 4 octobre 2026

## Périmètre publié
Studio, Projets, Apprentissages (Jago, Dumaan, Tiimora), L’équipe et pages légales. La navigation, les textes et les visuels validés sont conservés. Les épisodes restent non cliquables avec « Bientôt disponible ».

## Archive et transfert
Les anciennes routes marketing du produit Ressources sont déplacées de `src/app` vers `src/archived-resource-routes` : elles sont conservées, typées et testées mais ne génèrent plus de pages Next.js. L’inventaire `studio-route-archive-2026-10-04.json` détaille les déplacements. Les tests et audits du produit historique lisent explicitement l’archive. Le dépôt indépendant https://github.com/teamdemaa/demaa-ressources conserve l’application complète et les données existantes.

Les anciennes adresses des catalogues et offres redirigent temporairement vers `/studio`. Aucun lien public ne conduit au projet Ressources. Les anciennes pages d’articles sont archivées ; le routeur Apprentissages ne publie que les trois séries retenues. Les fiches individuelles de projets sont archivées et leurs URL redirigent vers `/projets`.

Les accès administratifs, API, parcours privés et livraisons signées de kits restent conservés pour ne pas interrompre les opérations existantes. Aucun compte, abonné, fichier Firebase, droit ou donnée métier n’est supprimé. Le retrait de ces services historiques et de leurs dépendances partagées est un chantier distinct, après validation administrative de Ressources.

## Travail local préservé
Les modifications locales de la page Investisseurs sont laissées intactes dans le checkout original et sauvegardées avant intervention. Cette livraison part du dernier `origin/main` dans une copie isolée et ne publie pas ces modifications non validées.

## Contrôles et retour arrière
Avant fusion : lint, TypeScript, suite complète, validateurs de données, build Next.js et contrôles HTTP des pages publiques, des 404 et des redirections des catalogues. Après déploiement : audit du sitemap, vérification navigateur desktop/mobile et production.

L’abonnement Resend et sa désinscription ont déjà été testés avec l’adresse autorisée `team@demaa.fr`. Cette adresse de test reste désinscrite. Aucun nouvel envoi n’est déclenché par cette clôture.

L’archive Git `archive/production-before-studio-2026-10-04` conserve l’ancienne version. Le tag `release/studio-before-final-closeout-2026-10-04` pointe vers la version précédant ce nettoyage. Pour annuler la livraison : rollback vers le déploiement Vercel antérieur, ou revert du commit de fusion, puis redéploiement. Les données n’ayant pas été migrées, aucun retour arrière Firebase n’est nécessaire.

La connexion administrative du projet Ressources reste à finaliser ; elle ne bloque pas la publication du Studio. La copie Google Drive du destinataire a été validée séparément.
