# Gouvernance du référentiel Process

## Source de vérité

Le référentiel éditorial unique est le Google Sheet maître
[DEMAA — Référentiel Process — Nettoyage](https://docs.google.com/spreadsheets/d/1Y_FqDpG9AshpS-gS46MpDZaPG-2lktfOsVYp3miB75c/edit).
Il contient les métiers, les piliers, les familles, les processus, les étapes et les références
des documents associés.

Les fichiers `process-registry.generated.json` et `process-steps.generated.json` sont des miroirs
techniques générés depuis ce référentiel. Ils alimentent l'application et ne doivent pas être
modifiés manuellement.

Les 115 Google Sheets métier sont des sources historiques auditées et des sorties métier. Ils ne
doivent plus définir seuls un processus commun : toute correction durable passe par le référentiel
maître, puis par une régénération.

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

## Documents et modèles

Le lot actuel couvre uniquement le nettoyage et la consolidation. Il ne crée aucun modèle.

Le lot suivant créera les modèles séparément, exclusivement dans :

- Google Sheets pour les registres, suivis, grilles, tableaux et calculateurs ;
- Google Docs pour les checklists, procédures, attestations et trames narratives.

Les liens de copie seront ajoutés au référentiel maître après validation du modèle. L'application
pourra ensuite les exposer depuis l'onglet **Process** du tableau de pilotage.

## Règles de maintenance

- Modifier d'abord le Google Sheet maître.
- Conserver un identifiant stable pour chaque métier, famille, processus, étape et document.
- Ne pas réintroduire `operationProcesses`, `processExamples` ou `system_process_templates`.
- Régénérer les deux fichiers JSON après une modification éditoriale.
- Lancer `npm run validate:data` avant livraison.
- Vérifier le pilote plomberie : 18 processus et 74 contenus typés.

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
