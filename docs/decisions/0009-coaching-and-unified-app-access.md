# ADR 0009 — Clarification gratuite, Coach business et accès unifié

- Statut : `validated`
- Date : 2026-08-11
- Mise à jour : 2026-08-15, accompagnement Coach business unifié à 750 EUR HT par mois
- Supersède : les passages de l’ADR 0008 et de D-076 qui reportaient intégralement l’accompagnement

## Décision

La composition de navigation initiale est supersédée par l'ADR 0010. La
navigation active est `Plan d’action`, `Opportunités`, `Académie` ; la
clarification s'ouvre depuis l'action compacte `Échanger`. L'authentification
Firebase ouvre directement le plan ou l'intention demandée sans introduire un
portail concurrent `Mon espace`.

Le produit accessible par `Échanger` est une conversation simple, écrite ou
dictée. Il ne comporte aucun onglet Sessions ou Formules. La surface s'intitule
`Clarifier ma situation` et explique qu'une première clarification est offerte.
Le brouillon est conservé pendant l'authentification puis envoyé sous l'UID
Firebase. Aucun enregistrement audio n'est conservé.

Chaque UID Firebase bénéficie d'une première clarification offerte. Le premier
message ouvre ce droit. La Team Demaa peut demander des précisions sans fermer
l'échange, puis clôture manuellement la clarification au moment de sa réponse
finale. La réponse et la clôture sont atomiques. Une action secondaire permet
de rouvrir uniquement une clarification déjà clôturée par erreur ; elle retire
les marqueurs de clôture tout en conservant la date d'ouverture initiale. La suppression ultérieure des
messages ne recrée jamais un droit gratuit. Après trente jours d'ouverture,
l'administration signale la clarification à revoir, sans la fermer ni la
facturer automatiquement.

Une fois la clarification terminée, le champ de réponse est remplacé par un
lien vers `Coach business`. Il n'existe aucune facturation automatique et la
clôture gratuite n'appelle jamais Stripe.

`Coach business` reste une carte distincte dans Accompagnement. Le produit
vendu est un accompagnement mensuel unique à 750 EUR HT par mois, et non un
forfait de séances. Il comprend deux sessions individuelles de 60 minutes, la
préparation des priorités et un suivi écrit entre les séances sur les sujets
travaillés. Le CTA `Être rappelé(e)` transmet une demande de contact sans
connexion ni paiement. Demaa qualifie ensuite le besoin et le matching avec le
dirigeant. La clôture de la clarification gratuite ne déclenche jamais Stripe.

Tant qu'un accompagnement mensuel éligible est actif, le client bénéficie de
12 % de réduction sur les autres prestations directement facturées par Demaa.
Coach business est confirmé par Stripe et la relation Expert-comptable par la
Team Demaa. Cette confirmation manuelle reste active jusqu'à sa désactivation
par la Team ; une date d'expiration explicite peut être enregistrée si le cas
l'exige, mais aucune échéance annuelle arbitraire n'est créée. Les avantages ne
se cumulent pas. La réduction ne s'applique pas :

- au prix du Coach business lui-même ;
- aux honoraires d'un expert-comptable, d'un coach ou d'un autre partenaire ;
- aux budgets publicitaires ;
- aux logiciels, licences et frais facturés par des tiers.

Pour une prestation éligible, le navigateur affiche seulement l'avantage. Le
serveur recalcule le droit à partir de l'UID Firebase, du catalogue canonique et
du statut Stripe projeté. Seul un webhook Stripe signé peut activer ou retirer
ce statut. Une valeur envoyée par le navigateur ne peut jamais accorder la
réduction. Cette même résolution doit être réutilisée avant l'émission d'un
devis et avant la création d'un paiement lorsque ces parcours seront automatisés.

## Sécurité de la session Firebase

E-mail/mot de passe et Google transmettent un jeton d'identité Firebase au même
endpoint serveur. Firebase Admin le transforme en cookie de session HttpOnly,
`SameSite=Lax`, vérifié avec contrôle de révocation. L'UID est l'unique clé
d'autorisation des conversations et brouillons ; l'e-mail sert seulement de
contact. Les plans exigent en plus une appartenance active à leur `company_id`,
conformément à D-078 et à l'ADR 0010.

Si une action nécessitant une identité est déclenchée sans session, le parcours
conserve uniquement l'intention autorisée et revient directement à cette action
après connexion. Lorsqu'un plan existe seulement dans la page, l'ouverture
d'Échanger conserve le plan en mémoire, l'enregistre dans l'entreprise par défaut après
authentification puis ouvre son URL canonique avec le brouillon de clarification.

## Conditions de recette

- une première clarification peut être envoyée après authentification ;
- la Team peut demander une précision sans fermer l'échange ;
- la réponse finale et la clôture sont atomiques ;
- une clarification terminée ne peut pas être contournée avec un abonnement ou
  une valeur envoyée par le navigateur ;
- le CTA Coach business envoie uniquement une demande de rappel ;
- le catalogue et la demande de rappel ne proposent aucun choix entre plusieurs
  rythmes ou prix Coach business ;
- aucun paiement Stripe n'est créé par l'interface publique ;
- l'abonnement et l'avantage restent inactifs tant qu'un statut confirmé n'a
  pas été projeté côté serveur ;
- les cartes éligibles affichent `Avantage abonné : −12 %` sous le prix ;
- les cartes Coach business et Expert-comptable n'affichent aucune mention de
  l'avantage qu'elles peuvent ouvrir ;
- les exclusions de tiers et de budgets sont explicites dans la fiche ;
- le serveur n'accorde la réduction qu'à un UID disposant d'un accompagnement
  mensuel actif : période Stripe valide pour Coach business, ou confirmation
  Team active et éventuellement non expirée pour Expert-comptable.

## Extensions différées

- console dédiée aux coachs externes et attribution des dossiers ;
- automatisation du devis et du paiement Coach business ;
- quotas de conversation supplémentaires ;
- multi-tenant et sélecteur d'entreprise ;
- enrichissement facultatif du profil entreprise.
