# ADR 0006 — Accompagnement France et contact WhatsApp

- Statut : `validated`
- Date : 10 août 2026
- Portée : catalogue Services, composition des Solutions, prix publics, SEO et
  parcours de contact
- Supersède : les décisions incompatibles des ADR 0004 et 0005 relatives au
  catalogue, à l'ordre, aux prix, à l'éligibilité et au parcours de rappel
- Mise à jour : 15 août 2026, publication contextualisée de Formalités
  d'entreprise et accompagnement Coach business unifié

> Mise à jour canonique du 17 août 2026 : D-089 et l'ADR 0015 supersèdent le
> nombre d'offres, leur ordre, les forfaits Automatisation/Application métier,
> la présentation des prix sur les cartes, le CTA et le positionnement séparé
> de `/sur-mesure`. Assistante administrative est désormais une mise en
> relation publique facturée par la professionnelle. Les règles de contact
> WhatsApp et de composition serveur restent applicables lorsqu'elles ne
> contredisent pas l'ADR 0015.

## Catalogue canonique

Une seule source de vérité, `src/lib/canonical-service-catalog.ts`, publie les
neuf accompagnements dans cet ordre :

1. Automatisation des processus et IA ;
2. Application métier ;
3. Coach business ;
4. Expert-comptable ;
5. Assistante administrative ;
6. Formalités d'entreprise ;
7. Gestion des réseaux sociaux ;
8. Publicité en ligne ;
9. Prospection ciblée.

Sous-traitance de formalités juridiques reste conservée dans un catalogue
serveur privé avec la visibilité `recommendation_only`. Assistante
administrative reste recommandable par la Team tout en étant publique dans le
catalogue Accompagnement.

Ces Services sont composés au rendu et ne sont pas dupliqués dans Firebase.
Les cartes sont regroupées sous le titre public `Accompagnement`. La route
technique `/services` reste canonique. Une carte entière est cliquable, de
hauteur fixe, et ouvre la même fiche détaillée depuis le catalogue ou un
Système. Aucun badge public n'indique « réalisé par Demaa » ou « partenaire ».
Les cartes n'utilisent aucun séparateur horizontal entre le descriptif et le
tarif. Le tarif reprend la couleur et le poids du texte courant. La décision
D-098 retire tout avantage mensuel en pourcentage du catalogue et des demandes.

## Matrice d'éligibilité

- Un Système standard peut afficher les neuf accompagnements publics selon la
  matrice d'éligibilité.
- `cabinet-comptable` et l'alias `expert-comptable` n'affichent ni
  Expert-comptable ni Formalités d'entreprise.
- `cabinet-davocat` et `notaire` n'affichent pas Formalités d'entreprise.
- Coach business est disponible dans tous les Systèmes.

La carte fournisseur historique JuridiConsulting n'est plus rendue lorsqu'elle
ferait doublon avec les Services juridiques canoniques. Son historique, ses
preuves et ses divulgations sont conservés tant que d'anciens consommateurs en
dépendent.

## Nature des offres et SEO

Les offres directement tarifées par Demaa peuvent être publiées comme `Offer`
Demaa dans les données structurées. Aucun avantage mensuel en pourcentage n'est
affiché ou appliqué. Les prix du catalogue et du devis restent les seules
références commerciales.

Expert-comptable, Formalités d'entreprise et les prestations privées
recommandées sont délivrés par un tiers. Ils ne doivent jamais attribuer à
Demaa le rôle de prestataire, le prix du tiers ou une relation de partenariat.
Une mise en relation reste libre et sans publication automatique du
professionnel dans les Systèmes.

## Contact Coach business et WhatsApp

Les neuf fiches, y compris Coach business, utilisent le CTA
`Envoyer ma demande` et un formulaire minimal. Coach business est présenté
comme un accompagnement mensuel unique incluant deux rendez-vous individuels de
60 minutes et un suivi entre les rendez-vous. Aucun sélecteur de rythme ou de
prix n'est affiché avant l'envoi de la demande :

- nom de l'entreprise ;
- numéro WhatsApp.

Le service, le Système et la source sont transmis silencieusement. La demande
est enregistrée par le pipeline sécurisé existant et notifiée dans Slack. Demaa
recontacte ensuite la personne manuellement sur WhatsApp. Ce parcours ne
déclenche ni paiement, ni message WhatsApp automatique et ne requiert pas
d'API WhatsApp.

La politique de confidentialité mentionne explicitement ce canal et le
formulaire précise que le numéro est utilisé uniquement au sujet de la demande.

## Garde-fous

- L'ancien `Plan marketing et prospection` est retiré ; son trafic est redirigé
  vers Coach business. Les anciens slugs d'assistance ne redirigent pas vers
  une prestation privée.
- Aucun deuxième catalogue Services ne doit être créé.
- Toute nouvelle éligibilité métier fait l'objet d'un test de matrice.
- La prochaine extension Fournisseurs reste un lot Firebase séparé, préparé en
  brouillon et sans activation Production implicite.
