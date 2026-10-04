# Plan de consolidation de Demaa

Proposition du 3 octobre 2026. Construire la nouvelle version autour du Studio, avec la direction visuelle du deck Canva, en conservant les solutions, tutoriels et fonctionnalités utiles de l’application actuelle. Le travail demandé à ce stade est une analyse et un plan : aucune page de production n’a été modifiée.

## Sources et état constaté

- [Deck Canva DEMAA Présentation investisseurs v2](https://canva.link/ignym1dyn1ato0n) : 30 pages consultées. Référence pour le positionnement, les neuf projets présentés et leurs images. Les objectifs 2027 sont des objectifs, pas des résultats acquis.
- Studio local : http://localhost:3012/studio ; branche `codex/archive-studio-mnd-dumaan`, commit `6ee9864`. Code dans `/Users/oumougory/Documents/Codex/2026-09-27/tu-e/outputs/demaa-studio-archive`.
- Code actuel de `main` récupéré en lecture : `18dfdd474eaaf8d893a83e294218d0aa4f3ef2ee`. Sa correspondance exacte avec le déploiement Vercel reste à confirmer avant développement.
- Production consultée : `/studio` aboutit à `/accompagnement`. `/solutions` conserve recherche d’activité, catégories et fiches par métier. La navigation publique actuelle est Accompagnement, Solutions, Tutoriels.
- `src/lib/demaa-public-routes.ts` exclut actuellement de l’indexation plusieurs familles de routes, dont `/annuaire-*`, `/modeles`, `/outils`, `/aides-et-subventions`, `/contenus`, `/organiser` et `/a-reprendre`. Leur code existe encore, mais elles portent un en-tête noindex.
- L’archive locale `public/studio/index.html` est une ancienne maquette distincte. Elle ne doit pas remplacer l’application entière.

## Structure recommandée

Conserver une application et un domaine. Le Studio devient l’entrée institutionnelle ; les ressources restent des parcours complets accessibles depuis le bas des pages.

| Élément | Destination proposée | Traitement |
| --- | --- | --- |
| Accueil | `/` vers `/studio` | Changer la destination actuelle dans le routage et les liens du logo |
| Studio | `/studio` | Présentation, méthode, trois projets prioritaires, fondatrices, contact |
| Projets | `/projets` et `/projets/[slug]` | Neuf projets du deck en premier ; autres projets conservés dans les données et affichés selon leur statut |
| Opportunités du Studio | `/studio/opportunites` | Collaborations et rôles réellement ouverts ; éviter de réutiliser la route historique `/opportunites` sans audit |
| Solutions | `/solutions` et `/solutions/[slug]` | Préserver catalogue, recherche, filtres, fiches et données ; adapter uniquement la présentation |
| Tutoriels | `/tutoriels` et détails | Garder vidéos, articles, contenus et parcours actuels |
| Accompagnement | `/accompagnement` | Garder l’offre et les prises de contact ; rendre accessible dans le footer et depuis les solutions |
| Annuaires | Routes historiques sélectionnées | Réactiver individuellement après validation des données et du routage |

Navigation principale proposée : Studio · Projets · Opportunités, avec un bouton Nous contacter. Le logo mène au Studio. Ajouter un lien secondaire Ressources vers le bloc en bas de page ou vers le catalogue Solutions si nécessaire.

Bas de la page Studio : un bloc « Des ressources pour faire avancer votre entreprise », avec un court texte, un lien Solutions par activité, un lien Tutoriels et un lien Accompagnement. Ne pas intégrer les centaines de cartes du catalogue dans cette page. Le footer commun contient Studio, Projets, Opportunités, Solutions, Tutoriels, Accompagnement, Contact et les mentions légales. Les annuaires sélectionnés peuvent former une colonne Ressources quand leurs routes fonctionnent.

## Ce qu’il faut conserver

- Les services serveur actuels, Firebase, les catalogues et leurs sources de données. Aucun import ou changement de base n’est nécessaire pour un changement de couleurs.
- Les fonctions de recherche et les pages métier de Solutions, les tutoriels et les médias existants.
- Les fonctionnalités opérationnelles encore utilisées : formulaires, authentification, espace client, paiement et tâches planifiées, après inventaire de leurs usages. Ne pas supprimer du code simplement parce qu’il n’apparaît plus dans le menu.
- Les URLs utiles et les liens entrants. Toute nouvelle URL doit avoir une correspondance explicite avec l’ancienne.
- Le contenu de l’archive Studio et ses dix-neuf projets comme historique. Le maximum est conservé dans les données et les sauvegardes ; la sélection publique doit rester fidèle aux projets actuels.
- Les composants accessibles, les métadonnées et les outils de vérification du projet actuel.

## Page Studio à réaliser

1. Une ouverture avec la photo de couverture Canva et le message « On crée des entreprises sur des marchés qu’on connaît de l’intérieur ». Boutons Voir les projets et Nous contacter. Ne pas présenter la personne de la photo comme une fondatrice sans confirmation.
2. Une présentation courte du studio, de son ancrage Afrique et Europe et des quatre pôles du deck.
3. Une méthode simple : identifier une opportunité, tester pendant 3 à 6 mois, décider, développer. Ne pas publier les détails du montage financier dans cette présentation.
4. Trois projets mis en avant : Tiimora, Dumaan et MND. Pour chacun : image, besoin, offre et statut réel.
5. Un aperçu des six autres projets du deck, avec lien vers le portefeuille complet.
6. Une section Aïssata et Oumou, reprenant leurs rôles et parcours du deck avec des textes nettoyés. Utiliser leurs portraits réels si disponibles.
7. Une invitation à collaborer, puis le bloc Ressources et le footer.

Conserver les pages séparées du studio local. Supprimer les doublons de présentation et les longues phrases génériques quand les informations du deck donnent une description précise.

## Corrections de contenu avant publication

| Projet | Correction à apporter par rapport au studio local |
| --- | --- |
| Tiimora | Logiciel opérationnel pour cabinets comptables. Le deck indique deux cabinets pilotes ; dater et confirmer ce statut avant publication. Ne pas présenter 28 clients fin 2027 comme une réalisation. |
| Dumaan | Légumes et plats ouest-africains surgelés pour restaurants et traiteurs. Remplacer le positionnement principal de repas grand public et les images de livraison devenues incohérentes. |
| MND | Média et commerce de produits ouest-africains vendus en lots ; démarrage autour de la food, puis style, care et home. Harmoniser le statut local « en étude » avec le test décrit dans le deck. |
| Jago | Harmoniser l’affichage public Jago/Jagoya. Conserver le slug historique `jagoya` tant qu’une migration n’est pas décidée, ou prévoir une redirection précise. Offre B2B de vente en gros de produits de marques africaines. |
| Tendera | Remplacer la description d’espace de contenus par les appels d’offres BTP assistés par IA. |
| Kahé | Ajouter au catalogue public : concept de coffee shop inspiré du Mandé. Ne pas affirmer qu’une franchise est déjà ouverte. |
| Mandya | Ajouter au catalogue public : concept de spa premium inspiré du Mandé. |
| Lafiasso | Aligner la description sur la vente de terrains en Afrique de l’Ouest, puis de maisons ; le catalogue de programmes immobiliers est une ancienne formulation. |
| Djaty | Remplacer la sélection/location de maisons par le studio de rénovation spécialisé dans les maisons de vacances. |

Les neuf projets ci-dessus constituent la sélection du deck. Sini, Oryka, Revyo et les autres projets locaux ne sont pas supprimés : documenter leur statut, puis les afficher dans une section Autres projets, Partenaires ou Archives selon leur situation. Une absence du deck ne prouve pas un abandon. Les rôles actuellement décrits pour AfroTaste, Afro Hair Academy et Kalan ne doivent être affichés comme ouverts qu’après confirmation de leur actualité.

## Couleurs et images

Reprendre les fonds ivoire, le brun sombre, les tons sable et les photographies du deck. Garder les composants et interactions de l’application ; adapter leurs styles via des variables partagées.

Palette de départ proposée, cohérente avec le deck et la trame PDF locale, mais non certifiée comme les valeurs exactes du fichier Canva : fond `#F5F1EA`, surface `#FFFCF7`, texte `#171411`, texte secondaire `#716B64`, bordures `#D3CCC3`, accent `#8B6852`. Définir séparément les couleurs de succès, d’erreur et d’avertissement ; vérifier les contrastes des textes et boutons.

Titres éditoriaux en serif, interface et paragraphes en sans serif. Préserver au départ les polices locales déjà installées. Le changement de palette doit aussi concerner les footers, boutons, champs, focus clavier et pages Solutions/Tutoriels, sans transformer les tableaux ou formulaires en pages de présentation.

Images du deck à réutiliser : couverture, visuels Tiimora, Dumaan, MND, Jago, Kahé, Lafiasso, Mandya, Tendera et Djaty. Préférer les fichiers image sources ; ne pas utiliser une diapositive entière comme une image contenant du texte. Des concepts visuels ne doivent pas être présentés comme des photos d’établissements déjà ouverts. Conserver les logos d’origine, les proportions et les illustrations des tutoriels.

Quatre fichiers image ont été exportés par le navigateur depuis le deck. Sept exports ont échoué, puis trois variantes ont également échoué. Les fichiers récupérés sont sauvegardés dans `output/consolidation-demaa-2026-10-03/canva-images/`, avec un inventaire local. Leur association aux projets et la récupération des autres originaux restent à terminer. Les images déjà présentes dans `output/images/projets-2026/` sont une autre source disponible : les comparer au Canva avant remplacement.

Ne pas publier par défaut les tickets d’investissement, la répartition du capital, les simulations de rendement, la rémunération des fondatrices, les prévisions financières ou les affirmations fiscales du deck. Ils appartiennent au parcours investisseurs et exigent une validation distincte si une publication est souhaitée. Leur analyse juridique ou financière ne fait pas partie de ce plan.

## Ordre d’exécution et sauvegardes

1. Identifier le dépôt actuel et le commit réellement déployé sur Vercel. Sauvegarder ce point et l’archive Studio avec des tags datés ; conserver les changements locaux non committés dans une sauvegarde distincte après inspection. Ne jamais ajouter des secrets ou fichiers `.env` aux sauvegardes versionnées.
2. Créer une branche `codex/demaa-consolidation` depuis le code actuel. Réutiliser uniquement les fichiers Studio nécessaires depuis l’archive. Ne pas fusionner ou déployer toute la branche ancienne.
3. Établir une liste de routes conservées, réactivées, redirigées et archivées. Modifier ensemble les pages, `src/lib/demaa-public-routes.ts`, le proxy, les redirections, les liens du logo, le footer, le sitemap et les canonicals.
4. Centraliser les noms, statuts, descriptions, pôles et images des projets. Prévoir un statut de publication distinct du statut d’avancement : conserver une fiche dans les données n’oblige pas à l’afficher publiquement.
5. Récupérer les images manquantes, garder les originaux, créer les variantes web et documenter leur provenance. Ne pas dépendre des liens temporaires signés de Canva pour le site.
6. Adapter les couleurs et typographies, puis réaliser Studio et Projets. Harmoniser Solutions, Tutoriels et Accompagnement sans réécrire leurs services.
7. Réactiver uniquement les annuaires utiles : contrôler leur contenu, leurs dépendances et leurs liens. Aucun lien de footer ne doit aboutir à une route bloquée. Le catalogue Solutions reste le point d’accès principal aux outils, fournisseurs, financements, aides et réseaux.
8. Sauvegarder chaque lot dans un commit lisible : contenu des projets, routes, styles et médias, pages, vérifications. Documenter les décisions et les références d’images. Exclure caches, builds, dépendances et fichiers privés.
9. Exécuter lint, TypeScript, tests ciblés de routage et des parcours affectés, puis build de production. Vérifier navigation, recherche Solutions, lecture Tutoriels, formulaires, images, erreurs navigateur, affichage mobile et clavier. Le serveur local actuel a émis un avertissement `google-gax` : le diagnostiquer dans le build avant publication.
10. Publier une préproduction depuis cette branche ; valider visuellement Studio, Projets, Solutions, Tutoriels et Accompagnement. Ensuite seulement publier la version consolidée. Consigner l’URL, le commit et l’identifiant du déploiement précédent pour pouvoir revenir à la version précédente.

## Critères de livraison

- Studio est accessible sans redirection vers Accompagnement ; le logo et l’accueil mènent à la destination retenue.
- Les neuf projets du deck ont des descriptions cohérentes, des statuts vérifiés et des images adaptées. Les autres fiches sont conservées avec une décision documentée.
- Solutions et Tutoriels gardent leurs fonctionnalités et leurs données. Les annuaires sélectionnés fonctionnent réellement.
- Le footer expose les ressources sans surcharger l’ouverture du site.
- Aucun lien cassé, image manquante, débordement mobile ou régression des parcours utilisés.
- Les sauvegardes, commits, sources des images et procédure de retour sont disponibles.

## Sauvegarde réalisée pour ce plan

Le plan et quatre images récupérées sont conservés dans le dossier Demaa. Un instantané des fichiers Studio concernés et des fichiers de routage du `main` consulté accompagne ce plan dans `output/consolidation-demaa-2026-10-03/`. C’est une sauvegarde ciblée pour préparer le travail, pas une sauvegarde de toute l’application ni de Firebase. Le plan a ensuite été exécuté sur la branche `codex/demaa-consolidation`. Voir `studio-consolidation-handover.md` pour les changements et vérifications. La production reste inchangée.
