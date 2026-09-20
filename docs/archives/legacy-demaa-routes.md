# Archive des routes héritées de demaa dans sini

Statut : archive logique dans le code et sur le déploiement privé sini.
Aucun fichier de page n'a été supprimé.
Leur version de référence demeure dans le dépôt demaa, à côté de ce worktree.
Le proxy du worktree sini renvoie 404/noindex sur ces anciennes pages afin
qu'elles ne se retrouvent pas dans l'aperçu ou dans un futur déploiement sini.

| Famille héritée | Destination et conservation |
| --- | --- |
| Académie, organiser, tutoriels, contenus, modèles | demaa > Académie ; les cinq méthodes de cession utiles à sini sont reprises sur `/conseil` et `/conseil/[slug]`. |
| Outils, systèmes, solutions, annuaires métiers, fournisseurs, financements, aides, secteurs | demaa > Solutions ; conserver les fichiers et les données dans les deux historiques jusqu'à séparation technique complète. |
| Spécialistes, services, annuaire des coachs et experts-comptables | demaa > Spécialistes ; seul l'accompagnement à la transmission reste public sur sini. |
| Plans, diagnostic, espace client et autres parcours d'application demaa | demaa ; ne pas les exposer comme pages publiques sini. |
| Studio, partenaires, pages de recrutement demaa, anciennes pages de présentation | demaa ; archiver dans sini sans suppression. |

Routes publiques sini conservées : `/` (Reprendre), `/a-reprendre/[slug]`,
`/transmettre` (Vendre), `/conseil`, `/conseil/[slug]`, `/accompagnement` et
`/alertes-reprise/[id]`. Les anciennes URL `/a-reprendre` et `/apercu-sini`
redirigent vers leur destination sini. Les API et pages d'administration sont
conservées techniquement pour ne pas casser les formulaires et les opérations ;
elles nécessitent un audit séparé avant de fournir des secrets au projet Vercel.
Les deux tâches planifiées demaa sont retirées de `vercel.json` côté sini et
leurs points d'entrée HTTP sont bloqués par le proxy.

Exception provisoire : `/mentions-legales` et `/politique-de-confidentialite`
restent accessibles parce que les formulaires y renvoient, mais leur texte
décrit encore demaa.fr. Elles doivent être adaptées à l'éditeur et à l'URL
réels de sini avant de partager publiquement une prévisualisation ou d'activer
des formulaires réels. Le sitemap hérité est masqué ; l'indexation est bloquée.

Pour réactiver une page : décider d'abord si elle appartient réellement à
sini ; sinon, faire pointer les éventuels liens entrants vers le dépôt demaa.
Si elle appartient à sini, adapter identité, données, liens, SEO, formulaire et
tests, puis l'ajouter explicitement à la liste des routes sini du proxy.
