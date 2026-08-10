# ADR 0005 — Tarification et densité des Services

- Statut : `validated`
- Date : 9 août 2026
- Portée : catalogue Services, cartes Système, modales, fiches et SEO
- Supersède : les passages incompatibles de l’ADR 0004 relatifs au nom, à
  l’ordre, aux prix et à la présentation des Services

- Statut de la décision Services : `superseded` par l'ADR 0006. Les principes
  de densité des modales restent une référence de présentation.

## Décision

Les quatre Services restent composés depuis le catalogue canonique du code et
ne sont pas copiés dans Firebase. Leur ordre public est :

1. Automatisation des processus ;
2. Expert-comptable ;
3. Marketing et prospection ;
4. Assistance facturation.

Le slug historique et canonique du service Marketing et prospection reste
`/services/marketing-vente`. Le système `cabinet-comptable` n’affiche pas le
service Expert-comptable.

## Tarifs publics

- Automatisation des processus : 500 EUR HT par jour. Le nombre de jours et
  l’enveloppe totale sont validés avant le démarrage.
- Marketing et prospection : 950 EUR HT par mois, avec un engagement initial
  de trois mois.
- Assistance facturation : forfait minimum de 500 EUR HT par mois pour vingt
  heures, puis 25 EUR HT par heure supplémentaire.
- Expert-comptable : honoraires du cabinet à partir de 250 EUR HT par mois.
  Ce montant dépend du dossier ; la mise en relation par Demaa reste sans
  frais.

Les trois premiers tarifs peuvent être décrits comme des offres Demaa dans les
données structurées. Les honoraires de l’expert-comptable sont ceux d’un tiers
et ne doivent jamais être publiés comme une `Offer` fournie par Demaa.

## Présentation

Dans les fiches Système, la section reste intitulée `Services`. Les cartes
n’affichent pas le prix et utilisent la catégorie réelle de chaque service au
lieu de répéter `Service Demaa`.

La navigation depuis un Système conserve l’interception de route partageable,
mais la modale utilise une présentation compacte : résultat, trois éléments
pris en charge au maximum, tarif, condition essentielle et CTA. Les blocs
détaillés `Ce qui est inclus`, `Conditions` et `Non inclus` restent réservés à
la fiche complète `/services/[slug]`.

Les quatre services utilisent le même parcours de rappel : entreprise et
téléphone uniquement, avec le CTA `Être rappelé`. Le contexte du service, du
système métier et de la source est transmis silencieusement au pipeline de
leads sécurisé.

Les clés internes de suivi utilisent le slug stable du service et non son nom
commercial susceptible d’évoluer.
