# Simplification de Demaa — 3 octobre 2026

Cette livraison remplace les décisions de navigation et de présentation du premier plan de consolidation.

## Ligne directrice

Demaa crée des entreprises et partage des ressources pour entreprendre. Trois entrées publiques : Studio, Solutions, Academy. Les URL existantes de Solutions et des tutoriels sont conservées.

## Étapes réalisées

1. Navigation typographique sans capsule, icônes ni fond actif ; soulignement de la page courante. Les fiches projet et les pistes activent Studio.
2. Ressources limitées à Solutions et Academy. L’offre d’accompagnement à quatre semaines et son diagnostic sont retirés du parcours public. `/accompagnement` redirige vers `/tutoriels` et sort du sitemap. Les composants et contenus anciens restent dans le code et dans Git.
3. Trois projets illustrés : Tiimora, Dumaan et MND. Les autres initiatives et partenaires sont présentés en texte.
4. « Construire avec nous » présente six pistes avec leur proposition, l’expérience recherchée et un lien mailto par projet. Aucune image ni indication de maturité. Aucune candidature n’a été envoyée pendant les vérifications.
5. Les anciennes fiches de pistes restent accessibles, sans photo ni statut visible, afin de conserver les URL. Les données et images originales ne sont pas supprimées.
6. Dumaan est présenté comme une activité alimentaire B2B. Son visuel corrigé montre des grands conditionnements de pastels surgelés, mafé et légumes découpés, avec une caisse sur chariot. Les tailles imprimées (2 L et 2,5 kg) sont illustratives et ne constituent pas un conditionnement commercial confirmé.

## Images et Canva

Le site utilise `public/images/studio/dumaan-restauration-v2.webp`. L’ancienne image reste conservée. L’original haute définition corrigé, prêt à importer dans le deck, est sauvegardé dans `../output/consolidation-demaa-2026-10-03/dumaan-restauration-pour-canva.png`. Le deck Canva partagé n’a pas été modifié ; le remplacement y reste à effectuer dans un accès éditable. La provenance est documentée dans `studio-image-provenance.json`.

## Validation et publication

43 tests ciblés, ESLint et build de production avec TypeScript réussis. Contrôle navigateur de Studio, du menu, de la page de recrutement sans images/statuts et de l’affichage mobile. Prévisualisation : http://localhost:3013/studio.

La production demaa.fr n’est pas modifiée. Les limites Firebase de la livraison précédente restent applicables : vérifier les fiches métier et sessions avec le registre actif en préproduction. Les contacts mailto et paiements ne sont pas exercés.

## Ajustement final de navigation

Le menu retenu est désormais Studio, Opportunités, Academy. Solutions reste accessible comme « Outils et ressources par activité ». « Nous contacter » est le CTA par défaut des en-têtes publics. Les projets du deck restent conservés ; le deck n'a pas été modifié.

Une fiche Solutions peut utiliser le snapshot sous `next start` uniquement avec `DEMAA_LOCAL_SOLUTIONS_PREVIEW=true`, un hôte localhost/loopback, et sans indicateurs Vercel. Les déploiements conservent l'obligation du registre actif Firebase. Le bandeau « Aperçu local » reste visible. Les tests couvrent notamment le refus du fallback sur demaa.fr et sur Vercel.


## Academy consolidée le 3 octobre 2026

La navigation secondaire est Cours, Modèles, Solutions. Le menu principal reste Studio, Opportunités, Academy et conserve Nous contacter. Les dix cours partent de problèmes d’entrepreneurs et privilégient organisation et structuration : étapes, exemple fictif, exercice, support CSV, critères de vérification et piège à éviter. Les sujets ne sont pas présentés comme un classement de questions les plus fréquentes, faute d’étude de fréquence.

1. Tout repose sur moi : par quoi commencer pour organiser mon entreprise ?
2. Mon offre pourrait intéresser beaucoup de monde : à qui vendre en premier ?
3. Les clients ne comprennent pas mon offre : comment la rendre claire ?
4. Les gens aiment mon idée : comment savoir s’ils achèteraient ?
5. Les clients trouvent mon prix trop élevé : dois-je le baisser ?
6. Où trouver mes premiers clients et comment organiser ma prospection ?
7. J’oublie mes relances : comment suivre mes prospects simplement ?
8. Les commandes arrivent de partout : comment éviter les erreurs ?
9. Je dois tout corriger : comment mieux déléguer ?
10. Je travaille beaucoup : comment savoir si l’entreprise avance ?

