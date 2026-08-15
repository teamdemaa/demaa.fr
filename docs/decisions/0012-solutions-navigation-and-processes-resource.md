# ADR 0012 — Solutions dans la navigation et ressource Processus métier

- Statut : `validated`
- Date : 2026-08-15
- Supersède : la composition de navigation et les sous-onglets locaux de
  l’ADR 0010

## Décision

La navigation principale de l’application suit l’ordre `Plan d’action`,
`Solutions`, `Académie`, `Opportunités`. Elle conserve ses icônes et sa ligne de
focus. `Opportunités` est volontairement placée en dernier : elle constitue une
surface de découverte distincte du parcours principal qui va du plan vers les
solutions puis l’apprentissage.

`Plan d’action` affiche directement les Actions. Les sous-onglets locaux
`Actions / Solutions` sont supprimés. `Solutions` devient une vue principale
accessible avant et après connexion, sans modifier les routes publiques
`/systemes`.

La vue Solutions conserve le sélecteur du Système métier, puis affiche dans cet
ordre : `Outils`, `Accompagnement`, `Ressources`. Elle réutilise les mêmes
données, sélections et modales ; aucun nouveau catalogue n’est créé.

Dans Ressources, la première carte devient `Processus métier`. Elle ouvre la
route imprimable `/systemes/[slug]/processus`, qui contient uniquement les
processus publiés pour ce métier. Elle ne répète pas les Outils,
Accompagnements ou autres Ressources. L’ancien récapitulatif complet et sa
révision restent résolubles uniquement pour garantir les liens historiques
déjà envoyés.

## Compatibilité

Les entrées historiques `view=system` et
`view=plan&planTab=solutions` sont acceptées et normalisées vers
`view=solutions`. Les paramètres sûrs `system`, `systemTab` et `resource` sont
conservés. La connexion et le retour vers un plan sauvegardé conservent cette
vue et ce contexte.

## Hors périmètre

- changement du catalogue de prestations ou d’outils ;
- changement de l’API Systèmes ;
- suppression de l’ancien récapitulatif ou des livraisons historiques ;
- nouveau stockage ou nouveau mécanisme de paiement.
