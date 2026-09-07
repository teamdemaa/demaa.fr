# Mon entreprise — réalisation du modèle Notion

## État d’exécution

- Le connecteur et l’interface donnent bien accès au même espace Notion : « Notion de Oumou GORY ». **Team Demaa est un espace d’équipe de cet espace de travail**, pas un second workspace incompatible.
- Le modèle a été créé dans Team Demaa, sous `Demaa`, à l’adresse privée `https://app.notion.com/p/Mon-entreprise-mod-le-Notion-3d307d787523816a992ae53bae65f80d`.
- L’accueil, les quatre espaces métier, les six bases canoniques, leurs relations, les vues liées et les trames réutilisables sont créés. Aucune donnée réelle, échéance réelle ni lien privé n’a été ajouté.
- Une copie complète a été testée : ses vues et relations visent bien les bases de la copie, pas celles du modèle source. La copie de test a été renommée puis déplacée dans `Archives — Demaa (ancienne structure)`.
- La carte « Pilotage simple de son entreprise dans Notion » et les onglets `Guides` / `Modèles` sont préparés et vérifiés dans l’application Demaa avec l’URL publique canonique.
- La page est publiée à l’adresse `https://lead-yew-beb.notion.site/Mon-entreprise-mod-le-Notion-3d307d787523816a992ae53bae65f80d`. L’option « Dupliquer et créer un modèle » est activée et l’indexation par les moteurs de recherche reste désactivée.
- Le générateur Drive, son aperçu et les explications du catalogue ont aussi été mis à jour localement. Aucune arborescence n’a été créée dans un Drive réel pendant ces tests. Aucun modèle Airtable global supplémentaire n’est nécessaire.

## Structure réalisée

L’accueil « Mon entreprise » présente quatre accès de navigation, une vue liée des prochaines tâches et trois raccourcis à renseigner : Drive, facturation, outil métier. Aucune donnée réelle ni lien privé Demaa n’entre dans le modèle destiné à être dupliqué.

1. **Pilotage** : Le cap de l’entreprise, Objectifs de l’année, Indicateurs utiles, Décisions importantes.
2. **Tâches en cours** : tableau À faire / En cours / En attente / Terminé ; vues Mes tâches, Cette semaine, Toutes les tâches.
3. **Réunions** : liste chronologique, calendrier seulement si utile, trame réutilisable.
4. **Comment on travaille** : galerie Rôles, Procédures et checklists, Outils et liens utiles.

Le cap précède les objectifs : qui servons-nous, quel problème résolvons-nous, pourquoi nous choisir, quels choix faisons-nous cette année ? Il reste dans une courte page, sans base stratégique supplémentaire.

## Bases canoniques et propriétés

Les six bases sont regroupées sous une page technique « Bases du modèle », puis réutilisées sous forme de vues liées dans les quatre espaces et sur l’accueil. Elles ne sont pas dupliquées pour chaque vue.

| Base | Propriétés minimales | Présentation |
| --- | --- | --- |
| Tâches | Tâche (titre), Statut, Responsable (personne), Échéance (date), Objectif (relation facultative), Réunion (relation facultative) | Kanban par statut ; listes personnelles et hebdomadaires |
| Objectifs | Objectif (titre), Résultat attendu (texte), Responsable (personne), Échéance (date), Statut | Galerie filtrée dynamiquement sur l’année de l’échéance |
| Indicateurs | Indicateur (titre), Valeur actuelle (texte), Cible (texte facultatif), Dernière mise à jour (date), Source (URL) | Tableau court avec date et source visibles |
| Réunions | Réunion (titre), Date (date), Participants (texte) | Liste chronologique ; calendrier facultatif |
| Décisions | Décision (titre), Date (date), Responsable (personne), Réunion (relation facultative), Objectif (relation facultative) | Liste du plus récent au plus ancien |
| Documentation | Fiche (titre), Type (Rôle / Procédure / Outil), Responsable (personne), Dernière revue (date), Lien utile (URL) | Galerie filtrable par type |

Pour les indicateurs, conserver une seule ligne courante par KPI. Notion affiche la valeur utile à la décision, sa date de mise à jour et le lien vers la source ; l’historique reste dans l’outil source. Ne pas transformer Notion en entrepôt de mesures, présenter d’anciennes valeurs comme actuelles ni inventer de graphique sans données.