Les anciennes pages et données ne sont pas supprimées : les quatre tutoriels Airtable restent dans une section complémentaire, les cinq anciennes méthodes restent accessibles à leurs URL et les modèles existants restent dans leur catalogue. Les dix nouveaux supports sont accessibles dans Modèles et directement depuis les exercices. Les fichiers sont des CSV UTF-8 avec BOM, séparateur point-virgule, une ligne d’exemple fictif et une ligne vide. Le chemin `/downloads/academy/` évite la redirection historique de `/academy`.

Les quatre paysages ont été générés avec imagegen puis optimisés en WebP 1600 × 900. Ils sont réutilisés dans les dix cartes et les en-têtes des cours, sans filtre d’illustration ni texte dans l’image. Assets : `public/images/academy/paysages/`. Sources éditoriales : `src/lib/academy-courses-data.json`. Aucun changement du deck Canva ni publication de production.

Validation : 45 tests ciblés passent, ESLint des fichiers modifiés passe. La suite globale lancée avant l’actualisation des assertions de navigation a donné 1703 tests passants, 8 tests en échec et 6 ignorés ; deux échecs liés au nouveau parcours ont depuis été corrigés et revérifiés dans les tests ciblés. D’autres échecs concernent des assertions de l’ancien accompagnement, l’ancien footer, la sélection Solutions, des imports `client-only` et des délais de test. La suite globale n’est pas déclarée verte.

La revue React conserve les textes côté serveur, ne transmet que les cartes à la recherche, utilise des clés stables et des champs de recherche accessibles, et garde le JSON-LD sérialisé par le helper existant. Le build final isolé `.next-academy-final` permet de préparer la nouvelle version sans modifier l’aperçu existant pendant la compilation.

Contrôles finaux : build de production et TypeScript réussis ; 27 pages et fichiers renvoient HTTP 200, le proxy bloque explicitement les cours inconnus avec HTTP 404 et noindex pour éviter le statut 200 du rendu en streaming. Recherche (résultat, résultat vide, filtre Organisation), téléchargement réel d’un support CSV, rubrique Solutions et fiche Cabinet comptable vérifiés dans le navigateur. Article mobile testé en 390 × 844, largeur de page égale au viewport. Le serveur local final utilise `.next-academy-final` sur le port 3013 avec les flags locaux déjà décrits.

## Simplification finale de la page Academy

Les deux textes introductifs de l’en-tête et la section « Mettre en pratique avec Airtable » ont été retirés à la demande de l’utilisateur. L’index affiche les dix cours ; les anciens tutoriels restent accessibles à leurs URL et depuis les modèles existants.

### Paysages Academy — 3 octobre 2026
- Dix miniatures remplacées : huit entrées Afrique (Siby/Mali, Santo Antão/Cap-Vert, Sine-Saloum/Sénégal, Haut Atlas/Maroc, Sossusvlei/Namibie), deux ailleurs (Vestrahorn/Islande et Dolomites/Italie). Sept visuels distincts.
- Aucun satellite ni ancienne photo d’Hombori. Pour le Mali : visuel généré réaliste, explicitement légendé « Inspiré de Siby · Mali », signalé IA dans les articles. Les références Siby Tourisme ne sont pas réutilisées faute de licence vérifiée.
- Six photographies sous licence Unsplash, sources et crédits consignés dans academy-landscape-selection-v2.json et liés depuis les articles. Recadrage 1600×900 WebP ; originaux précédents conservés pour retour arrière.
- Lieu discret sous chaque miniature ; mêmes visuels et légendes dans les articles. Texte des cours conservé.
- Validation : ESLint, huit tests ciblés, build Next/TypeScript, dix articles et sept fichiers HTTP 200 avec crédits, vérification visuelle dans navigateur local. Capture : output/consolidation-demaa-2026-10-03/academy-paysages-v2.png.
- Preview local : port 3013. Aucune publication en production.

### Légendes sur les photos
- À la demande de l’utilisateur, le lieu apparaît désormais en blanc en bas à droite de la photo, sur un dégradé discret, dans les miniatures et les articles.
- Libellé Mali : « Siby · Mali ». La nature générée et l’inspiration des reliefs du Mandé restent précisées dans le crédit de l’article et le manifeste.
