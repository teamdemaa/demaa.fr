# Modèle d’arborescence Google Drive

Le modèle `structure-google-drive-entreprise` fonctionne sans configuration en mode copie texte. La création automatique dans Google Drive nécessite un client OAuth Google.

## Configuration Google Cloud

1. Activer Google Drive API dans le projet Google Cloud utilisé par Demaa.
2. Dans Google Auth Platform, renseigner `Branding`, puis choisir l’audience :
   `External` pour les comptes Google de clients, ou `Internal` si l’outil reste
   limité à un seul domaine Google Workspace.
3. Dans `Data Access`, déclarer uniquement le scope :

   `https://www.googleapis.com/auth/drive.file`

4. En mode `Testing`, ajouter les comptes Google autorisés dans `Audience > Test
   users`.
5. Dans `Clients`, créer un client OAuth de type `Web application`.
6. Ajouter l’URI de redirection de production, à l’identique :

   `https://demaa.fr/api/modeles/structure-google-drive-entreprise/drive/callback`

Pour le développement local actuel sur le port 3000, ajouter également :

   `http://127.0.0.1:3000/api/modeles/structure-google-drive-entreprise/drive/callback`

Le protocole, l’hôte, le port, le chemin et l’éventuel slash final doivent
correspondre exactement. Si le site est ouvert avec `localhost` plutôt que
`127.0.0.1`, ajouter et utiliser cette variante :

   `http://localhost:3000/api/modeles/structure-google-drive-entreprise/drive/callback`

## Variables d’environnement

- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_OAUTH_STATE_SECRET` : secret aléatoire d’au moins 32 caractères
- `GOOGLE_DRIVE_REDIRECT_URI` : facultatif, utile si l’URI publique doit être forcée

Pour générer le secret d’état :

```sh
openssl rand -base64 48
```

En local, placer ces valeurs dans `.env.local`, puis reconstruire et redémarrer
l’application. En production, créer les trois variables dans Vercel pour
l’environnement `Production`, puis redéployer. Ne jamais exposer le client secret
dans une variable préfixée par `NEXT_PUBLIC_`.

## Recette

1. Ouvrir le modèle et vérifier que le bouton affiche `Créer dans mon Drive`.
2. Saisir le nom du dossier principal puis cliquer sur le bouton.
3. Autoriser Demaa sur l’écran Google.
4. Vérifier la redirection vers le nouveau dossier et la présence des 11 domaines.

Pour les premiers essais, conserver l’application OAuth en mode `Testing` et
ajouter les comptes testeurs. Avant l’ouverture à tous les comptes Google, passer
l’application en production et terminer la vérification OAuth demandée par Google.

La portée OAuth demandée est uniquement `https://www.googleapis.com/auth/drive.file`. Le jeton d’accès est utilisé pendant le callback pour créer l’arborescence, puis il est abandonné. Aucun jeton Google n’est conservé en base.

En cas d’échec pendant la création, le dossier racine créé par Demaa est supprimé afin de ne pas laisser d’arborescence partielle.
