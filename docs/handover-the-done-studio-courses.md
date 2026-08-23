# Handover — Cours dans The Done Studio

**Date :** 23 août 2026
**Source informative :** Demaa
**Propriétaire de l'implémentation :** The Done Studio
**Nature :** passage de connaissances sans contrat commun

## État cible

The Done Studio conserve sa navigation actuelle. Dans `Ressources`, une seule
section `Cours` arrive en première position, avant les autres catégories. Ses
cartes sont horizontalement scrollables et utilisent le design propre à The
Done Studio.

Il n'existe dans The Done Studio :

- ni onglet Academy ;
- ni sections Tutoriels/Formations ;
- ni réactivation de l'ancienne route `/contenu` ;
- ni lecteur, progression ou stockage importé de Demaa.

## Réutilisation locale recommandée

L'implémentation doit d'abord réutiliser les briques déjà présentes dans The
Done Studio : `KitPage`, ses rails horizontaux, `ResourceDetailPage`, les
routes Ressources, les métadonnées et le sitemap.

Les miniatures Demaa constituent seulement une référence de composition. Les
couleurs, la typographie, les espacements, les états de focus et le responsive
appartiennent au design The Done Studio.

## Frontières

Chaque application possède ses contenus, modèles, routes, tests, déploiements
et données. Aucun fichier n'est synchronisé automatiquement. Un contenu Demaa
ne devient pas un Cours The Done Studio sans sélection et adaptation
éditoriales explicites dans le dépôt cible.

## Gate de livraison

- `Cours` est le premier rail de `/ressources` ;
- absence de sous-section Tutoriels ou Formations ;
- navigation toucher, souris et clavier ;
- absence d'overflow de page ;
- pages de détail, retour, URL directe, SEO et sitemap vérifiés ;
- mobile et PWA recettés ;
- tests unitaires, build et E2E verts ;
- aucune dépendance vers Demaa.
