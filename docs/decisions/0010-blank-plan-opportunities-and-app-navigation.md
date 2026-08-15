# ADR 0010 — Plan vierge, Opportunités et navigation de l’application

- Statut : `validated`
- Date : 2026-08-11
- Mise à jour : 2026-08-14, hiérarchie visuelle, compte progressif et sauvegarde automatique
- Supersède : la composition de navigation de l’ADR 0009 et les passages de
  l’ADR 0008 qui imposaient un résultat IA avant l’accès à l’application
- Supersédé partiellement : la composition de navigation et les sous-onglets
  locaux sont remplacés par l’ADR 0012 ; les autres décisions restent actives

## Décision

L’application conserve une seule navigation visuelle : `Plan d’action`,
`Opportunités`, `Académie`. Sur mobile, cette navigation reste fixée en bas.
Cette navigation est visible et utilisable dès la première arrivée, avant toute
génération et sans compte. `Plan d’action` affiche alors le grand champ libre ;
ses sous-onglets `Actions` et `Solutions`, ainsi que `Opportunités` et
`Académie`, restent consultables immédiatement. Le sous-onglet `Solutions`
ouvre uniquement les recommandations du Système métier sélectionné.
La navigation principale conserve ses icônes mais n'est plus enfermée dans une
grande capsule. Les sous-onglets `Actions` et `Solutions` n'ont pas d'icône et
forment une capsule locale distincte. Dans le header,
`Connexion` est un lien texte et non un bouton en forme de pilule.
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
compacte `Échanger` du header, y compris avant la génération d'un plan. Cette surface est une
conversation simple sans onglets commerciaux ; la carte Coach business reste
dans Services conformément à l’ADR 0009.

La sauvegarde est automatique et n'encombre ni le header ni le plan avec une
action `Enregistrer`. Pendant la génération, l'invité voit seulement la
progression. Lorsque le résultat est prêt, il crée ou reprend son accès avant
que le plan soit révélé, puis celui-ci est sauvegardé automatiquement. Une
personne déjà connectée voit directement son plan et ses modifications
persistées. Un plan vierge n'est créé côté serveur qu'après sa première
modification utile.

Cette règle s'applique à toutes les actions fonctionnelles de l'application :
une personne connectée ne ressaisit pas son adresse dans un guide métier, une
Opportunité, Coaching, une inscription ou une demande. L'API autorise l'action
avec l'UID Firebase et utilise l'e-mail de la session uniquement comme contact.
Pour une personne non connectée, l'action ouvre l'authentification e-mail et
mot de passe ou Google, puis reprend l'intention exacte dans l'application.

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
son `opportunityId`. `Rejoindre Team Demaa` est un lien simple dans la vue
Opportunités : il ouvre la même modale que les candidatures, sans carte ou page
catalogue intermédiaire. Le formulaire générique propose une seule expertise
principale parmi les 23 valeurs canoniques ; une opportunité précise peut
imposer son expertise mappée. L'ancienne route `/rejoindre-team-demaa` redirige
vers cette modale dans l'application. Ce parcours permanent reste dans le même pipeline, sans `opportunityId`. Les
collections `expertise_catalog`, `opportunities` et `lead_requests` restent les
sources canoniques ; aucun catalogue ou stockage parallèle n’est créé.

Un bouton `+` compact, immédiatement adjacent à la recherche sur desktop,
permet aussi de proposer une
Opportunité. La personne remplit le formulaire avant connexion. Au clic sur
Envoyer, un brouillon serveur opaque conserve exactement les champs, puis la
session Firebase reprend et soumet automatiquement le brouillon.
Le document est créé dans `opportunities` avec le statut `draft` et ne devient
public qu'après l'action explicite de l'administration.

Le nom de l’organisation à l’origine d’une opportunité n’est pas affiché dans
cette version. Un futur champ facultatif pourra être décidé séparément.

## Identité et sauvegarde invitée

Firebase Authentication gère l'adresse et le mot de passe ; Demaa ne reçoit
jamais le mot de passe. Le serveur transforme le jeton d'identité en cookie de
session Firebase natif, HttpOnly et vérifié avec contrôle de révocation.
E-mail/mot de passe et Google alimentent la même identité. L'UID Firebase reste
l'identité racine. Les conversations et brouillons restent attachés à cet UID ;
les plans sont rattachés à l'entreprise par défaut et autorisés par une
appartenance active. L'e-mail de session reste une coordonnée de contact. Aucun
accès historique ou système de réclamation par e-mail n'est maintenu.

## Hors périmètre

- nom ou logo de l’organisation dans les cartes Opportunités ;
- paiement ou agenda automatique du Coaching ;
- place de marché et publication automatique de profils ;
- glisser-déposer Kanban, notifications ou collaboration multi-utilisateur ;
- comptes possédant plusieurs entreprises, sélecteur d'entreprise et
  collaboration multi-membre ;
- recherche web ou étude de marché automatique.
