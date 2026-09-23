# Parité Outils → Solutions — contrôle du 20 septembre 2026

Statut : aperçu uniquement. Ce contrôle ne valide pas la publication de la migration sur `demaa.fr`.

## Références comparées

- Site actuel : `https://demaa.fr/solutions/restaurant`, `/solutions/batiment`, `/solutions/cabinet-comptable`.
- Aperçu protégé vérifié : déploiement `dpl_5CRnQUmMkokC2eRnPYy4JRNnk96e` (`https://demaa-5tflqmobq-hiteamdemaa-2292s-projects.vercel.app`).
- Code du hub `/outils`, de la fiche `/solutions/[slug]`, du comparateur, des processus et du registre Firebase.
- Snapshot local D-091 : diagnostic de couverture, **pas** copie certaine du registre Firebase actif.
- Audit reproductible : `npm_config_cache=/private/tmp/codex-vercel-cache-20260920 node scripts/audit-live-solutions-parity.mjs --preview=https://demaa-5tflqmobq-hiteamdemaa-2292s-projects.vercel.app` ; 115 pages publiques et 115 pages de l'aperçu ont répondu.

## Résultat chiffré de la parité en ligne

| Mesure | Site actuel | Aperçu DEMAA |
| --- | ---: | ---: |
| Occurrences de cartes logiciel sur 115 métiers | 313 | 335 |
| Occurrences présentes sur l'actuel et absentes de l'aperçu | — | 0 |
| Accès comparateur perdus | — | 0 |
| Accès processus perdus | — | 0 |

Une occurrence désigne une carte sur un métier ; le même logiciel peut figurer dans plusieurs métiers. Les 22 occurrences supplémentaires de l'aperçu proviennent du lot pilote limité à l'environnement de prévisualisation ; elles ne sont pas activées en production par ce code. Le relevé compare l'HTML effectivement servi, et non seulement les données locales. Le premier aperçu montrait 32 cartes et perdait 303 occurrences : l'écart était dû à la nouvelle porte `publishedOnly` sur les logiciels déjà visibles sur l'ancien site. Cette porte a été rétablie à la règle historique **uniquement pour les logiciels** ; les autres catégories restent publiées/validées avant affichage.

## Parcours et éléments conservés

| Élément de l'ancien parcours | État dans la migration | Réserve |
| --- | --- | --- |
| Recherche et choix du métier | `/solutions` réutilise le hub ; ses secteurs ne sont plus filtrés. | Vérifier la totalité des métiers en recette navigateur. |
| Cartes d'outils, détail et lien éditeur | Composants réutilisés ; les 313 occurrences historiques sont retrouvées dans l'aperçu. | Les 22 ajouts pilotes restent propres à l'aperçu protégé. |
| Comparateur par métier | Route, modal et quatre boutons d'entrée historiques conservés. | Les ajouts pilotes ne sont pas intégrés à la table comparative du registre actif. |
| Processus métier | CTA conservé ; page `/systemes/[slug]/processus` répond 200 pour Bâtiment, avec impression/PDF et redirection des anciens paramètres `tab`/`resource`. | Vérifier chaque métier et le téléchargement PDF en recette. |
| Quotidien du dirigeant | Les huit liens du composant `LeaderDailyRail` sont présents sur la fiche Solutions. | Le rail reste volontairement horizontal. |
| Fournisseurs, financement, aides, réseaux | Les fournisseurs déjà présents dans l'annuaire public sont désormais reliés aux métiers par les recommandations existantes ; financement et aides restent composés. | Les placements Firebase fournisseurs/réseaux non approuvés ne sont pas réactivés en bloc. |
| Modèles et outils gratuits | Routes historiques `/modeles` et `/outils/...` conservées ; modèles liés à certains cours de l'Académie. | Leur découvrabilité depuis la nouvelle navigation reste à recetter. |
| Récapitulatif du système et ressources métier | Routes/composants conservés, notamment dans le plan d'action. | Ils ne sont plus des blocs de la fiche Solutions publique. |

## Écarts encore ouverts, avant toute mise en production

1. **Référencement encore à recetter.** Les fournisseurs de l'annuaire déjà public sont visibles par métier (Point.P et Kiloutou vérifiés sur Bâtiment, fiche Point.P accessible). Le snapshot Firebase contient en plus 125 placements fournisseurs sélectionnés (3 publiés, tous issus de l'ancien fournisseur exclu du rendu) et 90 placements réseaux sélectionnés (0 publié). Ces brouillons ne sont pas activés en bloc. Il reste à contrôler la pertinence des recommandations, les liens sortants et l'absence de revendication commerciale sur un échantillon de métiers avant publication.
2. **Lot pilote non comparable dans son intégralité.** Les anciens outils sont de nouveau reliés au comparateur, mais les 22 occurrences supplémentaires de l'aperçu ne figurent pas toutes dans la table calculée à partir du registre actif. Avant d'en faire une fonctionnalité publique, il faut valider les données comparatives et la cohérence des libellés.
3. **Parcours historiques encore accessibles mais moins visibles.** `/annuaire-outils`, les générateurs gratuits `/outils/...`, `/modeles` et `/systemes/[slug]/recapitulatif` existent toujours. Leur place définitive dans Académie/Solutions reste à confirmer par une recette de navigation, plutôt que de supprimer les routes.
4. **Migration SINI et domaines incomplète.** Les anciennes pages Reprendre/Vendre restent fonctionnelles pendant la transition. Ce contrôle n'atteste ni de la bascule du domaine DEMAA, ni du domaine futur de SINI.
5. **Validation éditoriale du dépôt.** Lint, TypeScript, 1 742 tests et build Vercel passent. `npm run check` s'arrête encore sur la règle de typographie des tirets longs dans le catalogue Méthodes historique et le HTML statique Studio ; ce contrôle doit être arbitré/corrigé avant une certification complète.

## Action faite ici

La rubrique « Outils et logiciels » reprend le même rail horizontal, les mêmes flèches et les mêmes cartes que les autres rubriques de Solutions. La page Solutions conserve les outils déjà publics, le comparateur et les processus ; elle relie aussi les fournisseurs de l'annuaire public via la sélection métier existante, sans ouvrir les brouillons du registre. Les pages DEMAA disposent désormais d'un pied de page Académie/Solutions/Spécialistes distinct des anciennes pages Reprendre/Vendre ; un contrôle du HTML confirme que l'ancien slogan n'est plus sérialisé sur Solutions.

## Porte de sortie

Ne pas promouvoir cet aperçu en production avant : (1) recette des fournisseurs de l'annuaire, décision éditoriale sur les réseaux et brouillons restants, (2) recette mobile, clavier, comparateur, processus/PDF, liens sortants et SEO, (3) clôture de l'archivage/bascule SINI et validation de la configuration des domaines, (4) résolution du contrôle éditorial du dépôt. La parité des outils historiques et le pied de page DEMAA sont désormais vérifiés.
