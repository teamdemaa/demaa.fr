# Baseline Studio DEMAA — 21 septembre 2026

Ce document fige le point de départ avant la mise en place de la couche
**Studio · Projets · Opportunités**.

## Sources de référence à préserver

- `public/studio/index.html` est l'archive HTML de la direction Studio historique.
- `src/lib/demaa-studio-projects.ts` est la seule source des projets présentés
  publiquement (Tiimora, Oryka, Revyo).
- Les pages `academie`, `solutions`, `specialistes` et les annuaires restent
  indépendants : elles ne doivent pas être supprimées ni réécrites par le
  travail Studio.
- Les illustrations de l'Académie restent dans `public/images/academy/` et
  ne sont pas des assets Studio à remplacer.

## Règles de mise en oeuvre

1. La navigation Studio contient uniquement `Studio`, `Projets` et
   `Opportunités`.
2. `Découvrir l'Académie` est un lien éditorial vers `/academie`, jamais un
   quatrième onglet de cette navigation.
3. Les trois onglets sont trois pages dédiées : `/studio`, `/projets` et
   `/opportunites`. Elles partagent une même navigation et une même direction
   visuelle, sans dupliquer l'Académie.
4. Toute nouvelle proposition visuelle est validée en préproduction avant un
   déploiement de production.
5. Les modifications de routes publiques demandent une vérification du
   canonical, du sitemap et des redirections avant publication.

## Point de retour

- Branche : `archive/demaa-baseline-2026-09-21`
- Tag : `demaa-baseline-2026-09-21`
