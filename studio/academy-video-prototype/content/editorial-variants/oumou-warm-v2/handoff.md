# Handoff D-048 — passe orale finale `oumou-warm-v2`

## Résultat

Les cinq narrations ont été reformulées en français oral naturel. Les notions
métier, les calculs et la structure pédagogique sont conservés. Les erreurs
fréquentes sont formulées avec « on » ; les actions proposées avec « vous ».

Les cinq cours sont au statut `script-approved`. Le profil vocal futur validé
utilise la voix Oumou à la vitesse native `1.15`, sans seconde accélération.

| Cours | Scènes | Mots | Caractères de narration | SHA-256 du script |
|---|---:|---:|---:|---|
| C1 — `gestion-tresorerie` | 9 | 578 | 3 520 | `f2490a32dad7100c84e121abe2ede0b9f5c131897ff9fb187a0546e60392d1a8` |
| C2 — `chiffre-affaires-benefice` | 7 | 536 | 3 323 | `adb6c5f930794256b684a8e05b14692a353c275e23b530c22e95731e9622bb51` |
| C3 — `fixer-ses-prix` | 8 | 600 | 3 625 | `7ac50ba679f89d4042fb2405a9f9c549762c745ed277e3f0c58903d16d91a641` |
| C4 — `construire-systeme-marketing-vente` | 8 | 591 | 3 673 | `33ebc74cc408091952f11a736f23798bce579d324ec982f473950f6a6a4102ab` |
| C5 — `deleguer-sans-perdre-controle` | 8 | 599 | 3 744 | `4c5bed3bf2a24e7b8e70d713e8ec825760dd28a69e7278345de29b90f4a3bfd0` |
| **Total** | **40** | **2 904** | **17 885** | |

Crédits consommés pendant D-048 : **0**.

## Scripts complets

- C1 :
  `content/courses/gestion-tresorerie/variants/oumou-warm-v2/course.json`
- C2 :
  `content/courses/chiffre-affaires-benefice/variants/oumou-warm-v2/course.json`
- C3 :
  `content/courses/fixer-ses-prix/variants/oumou-warm-v2/course.json`
- C4 :
  `content/courses/construire-systeme-marketing-vente/variants/oumou-warm-v2/course.json`
- C5 :
  `content/courses/deleguer-sans-perdre-controle/variants/oumou-warm-v2/course.json`

Chaque dossier contient aussi `editorial-matrix.md`, avec les formulations
sensibles avant/après et les invariants associés.

## Changements principaux

- C1 traduit immédiatement le BFR comme l’argent à avancer en attendant les
  encaissements. Le résultat, le solde du compte et le point bas sont décrits
  avec des mots courants.
- C2 remplace les métaphores écrites par quatre questions simples : combien a
  été vendu, quelle marge reste, quel résultat est produit et combien d’argent
  est disponible.
- C3 traduit le prix plancher dès sa première apparition et sépare clairement
  le calcul économique de la règle juridique sur la revente à perte.
- C4 explique le rôle du marketing avec trois critères : problème réel,
  personnes concernées et capacité de l’entreprise à répondre au besoin. La
  décision consiste concrètement à continuer ou non, sans pression.
- C5 remplace les formulations de manuel par des comportements observables :
  ce qui doit être prêt, quand prévenir, quoi suivre et comment corriger.

## Formulations d’opinion conservées

Maximum deux par cours :

- C1 : « Une facture ne paie rien tant qu’elle n’est pas encaissée. »
- C2 : « Si on s’arrête au premier chiffre, on s’arrête avant la réponse. » ;
  « Cette vente a coûté plus qu’elle n’a rapporté. »
- C3 : « Oublier son propre temps, c’est simplement décider de le payer
  soi-même. » ; « Le calcul donne le minimum. Il ne choisit pas le prix à
  votre place. »
- C4 : « Le marketing ne compense pas un produit ou un service qui ne répond
  pas à un vrai besoin. »
- C5 : « Un tableau de vingt colonnes peut rassurer, mais il ajoute souvent du
  travail sans aider à décider. »

## Invariants vérifiés

- C1 : résultat/trésorerie ; `30 k€ / 8 k€ / 16 k€ / 9 k€ / −7 k€` ; BFR ;
  croissance ; douze semaines ; acompte, facturation et relances.
- C2 : CA/marge/résultat ; `100 k€ / 60 k€ / 35 k€ / 5 k€` ; contrat `20 k€`
  coûtant `22 k€` ; marge `40 %` ; point mort `87,5 k€` ; trésorerie séparée.
- C3 : H.T./TVA ; calcul économique et règle juridique ; coûts, temps, charges
  et commissions ; `2 400 / 120 = 20` ; `2 400 / 80 = 30` ;
  `78 / (1 − 8 %) = 84,78` ; prix plancher et prix cible.
- C4 : cible/problème/résultat ; canaux limités ; prochaine étape ;
  centralisation ; qualification ; parcours `30 → 18 → 10 → 6 → 3` ; revue
  hebdomadaire ; quatre indicateurs ; critères éthiques objectifs.
- C5 : abandon/micromanagement ; choix de tâche ; résultat observable ;
  contexte ; trois zones d’autonomie ; seuils `+1 jour / +5 % / client /
  sécurité` ; dix-huit interventions ; amélioration du cadre avant reprise.

## Écrans et structure

Les scènes, visuels, assets, `onScreen` et beats restent inchangés, à une seule
exception éditoriale indispensable dans C3 :

- ancienne formulation : compréhension décrite de façon abstraite ;
- nouvelle formulation : « Vérifier que le client comprend ce qu’il
  obtient. »

## Contrôles locaux

- `course:validate:draft` : 5/5 OK ;
- statuts : 5/5 `script-approved`, scripts approuvés et inchangés ;
- invariants chiffrés et métier : 5/5 OK ;
- expressions interdites : absentes du paquet courant ;
- répétitions longues : aucune dans un même cours ;
- cohérence narration/écran : OK ;
- repli `oumou-v1` : inchangé et fonctionnel ;
- snapshots, baselines, anciens médias et anciens outputs : inchangés ;
- aucun appel ElevenLabs, aucun audio et aucun rendu D-048.

## Ce qui attend une validation

Les cinq scripts ont été validés. Le profil vocal futur `1.15` est documenté,
mais aucune narration complète n’est encore approuvée : les cinq cours doivent
rester à `script-approved` jusqu’au prochain gate humain.
