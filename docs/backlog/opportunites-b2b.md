# Backlog — Opportunités B2B

## Statut et périmètre

Ce chantier est **en backlog**. Il ne publie ni page, ni route API, ni lien de navigation dans l'état actuel du produit.

L'intention à évaluer ultérieurement est un espace Demaa où :

- l'équipe peut présenter des opportunités B2B sélectionnées ;
- un visiteur peut manifester son intérêt pour une opportunité ;
- un visiteur peut proposer une nouvelle opportunité.

Il ne s'agit pas d'autoriser une place de marché ouverte sans règles. Avant toute publication, le produit, l'exploitation et le cadre de traitement des données doivent être définis ensemble.

## Prototype archivé

La seule source de référence est le commit d'archive `473217a` (`Archive mixed resources work`). Aucun de ses fichiers ne doit être repris tel quel dans le lot actif.

| Élément du prototype | Pointeur dans l'archive | Rôle observé |
| --- | --- | --- |
| Page publique | `src/app/opportunites-b2b/page.tsx` | Montage de la page `/opportunites-b2b`. |
| Liste locale | `src/lib/b2b-opportunities.ts` | Trois exemples d'opportunités codés en dur. |
| Interface de liste | `src/components/B2BOpportunitiesClient.tsx` | Recherche, cartes et point d'entrée vers les deux modales. |
| Intérêt | `src/components/B2BOpportunityInterestModal.tsx` et `src/app/api/opportunites-b2b/interest/route.ts` | Nom + e-mail, puis notification Slack. |
| Proposition | `src/components/B2BOpportunitySubmitModal.tsx` et `src/app/api/opportunites-b2b/submit/route.ts` | Titre, description, coordonnées, puis notification Slack. |
| Exposition | `src/components/Footer.tsx` et `src/app/sitemap.ts` | Ajout du lien et de l'URL publique. À ne pas réintroduire avant GO. |

Le prototype contient des protections techniques ponctuelles (contrôles d'origine/hôte, limite de débit, honeypot, normalisation, clés d'idempotence). Elles ne remplacent pas les décisions métier et de conformité ci-dessous.

## Manques bloquants

### Produit et exploitation

- Pas de modèle de cycle de vie : brouillon, soumis, en revue, publié, suspendu, refusé, expiré, archivé.
- Pas de modération, de responsable identifié, de délai de traitement, ni de procédure de retrait/signalement.
- Les opportunités du prototype sont dans le code : aucun back-office, journal d'audit, propriétaire de contenu ni source de vérité durable.
- Pas de dates de publication/expiration, de fermeture automatique, ni de gestion des opportunités déjà pourvues.
- Pas de règles de qualification : catégorie, zone, destinataire, qualité minimale, droit de publier, contenu interdit, doublons et conflit d'intérêt.
- Le geste « intéressé » notifie Slack seulement ; il n'organise ni mise en relation, ni consentement réciproque, ni suivi de l'issue.

### Données personnelles et conformité

- Finalités, base légale, durée de conservation et registre de traitement à préciser pour les deux formulaires.
- Information de confidentialité et consentement adaptés absents du flux archivé ; ne pas assimiler une simple saisie de coordonnées à un consentement universel.
- Aucun choix explicite concernant la transmission des coordonnées au porteur de l'opportunité.
- Pas de processus d'accès, rectification, suppression, retrait du consentement ou purge des demandes expirées.
- Pas de politique de minimisation des données, ni de décision sur le stockage des contenus potentiellement sensibles ou commerciaux.

### Qualité, sécurité et vérification

- Aucun test dédié au catalogue, à la recherche, aux modales, aux contrats d'API, à la modération ou à l'expiration.
- Aucun test d'accessibilité et aucun parcours end-to-end ne couvre la soumission, l'intérêt, les erreurs et la protection anti-abus.
- La livraison archive plusieurs changements non liés : son état de compilation et sa compatibilité avec `main` ne sont pas une base d'intégration.
- Les alertes Slack seules ne constituent ni une persistance fiable ni une piste d'audit suffisante.

## Critères de GO pour un chantier futur

Le chantier ne peut passer en réalisation que lorsque les points suivants sont validés explicitement :

1. Un owner produit et un responsable de modération/exploitation sont nommés, avec règles écrites de publication, refus, retrait et escalade.
2. Le périmètre est tranché : contenu éditorial géré par Demaa seulement, soumissions externes modérées, ou autre modèle clairement délimité.
3. Le cycle de vie et la persistance sont conçus, avec dates d'expiration, archivage, audit et gestion des doublons.
4. Les mentions de confidentialité, finalités, consentements nécessaires, durées de conservation et modalités de mise en relation sont validés.
5. Les règles anti-abus et de sécurité sont testées : validation serveur, limites, signalement, journalisation et protection des données.
6. Un jeu de tests couvre au minimum les règles de cycle de vie, les API, les formulaires, l'accessibilité et les parcours principaux.
7. Une revue d'intégration isole ce chantier des autres archives ; seules les pièces retenues sont adaptées à l'état courant de `main`.

## Règle d'intégration

Ne pas cherry-pick le commit `473217a` ni copier son prototype. À l'ouverture du chantier, repartir de la présente décision, puis consulter les fichiers pointés dans l'archive comme matériau de découverte uniquement.
