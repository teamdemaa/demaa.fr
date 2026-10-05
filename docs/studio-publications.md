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

Jago, Dumaan et Tiimora : EP00 à EP05. Genèse, stratégie et plan d’action sont amorcés par les neuf articles prêts de la base Notion Contenus éditoriaux DEMAA. Update 1 à 3 restent indisponibles.
Une rubrique Le Studio dans l’éditeur gère trois articles transversaux : Pourquoi on construit DEMAA, Notre système Go-to-Market, Comment on pilote notre exécution dans Airtable.
Texte avec paragraphes, gras **Markdown**, retours à la ligne et intertitres des cadres GTM ; sans éditeur riche ni médias incorporés. Les visuels existants des projets sont conservés.
Publication et diffusion sont deux actions distinctes. Aucune diffusion aux abonnés n’est effectuée pendant la livraison.

## Import Notion du 5 octobre 2026

Source : base Contenus éditoriaux DEMAA, collection 9c4c24da-4635-462d-b323-21936ff9071f, vue Ordre de publication (Ordre ≤ 12).
Douze articles Prêt repris, à partir de la propriété Article. Les posts LinkedIn ne sont pas publiés sur le site.
Les anciennes versions de la page parent et Archive — Où suivre la suite des projets ne sont pas importées.
Les sourceUrl/sourceImportedAt de chaque article figurent dans learning-episodes-data.json pour traçabilité ; seuls titre, résumé et contenu sont affichés.
L’import amorce les versions initiales, sans écraser les révisions déjà enregistrées dans Firebase. Il n’y a pas de synchronisation automatique avec Notion.
Le titre de la propriété Contenu prévaut pour les articles du Studio ; cela harmonise Comment on pilote notre exécution dans Airtable avec le libellé demandé.
Aucune base Airtable privée ni capture de données clients n’est publiée.