Les vues « Mes tâches » filtrent sur l’utilisateur courant, pas sur le créateur du modèle. La vue « Cette semaine » exclut les tâches terminées ; prévoir aussi un accès clair aux retards, sans cacher les tâches sans date dans Toutes les tâches. Les tâches déjà suivies dans l’outil métier n’y sont pas ressaisies.

## Contenu des trames réutilisables

### Réunion

- Objectif de la réunion.
- Points à aborder.
- Notes utiles.
- Décisions : liens vers les fiches de la base Décisions.
- Actions : vue ou liens vers les tâches canoniques, avec responsable et échéance.

### Décision

- Contexte et problème à trancher.
- Choix retenu et raison.
- Conséquence attendue.
- Date de réexamen si nécessaire.

### Procédure

- Quand l’utiliser et qui s’en occupe.
- Étapes sous forme de checklist.
- Résultat attendu ou contrôle final.
- Lien vers l’outil ou le fichier de référence, sans recopier son contenu.

### Rôle

- Mission et responsabilités.
- Décisions que la personne peut prendre.
- Interlocuteurs et ressources utiles.

### Outil

- À quoi il sert et qui l’utilise.
- Lien d’accès et personne référente.
- Où se trouve l’aide ; jamais de mot de passe ou de clé d’accès dans cette fiche.

Les trames sont matérialisées par des fiches `MODÈLE — …` faciles à dupliquer dans leurs bases. Elles ne sont pas présentées comme des modèles natifs de base de données : la transformation éventuelle en modèles natifs depuis l’interface Notion reste une amélioration facultative.

## Réalisation et recette

1. Identité du connecteur et emplacement Team Demaa vérifiés.
2. Quatre espaces et page technique construits.
3. Six bases, relations et vues liées créées puis relues.
4. Trames ajoutées sans affectation à de vraies personnes.
5. Accueil et guide « Commencer ici » construits.
6. Copie complète testée ; bases et relations de la copie indépendantes de l’original.
7. Partage public activé après confirmation finale ; duplication publique et désactivation de l’indexation vérifiées.
8. Carte Notion et navigation `Guides` / `Modèles` ajoutées localement au catalogue Demaa.

## Vérifications locales Drive réalisées

- 35 tests ciblés réussis : arborescence, dossiers à la demande, sélection solo/équipe, catalogue, routes, périmètre OAuth, création simulée et nettoyage après échec.
- Suite complète : 298 fichiers et 1 673 tests réussis. Les quatre timeouts observés lors d’une première exécution concurrente avec ESLint ont tous disparu lors de la relance isolée, sans modifier les tests ni leurs seuils.
- ESLint, TypeScript et build Next.js de production : réussis ; 497 pages générées. Le build conserve un avertissement préexistant concernant `metadataBase`.
- Navigateur : page rendue sans erreur console, cases fonctionnelles, exercice comptable modifiable, année invalide bloquée, résumé cohérent lorsque Finance est désélectionné, erreurs de création visuellement distinctes et aucun débordement horizontal à largeur mobile.
- Le parcours OAuth Google réel et la création de dossiers dans un compte utilisateur ne sont pas validés par ces tests simulés.

## Vérifications locales Notion et application réalisées

- Modèle Notion relu dans l’interface : bon emplacement Team Demaa, quatre espaces, six bases et vues liées accessibles.
- Test de duplication réussi et copie de recette archivée.
- TypeScript et ESLint : réussis.
- 18 tests ciblés du catalogue, des routes et de la page Organisation : réussis.
- Suite complète : 297 fichiers réussis pendant l’exécution groupée ; l’unique test Firebase ayant dépassé son délai de 10 secondes passe isolément avec ses 6 assertions. Au total, les 298 fichiers et 1 673 tests sont validés.
- Build Next.js de production : réussi, y compris la génération de la nouvelle route Notion parmi 499 pages. L’avertissement préexistant sur `metadataBase` demeure sans lien avec ce modèle.
- Navigateur : `Guides` actif par défaut, `Modèles` accessible au clic et au clavier, carte Notion visible une seule fois, aucun overlay d’erreur, aucune erreur console instrumentée et aucun débordement horizontal.
- Publication publique : réponse HTTP 200 vérifiée sans session applicative. L’option de duplication est activée dans les réglages du site Notion.
