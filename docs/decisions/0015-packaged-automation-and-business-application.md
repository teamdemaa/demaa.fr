# ADR 0015 — Tarification d’Automatisation, IA et Application métier

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

## Tarification simplifiée

Chaque prestation conserve un seul point d’entrée public :

- `Automatisation des processus et IA` : à partir de 1 500 EUR HT ;
- `Application métier` : à partir de 4 500 EUR HT.

Le budget est établi sur une base commune de 500 EUR HT par jour. Le taux
journalier sert uniquement au calcul du devis : il n’est pas additionné au prix
d’entrée sur la carte. Le périmètre, le nombre de jours et le prix total sont
confirmés avant le démarrage. Aucun dépassement n’est engagé sans validation.

Les anciennes variantes `essentielle` et `avancée` ne sont plus présentées
comme des offres distinctes. Le premier slug technique historique de chaque
prestation est conservé dans les demandes afin d’éviter une migration de
contrat et d’API ; les variantes avancées ne sont plus sélectionnables.

Toute migration importante, API non documentée, application mobile native,
moteur métier critique, droits très fins, intégration ERP complexe ou changement
de périmètre est chiffré dans le devis ou fait l’objet d’un devis séparé. Les
licences, consommations IA, budgets tiers, hébergements spécifiques et frais
externes restent séparés.

Une correction rétablit le comportement accepté dans le périmètre signé. Une
évolution modifie ce périmètre et n'est pas incluse dans les trente jours de
correction. Le support à 110 EUR/heure, la maintenance à 99 EUR/mois et les
promesses absolues de propriété, d'hébergement ou de conformité de l'ancienne
page `/sur-mesure` doivent être retirés ou revalidés contractuellement avant la
livraison du nouveau runtime.

## Présentation

`Nos accompagnements` affiche Automatisation des processus et IA puis
Application métier, réalisées directement par Demaa. Les prestations de mise en
relation restent dans le catalogue canonique pour leurs parcours historiques,
mais leur section publique est masquée.

Les cartes affichent uniquement le prix d’entrée avec `À partir de`. La fiche
précise ensuite la base de 500 EUR HT par jour et la validation du devis. Une
source de vérité unique alimente la carte, la modale, `/sur-mesure`, la demande
et les données structurées SEO. Aucun montant n'est recopié dans un composant.

Automatisation et Application métier sont directement facturées par Demaa.
D-098 retire tout avantage mensuel en pourcentage : le prix du catalogue et le
montant validé sur le devis sont les seules références.

Assistante administrative est facturée directement par la professionnelle :
la carte et la fiche indiquent `À partir de 500 EUR HT / mois`, correspondant
au minimum de 20 heures à 25 EUR HT / heure ; toute heure supplémentaire reste
à 25 EUR HT. La demande utilise le même parcours WhatsApp minimal que les
autres accompagnements. Elle est masquée des projections Système des
professionnels qui proposent déjà ce service eux-mêmes.

Gestion des réseaux sociaux, Publicité en ligne et Prospection ciblée sont des
prestations partenaires facturées directement par le professionnel.

## Demande

Le CTA canonique reste `Envoyer ma demande`. Il ne déclenche aucun paiement.
Le navigateur transmet uniquement l'intention ; le serveur retrouve le point
d’entrée tarifaire dans le catalogue.

La demande conserve au minimum :

```text
serviceSlug
packageSlug
systemId
localeCode
marketCode
sourcePage
```

`packageSlug` reste renseigné automatiquement avec l’identifiant technique
historique unique pour Automatisation et Application métier. Aucun choix de
forfait n’est demandé à l’utilisateur. Aucun montant, nombre de jours,
pourcentage ou droit à une remise envoyé par le navigateur n'est accepté comme
autorité. La clé d'idempotence distingue le service et son point d’entrée. Le
parcours reste le formulaire minimal Entreprise + numéro WhatsApp, le pipeline
de leads et la notification Team existants.

## International

Les projections anglaises réutilisent les mêmes slugs, contrats, forfaits et
demandes. `Process automation and AI` est inclus uniquement si la prestation
est réellement délivrable en anglais. `Business application` reste masquée du
marché anglais tant que Demaa ne peut pas assurer cadrage, livraison et support
en anglais. Aucun prix en USD n'est déduit de la langue.

## Gates

- aucune occurrence publique des anciennes variantes à 3 000 ou 7 500 EUR ;
- le taux de 500 EUR HT/jour apparaît dans la fiche, jamais comme supplément
  ambigu sur la carte ;
- aucune définition tarifaire dupliquée ;
- aucune page SEO concurrente à `/sur-mesure` ;
- point d’entrée validé côté serveur et présent dans la notification Team ;
- remise vérifiée côté serveur, jamais par le navigateur ;
- cartes, modales, pages, données structurées et tests cohérents ;
- desktop, mobile, PWA, clavier et lecteur d'écran vérifiés ;
- aucune fusion Production sans GO PROD explicite.
