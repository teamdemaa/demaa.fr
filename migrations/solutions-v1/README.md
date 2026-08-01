# W4 — snapshot candidat Solutions/Outils

Ce dossier est une zone de migration offline. Il ne constitue ni un registre
produit, ni une source publiée, ni une autorisation éditoriale.

## Garanties

- les données sources sont les artefacts W2 figés au commit
  `4b8a5d77333f7f30d0d649a200a0414b1796a65f` ;
- leurs empreintes sont vérifiées avant chaque génération ;
- les 115 systèmes possèdent un verdict candidat explicite ;
- toutes les ressources et tous les besoins restent `pending` avec une relation
  commerciale `unknown` ;
- aucun placement approuvé ou publié n'est produit ;
- aucun fallback n'est créé ;
- aucun fichier de ce namespace n'est importé par `src/` ;
- le juridique externalisé des cabinets et la réponse aux appels d'offres du
  BTP sont conservés comme besoins non satisfaits, sans prestataire inventé.

## Fichiers

- `sources/` : copies immuables des deux audits W2 utilisés ;
- `source-manifest.json` : empreintes exactes des sources et des artefacts W2 ;
- `build-snapshot.mjs` : générateur déterministe et offline ;
- `solutions-migration-candidates.json` : projection candidate des 115 systèmes ;
- `output-manifest.json` : empreinte et compteurs du résultat généré.

## Reproduction

```bash
node migrations/solutions-v1/build-snapshot.mjs --check
```

Pour générer dans un dossier isolé :

```bash
node migrations/solutions-v1/build-snapshot.mjs --output-dir /private/tmp/demaa-solutions-output
```

La commande ne lit ni `src/`, ni Firestore, ni le réseau. Toute promotion vers
un registre produit exige une revue éditoriale distincte et un nouveau GO.
