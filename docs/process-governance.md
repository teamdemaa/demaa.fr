# Gouvernance du référentiel Process

> **Note de gouvernance au 31 juillet 2026**
>
> Ce document décrit le flux éditorial historique du référentiel Process. La
> hiérarchie active des sources de vérité est désormais définie dans
> [`docs/governance/README.md`](./governance/README.md). Le Google Sheet est un
> outil de proposition et de synchronisation ; il ne peut pas remplacer seul
> un contrat Git validé.

## Miroir éditorial historique

Le référentiel éditorial historique est inventorié, avec son lien unique, dans
[`docs/governance/source-inventory.md`](./governance/source-inventory.md). Il
contient les métiers, les piliers, les familles, les processus, les étapes et
les références des documents associés.

Les fichiers `process-registry.generated.json` et `process-steps.generated.json`
sont les snapshots Git approuvés qui alimentent l'application. Ils sont générés
depuis une proposition validée et ne doivent pas être modifiés manuellement.

Les 115 Google Sheets métier sont des sources historiques auditées et des sorties métier. Ils ne
doivent plus définir seuls un processus commun.

## Workflow de modification

1. proposer la correction dans le miroir Google Sheet ;
2. vérifier les identifiants, la provenance, le métier et les impacts ;
3. obtenir une validation éditoriale explicite ;
4. générer les snapshots Git sans modification manuelle ;
5. exécuter les validateurs et contrôler le diff ;
6. lier le commit et les empreintes au manifeste de release.

Une proposition Sheet non validée n'est jamais consommée par le produit.

## Structure cible

Chaque ligne de processus est rattachée à :

1. un pilier ;
2. une famille de métiers ;
3. un processus canonique ;
4. une liste de contenus concrets par métier, classés en actions de mise en
   place, étapes opérationnelles, règles ou contrôles récurrents ;
5. une référence de document.

Les titres existants des processus restent la base. Les étapes les rendent concrètes pour chaque
métier sans recréer un second catalogue.

## État du référentiel au 26 juillet 2026

- 115 métiers ;
- 37 familles ;
- 526 processus ;
- 8 510 contenus opérationnels, soit 74 par métier ;
- 526 références de supports ;
- 18 supports Plomberie & chauffage possédant une démonstration et un modèle
  vierge liés.

L'industrialisation éditoriale des 115 métiers est terminée. La création des
classeurs métier et des supports associés constitue un chantier séparé : elle
ne doit pas modifier les intitulés de processus ni les 8 510 contenus validés.

## Documents et modèles

Les modèles sont créés exclusivement dans :

- Google Sheets pour les registres, suivis, grilles, tableaux et calculateurs ;
- Google Docs pour les checklists, procédures, attestations et trames narratives.

Chaque support publié doit posséder deux accès distincts :

- une démonstration consultable en lecture seule ;
- un modèle vierge copiable.

Après validation, les liens sont synchronisés dans le contrat Git. L'application
expose un support depuis **Process** uniquement si l'asset réel existe, si son
format est validé et si la démonstration et la copie sont correctement liées.
Sinon, aucune mention ni espace réservé ne doit être rendu.

## Règles de maintenance

- Proposer d'abord dans le Google Sheet, puis valider avant génération Git.
- Conserver un identifiant stable pour chaque métier, famille, processus, étape et document.
- Ne pas réintroduire `operationProcesses`, `processExamples` ou `system_process_templates`.
- Régénérer les deux fichiers JSON seulement après validation éditoriale.
- Lancer `npm run validate:data` avant livraison.
- Vérifier chaque métier : 74 contenus typés.
- Vérifier le pilote Plomberie : 18 processus, 74 contenus et 18 supports liés.
- Ne jamais utiliser un modèle vierge comme démonstration remplie.

## Pilote Plomberie et vagues BTP du 25 juillet 2026

- Les 39 étapes historiques ont été remplacées par 74 contenus concrets.
- Chaque contenu possède un type, un responsable recommandé et une récurrence.
- Chaque processus possède un objectif, un déclencheur, un résultat attendu,
  un responsable recommandé et une cadence.
- Le pilote sert de référence éditoriale à l’industrialisation BTP.
- Électricité générale, Climatisation, Serrurerie, Maçonnerie et gros œuvre,
  Menuiserie et agencement et Rénovation intérieure possèdent également
  18 processus et 74 contenus typés.
- Entreprise générale du bâtiment, Couverture, Peinture en bâtiment, Carrelage,
  Paysagisme et Pisciniste sont également synchronisés au même niveau.
- La famille BTP est donc complète : 13 métiers, 18 processus et 74 contenus
  typés par métier.

## Nettoyage Firestore du 25 juillet 2026

- Les 326 champs historiques `processes`, `operationProcesses` et `processExamples` ont été
  supprimés des 115 documents `enterprise_annuaire`.
- Les 12 documents de la collection obsolète `system_process_templates` ont été supprimés.
- La sauvegarde avant nettoyage est conservée dans le lot local d'audit.
