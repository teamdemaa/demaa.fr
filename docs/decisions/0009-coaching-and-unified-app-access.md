# ADR 0009 — Coaching et accès unifié à l’application

- Statut : `validated`
- Date : 2026-08-11
- Supersède : les passages de l’ADR 0008 et de D-076 qui reportaient intégralement Coaching

## Décision

La composition de navigation décrite initialement par cette ADR est supersédée
par l'ADR 0010. La navigation active est `Plan d’action`, `Système`, `Académie`,
`Opportunités` ; Coaching s'ouvre depuis l'action compacte
`Parler à un spécialiste`. L’e-mail de connexion ouvre directement le plan ou
l'intention demandée après consommation sécurisée du lien à usage unique. Il
ne doit pas introduire une présentation concurrente « Espace membre ».

Il n’existe pas de second écran public `Mon espace` ou `Mes plans`. Après
connexion, `/plans` redirige vers le dernier plan sauvegardé dans l’application,
ou vers l’accueil lorsqu’aucun plan n’existe. L’ancienne route `/mon-espace`
est uniquement conservée comme redirection de compatibilité vers `/plans`.
Les historiques restent conservés dans les données sans créer de portail
concurrent.

Coaching contient deux onglets : `Sessions` et `Messages`.

`Coaching` est le nom du produit. Tous les libellés qui désignent la personne
emploient `spécialiste`, notamment `Parler à un spécialiste` et
`Écrire à un spécialiste`. L'interface ne parle pas de `coach` ni de
`votre coach`.

- Session de pilotage : 60 minutes par téléphone, 150 EUR HT, soit 180 EUR TTC
  si la TVA française à 20 % s’applique.
- Parcours de pilotage : trois sessions de 60 minutes, valables trois mois,
  avec le même spécialiste, 400 EUR HT, soit 480 EUR TTC si la TVA française à
  20 % s’applique.
- Échange préalable : 15 minutes offertes par téléphone. Il sert à faire
  connaissance et vérifier l’adéquation ; il ne constitue pas une séance de
  coaching.

Les demandes sont coordonnées manuellement. Aucun paiement, agenda automatique
ou promesse de disponibilité n’est ajouté sans une décision ultérieure.
Messages est asynchrone. La dictée transforme la voix en texte relisible avant
envoi ; aucun enregistrement audio n’est conservé dans cette version.

## Sécurité du lien magique

Le lien e-mail reste temporaire et à usage unique. Sa consommation demeure une
requête POST déclenchée dans le navigateur : le jeton n’est pas consommé en GET,
afin que les scanners de liens des messageries ne puissent pas l’invalider avant
le clic de l’utilisateur. Le cookie de session persiste ensuite jusqu’à son
expiration ou sa suppression.

L'adresse vérifiée par ce lien devient l'identité e-mail de la session. Les
formulaires de l'application la récupèrent côté serveur et ne la redemandent
pas. Si une action nécessitant une identité est déclenchée sans session, le
parcours de lien magique conserve une intention autorisée et ramène directement
à cette action après connexion, sans écran `Mon espace` ou `Mes plans`.
