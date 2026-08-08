# Réseau de prestataires et opportunités

## Source de vérité

Firebase est la seule source de vérité en environnement configuré :

- `expertise_catalog/{expertiseId}` contient les 23 expertises publiques ;
- `opportunities/{opportunityId}` contient les besoins ouverts, fermés ou en brouillon ;
- `lead_requests/{leadId}` reçoit les profils généraux et les candidatures ;
- chaque profil ou candidature programme une notification Slack.

Les fichiers `*.snapshot.generated.json` sont des paquets d’amorçage versionnés pour les tests, le build local et la récupération contrôlée. Ils ne remplacent jamais silencieusement Firebase lorsque Firebase est configuré.

Les pages publiques attendent une requête avant de charger leurs données. En environnement déployé, l’absence de configuration Firebase provoque une erreur explicite : les snapshots ne sont jamais utilisés comme source publique de secours.

## Deux parcours publics

- `/rejoindre-le-reseau` : inscription permanente d’un professionnel sur une à trois expertises ;
- `/opportunites` : besoins concrets et actuellement ouverts.

Les anciennes routes `/partenaires` et `/opportunites-b2b` redirigent définitivement vers ces routes.
L’ancien dossier public `/opportunites/0034` redirige également vers le catalogue dynamique.

Les deux parcours utilisent le même formulaire et la même route d’enregistrement : `/api/provider-profile-submission`.

## Gestion quotidienne

`/admin/opportunites` permet de créer, fermer ou rouvrir une opportunité avec la variable privée `OPPORTUNITIES_ADMIN_SECRET`. Cet écran ne gère ni matching ni publication automatique de prestataires.

Le placement dans un système métier reste manuel : une carte représente une expertise générique, jamais une personne. Demaa choisit ensuite le professionnel pertinent après réception du besoin.

## Import initial

1. Vérifier le plan sans écriture avec `npm run plan:provider-network-import`.
2. Relever l’empreinte exacte affichée.
3. Importer d’abord dans Firebase Preview avec le projet, l’empreinte et le drapeau d’application explicitement confirmés.
4. Vérifier les 23 expertises, les trois opportunités et les parcours complets.
5. Répéter en Production uniquement après un GO séparé.

L’import est create-only : il refuse d’écraser un document existant différent.
