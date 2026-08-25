# Standard éditorial — « Organiser »

## Décision et promesse

La destination française visible s’appelle `Organiser` et sa route canonique est
`/organiser`. L’identifiant technique `academy`, les API et les caches
historiques restent inchangés. L’ancienne route `/academie` redirige de manière
permanente vers `/organiser`.

La phrase de référence est :

> On aide les dirigeants à mieux s’organiser grâce à des applications métier
> adaptées.

La navigation publique suit le parcours :

`Plan d’action → Organiser → Application métier`

- `Plan d’action` aide le dirigeant à choisir ses priorités ;
- `Organiser` regroupe les solutions par métier et montre comment un travail
  réel doit circuler ;
- `Application métier` présente l’accompagnement pour construire un outil
  adapté lorsque les logiciels existants ne suffisent plus.

Dans `Organiser`, la sous-navigation est verrouillée dans l’ordre
`Solutions → Processus`. `Solutions` est l’entrée par défaut et demande
l’activité avant d’afficher un contenu contextualisé. `Processus` contient les
quatorze guides. Aucun onglet Solutions n’est affiché dans le Plan d’action.

`Organiser` n’est ni une académie classique ni un blog généraliste. C’est une
bibliothèque de processus opérationnels pour les TPE.

## Référence qualité

Le guide « Comment organiser une entreprise de plomberie, de la demande à la
facture » est le pilote canonique. Chaque nouveau guide doit atteindre la même
précision, mais ne doit pas en recopier artificiellement les formulations.

La référence visuelle historique est conservée dans
`docs/assets/organiser-article-plomberie-reference.png` jusqu’à la prochaine
capture automatisée depuis le runtime. Cette capture est antérieure au
changement de libellé : son lien `Retour à Structurer` n’est pas normatif et le
rendu courant doit afficher `Retour à Organiser`. La miniature de référence et
sa source éditable sont conservées dans
`docs/assets/organiser-process-thumbnail-reference.png` et
`docs/assets/organiser-process-thumbnail-reference.svg`. Le runtime, la carte
et l’article sont désormais alimentés par la même donnée structurée dans
`src/lib/organiser-process-guides.ts`.

La source éditoriale peut conserver des champs opérationnels détaillés pour la
revue interne. Ils ne sont pas tous affichés : le rendu public reste aussi
direct et léger que le pilote validé.

## Source unique obligatoire

Chaque guide contient exactement six macro-étapes. La même liste alimente :

1. la miniature 16:9 de la carte ;
2. le process map affiché dans l’article ;
3. les règles et l’exemple qui expliquent son fonctionnement ;
4. le texte alternatif et les métadonnées associées.

Une étape ne doit jamais être corrigée seulement dans la miniature ou seulement
dans le corps du texte.

## Fiche de préparation

Avant la rédaction, chaque sujet doit préciser :

- l’entreprise concernée et son activité ;
- la taille ou le volume utile pour comprendre le cas ;
- le déclencheur du processus ;
- le résultat final observable ;
- les six étapes ;
- l’entrée, l’action, le responsable, la sortie et le contrôle de chaque étape ;
- les exceptions qui doivent remonter à la direction ;
- un exemple qui traverse tout le flux ;
- les outils réellement nécessaires ;
- le système métier auquel renvoie le guide.

Si le flux ne peut pas être compris sans le corps de l’article, la fiche n’est
pas prête.

## Structure verrouillée d’un guide

1. Eyebrow métier et durée de lecture.
2. H1 explicite orienté recherche et résultat.
3. Réponse courte décrivant le bénéfice du processus.
4. Portrait de l’entreprise, jamais d’un personnage fictif.
5. Friction observable dans le fonctionnement actuel.
6. Process map complet.
7. Quatre à six règles du système.
8. Un exemple compact traversant le processus.
9. Outils recommandés et CTA `Voir les solutions [métier]`.
10. Checklist pour démarrer aujourd’hui.
11. Trois questions fréquentes utiles.
12. Résultat final attendu.

Les champs de préparation `entrée`, `responsable`, `sortie` et `contrôle`
restent dans la source pour valider le réalisme des étapes. Ils ne deviennent
jamais des colonnes, des cartes ou une section « étapes une par une » dans
l’article public. Les blocs « point de départ », « rythme de pilotage » et
« exceptions à remonter » sont eux aussi réservés à la préparation interne.

## Règles du process map

- Format carte : 16:9.
- Six blocs blancs sur une surface vert sauge très claire.
- Trois étapes de gauche à droite sur la première ligne.
- Descente à droite.
- Trois étapes de droite à gauche sur la seconde ligne.
- Deux à quatre mots par libellé.
- Premier bloc : événement d’entrée observable.
- Dernier bloc : résultat terminé, transmis, validé ou facturé.
- Aucun titre marketing, logo, portrait, photo, icône ou décoration.
- Aucune opacité globale à 60 % : le texte reste à contraste plein.
- Dans le corps de l’article, les six étapes deviennent une colonne lisible de
  haut en bas sur mobile.

