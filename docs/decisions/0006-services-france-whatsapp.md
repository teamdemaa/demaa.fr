# ADR 0006 — Services clés France et contact WhatsApp

- Statut : `validated`
- Date : 10 août 2026
- Portée : catalogue Services, composition des Solutions, prix publics, SEO et
  parcours de contact
- Supersède : les décisions incompatibles des ADR 0004 et 0005 relatives au
  catalogue, à l'ordre, aux prix, à l'éligibilité et au parcours de rappel

## Catalogue canonique

Une seule source de vérité, `src/lib/canonical-service-catalog.ts`, publie les
six Services dans cet ordre :

1. Automatisation des processus — 500 EUR HT par jour ;
2. Expert-comptable — à partir de 250 EUR HT par mois ;
3. Formalités juridiques — sur devis ;
4. Sous-traitance de formalités juridiques — sur devis ;
5. Plan marketing et prospection — forfait unique de 550 EUR HT ;
6. Assistance facturation — 500 EUR HT par mois pour vingt heures, puis
   25 EUR HT par heure supplémentaire.

Ces Services sont composés au rendu et ne sont pas dupliqués dans Firebase.
Les cartes des fiches Système sont regroupées sous le titre `Services clés`.

## Matrice d'éligibilité

- Un Système standard affiche les cinq Services, sans la sous-traitance de
  formalités juridiques.
- `cabinet-comptable` n'affiche pas Expert-comptable. Il affiche les deux
  Services juridiques, dont la sous-traitance.
- `cabinet-davocat` et `notaire` affichent les six Services.
- La sous-traitance ne doit pas apparaître sur les autres Systèmes sans
  décision explicite.

La carte fournisseur historique JuridiConsulting n'est plus rendue lorsqu'elle
ferait doublon avec les Services juridiques canoniques. Son historique, ses
preuves et ses divulgations sont conservés tant que d'anciens consommateurs en
dépendent.

## Nature des offres et SEO

Automatisation, Plan marketing et prospection et Assistance facturation sont
des offres Demaa. Les prix correspondants peuvent être publiés comme `Offer`
Demaa dans les données structurées.

Expert-comptable et les deux Services de formalités sont délivrés par un tiers.
Ils ne doivent jamais attribuer à Demaa le rôle de prestataire, le prix du tiers
ou une relation de partenariat. Une mise en relation reste libre et sans
publication automatique du professionnel dans les Systèmes.

## Contact WhatsApp

Toutes les fiches utilisent le CTA `Être recontacté(e)` et le même formulaire
minimal :

- nom de l'entreprise ;
- numéro WhatsApp.

Le service, le Système et la source sont transmis silencieusement. La demande
est enregistrée par le pipeline sécurisé existant et notifiée dans Slack. Demaa
recontacte ensuite la personne manuellement sur WhatsApp. Ce parcours ne
déclenche aucun message WhatsApp automatique et ne requiert pas d'API WhatsApp.

La politique de confidentialité mentionne explicitement ce canal et le
formulaire précise que le numéro est utilisé uniquement au sujet de la demande.

## Garde-fous

- Les anciens prix Marketing à 750 EUR, 950 EUR mensuels et 2 000 EUR ne sont
  pas des prix publics actifs.
- Le slug `marketing-vente` reste stable malgré le nom public
  `Plan marketing et prospection`.
- Aucun deuxième catalogue Services ne doit être créé.
- Toute nouvelle éligibilité métier fait l'objet d'un test de matrice.
- La prochaine extension Fournisseurs reste un lot Firebase séparé, préparé en
  brouillon et sans activation Production implicite.
