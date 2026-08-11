# ADR 0009 — Coaching et accès unifié à l’application

- Statut : accepted
- Date : 2026-08-11
- Supersède : les passages de l’ADR 0008 et de D-076 qui reportaient intégralement Coaching

## Décision

L’expérience connectée conserve une seule navigation : `Plan d’action`,
`Système`, `Académie`, `Coaching`. L’e-mail de connexion ouvre directement le
plan demandé après consommation sécurisée du lien à usage unique. Il ne doit
pas introduire une présentation concurrente « Espace membre ».

Il n’existe pas de second écran public `Mon espace` ou `Mes plans`. Après
connexion, la route technique de compte redirige vers le dernier plan sauvegardé
dans l’application, ou vers l’accueil de l’application lorsqu’aucun plan
n’existe. Les historiques restent conservés dans les données sans créer de
portail concurrent.

Coaching contient deux onglets : `Sessions` et `Messages`.

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
