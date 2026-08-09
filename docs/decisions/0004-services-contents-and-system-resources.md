# ADR 0004 — Services, Contenus et Ressources des Systèmes

- Statut : `validated`
- Date : 9 août 2026
- Portée : Services Demaa, composition de Solutions, Académie, Contenus et
  Ressources des 115 systèmes
- Supersède : les passages incompatibles des ADR 0001, 0002 et 0003

## Décision

### Services Demaa

Demaa publie exactement trois services canoniques :

1. Expert-comptable (`/services/expert-comptable`) ;
2. Marketing externalisé (`/services/marketing-vente`) ;
3. Assistance facturation (`/services/assistante-facturation`).

`/services` est l'annuaire public de ces trois offres. `/sur-mesure` reste une
offre séparée. Les anciens catalogues, prix et promesses ne constituent plus
une source de vérité.

La source produit du Marketing externalisé est le document
`Offre-Marketing-Vente-Externalises.docx` : 950 EUR HT par mois, engagement
initial de trois mois, point d'avancement hebdomadaire, bilan mensuel et support
sous 24 à 48 heures.

Les trois offres sont composées au rendu dans les 115 fiches Système. Elles ne
sont pas copiées 345 fois dans Firebase.

### Ordre de Solutions

1. Outils ;
2. Services ;
3. Fournisseurs ;
4. Réseaux professionnels.

Les sections Fournisseurs et Réseaux restent conditionnelles à des placements
Firebase réellement pertinents. Aucun fournisseur transversal n'est injecté
aux 115 systèmes par défaut.

### Ressources des Systèmes

1. Modèles et documents ;
2. cas concret contextuel, lorsqu'il existe ;
3. Guides métier.

Les deux présentations universelles « Maîtriser les obligations et les finances
de son entreprise » et « La facturation électronique » sont masquées dans les
115 systèmes, sans supprimer leurs assets ni les anciennes livraisons.

Les deux guides métier contextualisés « Bientôt disponible » restent visibles
dans chacun des 115 systèmes. Leur CTA « Être informé(e) » et leur pipeline
sécurisé sont conservés.

### Contenus

`/contenus` devient l'annuaire canonique des contenus éditoriaux Demaa. La
première fiche publiée est `/contenus/facturation-electronique`, initialement
sous forme d'article et de diaporama de neuf slides. Une future vidéo enrichit
la même URL sans créer de doublon SEO.

### Académie

L'ordre public est :

1. Cours fondamentaux ;
2. Formations en direct ;
3. Modèles et documents.

Les six formations en direct durent deux heures et coûtent 250 EUR HT. Les
dates sont explicitement validées avant publication et aucune restauration de
Stripe n'est prévue.

L'index global « Cas concrets » disparaît de l'Académie, mais ses routes restent
canoniques et les cas sont rattachés aux Systèmes concernés.

## Parcours

- Expert-comptable et Assistance facturation : CTA « Être rappelé » puis
  formulaire strict `entreprise + téléphone`.
- Marketing externalisé : CTA « Construire ma stratégie marketing » puis
  réservation existante d'un échange de trente minutes.
- Les fiches Services sont accessibles directement et via une interception
  modale partageable.

## Sources de vérité

- un seul catalogue actif pour les trois Services ;
- un seul catalogue actif pour les Contenus ;
- Firebase reste la source distante autoritaire des Solutions tierces ;
- le fallback Solutions est généré depuis la révision Firebase active et ne se
  modifie jamais manuellement.

## Fournisseurs — lot séparé

La couverture fournisseurs sera enrichie par familles de métiers : besoin
réel, acteur et URL officielle, catégorie, pays, limites et date de contrôle.
Les placements sont préparés en brouillon puis validés avant activation. Alan,
Swile ou tout autre acteur ne sont que des candidats et ne sont jamais ajoutés
universellement.

