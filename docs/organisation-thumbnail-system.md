# Miniatures Organisation Demaa

Ce système produit les miniatures utilisées dans la bibliothèque Organisation,
les articles, YouTube et les aperçus sociaux. Une miniature est générée une fois
en PNG puis réutilisée partout.

## Règles visuelles

- Format : 1280 × 720 px, ratio 16:9.
- Fond : `#F1F3F0` (`dema-sage`).
- Texte et accents : `#315F46` (`dema-forest`).
- Traits secondaires : `#6F756E` (`dema-muted`) avec une opacité réduite.
- Bordure : `#ECEEED` (`dema-line`).
- Titre : Gambetta Light Italic, jamais en gras.
- Trois lignes de titre maximum.
- Pas de signature « Organisation · Demaa » dans la miniature.
- Illustration discrète à droite, principalement grise, avec une ou deux touches
  du vert officiel.
- Ne pas introduire une nouvelle couleur ni générer une illustration isolée avec
  un outil d’image.

## Source de vérité

`src/lib/organiser-thumbnail-catalog.ts` contient pour chaque contenu :

- le slug ;
- les retours à la ligne validés ;
- la taille du titre ;
- la clé de l’illustration ;
- un éventuel complément court, comme `2026 → 2027`.

`scripts/generate-organiser-thumbnails.mjs` contient la banque d’illustrations
et le moteur de rendu. Les illustrations sont composées avec des formes simples,
des traits et des symboles réutilisables. Elles ne dépendent d’aucune banque
externe.

Les fichiers finaux sont placés dans :

`public/images/organiser/thumbnails/<slug>.png`

## Ajouter un contenu

1. Ajouter sa définition au catalogue.
2. Réutiliser une illustration existante ou ajouter une clé explicite à la banque.
3. Écrire manuellement deux ou trois lignes courtes : ne jamais laisser un titre
   être coupé automatiquement.
4. Lancer `npm run generate:organiser-thumbnails`.
5. Vérifier le PNG à sa taille réelle et dans la grille Organisation.
6. Vérifier que la miniature reste lisible lorsqu’elle est réduite à 320 × 180 px.

## Contrôle avant publication

- Le vert visible est exactement `#315F46`.
- Le titre correspond au sujet de la vidéo, sans formule abstraite.
- Le texte tient sur trois lignes maximum.
- L’illustration ne concurrence pas le titre.
- Le fichier mesure exactement 1280 × 720 px.
- La carte Organisation et l’article utilisent le même chemin d’image.
