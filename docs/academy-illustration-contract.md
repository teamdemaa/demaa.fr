# Charte de production — illustrations Academy DEMAA

Cette charte s’applique aux couvertures de la bibliothèque Academy, stockées dans
`public/images/academy/covers/`. Ces fichiers validés sont la référence visuelle
de production. Une nouvelle demande ne doit jamais conduire à régénérer la série
sans référence précise.

## Système visuel approuvé

- **Canvas :** 1536 × 864 px, ratio 16:9.
- **Fond :** vert sauge très clair. L’intérieur de chaque forme fermée reprend
  exactement ce fond ; il n’est ni blanc ni transparent.
- **Dessin :** illustration éditoriale au trait vert foncé, fin et régulier,
  avec beaucoup d’espace vide. Une carte exprime une idée principale.
- **Composition :** personnage(s) ou scène à gauche, repère métier/processus à
  droite quand cela sert réellement le sujet ; pas d’ajout décoratif gratuit.
- **Typographie dans l’image :** un repère court seulement lorsque nécessaire
  (`MARGE`, `PARCOURS`, `AUTONOMIE`…), jamais un sous-titre ou du texte de carte.
- **Diversité :** les personnes représentées doivent varier réellement d’une
  couverture à l’autre. Ne pas répéter automatiquement le même profil.

### Diagrammes et parcours

Les traits de liaison vont **entre** les formes, jamais à travers elles. Pour des
cercles, la ligne s’arrête au contour, l’intérieur masque le trait et reprend la
couleur du fond. Une coche ou un symbole validé peut rester à l’intérieur d’un
cercle sans réintroduire un trait de liaison.

La correction validée pour `construire-systeme-marketing-vente-v4.png` est la
référence de ce comportement.

## Source de référence et versions

- Les fichiers `v2`, `v3` et versions ultérieures existants ne sont jamais
  écrasés ni supprimés pendant une itération visuelle.
- Toute proposition devient `slug-vN.png`, où `N` est supérieur à la dernière
  version existante pour ce slug.
- La version utilisée par le site est explicitement choisie dans
  `src/lib/academy-preview-catalog.ts`.
- Une nouvelle version ne remplace la version affichée qu’après validation
  visuelle explicite de la fondatrice.

## Processus obligatoire

1. Identifier la carte et le fichier de référence exacts avant toute génération.
2. Décrire la seule modification demandée et les éléments invariants à préserver.
3. Générer une prévisualisation non publiée avec `imagegen`.
4. Présenter la prévisualisation ; ne pas modifier le catalogue ni publier avant
   validation si le changement est créatif ou matériel.
5. Après validation, ajouter la version choisie dans `public/images/academy/covers/`.
6. Mettre à jour le catalogue, contrôler le rendu dans une carte Academy, puis
   vérifier TypeScript et les tests Academy.

## Contrôle avant mise en ligne

- Le fichier est en 1536 × 864 px et respecte le ratio 16:9.
- Son nom suit `slug-vN.png`.
- Le fond, les traits, la densité et la typographie correspondent à une
  couverture approuvée de la série.
- Les raccords de diagrammes respectent la règle ci-dessus.
- Le fichier précédent existe encore.
- La page Academy référence la version validée, et aucune autre carte n’a été
  modifiée involontairement.
