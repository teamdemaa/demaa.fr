# ADR 0021 — Structurer dans Demaa et frontières avec les Cours externes

- Décision : D-096
- Statut : validé, PR #194 prête, non livré
- Date : 23 août 2026

## Contexte

La surface Académie française affichait temporairement uniquement les `Cours`.
Les anciens Tutoriels techniques `case-study`, leurs routes et leurs contenus
avaient été conservés mais masqués. La décision courante inverse cette
publication : les Tutoriels deviennent la seule section visible de l'index
`Structurer`, tandis que les Formations restent conservées mais masquées.
The Done Studio est désormais une application autonome déployée et souhaite
ajouter une section `Cours` dans son propre onglet Ressources.

La proximité éditoriale ne doit pas créer de dépendance technique entre les
deux produits.

## Décision Demaa

Demaa conserve les contrats et routes techniques Academy, mais la destination
française visible s'appelle `Structurer`. L'identifiant `academy`, l'API et la
route `/academie` ne sont pas renommés. L'anglais reste `Academy`.

`Structurer` affiche une grille responsive unique de Tutoriels, sans titre de
section redondant et sans défilement horizontal. Les contenus `case-study`
existants sont réutilisés après revue éditoriale. Le clic ouvre une page de
lecture simple, accessible, sans progression ni quiz.

Les actuels `Cours` deviennent des Formations conservées mais masquées par une
gate dédiée. Leurs identifiants, routes directes, leçons, quiz, actions,
versions, caches et progressions restent compatibles. Le masquage ne supprime
ni ne migre aucune donnée et peut être levé par une future décision explicite.

Les huit Formations existantes couvrent cinq axes, sans nouvelle copie de
contenu :

- `Finances et trésorerie` : trésorerie, chiffre d'affaires et bénéfice ;
- `Prix et offre` : prix rentable et offre facile à acheter ;
- `Marketing et ventes` : système marketing et transformation d'une demande
  en client ;
- `Délégation` : déléguer sans perdre le contrôle ;
- `Réalisation des prestations` : livrer sans tout réinventer.

Les cartes Tutoriels conservent leurs miniatures et leur composition simple,
sans pastille d'icône supplémentaire. Les images intégrées aux articles ne
reçoivent pas un second cadre vert autour de leur propre cadre. Les Webinaires
restent masqués. L'anglais reste en pause et n'est pas activé par D-096.

La navigation française du lot D-096 est
`Plan d'action · Structurer · Services · Opportunités`. Cette même structure
d'ordre pourra être reprise par l'anglais lors de sa reprise, sans l'activer
dans ce lot. Le renommage
`Opportunités` → `Annonces` appartient exclusivement à D-095.

## Frontière avec The Done Studio

The Done Studio ne reçoit ni module runtime Demaa, ni contrat commun. Sa cible
est une section unique `Cours`, placée en premier dans son propre onglet
Ressources et rendue dans un rail horizontal.

Sont interdits entre les deux applications :

- package ou composant partagé ;
- schéma ou identifiant transversal obligatoire ;
- import ou synchronisation automatique de contenus ;
- API inter-projets ;
- compte, base, collection, cache ou progression partagés ;
- dépendance de build ou de déploiement.

Le passage de relais se limite à des références visuelles, décisions UX,
retours d'expérience et contenus que l'équipe The Done Studio choisit ensuite
librement d'adapter dans son propre modèle.

## Réutilisation attendue dans Demaa

Avant de créer un composant, l'implémentation doit auditer et réutiliser autant
que possible :

- `AcademyIndexClient` pour l'index et sa grille unique ;
- `AcademyCoursePlayer` pour les seules Formations ;
- les contrats, caches et progressions existants des Cours ;
- les routes et contenus `case-study` pour les Tutoriels ;
- `public-editorial-visibility.ts` pour les gates de publication.

Les Tutoriels ne doivent pas être forcés dans le contrat d'une Formation. Un
petit rendu article dédié est préférable à une fausse leçon unique.

## Gates

- aucun contenu masqué n'est republié sans revue éditoriale ;
- aucun état de progression existant n'est perdu ou réinitialisé ;
- les anciennes routes restent compatibles ou redirigent explicitement ;
- le masquage des Formations ne rend ni titre vide ni faux état d'erreur ;
- aucun rail horizontal ou titre de section redondant n'est rendu ;
- les cartes Tutoriels n'ajoutent ni pastille d'icône ni double cadre visuel ;
- desktop, mobile, PWA, clavier et lecteur d'écran sont recettés ;
- la PR française ne touche pas les PR anglaises en pause ;
- The Done Studio est recetté et publié indépendamment.
