# Apprentissages par projet

La navigation reste Studio, Projets, Apprentissages. L’index Apprentissages présente Jago, Dumaan et Tiimora, dans cet ordre. Chaque carte ouvre une page de série avec un paysage distinct, une présentation factuelle, une liste d’épisodes et le formulaire Resend existant.

La trame validée comporte cinq épisodes : Stratégie, Plan d’action, Update 1, Update 2, Update 3. Chaque titre est affiché avec « Bientôt disponible », sans explication ni lien tant que son contenu n’est pas publié. La structure `LEARNING_PROJECT_SERIES` centralise les projets et leurs épisodes. Pour publier un épisode, créer son contenu puis ajouter son numéro, son titre et son URL à la série correspondante. La présentation affiche automatiquement EP01, EP02, etc.

Le précédent article Jago reste conservé et accessible à son URL, mais ne figure plus dans l’index ni dans le sitemap, en attendant la décision éditoriale. Les anciens contenus, visuels et supports sont conservés.

Studio et Projets présentent désormais Jago, Dumaan, Tiimora. Leurs cartes restent non cliquables. MND figure dans les autres projets, avec une présentation média d’abord, e-commerce ensuite.

La sélection des paysages et les crédits existants sont conservés. Le formulaire d’abonnement et son API ne sont pas modifiés. Aucun déploiement en production n’est réalisé dans cette étape.

Validation : compilation de production réussie, ESLint sans avertissement, 22 tests du proxy réussis. Les trois séries ont été autorisées dans le contrôle des routes. L’ancienne route Academie ne génère plus de paramètres invalides à partir des nouvelles cartes.
