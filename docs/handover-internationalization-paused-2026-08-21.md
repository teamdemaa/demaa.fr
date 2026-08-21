# Hand-over — internationalisation en pause — 21 août 2026

Ce document est le guide opérationnel de reprise de la bêta anglaise. Il ne
remplace ni la décision D-085 dans `docs/central-backlog.md`, ni l'ADR 0014.
Ces deux documents restent les sources de vérité produit et architecture.

## Décision de pause

- Les améliorations françaises continuent normalement depuis `main`.
- La pile anglaise reste en brouillon et n'est pas fusionnée pendant la pause.
- `DEMAA_ENGLISH_BETA_ENABLED` reste désactivée en Production.
- `/en` reste absent de l'ouverture publique et `noindex`.
- Aucun retrait du flag, du `noindex` ou lancement public n'est autorisé sans
  un GO explicite distinct.

## Instantané Git vérifié

État vérifié le 21 août 2026 :

- base `origin/main` : `3b40505` ;
- sommet de la pile anglaise : `690cf83` ;
- branche sommet : `codex/i18n-copy-maintainability` ;
- écart au moment de la pause : `0` commit derrière `main`, `30` devant ;
- worktree du sommet propre ;
- 13 PR internationales ouvertes, toutes en brouillon, mergeables et avec le
  check `quality` vert ;
- dernière validation locale du sommet : ESLint strict, TypeScript,
  259 fichiers de tests et 1 445 tests, validations Academy et données, puis
  build Production de 434 pages.

Ces résultats constituent un instantané. Ils doivent être intégralement
revalidés contre le `main` courant lors de la reprise.

## Pile de PR canonique

La pile est déjà découpée. Ne pas recréer une grosse PR contenant les trente
commits et ne pas fusionner les branches dans un autre ordre.

