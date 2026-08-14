# ADR 0009 — Coaching et accès unifié à l’application

- Statut : `validated`
- Date : 2026-08-11
- Mise à jour : 2026-08-14, entrée `Échanger`, détail Clarté et Coach business dans Services
- Supersède : les passages de l’ADR 0008 et de D-076 qui reportaient intégralement Coaching

## Décision

La composition de navigation décrite initialement par cette ADR est supersédée
par l'ADR 0010. La navigation active est `Plan d’action`, `Opportunités`,
`Académie` ; Coaching s'ouvre depuis l'action compacte `Échanger`. L’e-mail de connexion ouvre directement le plan ou
l'intention demandée après consommation sécurisée du lien à usage unique. Il
ne doit pas introduire une présentation concurrente « Espace membre ».

Il n’existe pas de second écran public `Mon espace` ou `Mes plans`. Après
connexion, `/plans` redirige vers le dernier plan sauvegardé dans l’application,
ou vers une nouvelle situation vierge explicitement identifiée lorsqu’aucun
plan n’existe. Une session connectée qui ouvre la racine sans intention
explicite passe par `/plans` ; `/?new=1` reste l’entrée volontaire pour repartir
avec un plan vierge. L’ancienne route `/mon-espace`
est uniquement conservée comme redirection de compatibilité vers `/plans`.
Les historiques restent conservés dans les données sans créer de portail
concurrent.

Le produit accessible par `Échanger` est une conversation
simple écrite ou dictée. Il n'affiche aucun onglet `Sessions` ou `Formules`.

Tous les libellés qui désignent la personne emploient `spécialiste`, notamment
le titre `Échanger avec un spécialiste`. Le mot `coach` est réservé à la carte distincte
`Coach business` présentée dans Services.

- `Clarté` : 149 EUR HT par mois, questions écrites ou vocales, réponse d'un
  spécialiste sous 24 à 48 heures ouvrées, second regard et prochaine étape
  concrète. Le résumé Clarté ouvre un détail qui présente aussi l'équipe Demaa
  mobilisable selon le besoin, les mises en relation facilitées, 15 % de
  réduction sur les autres offres Demaa et la mise en avant prioritaire du
  profil pour les opportunités correspondant à son expertise.
- `Coach business` : une seule carte conforme au design Services, avec matching
  guidé et sélecteur interne. Une session individuelle de 60 minutes par mois
  coûte 350 EUR HT par mois ; deux sessions individuelles de 60 minutes par
  mois coûtent 550 EUR HT par mois. Le CTA est `Être rappelé(e)`. Le coach aide
  le dirigeant à clarifier le cap, prioriser son plan d'action et organiser
  l'exécution ; le dirigeant reste aux commandes.

Il n'existe ni carte distincte `Pilotage rapproché`, ni session ponctuelle à
150 EUR, ni parcours historique à 400 EUR. Les montants TTC ne sont pas affichés
dans cette interface.

Les CTA recueillent une intention et les demandes sont coordonnées manuellement.
Aucun abonnement, paiement ou agenda automatique n'est déclenché dans cette
version. L'activation d'un paiement récurrent exige une décision et une recette
distinctes.
La conversation est asynchrone. La dictée transforme la voix en texte relisible avant
envoi et affiche la transcription intermédiaire directement dans le champ ;
aucun enregistrement audio n’est conservé dans cette version. Les messages du dirigeant et les
réponses du spécialiste restent visibles dans un historique chronologique lié
à l’adresse e-mail vérifiée. Slack reste une alerte opérationnelle et ne devient
pas une seconde source de vérité de la conversation.

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
Lorsqu'un plan existe seulement dans la page, l'ouverture de Messages prépare
d'abord sa sauvegarde temporaire et le lien revient sur l'URL canonique de ce
plan, avec l'intention Coaching. Le plan ne doit jamais être remplacé par un
écran vierge au retour du lien.

La durée et les limites d'un éventuel essai Clarté restent à arbitrer. Aucune
promesse d'essai gratuit n'est publiée avant cette décision.
