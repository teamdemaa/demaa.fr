# Recette de l'aperçu SINI

Route locale : `/apercu-sini` ; anglais : `/apercu-sini?lang=en`. Cette route n'est ni l'accueil actuel, ni une nouvelle version des parcours `/a-reprendre`, `/transmettre`, `/accompagnement`.

## Vérifié

- Le rendu serveur FR et EN contient les titres, les trois liens de parcours, les liens FR/EN, les textes alternatifs traduits et l'attribut `lang` adapté.
- Métadonnées `robots: noindex, nofollow` ; aucune entrée dans le sitemap ; la redirection de `/` reste inchangée.
- Typage TypeScript, ESLint et tests ciblés passent.
- Revue statique à 320 px : la barre d'onglets est une grille à trois colonnes avec libellés capables de revenir à la ligne ; les sections et cartes sont en une colonne sous leurs seuils responsive.

## À vérifier avant toute publication

- Capture navigateur réelle à 320 px et desktop, absence de débordement et comportement clavier.
- Build complet Next.js après libération d'espace disque. Le serveur de développement local a été arrêté après une boucle `Watchpack EMFILE` ; aucun résultat navigateur ne doit être considéré comme validé.
- Identité juridique, mentions, formulaires, emails, métadonnées et domaine des parcours liés : ils restent ceux du site DEMAA actuel.
- Droits et pertinence des photographies listées dans `sini-preview-assets.md`.
