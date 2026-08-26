# ADR 0023 — Organiser : bibliothèque de processus pour les TPE

- Décision : D-099
- Statut : validé localement
- Date : 25 août 2026
- Supersède : libellé et direction éditoriale française de D-096 / ADR 0021

## Contexte

Le libellé `Structurer` et les anciens tutoriels d’acquisition ne correspondent
plus à la direction retenue. La promesse publique vise désormais le
fonctionnement concret d’une entreprise : demandes, devis, interventions,
chantiers, documents, stocks, validations et facturation.

## Décision

La destination française visible s’appelle `Organiser`. La navigation
principale est `Solutions · Application métier · Organiser`. `Solutions` est
une destination autonome : le dirigeant choisit son activité, puis voit les
outils, ressources et partenaires adaptés à ce métier. `Application métier`
présente l’accompagnement et des cas réalisés. `Organiser` ouvre directement la
bibliothèque éditoriale de processus, sans sous-navigation locale.

La route publique canonique devient `/organiser`. Le socle technique conserve
les identifiants `academy`, les API, caches et progressions. `/academie`,
`/academy` et `/cours` redirigent de manière permanente vers la nouvelle route.
L’anglais reste `Academy` et n’est pas redéfini par cette décision.

L’index français publie uniquement les nouveaux guides de processus. Les
anciennes formations et les anciens tutoriels d’acquisition restent conservés
mais ne sont plus présentés dans la grille publique. Leurs routes restent
accessibles pour les liens et progressions historiques, avec `noindex`, et ne
sont plus envoyées dans le sitemap.

Chaque guide utilise une source structurée unique comprenant six étapes. Cette
source alimente la miniature, le process map de l’article et les explications
détaillées. Chaque étape impose une entrée, une action, un responsable, une
sortie et un contrôle. Une image Open Graph et X reprend uniquement le même
process map. Cette image est aussi déclarée comme image de l’article dans le
JSON-LD via la route stable `/organiser/[slug]/process-map.png`. Le pilote
canonique est l’organisation d’une entreprise de plomberie, de la demande à la
facture.

La route racine ouvre `Solutions` par défaut. Un CTA depuis une action, un
article ou une fiche système ouvre `/solutions/[métier]`, avec le métier déjà
sélectionné. Les anciennes URL `view=solutions`, `view=system`,
`view=plan&section=solutions` et `/organiser?tab=solutions` restent compatibles
par redirection.

La collection contient quatorze guides : huit processus organisés par activité
et six réponses à des problèmes transversaux de centralisation, planning,
ressaisie, choix de logiciel et rentabilité d’une application métier.

Dans la grille, le bloc texte des cartes est volontairement secondaire : taille
réduite de 20 %, opacité de 59 % et métadonnée courte
`Process · [métier] · [durée] min`. Les libellés du process map conservent leur
contraste normal.

## Gates

- aucun ancien tutoriel d’acquisition ne revient dans l’index ;
- `Solutions` est la première entrée de navigation et la destination par défaut ;
- `Application métier` est la deuxième entrée et `Organiser` la troisième ;
- aucun onglet local ne mélange Solutions et Processus dans `Organiser` ;
- aucune formation masquée n’est republiée ;
- les six étapes restent identiques entre carte et article ;
- le processus reste lisible sur mobile et desktop ;
- les fiches outils sont des liens vers le répertoire canonique ;
- le CTA final utilise `Voir les solutions [métier]` ;
- les routes historiques restent compatibles ;
- les routes historiques sont absentes du sitemap et portent `noindex` ;
- chaque guide contient entre 900 et 1 200 mots utiles et une revue d'au moins
  17/20 ;
- la recette éditoriale suit `docs/organiser-process-article-standard.md`.

## Recette du 25 août 2026

Les quatorze routes ont été générées par la compilation de production. L’index,
le pilote plomberie, le process map desktop et sa version mobile ont été
contrôlés visuellement. La navigation affiche
`Solutions · Application métier · Organiser` ; les tests ciblés, le lint et la
compilation de production font partie de la recette obligatoire.
