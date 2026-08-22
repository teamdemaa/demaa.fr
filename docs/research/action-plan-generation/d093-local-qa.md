# D-093 — Contrôle local, Preview et Production

Date : 22 août 2026.

Périmètre initial : branche empilée `codex/d093-qa`, commit applicatif
`ea45b0ac`, rebasée sur `origin/main` après la fusion de D-091 par la PR #180.
Les contrôles n'ont provoqué aucun appel au vrai modèle, écriture Firebase ou
modification de la révision Solutions active.

## Contrôles automatisés

- `npm run check` : réussi ; ESLint strict, TypeScript, 256 fichiers de tests et
  1 447 tests réussis, validation Academy et audits de données réussis ;
- `npm run build:stable` : réussi avec Next.js 16.2.11 ; compilation,
  TypeScript et génération de 433 pages réussies ;
- tests ciblés du lot entrée/IA : 37 réussis ;
- tests ciblés du lot Plan/Stratégie : 55 réussis ;
- tests ciblés du lot Services : 21 réussis.

La première exécution complète après rebase a subi deux dépassements du timeout
de 5 secondes dans des tests Solutions existants, pendant que le nouveau test
D-091 et le snapshot de migration lourd s'exécutaient en parallèle. Les deux
tests ont ensuite réussi isolément, puis la seconde exécution complète a réussi
sans modification de code ni de timeout. Ce signal est consigné comme
contention transitoire à surveiller, pas comme une incompatibilité D-091/D-093.

## Recette navigateur local

Le serveur local a été contrôlé en desktop puis avec un viewport mobile. Les
résultats observés sont :

- titre accessible exact « Qu’est-ce qui vous prend trop de temps
  aujourd’hui ? », champ nommé autour des tâches, blocages et opérations, sans
  overlay ;
- plan vierge avec l'ordre `Plan / Solutions / Chiffres`, sans Stratégie et
  sans débordement horizontal ;
- `section=strategy` et `open-company-strategy` ouvrent une surface Plan non
  vide, sans Stratégie ni demande d'authentification intempestive ;
- `/services` contient neuf cartes dans le HTML, expose les deux offres Demaa
  et garde le dépliant « Avec nos partenaires de confiance » fermé par défaut ;
- le dépliant s'ouvre, rend les sept cartes partenaires consultables et ne crée
  aucun débordement horizontal ;
- la modale mobile réserve `48px` au bouton de fermeture uniquement dans son
  en-tête ; le bloc inclusions/forfaits/formulaire reprend toute la largeur ;
- aucun log navigateur de niveau avertissement ou erreur n'a été relevé.

Le contrôleur de navigateur a confirmé que le `summary` natif reçoit le focus,
mais n'a pas reproduit son activation clavier synthétique. Le clic et l'état
`open` ont été validés. La validation clavier physique et lecteur d'écran reste
donc volontairement un gate Preview.

## Recette de la Preview Vercel

La Preview du commit applicatif `ea45b0ac` a été contrôlée avant la fusion :

- déploiement `dpl_D8wMzDfzZjXDekY5JHGUxaQXaK14`, cible `Preview`, état
  `READY` ;
- URL :
  `https://demaa-6xptnlaxn-hiteamdemaa-2292s-projects.vercel.app` ;
- build Vercel réussi avec Next.js 16.2.11 et génération de 433 pages ;
- racine HTTP 200 et `manifest.webmanifest` valide, avec icônes 192, 512 et
  maskable ;
- entrée, gate d'authentification, Plan vierge, redirections legacy, page
  `/services`, surface Services de l'application et modale mobile validés ;
- les neuf services D-093 sont présents, dont sept partenaires dans le dépliant
  fermé par défaut ; le lot séparé « Recruter un alternant » n'était pas inclus
  dans cette Preview ;
- aucun débordement horizontal, overlay d'erreur, avertissement ou erreur dans
  la console ; aucun log Vercel de niveau erreur relevé après la recette ;
- page de connexion et dépliage du formulaire e-mail validés sans erreur, sans
  saisie de secrets et sans création de session.

## Contrôle post-déploiement Production

Pendant la recette, la PR #181 a été fusionnée sur `main`, puis la PR #182 a
ajouté le lot séparé « Recruter un alternant ». Ces opérations ont eu lieu hors
du worktree de recette alors que les gates authentifiés restaient ouverts.

L'état effectivement observé après ces fusions est :

- `origin/main` : `dbb8b723`, avec D-093 fusionné par `41e59833` et l'extension
  partenaire fusionnée par `dbb8b723` ;
- déploiement Production `dpl_2DbEGrBW5xxEQKcbjb8pT1yyZjUN`, état `READY`,
  servi par `demaa.co` ;
- contrôle indépendant de l'arbre applicatif `77e2f9ff` : ESLint strict,
  TypeScript, 256 fichiers et 1 451 tests réussis, validations Academy et
  audits de données sans erreur ni avertissement ;
- build Production stable indépendant réussi avec génération de 435 pages ;
- réponses HTTP 200 sur la racine et `/services`, manifeste PWA valide et
  en-têtes de sécurité présents ;
- entrée opérationnelle, création d'un plan vierge et ordre
  `Plan / Solutions / Chiffres` validés, sans Stratégie ni débordement ;
- session Production réellement authentifiée validée en lecture seule :
  `/connexion` revient vers le dernier plan, et `section=strategy` comme
  `open-company-strategy` conservent un Plan non vide sans exposer Stratégie ;
- dix services au total, dont deux Demaa et huit partenaires dans le dépliant
  fermé par défaut ; « Recruter un alternant » et les sept partenaires D-093
  sont présents sur la page publique et dans la surface authentifiée partagée ;
- aucun overlay ou log navigateur d'erreur et aucun log Vercel de niveau erreur
  relevé pendant le smoke test.

La session a été utilisée en lecture seule : la génération réelle et sa
persistance n'ont pas été exercées. L'activation clavier du `summary` n'a pas
non plus été déclarée conforme sur la seule base d'un événement synthétique.

## Gates restant à exécuter après déploiement

- relire les douze scénarios avec le vrai modèle et consigner modèle, nombre
  d'actions, `systemId`, faits inventés et marques introduites ;
- vérifier l'installation et la navigation PWA ;
- effectuer une passe clavier physique et lecteur d'écran ;
- consigner le GO de release ou l'écart de processus ayant permis les fusions
  alors que les gates précédents restaient ouverts.
