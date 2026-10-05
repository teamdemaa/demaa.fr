# Publications DEMAA

## Utilisation

Ouvrir https://demaa.fr/admin/publications avec le compte administrateur existant.
Choisir le projet et l’épisode. Écrire le titre, le résumé SEO et le texte (une ligne vide entre les paragraphes).
Enregistrer garde le brouillon privé ; Aperçu le relit ; Publier met la version sur le site immédiatement, sans déploiement.
Les corrections restent privées jusqu’à une nouvelle publication. Retirer du site conserve le contenu et l’historique.

## Newsletter

La newsletter reprend la version publiée. M’envoyer un test envoie uniquement au compte administrateur connecté.
Préparer dans Resend crée un brouillon sans diffusion. Actualiser remplace le contenu du même brouillon après correction.
Envoyer aux abonnés exige un test de la version actuelle et une confirmation explicite avec l’identifiant de l’épisode.
Un épisode envoyé ne peut pas être envoyé une deuxième fois par l’éditeur. En cas de résultat incertain, contrôler Resend avant toute intervention.
Le segment dédié est DEMAA · Apprentissages (ancien General vide, réutilisé sans changement de forfait).
Les nouvelles inscriptions y sont ajoutées. Aucun ancien contact des autres segments n’a été importé.

## Conservation et retour arrière

Firebase existant demaa-dde32 : collection studioPublications, sous-collections history.
Le contenu est chiffré côté serveur avec STUDIO_PUBLICATIONS_KEY, conservée dans les secrets de production Vercel.
Ne pas supprimer ou remplacer cette clé : les versions archivées et les brouillons en dépendent. Une rotation nécessite une migration complète des contenus et historiques.
Les clés Resend restent exclusivement côté serveur. Les accès réutilisent l’autorisation administrateur existante.
Retirer un article est réversible en le republiant. L’historique archive les révisions avant chaque modification du contenu.
Pour restaurer une ancienne révision, utiliser une procédure serveur contrôlée avec la même clé et l’identifiant du document parent ; aucun bouton de restauration n’est exposé dans cette première version.
Un retour de déploiement conserve les données Firebase. Revenir à une version antérieure à l’éditeur masquerait les nouveaux articles dynamiques ; ne pas supprimer les données.

## Périmètre

Jago, Dumaan et Tiimora : EP00 à EP05. Jago EP00 est amorcé par le texte validé Pourquoi Jago existe.
Texte simple, sans éditeur riche ni médias incorporés. Les visuels existants des projets sont conservés.
Publication et diffusion sont deux actions distinctes. Aucune diffusion aux abonnés n’est effectuée pendant la livraison.
