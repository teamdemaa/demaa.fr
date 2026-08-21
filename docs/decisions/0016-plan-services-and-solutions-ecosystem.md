# ADR 0016 — Plan, Services et écosystème Solutions

- Décision : D-090
- Statut : validée
- Date : 21 août 2026

## Contexte

La navigation applicative expose désormais `Services` comme destination
principale. Répéter le catalogue complet des accompagnements dans la vue
contextuelle `Solutions` alourdit l'expérience. À l'inverse, retirer les
placements Services du payload Système casserait les recommandations sobres
affichées dans une Action lorsqu'une délégation est explicitement demandée.

Les référentiels Fournisseurs, Financement, Aides et Réseaux existent déjà,
mais leur niveau de validation n'est pas homogène. Les entrées en brouillon ou
dont la relation commerciale n'est pas confirmée ne doivent pas être exposées
par une simple bascule de visibilité.

## Décision

1. La sous-navigation d'un plan sauvegardé est `Plan / Chiffres / Solutions`.
   Stratégie reste accessible sous le Plan et revient par `Retour au plan`.
2. `Services` reste une destination principale et son rail n'est plus rendu
   dans la vue contextuelle Solutions.
3. Les placements Services restent présents dans le DTO public Système : ils
   alimentent le moteur contextuel existant et ne contiennent aucune donnée
   privée. Le masquage est une décision de présentation, pas une suppression
   de données.
4. Une recommandation de service dans une Action exige simultanément un besoin
   métier précis et une intention explicite de délégation. Coach business est
   toujours exclu. Une Action reçoit au plus une recommandation commerciale,
   un plan au plus deux et un seul service peut être proposé par plan. Son clic
   ouvre directement la fiche dans la destination principale `Services`, jamais
   le rail contextuel désormais masqué.
5. Les exclusions métier du catalogue canonique restent obligatoires : un
   cabinet comptable ne reçoit pas Expert-comptable, les professions qui
   réalisent les formalités ne les reçoivent pas, et les métiers du support
   administratif ne reçoivent pas Assistante administrative.
6. La vue Solutions vise l'ordre `Outils / Ressources / Fournisseurs /
   Financement / Aides / Réseaux` en réutilisant les composants et identités
   existants. La section technique legacy `models` reste masquée ; Ressources
   continue d'utiliser `SystemResourcesTab`.
7. Une catégorie vide n'est pas affichée. Fournisseurs et Réseaux sont
   fail-closed : seuls les placements et ressources explicitement publiés
   peuvent sortir. Financement et Aides conservent leurs résolveurs
   déterministes et leurs avertissements de vérification.
8. Le sélecteur d'activité réutilise le scoring canonique de découverte. Il
   classe les correspondances mais ne choisit jamais silencieusement une
   activité ambiguë. Plusieurs activités sauvegardées restent autorisées.

## Conséquences

- D-083 reste l'historique de la première réduction de surface, mais sa cible
  `Outils + Services` est supersédée pour l'application.
- Aucun nouveau catalogue, endpoint ou moteur d'héritage n'est créé.
- Afficher toutes les familles d'information ne signifie jamais publier tous
  les brouillons internes.
- Le périmètre anglais reste en pause et n'est pas activé par cette décision.
