# Backlog — « Proposer votre solution » V2

## Statut et garde-fou

La V1 déjà présente sur `main` est le flux de référence et reste **inchangée** par ce backlog. Cette note ne publie rien et ne modifie ni la route `/partenaires`, ni le contrat de soumission, ni les règles de consentement V1.

Une V2 éventuelle pourra viser une réduction de friction locale dans le formulaire, après validation produit et mesure de l'usage réel de la V1.

## Améliorations observées dans l'archive

Le commit `473217a` contient une variante de `src/components/PartnerSubmissionForm.tsx`. Elle est un prototype de référence, pas une modification à intégrer directement.

| Observation dans le prototype | Bénéfice potentiel | Limite / condition |
| --- | --- | --- |
| Passage de trois étapes à deux (« La solution », puis « Votre contact ») | Parcours plus court et plus lisible. | Vérifier que la validation progressive reste compréhensible et accessible. |
| Sélection des métiers déplacée dans l'étape « La solution » | Évite une étape dédiée pour un choix lié à la solution. | Le métier reste obligatoire ; son importance ne doit pas être masquée. |
| Bloc « Les métiers concernés » replié par défaut | Réduit la densité initiale du formulaire. | Il doit s'ouvrir au bon moment, conserver le focus et expliquer la sélection requise. |
| Recherche et sélection multiple des métiers conservées | La V1 prend déjà en charge plusieurs métiers, jusqu'à 12 ; la V2 peut rendre cette capacité plus proche du contexte de la solution. | Ne pas modifier la limite ou le contrat serveur sans décision explicite. |
| Badge du nombre de métiers et étiquettes supprimables | Rend la sélection multiple visible. | Tester clavier, lecteur d'écran, petits écrans et listes longues. |
| Signalement des champs obligatoires et correction visuelle du sélecteur de catégorie | Clarifie les attentes du formulaire. | À évaluer comme améliorations V1 autonomes ou incluses dans une V2, sans mélanger les décisions. |

## Décisions à valider avant toute V2

1. Confirmer l'objectif : augmenter le taux de complétion, réduire le temps de saisie, améliorer la qualité des propositions, ou plusieurs de ces objectifs avec une mesure définie.
2. Décider si les ajustements de clarté (champs obligatoires et sélecteur de catégorie) sont une maintenance V1 séparée ou une partie inséparable de la V2.
3. Valider le comportement du bloc métiers : état initial, déclenchement automatique en cas d'erreur, texte d'aide, navigation clavier et annonce aux technologies d'assistance.
4. Vérifier que la sélection multiple actuelle est appropriée : limite de 12, recherche, libellés et présentation des choix déjà sélectionnés.
5. Définir les métriques et la période de comparaison avec la V1, sans dégrader la qualité des données envoyées à l'équipe.
6. Prévoir des tests de validation, accessibilité et parcours complet contre l'API V1 existante avant toute bascule.
7. Choisir un mode de déploiement et de retour arrière ; aucun changement de contrat de données n'est justifié par le seul prototype.

## Pointeurs d'archive et règle d'intégration

- Prototype UI : `473217a:src/components/PartnerSubmissionForm.tsx`.
- Contrat V1 à préserver pendant l'étude : `src/lib/partner-submission-contract.ts`.
- Flux V1 actuel à ne pas remplacer sans décision : `src/components/PartnerSubmissionForm.tsx` et son appel à `/api/partner-submission`.

Ne pas reprendre le diff de l'archive comme patch. Extraire séparément les décisions retenues, les implémenter contre `main`, puis les vérifier avec des tests ciblés.
