# Préparation — recommandations d’outils dans le Plan d’action

Statut : préparation uniquement. Aucun changement de catalogue public, de
Firestore, de générateur IA ou d’interface n’est inclus dans ce dossier.

Fichier machine lisible :
[`cabinet-comptable-pilot.v1.json`](cabinet-comptable-pilot.v1.json).

## Résultat de l’audit

Le dépôt disposait déjà de trois briques utiles :

- `cabinet-comptable` expose Pennylane, Tiimora et Silae dans cet ordre ;
- le catalogue pilote contient une description et une preuve officielle par
  produit ;
- le moteur d’aides contextuelles sait afficher au plus deux outils dans un
  plan.

Il manquait cependant la décision par problème. Les descriptions existantes
permettaient d’afficher trois logiciels, mais pas de répondre de manière fiable
à la question : « lequel est adapté à cette action précise ? ».

Le pilote préparé ajoute donc :

- onze identifiants fonctionnels indépendants de la langue ;
- les capacités réellement couvertes par chaque outil ;
- les frontières entre les trois outils ;
- dix scénarios de résolution et d’abstention ;
- les dépendances avec D‑068, D‑069 et D‑085 ;
- les éléments restant à faire valider avant toute activation.

Les verdicts utilisent des identifiants JSON sans espace ni accent. Le bloc
`verdictVocabulary` fournit leur correspondance exacte avec les cinq verdicts
humains de D‑068 ; `a_verifier` signifie donc bien `à vérifier`.

## Décision de positionnement

### Tiimora

À proposer lorsque le problème principal est la circulation entre le cabinet et
ses clients : demandes, documents, signatures, onboarding, relances, portail
client ou collecte des variables de paie.

Tiimora ne doit pas être présenté comme un logiciel de production comptable ni
comme un moteur de paie. Sa relation avec Demaa/ODEMA doit être affichée :
`Outil édité par l'équipe Demaa/ODEMA`.

Source officielle : <https://www.tiimora.com/>.

### Pennylane

À proposer lorsque le résultat attendu concerne la production comptable, les
déclarations, les données financières, la facturation, la trésorerie, le suivi
des missions, des temps ou de la rentabilité du cabinet.

Pennylane propose aussi une gestion interne, un CRM et un portail client. Un
cabinet déjà équipé de Pennylane ne doit donc pas recevoir automatiquement
Tiimora pour un problème générique de collaboration : le résolveur doit d’abord
indiquer que Pennylane est déjà utilisable et laisser l’action porter sur son
paramétrage ou son adoption.

Sources officielles :

- <https://www.pennylane.com/fr/expert-comptable> ;
- <https://www.pennylane.com/fr/expert-comptable/gestion-interne> ;
- <https://www.pennylane.com/fr/securite>.

### Silae

À proposer lorsque le résultat attendu est la production de la paie, la DSN,
les règles légales et conventionnelles ou les workflows RH reliés à la paie.

Silae et Tiimora peuvent être complémentaires : Tiimora organise une collecte
en amont ; Silae produit, contrôle et distribue la paie. Si Silae est déjà en
place et couvre le besoin de collecte, le résolveur doit privilégier sa
configuration avant d’ajouter un deuxième outil.

Sources officielles :

- <https://www.silae.fr/solution-rh-paie/> ;
- <https://www.silae.fr/solutions-paie-securisees-et-innovantes/>.

## Règles minimales du futur résolveur

1. L’IA produit un `capabilityKey`, jamais un nom de produit.
2. Le serveur filtre par `systemId`, capacité, marché, locale, publication et
   preuve.
3. Un outil déjà utilisé et capable de satisfaire le besoin est proposé en
   premier avec l’état `already_in_use`.
4. Un outil détenu par Demaa/ODEMA n’obtient aucun avantage de rang.
5. Une seule recommandation est autorisée par action et deux par plan.
6. Une action couvrant plusieurs résultats incompatibles doit être scindée ; le
   résolveur ne choisit pas arbitrairement un produit.