| Ordre | PR | Branche | Base actuelle | Sommet | Objet |
| ---: | --- | --- | --- | --- | --- |
| 1 | [#154](https://github.com/teamdemaa/demaa.fr/pull/154) | `codex/i18n-server-commercial-context` | `main` | `201d7af` | contexte commercial authentifié et autorité serveur |
| 2 | [#155](https://github.com/teamdemaa/demaa.fr/pull/155) | `codex/i18n-canonical-business-catalog` | branche #154 | `28d52fc` | catalogue canonique des 115 métiers |
| 3 | [#156](https://github.com/teamdemaa/demaa.fr/pull/156) | `codex/i18n-pilotage-parity` | branche #155 | `ee2b8e2` | Chiffres et Stratégie partagés/localisés |
| 4 | [#157](https://github.com/teamdemaa/demaa.fr/pull/157) | `codex/i18n-talk-to-us-parity` | branche #156 | `c851ddc` | `Talk to us` partagé et sécurisé |
| 5 | [#158](https://github.com/teamdemaa/demaa.fr/pull/158) | `codex/i18n-services-parity` | branche #157 | `f09d1ca` | Services, disponibilité et prix partagés |
| 6 | [#159](https://github.com/teamdemaa/demaa.fr/pull/159) | `codex/i18n-academy-parity` | branche #158 | `eeb8e31` | structure Academy canonique et paritaire |
| 7 | [#160](https://github.com/teamdemaa/demaa.fr/pull/160) | `codex/i18n-transverse-readiness` | branche #159 | `70fbb15` | PWA, confidentialité, SEO et éléments transverses |
| 8 | [#162](https://github.com/teamdemaa/demaa.fr/pull/162) | `codex/i18n-localized-root-layouts` | branche #160 | `1f2a690` | documents racine et layouts localisés |
| 9 | [#163](https://github.com/teamdemaa/demaa.fr/pull/163) | `codex/i18n-localized-auth-routes` | branche #162 | `e8db2aa` | routes d'authentification localisées |
| 10 | [#164](https://github.com/teamdemaa/demaa.fr/pull/164) | `codex/i18n-integrated-polish` | branche #163 | `7d441bb` | finitions intégrées et ponctuation |
| 11 | [#165](https://github.com/teamdemaa/demaa.fr/pull/165) | `codex/i18n-beta-closure` | branche #164 | `ed419fc` | contrats des demandes de la bêta |
| 12 | [#166](https://github.com/teamdemaa/demaa.fr/pull/166) | `codex/i18n-tools-parity` | branche #165 | `5a73680` | publication `Tools` fermée par défaut |
| 13 | [#167](https://github.com/teamdemaa/demaa.fr/pull/167) | `codex/i18n-copy-maintainability` | branche #166 | `690cf83` | dictionnaires partagés et sélecteur `FR`/`EN` |

La PR [#161](https://github.com/teamdemaa/demaa.fr/pull/161) ne fait pas partie
de cette pile. Elle conserve le pilote éditorial Opportunités et modifie
`docs/central-backlog.md`, également modifié par la PR #154. Si #161 est
fusionnée pendant la pause, ce conflit documentaire doit être résolu une seule
fois dans #154 lors de la reprise, jamais recopié dans les treize branches.

## État fonctionnel préservé au sommet

Le sommet de la pile contient notamment :

- la séparation entre locale d'interface et contexte commercial ;
- une résolution serveur du marché, du pays, de la devise et de l'entreprise ;
- les 115 identifiants métier et 37 familles canoniques, sans catalogue métier
  anglais parallèle ;
- les mêmes entreprises, plans, Chiffres et Stratégie en français et en
  anglais ;
- une structure Academy commune avec les mêmes cours, leçons, visuels, quiz et
  actions ;
- les mêmes slugs, composants et contrats Services, avec prix numériques hors
  traductions ;
- les mêmes conversations et demandes `Talk to us` ;
- l'authentification et les `returnTo` localisés ;
- les manifestes, pages de confidentialité, erreurs et métadonnées anglaises ;
- un sélecteur de locale compact, `EN` sous l'interface française et `FR` sous
  l'interface anglaise ;
- une publication `Tools` qui échoue fermée : aucune projection brouillon ne
  produit une carte publique.

## Gates volontairement ouvertes

La pile n'est pas un GO public anglais. Les points suivants restent ouverts :

1. Aucun Tool anglais n'est publié : les 22 projections préparées restent
   `draft` et demandent une validation éditoriale/commerciale explicite.
2. `Business Processes`, Resources et les modèles opérationnels restent hors
   de la première bêta ; traduire une carte ne suffirait pas à localiser les
   526 processus et leurs étapes.
3. Opportunities reste absent du marché anglais.
4. La première Preview reste volontairement en EUR. Une future conversion de
   devise exige un taux, une date, un arrondi et un montant verrouillés dans le
   devis ou la demande.
5. Aucun e-mail client automatique anglais ne doit être activé avant
   l'existence et le test de son rendu anglais dans la langue immuable de la
   demande ou de la conversation.
6. La recette authentifiée Google, desktop, mobile, PWA, clavier et lecteur
   d'écran doit être refaite contre le candidat final.
7. Le retrait du flag, du `noindex` et l'activation SEO nécessitent un GO public
   séparé après la recette.

## Règle pendant la pause

Les changements français et partagés sont développés une seule fois dans
`main`. Ne jamais copier manuellement un correctif dans une version anglaise
ou dans plusieurs branches de la pile.

Pour chaque changement français qui touche une surface partagée par la pile,
conserver dans la PR française les informations suivantes :

```text
Scope: shared | locale | market | country
Composants ou contrats concernés:
Impact potentiel sur la pile i18n:
Traductions ou disponibilités concernées:
Tests de parité à rejouer lors de la reprise:
```

Ne pas rebaser la pile après chaque petite évolution de `main`. Les correctifs
de sécurité urgents restent prioritaires dans `main` ; leur impact est audité
au moment de la reprise.

## Préflight de reprise

Avant tout changement de base ou toute fusion :

1. relire ce document, D-085 et l'ADR 0014 ;
2. actualiser `origin/main` sans écraser de changement local ;
3. inventorier tous les worktrees, branches, PR et modifications non
   committées ;
4. comparer les fichiers modifiés depuis `3b40505` dans `main` avec les fichiers
   modifiés entre `3b40505` et `690cf83` ;
5. classer les collisions par PR propriétaire ;
6. vérifier les éventuelles évolutions de schémas, variables Vercel, règles
   Firebase, index et contrats de cache ;
7. confirmer que le flag anglais reste désactivé en Production ;
8. lire les guides de la version Next.js installée avant toute modification de
   routes, layouts, métadonnées ou cache.

## Procédure de fusion de la pile

Le dépôt autorise les merge commits, les squash et les rebases, mais supprime
automatiquement une branche après sa fusion. Pour cette pile, utiliser
exclusivement des **merge commits** afin de préserver l'ascendance exacte.

Pour chaque PR, de #154 à #167 :

1. vérifier le diff propre à la PR et résoudre ses collisions avec le `main`
   courant ;
2. obtenir une CI verte contre le `main` courant ;
3. **avant** de fusionner la PR, rattacher la PR enfant suivante à `main` pour
   éviter que la suppression automatique de la branche parente ne ferme ou ne
   casse la PR enfant ;
4. fusionner la PR courante avec un merge commit, sans squash, sans rebase et
   sans suppression manuelle anticipée ;
5. attendre le recalcul du diff de la PR enfant ;
6. relancer explicitement sa CI contre le nouveau `main` ;
7. ne passer à la PR suivante qu'après contrôle du nouveau diff.

Exemple du début de pile :

```text
rattacher #155 à main
→ fusionner #154 avec un merge commit
→ recalculer et retester #155
→ rattacher #156 à main
→ fusionner #155
```

Si un conflit oblige à réécrire une branche, arrêter la séquence et réauditer
ses descendantes avant tout force-push. Toujours utiliser `--force-with-lease`,
jamais un force-push non protégé.

## Gate de chaque PR et gate intégrée

Pour chaque PR :

- diff limité au périmètre annoncé ;
- aucun texte français silencieux sous `/en` ;
- aucune autorité marché/pays/devise acceptée depuis le navigateur seul ;
- tests ciblés et check `quality` verts ;
- compatibilité française explicitement vérifiée ;
- anglais toujours flaggé et `noindex`.

Après intégration de la pile complète, mais avant toute activation publique :

- `npm run check` ;
- build Production ;
- E2E `fr + fr-fr`, `en + fr-fr` et `en + global-en-beta` ;
- authentification e-mail et Google avec retour localisé ;
- création, sauvegarde, fermeture et réouverture de plans FR et EN ;
- même entreprise, Chiffres et Stratégie dans les deux interfaces ;
- Services, prix, demandes et `Talk to us` ;
- Academy, progression et caches ;
- desktop, mobile, PWA, clavier et lecteur d'écran ;
- vérification de l'absence de Tools, Resources et Opportunities anglais non
  publiés ;
- audit des logs Preview et absence de régression France.

## Nettoyage après livraison

Ne supprimer les branches et worktrees de la pile qu'après :

1. fusion de #167 ;
2. vérification de `main` et de Production avec le flag toujours désactivé ;
3. confirmation qu'aucune PR enfant ne dépend encore d'une branche ;
4. conservation des décisions D-085/ADR 0014 et de ce hand-over dans `main`.

L'activation publique anglaise reste ensuite une opération séparée : Preview
finale, testeurs anglophones, GO explicite, retrait contrôlé du flag et du
`noindex`, puis activation SEO.
