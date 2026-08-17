# ADR 0015 — Automatisation, IA et Application métier en forfaits

- Statut : `validated`
- Date : 16 août 2026
- Décision : D-089
- Portée : catalogue Accompagnement France, tarification, cartes, modales,
  `/sur-mesure`, demandes et projections internationales futures
- Supersède : les prix et présentations incompatibles de l'ADR 0006 pour
  Automatisation, ainsi que le prix public historique de `/sur-mesure`

## Positionnement

Demaa conserve deux prestations distinctes et complémentaires :

1. `Automatisation des processus et IA` améliore un processus en conservant
   autant que possible les outils existants. L'IA reste un levier ciblé de
   l'automatisation et ne devient jamais une prestation séparée.
2. `Application métier` crée un espace de travail et une base centralisée
   lorsque les outils existants ne suffisent plus.

La frontière commerciale est formulée ainsi :

> Si nous pouvons améliorer vos outils actuels, nous automatisons. Si votre
> activité a besoin de son propre espace de travail, nous construisons une
> application métier.

Le slug `automatisation-processus` reste inchangé. `application-metier` devient
le slug métier de l'offre Application, mais `/sur-mesure` reste sa page
canonique. Aucun deuxième contenu, prix ou parcours commercial concurrent ne
doit être créé sous `/services/application-metier`.

## Forfaits

### Automatisation essentielle — 1 500 EUR HT

- un processus ;
- jusqu'à deux outils standards ;
- jusqu'à cinq étapes métier déterministes ;
- tests, documentation et prise en main.

### Automatisation avancée + IA — 3 000 EUR HT

- un processus ;
- jusqu'à quatre outils standards ;
- jusqu'à dix étapes métier ;
- une intégration à une API existante et documentée ou un usage IA ciblé avec
  entrées, sorties et validation humaine définies ;
- gestion des erreurs, tests, documentation et prise en main.

### Application métier essentielle — 4 500 EUR HT

- un processus ;
- une base de données ;
- jusqu'à quatre écrans ;
- un rôle utilisateur principal et un rôle administrateur ;
- authentification standard, automatisations simples, mise en ligne, formation
  et trente jours de correction des anomalies.

### Application métier avancée — 7 500 EUR HT

- jusqu'à deux processus ;
- une base de données ;
- jusqu'à huit écrans ;
- deux à trois rôles ;
- logique métier avancée, automatisations et une intégration documentée ;
- mise en ligne, formation, documentation et trente jours de correction des
  anomalies.

Ces prix restent fixes uniquement si les prérequis, critères d'acceptation,
données, intégrations et délais de validation client sont confirmés. Toute
migration importante, API non documentée, application mobile native, moteur
métier critique, droits très fins, intégration ERP complexe ou changement de
périmètre passe sur devis. Les licences, consommations IA, budgets tiers,
hébergements spécifiques et frais externes restent séparés.

Une correction rétablit le comportement accepté dans le périmètre signé. Une
évolution modifie ce périmètre et n'est pas incluse dans les trente jours de
correction. Le support à 110 EUR/heure, la maintenance à 99 EUR/mois et les
promesses absolues de propriété, d'hébergement ou de conformité de l'ancienne
page `/sur-mesure` doivent être retirés ou revalidés contractuellement avant la
livraison du nouveau runtime.

## Présentation

Le catalogue contient neuf accompagnements publics. Automatisation des
processus et IA est placée en premier, Application métier immédiatement après,
et Assistante administrative est désormais une prestation publique de mise en
relation. Seule la sous-traitance de formalités juridiques reste réservée aux
recommandations de la Team. Les cartes ont une hauteur commune
et affichent uniquement catégorie, titre, description courte et une action
discrète. Elles n'affichent ni montant, ni avantage, ni séparateur de prix.

Les prix apparaissent immédiatement dans la modale ou la fiche détaillée. Une
source de vérité unique alimente le catalogue, la modale interceptée et la page
`/sur-mesure`. Les données structurées SEO utilisent cette même source.

Automatisation et Application métier sont directement facturées par Demaa et
éligibles à l'avantage de 12 %. Coach business et Expert-comptable n'affichent
pas d'avantage sur leur propre offre, mais un accompagnement mensuel actif issu
de l'un ou l'autre peut ouvrir l'avantage sur les prestations Demaa éligibles.
La formulation canonique est :

> Avantage accompagnement mensuel : −12 % sur les prestations Demaa éligibles.

Assistante administrative est facturée directement par la professionnelle :
la carte ne montre aucun prix, la fiche indique `Sur devis`, et la demande
utilise le même parcours WhatsApp minimal que les autres accompagnements. Elle
est masquée des projections Système des professionnels qui proposent déjà ce
service eux-mêmes.

## Demande

Le CTA canonique devient `Envoyer ma demande`. Il ne déclenche aucun paiement.
Le navigateur transmet uniquement l'intention ; le serveur retrouve le forfait
et son montant dans le catalogue et vérifie l'éligibilité à l'avantage.

La demande conserve au minimum :

```text
serviceSlug
packageSlug
systemId
localeCode
marketCode
sourcePage
```

`packageSlug` est obligatoire pour Automatisation et Application métier et doit
appartenir au service. Il reste absent pour une prestation à prix unique ou sur
devis. Aucun montant, pourcentage ou droit à une remise envoyé par le navigateur
n'est accepté comme autorité. La clé d'idempotence distingue le service et le
forfait lorsqu'il existe. Le parcours reste le formulaire minimal Entreprise +
numéro WhatsApp, le pipeline de leads et la notification Team existants.

## International

Les projections anglaises réutilisent les mêmes slugs, contrats, forfaits et
demandes. `Process automation and AI` est inclus uniquement si la prestation
est réellement délivrable en anglais. `Business application` reste masquée du
marché anglais tant que Demaa ne peut pas assurer cadrage, livraison et support
en anglais. Aucun prix en USD n'est déduit de la langue.

## Gates

- aucune occurrence publique des anciens prix 500 EUR/jour ou 2 500 EUR ;
- aucune définition tarifaire dupliquée ;
- aucune page SEO concurrente à `/sur-mesure` ;
- forfait validé côté serveur et présent dans la notification Team ;
- remise vérifiée côté serveur, jamais par le navigateur ;
- cartes, modales, pages, données structurées et tests cohérents ;
- desktop, mobile, PWA, clavier et lecteur d'écran vérifiés ;
- aucune fusion Production sans GO PROD explicite.