7. Une situation trop vague produit une abstention.
8. Une capacité sans placement validé produit une abstention.
9. Airtable et Fillout ne sont pas ajoutés au pilote Cabinet comptable par
   analogie. Leur pertinence devra être auditée pour les systèmes concernés.
10. Les placements français ne sont pas utilisables dans
    `global-en-beta`. Les identifiants sont multilingues, pas les offres.

## Chevauchements à traiter explicitement

### Relation client : Pennylane ou Tiimora

- Pennylane déjà utilisé et besoin couvert par son CRM/portail : Pennylane,
  `already_in_use`.
- Aucun outil déclaré et besoin centré sur demandes, documents, signatures et
  relances : Tiimora peut être proposé après validation éditoriale.
- Besoin générique « mieux collaborer » sans processus observable : aucune
  recommandation.

### Variables de paie : Silae ou Tiimora

- Calcul, bulletin, conformité, conventions ou DSN : Silae.
- Collecte et suivi des informations envoyées par les clients avant la paie :
  Tiimora peut être proposé.
- Silae déjà en place et collecte disponible : configurer Silae avant d’ajouter
  un nouvel outil.

### Processus mélangeant plusieurs domaines

Une action qui mélange production comptable, paie et relation client n’a pas de
recommandation unique fiable. Le générateur doit produire plusieurs actions,
chacune associée à un résultat observable.

## Multilingue

Les `capabilityKey` sont universels. Le JSON contient leurs libellés français
et anglais afin qu’ils puissent être envoyés au même générateur avec la langue
du plan.

Ce pilote ne rend pas les trois outils éligibles à l’English Beta : les
placements sont limités à `fr` et `fr-fr`. Une projection anglaise et une preuve
de disponibilité dans `global-en-beta` seraient nécessaires avant toute
recommandation anglaise. Aucun libellé français ne doit servir de fallback.

## Points bloquants avant activation

Les trois propositions restent au verdict final `à vérifier`. Il manque :

1. la relecture métier contradictoire prévue par D‑069 ;
2. la confirmation explicite de la relation commerciale de Pennylane et Silae ;
3. l’alignement du registre runtime sur le statut `owned` de Tiimora et le
   libellé public correspondant ;
4. une preuve sécurité/traitement des données attachée à Tiimora ;
5. l’implémentation du résolveur après fusion du socle D‑085.

Ces blocages sont volontaires. Le dossier ne doit pas être transformé en
activation automatique pour terminer artificiellement le pilote.

## Instructions de transfert au chantier runtime

À transmettre après fusion des branches International Foundation, English
Action Plan, English Solutions/Talk et du lot Automatisation/Application
métier :

```text
1. Repartir du main fusionné, dans une PR runtime dédiée.
2. Importer la taxonomie de capabilityKey sans recopier les outils dans le
   prompt IA.
3. Ajouter recommendationIntents à l’enveloppe de génération, hors du modèle
   métier ActionPlan.
4. Faire produire uniquement actionId + capabilityKey ou null.
5. Ajouter capabilityKeys aux placements validés du registre Solutions.
6. Créer un résolveur serveur pur appliquant les règles du présent dossier.
7. Exécuter le résolveur après la génération et avant le passage du plan à
   active.
8. Enregistrer un recommendation_snapshot dans la transaction existante.
9. Utiliser le snapshot dans ActionPlanResult sans refaire le choix côté client.
10. Conserver le moteur lexical actuel seulement comme compatibilité des plans
    historiques.
11. Ne pas activer les lignes dont activationVerdict reste à vérifier.
12. Transformer les resolverScenarios du JSON en tests unitaires puis ajouter
    les E2E français et anglais prévus.
```

## Frontières de cette préparation

Ce dossier ne modifie pas :

- `action-plan-generation.server.ts` ;
- `action-plan-generation-execution.server.ts` ;
- `action-plan-storage.server.ts` ;
- `ActionPlanResult.tsx` ;
- le registre Firebase ;
- le catalogue public ;
- les routes anglaises ;
- la production.
