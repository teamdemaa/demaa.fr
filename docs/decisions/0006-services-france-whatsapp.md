# ADR 0006 — Accompagnement France et contact WhatsApp

- Statut : `validated`
- Date : 10 août 2026
- Portée : catalogue Services, composition des Solutions, prix publics, SEO et
  parcours de contact
- Supersède : les décisions incompatibles des ADR 0004 et 0005 relatives au
  catalogue, à l'ordre, aux prix, à l'éligibilité et au parcours de rappel
- Mise à jour : 15 août 2026, publication contextualisée de Formalités d'entreprise

## Catalogue canonique

Une seule source de vérité, `src/lib/canonical-service-catalog.ts`, publie les
sept accompagnements dans cet ordre :

1. Coach business — à partir de 350 EUR HT par mois ;
2. Expert-comptable — à partir de 250 EUR HT par mois ;
3. Formalités d'entreprise — sur devis, facturation directe par le professionnel ;
4. Automatisation des processus — 500 EUR HT par jour ;
5. Gestion des réseaux sociaux — sur devis ;
6. Publicité en ligne — 750 EUR HT par mois, budget média exclu ;
7. Prospection ciblée — sur devis.

Assistance administrative et Sous-traitance de formalités juridiques sont
conservées dans un catalogue serveur privé avec la visibilité
`recommendation_only`.

Ces Services sont composés au rendu et ne sont pas dupliqués dans Firebase.
Les cartes sont regroupées sous le titre public `Accompagnement`. La route
technique `/services` reste canonique. Une carte entière est cliquable, de
hauteur fixe, et ouvre la même fiche détaillée depuis le catalogue ou un
Système. Aucun badge public n'indique « réalisé par Demaa » ou « partenaire ».

## Matrice d'éligibilité

- Un Système standard affiche les sept accompagnements publics.
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
Demaa dans les données structurées. L'avantage mensuel de 12 % s'applique
uniquement à Automatisation, Gestion des réseaux sociaux, Publicité en ligne et
Prospection ciblée. Il ne s'applique jamais au Coach, à l'Expert-comptable, à
Formalités d'entreprise ou aux prestations recommandées. Pour Publicité en
ligne, la remise porte uniquement sur les honoraires Demaa, jamais sur le
budget média.
Les logiciels, licences et autres frais facturés par des tiers sont également
exclus. Le droit est recalculé côté serveur à partir de l'UID Firebase et d'un
accompagnement mensuel actif avant tout devis ou paiement.

Expert-comptable, Formalités d'entreprise et les prestations privées
recommandées sont délivrés par un tiers. Ils ne doivent jamais attribuer à
Demaa le rôle de prestataire, le prix du tiers ou une relation de partenariat.
Une mise en relation reste libre et sans publication automatique du
professionnel dans les Systèmes.

## Contact Coach business et WhatsApp

Les sept fiches, y compris Coach business, utilisent le CTA
`Être recontacté(e)` et un formulaire minimal. Pour Coach business, le rythme
d'une ou deux sessions est choisi avant l'envoi de la demande :

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
