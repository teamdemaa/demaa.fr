# ADR 0010 — Plan vierge, Opportunités et navigation de l’application

- Statut : `validated`
- Date : 2026-08-11
- Mise à jour : 2026-08-14, Solutions intégré au Plan et URLs normalisées
- Supersède : la composition de navigation de l’ADR 0009 et les passages de
  l’ADR 0008 qui imposaient un résultat IA avant l’accès à l’application

## Décision

L’application conserve une seule navigation visuelle : `Plan d’action`,
`Opportunités`, `Académie`. Sur mobile, cette navigation reste fixée en bas.
Cette navigation est visible et utilisable dès la première arrivée, avant toute
génération et sans compte. `Plan d’action` affiche alors le grand champ libre ;
ses sous-onglets `Actions` et `Solutions`, ainsi que `Opportunités` et
`Académie`, restent consultables immédiatement. Le sous-onglet `Solutions`
ouvre uniquement les recommandations du Système métier sélectionné.
L'application n'y affiche plus d'onglets Organisation ou
Ressources : les routines et modèles pertinents sont proposés directement dans
le détail d'une Action. Les fiches publiques `/systemes/[slug]` conservent
leurs trois espaces `Organisation / Solutions / Ressources`. Les anciennes
URLs applicatives `view=system` restent acceptées. Les nouveaux liens sont
normalisés en `view=plan&planTab=solutions` et transportent, lorsqu'ils sont
présents, `system`, `systemTab` et `resource`. Les slugs Système et les routes
publiques `/systemes` restent stables. Les choix
effectués dans cet espace restent uniquement en mémoire tant qu'aucun plan
n'est volontairement enregistré.
Coaching demeure dans la même application, mais s’ouvre depuis l’action
compacte `Parler à un spécialiste` du header. Cette surface est une
conversation simple sans onglets commerciaux ; la carte Coach business reste
dans Services conformément à l’ADR 0009.

La sauvegarde est une action contextuelle du Plan d’action et n’encombre pas le
header global. `Enregistrer` apparaît avec `Partager` et le menu contenant
`Nouveau plan`. Pour une personne connectée, les modifications sont
persistées sans redemander son e-mail.

Cette règle s'applique à toutes les actions fonctionnelles de l'application :
une personne connectée ne ressaisit pas son adresse dans un guide métier, une
Opportunité, Coaching, une inscription ou une demande. L'API déduit l'e-mail
de la session vérifiée. Pour une personne non connectée, l'action ouvre le
parcours de lien magique puis reprend l'intention exacte dans l'application.
Le lien magique ne mène jamais vers un portail distinct `Mon espace` ou
`Mes plans`.

Sous le champ principal, `Commencer avec un plan vierge` permet d’entrer dans
l’application sans appel IA. Le plan manuel accepte temporairement zéro action,
une stratégie vide et aucun Système sélectionné. Le Système est choisi
explicitement parmi les 115 activités. Aucune donnée vide n’est persistée avant
une action de sauvegarde.

Opportunités reste accessible publiquement et dans l’application. La rubrique
n’est pas limitée au freelance : elle peut présenter une mission, de la
sous-traitance, un partenariat, une reprise ou transmission d’entreprise, une
collaboration ou une autre opportunité professionnelle. La copie publique est :

> Découvrez les opportunités actuellement disponibles.

Une réponse à une opportunité précise est enregistrée dans `lead_requests` avec
son `opportunityId`. `Rejoindre Team Demaa` reste le parcours permanent de
présentation de profil, dans le même pipeline, sans `opportunityId`. Les
collections `expertise_catalog`, `opportunities` et `lead_requests` restent les
sources canoniques ; aucun catalogue ou stockage parallèle n’est créé.

Un bouton `+` compact près de la recherche permet aussi de proposer une
Opportunité. La personne remplit le formulaire avant connexion. Au clic sur
Envoyer, un brouillon serveur opaque conserve exactement les champs, puis la
session Google ou lien magique reprend et soumet automatiquement le brouillon.
Le document est créé dans `opportunities` avec le statut `draft` et ne devient
public qu'après l'action explicite de l'administration.

Le nom de l’organisation à l’origine d’une opportunité n’est pas affiché dans
cette version. Un futur champ facultatif pourra être décidé séparément.

## Sauvegarde invitée

Le clic manuel sur `Enregistrer` ouvre `Enregistrer mon plan`. Le navigateur ne
reçoit plus le secret de rattachement historique. Un jeton opaque limité au
plan est placé dans un cookie HttpOnly, SameSite Lax et Secure hors
développement ; seul son hash est stocké. Le lien magique reste temporaire et à
usage unique, puis crée la session normale et ouvre directement le plan dans
l’application. Les anciens liens restent compatibles pendant leur validité.

## Hors périmètre

- nom ou logo de l’organisation dans les cartes Opportunités ;
- paiement ou agenda automatique du Coaching ;
- place de marché et publication automatique de profils ;
- glisser-déposer Kanban, notifications ou collaboration multi-utilisateur ;
- comptes possédant plusieurs entreprises, sélecteur d'entreprise et
  progression partagée à l'échelle d'une entreprise ;
- recherche web ou étude de marché automatique.
