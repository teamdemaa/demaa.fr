# Préparation de mise en production

Version source : a46a637, branche codex/demaa-consolidation.
Prévisualisation Vercel : https://demaa-45fbou106-hiteamdemaa-2292s-projects.vercel.app
Déploiement : dpl_3oNddpR3fReHcvB9Az2RDoYqPq3C.

Compilation Vercel réussie. Studio, Projets, Apprentissages, Jago, Dumaan et Tiimora contrôlés sur la version hébergée : un H1 par page, aucun écran d’erreur. Les trois séries présentent les cinq épisodes annoncés. La page Projets a aussi été vérifiée dans le navigateur.

RESEND_API_KEY et RESEND_FROM_EMAIL sont configurés pour Production, pas Preview. Le test réel d’abonnement attend l’adresse choisie par l’utilisateur. Aucun contact de test créé, aucun e-mail envoyé. L’API existante de production pourra être testée avant le lancement, car elle est déjà disponible.

Le domaine demaa.fr n’a pas été modifié. Pour la mise en production, construire/déployer avec l’environnement Production : ne pas promouvoir cette Preview sans vérifier ses variables, car Resend n’y est pas configuré. Puis contrôler les pages publiques et le formulaire d’abonnement sur demaa.fr.
