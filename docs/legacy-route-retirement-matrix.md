# Matrice de retrait des routes historiques

Cette matrice applique l'ADR 0003. Elle distingue les redirections utiles des
vraies URL retirées. Les redirections sont permanentes (`308`) et conservent
la query string.

## Modèles et Ressources

| URL historique | Résultat canonique | Motif |
| --- | --- | --- |
| `/modeles-de-documents` | `308` vers `/academie` | L'Académie est le hub global des contenus ; les modèles contextualisés restent dans Ressources. |
| `/modeles-de-documents/tableau-de-pilotage-:slug` | `308` vers `/kit-operationnel/:slug?tab=resources` | La ressource est désormais attachée au système concerné. |
| `/modeles-de-documents/suivi-previsionnel-financier` | `308` vers `/academie/piloter-sa-tresorerie` | Le cours Trésorerie est le successeur pédagogique global ; le modèle reste disponible dans les Ressources des systèmes. |
| `/modeles-de-documents/pilotage-marketing-vente` | `308` vers `/academie/construire-systeme-marketing-vente` | Le cours Marketing & Vente porte désormais le contenu et son action associée. |
| `/modeles-de-documents/systeme-operationnel` | `308` vers `/academie/construire-systeme-marketing-vente` | Ancien alias du modèle Marketing & Vente. |
| `/modeles-de-documents/:slug` inconnu | `404` + `noindex, nofollow` | Aucun successeur fiable ne doit être inventé. |
| `/ressources` | `308` vers `/academie` | L'ancien hub global est remplacé par l'Académie ; Ressources reste contextualisé dans chaque système. |
| `/ressources/obligations-tpe` | `308` vers `/systemes` | La présentation universelle est retirée des Ressources ; le hub Systèmes reste le successeur public le plus proche. |
| `/ressources/obligations-tpe-template` | `308` vers `/systemes` | Même ancien contenu, sans maintenir une route pédagogique obsolète. |
| `/ressources/previsionnel-financier` | `308` vers `/academie/piloter-sa-tresorerie` | Successeur pédagogique canonique. |
| `/ressources/suivi-previsionnel-financier-template` | `308` vers `/academie/piloter-sa-tresorerie` | Même intention, ancien alias de téléchargement. |
| `/ressources/systeme-operationnel-airtable` | `308` vers `/academie/construire-systeme-marketing-vente` | Successeur pédagogique canonique. |
| `/ressources/systeme-operationnel-template` | `308` vers `/academie/construire-systeme-marketing-vente` | Même intention, ancien alias de téléchargement. |
| `/ressources/:slug` inconnu | `404` + `noindex, nofollow` | Aucun successeur fiable ne doit être inventé. |

## Opportunités

| URL historique | Résultat canonique | Motif |
| --- | --- | --- |
| `/opportunites-b2b` | `308` vers `/opportunites` | Le catalogue dynamique remplace l'ancien libellé. |
| `/opportunites/0034` | `308` vers `/opportunites` | L'opportunité de démonstration est remplacée par le catalogue dynamique. |

## Compatibilité conservée hors de ce retrait

| Surface | Contrat préservé |
| --- | --- |
| `/api/systeme-kit/request` | Livraison idempotente et résolution serveur des révisions historiques. |
| `/api/systeme-kit/open/:resourceSlug` | Ouverture des ressources autorisées sans exposer leur destination privée dans le navigateur. |
| `modeles` et `modeles-de-documents` en paramètre d'onglet | Alias de compatibilité vers `resources` sur une fiche Système. |
| anciens domaines Demaa | Première redirection vers la même URL sur `https://demaa.co`, chemin et query conservés. |

## Routes explicitement hors lot

- `/services` et `/services/[slug]` ;
- `/sur-mesure` ;
- `/cours` et `/cours/[slug]` ;
- `/academie` et `/academie/[slug]` ;
- les annuaires et outils publics.

Leur maintien ou leur retrait exige une décision séparée.
