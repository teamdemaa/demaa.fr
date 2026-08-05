# D-041 — Compatibilité des cours 1 et 2 avec un crop central 4:3

## Décision

Les compositions restent des masters 16:9 en 1920 × 1080. Toute information essentielle
doit rester dans la zone centrale de 1440 × 1080, comprise entre `x = 240` et `x = 1680`.
Les fonds et les accents purement décoratifs peuvent dépasser cette zone.

Cette règle ne crée aucune version 9:16 et ne modifie ni les scripts, ni les voix, ni les
timings, ni les masters publiés.

## Étendue de l'audit

- `gestion-tresorerie` : 24 états représentatifs audités.
- `chiffre-affaires-benefice` : 16 états représentatifs audités.
- Total : 40 états rendus depuis le composant produit réel.
- Pour chaque état : image 16:9 brute, superposition de la safe zone et crop central 4:3.

## Corrections ciblées

- Intro titre : contenu essentiel recentré dans la zone centrale.
- Transition d'intro : copie et illustration contenues dans 1440 px.
- Scènes texte + illustration : largeur utile et illustration ajustées sans offset uniforme.
- Comparaisons et cartes : largeur maximale ramenée à 1400 px.
- Timeline : largeur, colonnes et labels contenus dans le crop.
- Scènes croissance et point bas : graphiques et titres contenus dans la zone centrale.
- Actions numérotées : chiffres, titres et tags rapprochés.

## Résultat

Après correction, les 40 états conservent dans le crop 4:3 :

- tous les titres et intertitres ;
- tous les chiffres et unités ;
- tous les tableaux, cartes et graphiques utiles ;
- toutes les illustrations porteuses de sens ;
- la signature finale Demaa.

Les compositions 16:9 restent équilibrées : les gouttières latérales de 240 px servent de
respiration, sans contraindre les fonds ou les éléments décoratifs.

## Preuves

### Cours 1 — Gestion de la trésorerie

- Avant :
  `output/safe-zone-audit/before/gestion-tresorerie/gestion-tresorerie-before-contact.png`
- Après :
  `output/safe-zone-audit/after/gestion-tresorerie/gestion-tresorerie-after-contact.png`

### Cours 2 — Chiffre d'affaires ≠ bénéfice

- Avant :
  `output/safe-zone-audit/before/chiffre-affaires-benefice/chiffre-affaires-benefice-before-contact.png`
- Après :
  `output/safe-zone-audit/after/chiffre-affaires-benefice/chiffre-affaires-benefice-after-contact.png`

Les sous-dossiers contiennent aussi les preuves unitaires `*-raw.png`, `*-overlay.png` et
`*-crop.png`.

## Reproduction

```bash
npm run audit:safe-zone -- --checkpoint=after --courses=gestion-tresorerie,chiffre-affaires-benefice
```

## Intégrité des masters publiés

- `cours-gestion-tresorerie-final.mp4`
  SHA-256 : `3fd426d921c33a6f483d17fe5fd3e26bf61e6d6f71ca309e34dd7a41008fe69c`
- `cours-chiffre-affaires-benefice-final.mp4`
  SHA-256 : `5dc0b4ebd81d64e104d6f2b35bb4be4fad5ca77ee8480c4efa9f2c30139fd8ea`

Ces deux fichiers n'ont pas été modifiés.
