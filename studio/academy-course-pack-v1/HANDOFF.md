# Handoff — Académie v1

## Périmètre prêt à intégrer

- Six cours indépendants dans la section `Cours fondamentaux`.
- Un cas dans la section `Cas concrets`.
- Aucun contenu vidéo et aucun parcours obligatoire.
- Un seul moteur d’affichage pour les cours et les cas.
- Zéro ou un CTA final selon le contenu.

Les sept fichiers marqués `ready` sont dans `courses/` et `cases/`. Le contrat est décrit par `schema/course-definition.schema.json` et vérifié par `scripts/validate-course-pack.mjs`.

## Page d’accueil

1. Réutiliser exactement le header public existant.
2. Afficher le titre `Apprendre à entreprendre`.
3. Ajouter une recherche pleine largeur, très arrondie.
4. Afficher `Cours fondamentaux` avec trois cartes 16:9 par ligne sur desktop et une par ligne sur mobile.
5. Afficher `Cas concrets` sous les cours avec la carte JUSTE.
6. Une carte contient uniquement la vignette, le titre et la méta déjà fournis dans `identity.card`.
7. Une carte ouvre directement son contenu ; aucun écran d’introduction intermédiaire.

## Lecteur générique

Ordre immuable :

1. Titre, promesse et progression discrète.
2. Une leçon par écran, dans l’ordre de `lessons`.
3. Navigation principale par flèche `Suivant` ; flèche `Précédent` secondaire.
4. Un récapitulatif `Le cours en quatre phrases`.
5. Trois questions sous `Avez-vous bien retenu ?`, avec explication immédiate après réponse.
6. Le CTA final seulement si `action` n’est pas nul.
7. Fin du cours avec retour simple vers l’Académie.

Le lecteur rend les mêmes blocs pour `course` et `case-study`. Seuls la section de la page d’accueil et le libellé de contexte changent.

## CTA

- `Levier` : bouton MVP `Recevoir Levier`, livraison par email.
- `Tableau de pilotage Marketing & Vente` : utiliser le mode décrit par `deliveryMode`.
- Ne jamais ajouter un deuxième CTA ou un lien `système lié`.
- Le cours sur la délégation se termine sans CTA.

## Règles de rendu

- Interface calme, fond clair, texte court et grandes respirations.
- Les six cours utilisent les illustrations Demaa de `public/images/academy/illustrations/`. JUSTE conserve une image réaliste de marque ; ne pas générer de photographie pour les cours fondamentaux.
- Les visuels structurés de chaque leçon sont rendus depuis `visual.type` et `visual.data` ; ne pas les convertir en grandes illustrations décoratives.
- Aucun badge de gamification permanent. La progression et le résultat du quiz suffisent pour la v1.
- Les réponses fausses ne bloquent jamais la suite.
- L’état de progression est local et repris à la réouverture, sans imposer l’achèvement.

## Contrôle avant mise en ligne

```bash
node studio/academy-course-pack-v1/scripts/validate-course-pack.mjs
```

Critères d’acceptation :

- sept contenus visibles dans les bonnes sections ;
- trois cartes par ligne sur desktop, une sur mobile ;
- aucune vidéo ;
- une idée par écran ;
- quatre points de récapitulatif et trois questions par contenu ;
- au plus un CTA ;
- navigation clavier et mobile fonctionnelle ;
- aucune régression sur le header public existant.