## Présentation dans la bibliothèque

- Le titre sous la miniature utilise une taille réduite de 20 % par rapport aux
  autres cartes de bibliothèque et une opacité de 59 %.
- La ligne secondaire suit exactement `Process · [métier] · [durée] min`.
- Cette ligne reste sur une seule ligne et utilise elle aussi une taille réduite
  de 20 % et une opacité de 59 %.
- Le process map lui-même conserve son contraste de lecture normal.
- La miniature conserve toujours un ratio 16:9, y compris sur mobile.
- Elle utilise une seule surface vert sauge arrondie, sans cadre blanc ni
  second contour autour du fond.
- Son process map reste en deux rangées de trois étapes sur toutes les largeurs ;
  il ne bascule jamais dans la présentation verticale réservée à l’article.
- Le 16:9 encadre la process map sans l’étirer : les blocs conservent la
  proportion horizontale de la référence validée, soit environ `2,48:1`, avec
  l’espace vertical réparti autour de la grille.

## Les quatorze guides de la collection

1. Entreprise de plomberie : de la demande à la facture.
2. Entreprise de rénovation : du premier contact au devis signé.
3. Chantier de menuiserie : du devis signé à la réception.
4. Société de nettoyage : interventions récurrentes et contrôle qualité.
5. Garage automobile : du rendez-vous au paiement.
6. Restaurant : commandes, livraisons et stocks.
7. Organisme de formation : de l’inscription à l’attestation.
8. Agence : du brief à la facturation.
9. Centraliser les demandes reçues par téléphone, SMS et WhatsApp.
10. Organiser le planning de plusieurs techniciens.
11. Passer d’un bon d’intervention à la facture sans ressaisie.
12. Choisir un logiciel quand Excel ne suffit plus.
13. Évaluer la rentabilité d’une application métier.
14. Choisir un logiciel existant ou construire son propre outil.

## Outils et liens

- Aucun outil n’est ajouté pour remplir une carte.
- L’outil doit exister dans le répertoire canonique Demaa.
- Sa carte explique le besoin précis qu’il soutient.
- Le clic ouvre la fiche canonique de l’annuaire et sa modal lors d’une
  navigation interne.
- Le CTA placé avec les outils renvoie vers les solutions du système métier
  correspondant via `/organiser?tab=solutions&system=[métier]`.
- Chaque guide possède une image Open Graph et X générée depuis les mêmes six
  étapes, sans titre marketing ni décoration supplémentaire.
- Le JSON-LD utilise l’URL publique stable
  `/organiser/[slug]/process-map.png`, alimentée par le même générateur.

## Grille de validation sur 20

| Critère | Points |
| --- | ---: |
| Clarté du processus | 4 |
| Réalisme métier | 4 |
| Utilité immédiate | 4 |
| Qualité de l’exemple | 2 |
| Pertinence des outils | 2 |
| Cohérence carte / process map / article | 2 |
| Lisibilité et qualité éditoriale | 2 |

Un guide n’est publiable qu’à partir de 17/20. Les trois premiers critères ne
peuvent recevoir moins de 3/4.

La note et sa date de revue sont enregistrées avec le guide. Les tests refusent
un score inférieur à 17/20, un des trois premiers critères inférieur à 3/4, un
champ opérationnel vide ou un guide hors de la plage de profondeur.

## Recette obligatoire

- Comparer le guide au pilote plomberie.
- Vérifier la carte à 320, 768 et 1 280 px.
- Lire le process map sans le texte de l’article.
- Vérifier le clavier, les libellés accessibles et le retour à `Organiser`.
- Ouvrir chaque fiche outil et revenir à l’article.
- Tester le CTA `Voir les solutions [métier]`.
- Vérifier titre, description, canonical, Open Graph, X et JSON-LD.
- Vérifier que le JSON-LD de chaque nouveau guide référence son process map
  dynamique comme image d’article.
- Vérifier que les anciennes formations restent masquées et que leurs routes
  directes ne perdent aucune progression. Elles restent accessibles pour
  compatibilité, mais sont en `noindex` et absentes du sitemap public.

## Garde-fous contre la dilution

- Écrire le process map avant le corps du guide.
- Décrire des actions et résultats observables, jamais des conseils abstraits.
- Donner un responsable et une prochaine action au travail qui avance.
- Parler de l’entreprise ; un rôle peut être cité, pas un personnage inventé.
- Refuser une étape qui n’a ni sortie claire ni contrôle.
- Refuser un outil sans lien direct avec le processus.
- Motiver toute exception au gabarit pendant la revue éditoriale.
