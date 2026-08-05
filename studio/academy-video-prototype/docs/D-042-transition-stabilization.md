# D-042 — Stabilisation des transitions

## Décision canonique

Le profil `stable` est la base des prochains rendus :

- aucun scale animé sur le texte ;
- aucun zoom lent sur les écrans de texte ;
- translation verticale maximale de 12 px ;
- courbe d’entrée sans rebond ;
- translations verticales arrondies au pixel ;
- hauteurs de la waveform arrondies au pixel.

Le profil `legacy` reste disponible uniquement pour reproduire le témoin A.

## Reproduire le test A/B

Depuis `studio/academy-video-prototype` :

```bash
npm run transition:ab -- \
  --course=gestion-tresorerie \
  --from=80 \
  --seconds=14
```

Le script impose :

- la même scène pour tout l’extrait ;
- les mêmes frames et la même durée pour A et B ;
- une piste audio commune, encodée une seule fois puis copiée dans A et B ;
- 1920 × 1080 ;
- 30 fps ;
- H.264, `yuv420p`, plage TV ;
- matrice, primaires et transfert BT.709.

Les fichiers de contrôle sont écrits dans `output/transition-ab/`.

## Pipeline master préparé

Le rendu segmenté :

- refuse une cadence différente de 30 fps ;
- rend les segments en `yuv420p` et BT.709 ;
- utilise un GOP de 60 images ;
- conserve des plages de frames inclusives et contiguës.

Le remux final ajoute les informations VUI H.264 BT.709 sans réencoder la
vidéo. Le QA vérifie désormais la matrice, les primaires et la courbe de
transfert BT.709.

## Limites du checkpoint

- Aucun master complet n’a été rendu.
- Aucun master publié n’a été remplacé.
- Aucune voix n’a été générée.
- Aucun appel ElevenLabs, YouTube ou site n’a été effectué.
