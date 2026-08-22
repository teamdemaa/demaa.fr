# D-093 — Contrôle local avant Preview

Date : 22 août 2026.

Périmètre : branche empilée `codex/d093-qa`, rebasée sur `origin/main` après la
fusion de D-091 par la PR #180, sans fusion D-093, déploiement, appel au vrai
modèle, écriture Firebase ou modification de la révision Solutions active.

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

## Gates restant à exécuter en Preview

- relire les douze scénarios avec le vrai modèle et consigner modèle, nombre
  d'actions, `systemId`, faits inventés et marques introduites ;
- tester une session réellement authentifiée, notamment les redirections
  legacy ;
- vérifier l'installation et la navigation PWA ;
- effectuer une passe clavier physique et lecteur d'écran ;
- contrôler la Preview déployée avant toute demande de fusion ou de Production.
