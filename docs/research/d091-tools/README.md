# D-091 — Mode opératoire de curation des Solutions

Ce dossier contient des sources de recherche. Il ne constitue jamais une source
runtime et ne doit jamais déplacer le pointeur Firebase actif.

## Principe

Le nombre de cartes est un résultat de la revue, pas une cible. Une Solution est
retenue si elle couvre un besoin prioritaire du métier, possède une preuve
officielle encore valable, expose une contrainte réelle et apporte quelque
chose que les autres cartes ne couvrent pas déjà suffisamment.

Les cartes et rails existants sont conservés. Aucun badge, score visible ou
module d'aide au choix n'est ajouté.

## Sources d'autorité

| Rubrique | Identité et contenu | Sélection actuelle | Cible d'autorité |
| --- | --- | --- | --- |
| Outils | `tool-directory.json` | placements `software` de la révision Firebase | même révision Firebase, après revue |
| Fournisseurs | ressources et placements Firebase | placements `providers` publiés | même révision Firebase |
| Réseaux | ressources et placements Firebase | placements `networks` publiés | même révision Firebase |
| Financement | `finance-catalog.ts` | `finance-recommendations.ts` | catalogue dédié + sélection explicite revue |
| Aides | `aid-catalog.ts` | `aid-recommendations.ts` | catalogue dédié + éligibilité plausible et validité |
| Services | catalogue canonique Demaa | destination Services et recommandations contextuelles strictes | hors D-091 |
| Ressources | catalogue des ressources système | règles métier existantes | hors quota D-091 |

Outils, Fournisseurs et Réseaux partagent le registre Firebase, mais pas une
liste ni un quota. Financement et Aides restent des domaines dédiés : les forcer
dans Firebase maintenant créerait une migration sans bénéfice utilisateur.

## Gates communs

- identifiant canonique existant ;
- source officielle sûre et datée ;
- statut actif et publication fail-closed ;
- justification propre au système métier ;
- contrainte ou prérequis factuel ;
- absence de doublon ;
- rangs continus de 1 à N ;
- relecture contradictoire ;
- Preview avant toute activation.

## Gates propres aux rubriques

- **Outils** : couverture des besoins opérationnels prioritaires et composition
  complémentaire ; aucun outil ajouté pour remplir la liste.
- **Fournisseurs** : relation réellement disponible, zone desservie, capacité
  et mode de mise en relation vérifiés.
- **Financement** : besoin de financement cohérent avec le métier et le cycle
  d'exploitation ; aucun fallback générique présenté comme recommandation.
- **Aides** : éligibilité seulement plausible, autorité publique, période et
  conditions à jour ; la carte ne promet jamais l'obtention.
- **Réseaux** : audience, territoire, conditions d'accès et activité du réseau
  vérifiés.

## Pilote

`pilot-selections.v2.json` conserve les cinq pools initiaux.
`pilot-reviewed-selections.v1.json` contient leur seconde revue à volume
variable, avec ordre, besoin, usage, contrainte et preuve officielle. Aucun
remplacement n'est obligatoire lorsqu'un candidat est retiré.

Le gate pilote audite ces cinq systèmes dans une **révision candidate complète
des 115 systèmes**. Il n'accepte pas une mini-révision incompatible avec le
pointeur global. Le gate final audite ensuite les 115 systèmes.

## Activation

1. figer l'export actif et son fingerprint ;
2. créer une révision candidate complète sans modifier l'active ;
3. auditer les pilotes et le reste du catalogue avec le manifeste de besoins
   revu correspondant ;
4. recetter API, interface, pages publiques, HTML et JSON-LD sur Preview ;
5. faire valider la composition ;
6. déplacer le pointeur uniquement après un GO PROD explicite ;
7. conserver le snapshot précédent pour rollback.
