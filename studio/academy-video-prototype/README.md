# Demaa — moteur de mini-cours vidéo

Pipeline Remotion pour produire des mini-cours 16:9 destinés aux dirigeants de
TPE. Le contenu, les changements d’écran, les repères de narration et les
sorties sont définis par cours. Le moteur visuel n’a pas besoin d’être modifié
pour chaque nouveau sujet.

## Masters validés

- cours : `gestion-tresorerie` et `chiffre-affaires-benefice` ;
- 1920 × 1080, 30 images/seconde ;
- durées : 3 min 18,2 s et 3 min 31,7 s ;
- police Satoshi ;
- voix ElevenLabs « Grandfather Joe » ;
- prise source à 0,96×, post-traitement validé à 1,2× ;
- aucune musique ;
- clics légers pendant le titre tapé ;
- onde vocale discrète de 128 barres, collée en bas, avec une opacité de
  18 à 28 % et une amplitude fortement lissée ;
- signature « Demaa » en Gambetta Light Italic sur l’écran final ;
- sorties :
  - `output/cours-gestion-tresorerie-final.mp4` ;
  - `output/cours-chiffre-affaires-benefice-final.mp4`.

## Principe

`content/course-catalog.json` associe un slug aux fichiers d’un cours :

- contenu éditorial ;
- timing source et timing final ;
- alignement ElevenLabs ;
- narration source et narration rythmée ;
- statut et empreintes d’approbation ;
- fichier vidéo final.

Les scènes peuvent contenir des `beats`. Chaque beat décrit un écran, son
gabarit et son heure de début. Une `cue` optionnelle désigne la phrase prononcée
qui justifie le changement. Le validateur compare le timing configuré à
l’alignement caractère par caractère fourni par ElevenLabs.

## Commandes quotidiennes

```bash
# Consulter le statut, les approbations et l’intégrité du master
npm run course:status -- --course=gestion-tresorerie

# Vérifier le contenu, les assets, les timings et les cues
npm run course:validate -- --course=gestion-tresorerie

# Produire un aperçu de 10 secondes
npm run course:preview -- --course=gestion-tresorerie --seconds=10

# Construire avec les caches existants, rendre puis contrôler le MP4
npm run course:build -- --course=gestion-tresorerie

# Contrôler un master déjà rendu
npm run course:qa -- --course=gestion-tresorerie

# Ouvrir Remotion Studio
npm run studio
```

`course:build` ne déclenche jamais silencieusement une dépense ElevenLabs. Si
la narration manque ou ne correspond plus au texte, la commande s’arrête.

## Produire un nouveau cours

Le pipeline impose les états suivants :

`draft → script-approved → voice-approved → render-ready → final`

Le statut `final` ne peut être attribué que par un contrôle qualité réussi.

1. Créer automatiquement les dossiers, le contenu et l’entrée du catalogue :

```bash
npm run course:new -- --slug=<slug> --title="<titre>"
```

2. Écrire le cours, valider le brouillon et enregistrer l’approbation :

```bash
npm run course:validate:draft -- --course=<slug>
npm run course:stage -- --course=<slug> --set=script-approved
```

3. Après accord explicite sur la dépense ElevenLabs, générer et approuver la
voix :

```bash
npm run course:voice -- --course=<slug> --force
npm run course:stage -- --course=<slug> --set=voice-approved
npm run course:pace -- --course=<slug> --force
npm run course:stage -- --course=<slug> --set=render-ready
```

4. Prévisualiser, puis construire le master :

```bash
npm run course:preview -- --course=<slug> --seconds=10
npm run course:build -- --course=<slug>
```

Pour préparer plusieurs cours sans les rendre :

```bash
npm run course:build:batch -- --courses=<slug-1>,<slug-2> --dry-run
```

Le lot réel est traité séquentiellement afin de limiter l’usage de la mémoire
et de l’espace disque.

La génération ElevenLabs est mise en cache avec un hash du texte, de la voix,
du modèle et des réglages. Le post-traitement audio possède un second cache
fondé sur la prise source et le rythme. `--force` est donc une décision
explicite, jamais un comportement par défaut.

## Étapes du pipeline

1. validation éditoriale et technique ;
2. réutilisation de la narration en cache ;
3. réutilisation du rythme 1,2× en cache ;
4. rendu vidéo sans audio par segments, puis assemblage ;
5. mix narration + clics de l’intro ;
6. normalisation des timestamps à la cadence exacte ;
7. contrôle du codec, de la résolution, de la cadence, de la durée, du volume
   et décodage intégral ;
8. enregistrement du hash du master et du rapport QA dans
   `production.json`.

## Deuxième cours de contrôle

`chiffre-affaires-benefice` est finalisé. Son contenu, sa voix, son
alignement mot par mot et son rendu ont été produits avec le même moteur que le
premier cours, sans modification spécifique du pipeline. Le contrôle qualité
valide le décodage intégral, le format 1920 × 1080 à 30 images/seconde et un
niveau sonore intégré de -15,78 LUFS.

## Miniatures Académie

Le gabarit `AcademyThumbnail` produit les miniatures 16:9 en 1280 × 720 à
partir de `content/academy-thumbnails.json`.

```bash
npm run thumbnail:render -- --thumbnail=entreprise-rentable-sans-tresorerie
npm run thumbnail:render -- --thumbnail=chiffre-affaires-benefice
```

La couleur du croquis dépend automatiquement du thème :

- `sage` : fond `#eef2ed`, titre et croquis `#315f46` ;
- `forest` : fond `#315f46`, titre et croquis clairs.

Chaque entrée possède un objet `composition` distinct. Ses blocs `title` et
`artwork` portent leur propre `scale`, `offsetXPercent` et
`offsetYPercent`. Les valeurs par défaut du composant sont respectivement `1`,
`0` et `0` lorsqu’un champ est absent.

Le bloc `safeZone` documente le crop central cible et le ratio central minimal
strictement sûr mesuré sur le rendu 1280 × 720. Le crop cible commun est le
cadre central 4:3 de 960 × 720 pixels. Les valeurs ne doivent jamais être
recopiées d’une illustration à l’autre sans nouvelle mesure :

- `entreprise-rentable-sans-tresorerie` : croquis `1.25×`, décalage horizontal
  `-10 %`, titre `+17 %`, ratio central minimal sûr `1.2722:1` ;
- `chiffre-affaires-benefice` : croquis `sqrt(2)×`, décalage horizontal
  `-6.3 %`, titre à `0.69×` et `+15.9 %`, ratio central minimal sûr
  `1.3056:1`.

Les offsets verticaux restent explicitement à `0 %` pour les deux compositions
après audit de leurs alignements optiques. Le rendu 16:9 reste prioritaire,
puis le crop 4:3, puis le ratio central minimal documenté.

Le rendu est écrit dans `output/thumbnails/` sans modifier le master vidéo.

## Secrets

Copier `.env.example` vers `.env.local` et renseigner :

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

`.env.local`, les fichiers audio, les rendus et les props générées sont ignorés
par Git.
