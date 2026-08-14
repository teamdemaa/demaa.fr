# Réseau de prestataires et opportunités

## Source de vérité

Firebase est la seule source de vérité en environnement configuré :

- `expertise_catalog/{expertiseId}` contient les 23 expertises publiques ;
- `expertise_placements/{placementId}` contient les 115 placements éditoriaux
  vers les systèmes métier ;
- `opportunities/{opportunityId}` contient les opportunités ouvertes, fermées ou en brouillon ;
- `lead_requests/{leadId}` reçoit les profils généraux et les manifestations d'intérêt ;
- chaque profil ou manifestation d'intérêt programme une notification Slack.

Le contrat des opportunités accepte six types : `mission`,
`sous-traitance`, `partenariat`, `reprise-transmission`, `collaboration` et
`autre`. `expertiseId` est facultatif. Les trois enregistrements historiques
sans type restent valides et sont lus comme des missions.

Les fichiers `*.snapshot.generated.json` sont des paquets d’amorçage versionnés pour les tests, le build local et la récupération contrôlée. Ils ne remplacent jamais silencieusement Firebase lorsque Firebase est configuré.

Les pages publiques attendent une requête avant de charger leurs données. En environnement déployé, l’absence de configuration Firebase provoque une erreur explicite : les snapshots ne sont jamais utilisés comme source publique de secours.

## Deux intentions dans une même surface

- `/opportunites` : opportunités actuellement disponibles, avec une fiche et
  un formulaire de manifestation d'intérêt ;
- `Rejoindre Team Demaa` est un lien simple sous le catalogue et ouvre une
  modale de présentation de profil avec une seule expertise principale choisie
  dans les 23 expertises canoniques ;
- `/rejoindre-team-demaa` redirige vers la vue Opportunités avec cette modale
  déjà ouverte ; il n'existe plus de page catalogue Team Demaa distincte ;
- le panneau embarquable charge les données publiques à son ouverture depuis
  `/api/opportunities`.

Les anciennes routes `/rejoindre-le-reseau`, `/partenaires` et `/opportunites-b2b` redirigent définitivement vers ces routes.
L’ancien dossier public `/opportunites/0034` redirige également vers le catalogue dynamique.

Les deux intentions réutilisent la même route sécurisée
`/api/provider-profile-submission`. Une manifestation d'intérêt est stockée
avec `requestType: opportunity_interest` et son `opportunityId`; un profil
permanent conserve `requestType: provider_profile_submission`.

## Gestion quotidienne

`/admin/opportunites` permet de créer, fermer ou rouvrir une opportunité avec la variable privée `OPPORTUNITIES_ADMIN_SECRET`. Cet écran ne gère ni matching ni publication automatique de prestataires.

Une carte placée dans un système représente une expertise générique, jamais une
personne. La sélection de la personne reste manuelle après réception du besoin.
Le registre initial place `Expert-comptable` dans 114 systèmes et `Délégation et
formalités juridiques` dans le cabinet comptable. Aucun de ces placements ne
déclare une relation de partenariat, d'affiliation, Demaa ou ODEMA.

## Import initial

1. Vérifier le plan sans écriture avec `npm run plan:provider-network-import`.
2. Relever l’empreinte exacte affichée.
3. Importer d’abord dans Firebase Preview avec le projet, l’empreinte et le drapeau d’application explicitement confirmés.
4. Vérifier les 23 expertises, les trois opportunités et les parcours complets.
5. Répéter en Production uniquement après un GO séparé.

L’import est create-only : il refuse d’écraser un document existant différent.
