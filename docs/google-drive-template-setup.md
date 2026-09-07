# Modèle d’arborescence Google Drive

Le modèle `structure-google-drive-entreprise` fonctionne sans configuration en mode copie texte. La création automatique dans Google Drive nécessite un client OAuth Google.

## Structure et frontières entre outils

La source de vérité est `src/lib/drive-folder-templates.ts`. L’aperçu, la copie texte et la création Google utilisent cette même structure.

- `00 — À classer` : une seule boîte d’entrée, toujours incluse dans le formulaire.
- `01 — Administration & finance` : société et juridique, assurances, banque et financements, comptabilité par exercice, budget et trésorerie, fournisseurs et abonnements, locaux et matériel, archives du domaine.
- `02 — Dossiers clients` : dossiers créés au fil des besoins et dossiers archivés.
- `03 — Équipe` : facultatif et décoché au départ ; recrutement, dossiers collaborateurs, documents employeur, archives RH.
- `04 — Communication` : identité visuelle, photos et vidéos, présentations et supports, site et publications, archives du domaine.

Tous les domaines hors À classer peuvent être décochés. Les numéros restent stables même si un domaine est omis. Aucun dossier client, collaborateur, recrutement ou fournisseur fictif n’est généré. Leur arborescence détaillée est consultable dans « À ajouter au fil des besoins », alimentée par `COMPANY_DRIVE_DOSSIER_GUIDES`.

La comptabilité commence par l’exercice choisi dans le formulaire, prérempli avec l’année courante, avec factures de vente, factures d’achat, relevés bancaires, notes de frais et justificatifs, déclarations fiscales, bilan et clôture. Les exercices précédents restent sous Comptabilité ; pas d’archives annuelles générales à la racine.

Drive conserve les fichiers. Notion porte le cap de l’entreprise, les objectifs, indicateurs, décisions, tâches, réunions et procédures. La facturation et les opérations déjà couvertes restent dans l’outil métier. Ne pas recopier systématiquement les documents de l’outil comptable : conserver seulement les exports et justificatifs utiles selon l’organisation choisie avec le comptable.

Pas de dossier Modèles général : devis dans l’outil de facturation, comptes rendus et procédures dans Notion, présentations dans leur outil de création ou dans Communication / Présentations, contrat type client dans Dossiers clients seulement s’il est réellement utilisé dans Drive.

## Confidentialité

Le cadenas de l’aperçu signifie **accès restreint recommandé**, pas accès déjà configuré. Le générateur crée des dossiers, sans définir de permissions ni modifier les partages existants. Vérifier les accès avant de déposer des pièces financières ou RH ; ne pas partager globalement la racine avec toute l’équipe. Un lien Notion vers Drive ne remplace pas le contrôle des permissions dans Drive.

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

Pour le développement local actuel sur le port 3001, ajouter également :

   `http://127.0.0.1:3001/api/modeles/structure-google-drive-entreprise/drive/callback`

Le protocole, l’hôte, le port, le chemin et l’éventuel slash final doivent
correspondre exactement. Si le site est ouvert avec `localhost` plutôt que
`127.0.0.1`, ajouter et utiliser cette variante :

   `http://localhost:3001/api/modeles/structure-google-drive-entreprise/drive/callback`

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

1. Ouvrir le modèle et vérifier que le bouton affiche `Créer automatiquement dans mon Drive`.
2. Saisir le nom du dossier principal, vérifier le premier exercice comptable, sélectionner les domaines utiles, puis cliquer sur le bouton.
3. Autoriser Demaa sur l’écran Google.
4. Vérifier la redirection vers le nouveau dossier et la présence des domaines sélectionnés (quatre au départ, cinq avec Équipe).
5. Vérifier les six sous-dossiers comptables sous l’exercice courant et l’absence de dossiers fictifs.
6. Vérifier les permissions avant d’ajouter des fichiers. Aucune restriction n’est appliquée automatiquement.
7. Tester aussi la copie texte : même sélection, même ordre et aucun appel à Google.

Pour les premiers essais, conserver l’application OAuth en mode `Testing` et
ajouter les comptes testeurs. Avant l’ouverture à tous les comptes Google, passer
l’application en production et terminer la vérification OAuth demandée par Google.

La portée OAuth demandée est uniquement `https://www.googleapis.com/auth/drive.file`. Le jeton d’accès est utilisé pendant le callback pour créer l’arborescence, puis il est abandonné. Aucun jeton Google n’est conservé en base.

En cas d’échec pendant la création, Demaa attend la fin des créations déjà lancées puis supprime le dossier racine de l’essai. La réponse de Google est vérifiée : si ce nettoyage ne peut pas être confirmé, l’utilisateur est invité à vérifier son Drive et à supprimer lui-même le dossier incomplet.
