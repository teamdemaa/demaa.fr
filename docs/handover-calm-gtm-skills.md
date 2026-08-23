# Handover — Skills spécialisés vers Calm GTM

**Date :** 23 août 2026
**Projet propriétaire :** Calm GTM
**Sources auditées :** Demaa et skill utilisateur de production vidéo

## Objectif

Calm GTM doit pouvoir distribuer des capacités spécialisées sans gonfler son
skill cœur ni embarquer du code produit Demaa ou The Done Studio.

Les add-ons ciblés sont :

- `calm-prospect-ethically` ;
- `calm-produce-video`.

## Fondation

L'installateur Calm actuel gère un seul skill. La première PR doit introduire
une installation multi-skills sûre pour les emplacements `.agents`, `.codex`
et `.claude`, avec manifestes, mises à jour et tests de coexistence. Le cœur
`calm-gtm` reste responsable uniquement de la stratégie APOP, du plan d'action,
des assets approuvés et du suivi hebdomadaire.

## Prospection

La source Demaa conserve des invariants à généraliser : sources publiques,
preuve métier, identité légale, déduplication, opposition, journal, drafts et
approbation avant toute action externe. Aucun envoi automatique n'est permis.

La cible, le secteur, les preuves attendues, la marque, les messages, la limite
quotidienne et le fuseau deviennent des paramètres de projet. La configuration
Demaa reste une projection et ne définit pas le skill générique.

## Vidéo

Le skill vidéo doit séparer :

1. instructions et orchestration légères ;
2. runtime de rendu optionnel ;
3. pack de marque ;
4. sources et sorties du projet.

Le package standard ne doit pas embarquer les rendus et assets volumineux du
studio Demaa. Les chemins absolus, dépendances macOS ARM, polices, voix,
couleurs et répertoires de sortie deviennent portables ou configurables.

## Frontières

- aucun composant Academy ou runtime produit dans Calm ;
- aucune base, identité ou API commune entre applications ;
- aucune mutation externe sans autorisation au moment de l'action ;
- une PR Fondation, une PR Prospection et une PR Vidéo ;
- aucune release Calm avant validation des tests d'installation et des deux
  skills avec `quick_validate.sh` et des scénarios comportementaux réalistes.
