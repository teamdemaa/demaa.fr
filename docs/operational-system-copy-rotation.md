# Rotation privée des copies des systèmes opérationnels

Cette procédure prépare une rotation sans afficher les identifiants, sans les
commiter et sans modifier les fichiers Google Sheets existants. Aucune étape
Production ne doit être exécutée sans un `GO PROD` explicite.

## 1. Préparer les nouvelles copies

1. Créer une nouvelle copie modifiable distincte pour chacun des 115 systèmes.
2. Conserver le mapping `slug → URL ou identifiant` dans un fichier local
   ignoré par Git, par exemple `private/new-copy-registry.json`.
3. Ne modifier ni les droits, ni les URL, ni les fichiers actuellement
   utilisés pendant cette préparation.

## 2. Valider hors du dépôt public

```bash
node scripts/prepare-operational-system-copy-rotation.mjs \
  --input private/new-copy-registry.json \
  --output private/new-copy-registry.normalized.json \
  --hash-output private/new-copy-registry.hashes.json
```

Le script vérifie :

- exactement 115 slugs publiés ;
- un identifiant Google Sheets valide et unique par slug ;
- l'absence de réutilisation d'un identifiant courant lorsque le secret actuel
  est disponible dans l'environnement ;
- une sortie privée avec des droits fichier restreints.

Il n'appelle ni Google Drive ni Vercel et n'effectue aucune rotation.

## 3. Valider en Preview

1. Ajouter le contenu compact de
   `private/new-copy-registry.normalized.json` dans le secret
   `OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON`, uniquement pour l'environnement
   Preview et la branche de rotation.
2. Déployer une Preview.
3. Vérifier une demande réelle sur un échantillon représentatif, puis les 115
   correspondances avec un contrôle serveur qui ne journalise jamais les
   identifiants.
4. Vérifier que l'API répond uniquement `{ "ok": true }` et qu'aucune URL de
   copie n'apparaît dans le HTML, les réponses ou les logs client.

## 4. Préparer le garde-fou

Fusionner les empreintes du fichier privé
`private/new-copy-registry.hashes.json` dans
`scripts/private-operational-system-sheet-id-hashes.json`, sans copier les
identifiants eux-mêmes. Exécuter ensuite :

```bash
npm run audit:private-operational-assets
```

## 5. Bascule Production après autorisation

Après un `GO PROD` explicite seulement :

1. sauvegarder la configuration active sans l'afficher ;
2. remplacer atomiquement le secret Production ;
3. déployer et contrôler les envois ;
4. surveiller les erreurs avant toute révocation ;
5. révoquer les anciens liens uniquement après confirmation de la stabilité et
   selon une fenêtre de retour arrière convenue.

La préparation décrite ici ne révoque et ne remplace aucun lien existant.
