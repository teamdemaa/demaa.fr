# Apprentissages et abonnement — 4 octobre 2026

Menu public : Studio, Projets, Apprentissages. La page Construire avec nous reste accessible depuis Studio, Projets et le pied de page, hors menu principal.

Premier article publié localement : « Comment structurer un go-to-market ? Le cas Jago ». Étapes, exemple explicitement hypothétique et support CSV. Aucun résultat réel attribué au projet. Paysage Siby conservé. Les dix anciens articles et leurs visuels restent dans les sources ; seul ce premier cas est mis en avant dans le nouvel index.

Abonnement : formulaire natif à la fin de l’article et sur l’index, relié à l’API existante `/api/newsletter-subscribe` et au contact Resend. Consentement explicite, confidentialité, champ anti-robot, attente, confirmation et erreur. Aucun service ni dépendance ajouté.

Vérifications : compilation production et TypeScript réussis ; ESLint ciblé sans avertissement ; audit SEO 15 URL sans échec ; test unitaire Resend réussi ; API de production testée avec une adresse invalide, réponse 400 sans inscription. La présence de RESEND_API_KEY est vérifiée dans les variables Vercel production, sans lecture ni affichage de sa valeur.

Limite : la prévisualisation locale est lancée en mode production, où les protections d’origine rejettent localhost, et ne dispose pas de clé Resend locale. L’inscription réelle n’a pas été soumise, et aucun e-mail n’a été envoyé. L’intégration utilise la configuration existante de production lors de la publication. Les campagnes d’envoi ne sont pas créées par cette modification.

Version non publiée en production durant ce travail.
