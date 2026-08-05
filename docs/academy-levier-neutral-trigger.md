# Raccord Académie vers Levier

La nouvelle Académie ne doit pas ouvrir la modale Levier d’une fiche métier avec un
`systemSlug` inventé. Le parcours Levier actuel est volontairement lié à un système
opérationnel et conserve son attribution métier.

Tant qu’un déclencheur neutre n’existe pas, les cours qui recommandent Levier utilisent
le libellé explicite « Trouver mon système pour recevoir Levier » et renvoient vers le
catalogue des systèmes. Ce fallback ne prétend donc pas livrer Levier immédiatement.

Le futur point de raccord devra fournir un composant et un contrat serveur neutres qui :

- affichent la même prévisualisation Levier ;
- demandent uniquement l’adresse e-mail ;
- ne fabriquent aucun `systemSlug` ;
- conservent l’idempotence et le snapshot de ressource ;
- envoient le lien Google Sheets `/copy` sans l’exposer au client.

Ce raccord est hors du présent lot local Académie.
