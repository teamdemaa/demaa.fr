# ADR 0003 - Architecture publique France et retrait des routes historiques

- Statut : `validated`
- Date : 9 août 2026
- Portée : architecture publique France, navigation, contenus et politique de
  retrait des anciennes URL
- Base d'implémentation : `a58a191847867b700ad71ad40e6e8e6436d34d44`

> Mise à jour : les passages relatifs aux Services, à leur placement dans les
> Systèmes, à l'Académie et aux Ressources sont supersédés par l'ADR 0004. La
> route canonique des fiches Système est supersédée par l'ADR 0007. Le point 3
> autorisant `/` à reproduire `/systemes` est supersédé par l'ADR 0008 ; le hub
> public `/systemes` et le reste de cette ADR demeurent applicables.

## Contexte

Demaa prépare son lancement France sur `demaa.co`. Le produit a évolué par
étapes : anciens kits opérationnels, pages Modèles, Ressources, Services,
Académie, puis Systèmes métier. Plusieurs URL historiques existent encore,
alors que leurs contenus ont été déplacés dans les Systèmes ou l'Académie.

La priorité est de conserver une architecture simple et une seule destination
canonique par intention, sans casser les liens qui possèdent encore un
équivalent utile ni les livraisons historiques envoyées par e-mail.

## Décision

### Architecture publique France

1. `demaa.co` est le domaine canonique. `demaa.fr`, `www.demaa.fr` et
   `www.demaa.co` redirigent en permanence vers ce domaine en conservant le
   chemin et la query string.
2. La navigation principale expose deux univers :
   **Système métier** et **Académie**.
3. `/systemes` est le hub canonique des 115 systèmes. `/` peut présenter le
   même point d'entrée, sans créer un troisième univers de navigation.
4. Une fiche `/systemes/[slug]` contient seulement :
   **Process**, **Solutions** et **Ressources**.
5. Ressources conserve les guides, modèles et documents contextualisés au
   métier. L'Académie reste le hub global des contenus pédagogiques.
6. La règle historique sur les CTA de Process et Solutions est supersédée par
   les parcours définis dans l'ADR 0004.
7. `/opportunites` et `/rejoindre-team-demaa` sont les deux parcours publics
   du réseau de prestataires. Ils restent distincts des Solutions d'un métier.
8. `/services` et `/sur-mesure` ne font pas partie de la navigation principale.
   Leur contenu et leur placement sont désormais définis par l'ADR 0004.
9. L'internationalisation, les préfixes de locale et les variantes par pays
   restent différés. Le lancement courant est la version France sans préfixe
   `/fr`.

### Sources de vérité et livraisons

- Firebase reste la source de vérité distante des Solutions et du réseau de
  prestataires lorsque l'environnement est configuré.
- Les ressources publiques d'un système sont décrites par le catalogue
  Ressources ; leurs destinations privées et leurs révisions historiques
  restent résolues côté serveur.
- Le retrait d'une page publique ne doit jamais supprimer un asset privé, une
  révision, un endpoint de livraison ou une destination déjà envoyée par
  e-mail.

### Politique de retrait des URL

- Une URL ancienne qui possède un successeur clair reçoit une redirection
  permanente `308` vers ce successeur.
- Une URL générique dirige vers le hub actif le plus proche uniquement lorsque
  l'intention reste équivalente.
- Une URL inconnue sous un espace retiré répond `404` avec
  `X-Robots-Tag: noindex, nofollow`.
- Une redirection de domaine s'applique avant la politique de retrait : une URL
  demandée sur `demaa.fr` arrive d'abord sur la même URL de `demaa.co`, puis
  suit sa destination canonique.
- La matrice opérationnelle exhaustive est versionnée dans
  [`docs/legacy-route-retirement-matrix.md`](../legacy-route-retirement-matrix.md).

## Conséquences

- Les routes App Router mortes de `modeles-de-documents` peuvent être
  supprimées, mais les anciennes URL connues restent redirigées.
- Les deux composants de redirection Opportunités peuvent être remplacés par
  des redirections déclaratives dans `next.config.ts`.
- Les redirections spécifiques sont évaluées avant Proxy. Proxy ne traite en
  404 que les chemins inconnus des anciens espaces.
- Les validateurs SEO doivent contrôler les destinations actives, pas exiger
  le retour de pages Modèles retirées.

## Décisions supersédées

Cette ADR supersède les parties de l'ADR 0001 qui imposaient :

- un accès Services dans la navigation principale ;
- un CTA d'aide à l'organisation sous Process ou Solutions ;
- les sept offres Services comme architecture commerciale active ;
- l'appellation publique « Système opérationnel » lorsqu'elle désigne le hub
  actuel « Système métier ».

L'ADR 0001 reste historique pour la séparation conceptuelle entre Process,
Solutions, Ressources et Services.

## Critères d'acceptation

1. chaque URL de la matrice retourne le statut et la destination prévus ;
2. aucune redirection ne termine sur une 404 ;
3. les chemins et queries sont préservés pendant la bascule de domaine ;
4. `/opportunites`, `/academie`, `/systemes` et les Ressources des systèmes
   restent accessibles ;
5. les anciennes livraisons et destinations privées restent résolubles ;
6. sitemap, robots, canonicals, tests, lint, TypeScript et build restent verts.
