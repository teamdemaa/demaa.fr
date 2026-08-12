# ADR 0008 - Générateur de plan d'action sur la homepage

- Statut : `validated`
- Date : 10 août 2026
- Portée : homepage, génération de plan, sélection du Système et persistance
- Contrat détaillé :
  [`docs/action-plan-generator-product-contract.md`](../action-plan-generator-product-contract.md)

> Cette ADR supersède uniquement le point 3 de l'ADR 0003 dans la mesure où il
> autorisait `/` à présenter le même point d'entrée que `/systemes`.
> `/systemes`, `/academie`, leur navigation publique, les 115 fiches et toutes
> les autres décisions des ADR 0003, 0004, 0006 et 0007 restent applicables.

> **Mise à jour :** les points 2 et 11 ainsi que les lignes Coaching du hors
> périmètre sont supersédés par les ADR 0009 et 0010. La navigation
> `Plan d’action / Système / Académie / Opportunités` est désormais visible dès
> l'arrivée ; la première version Coaching existe via `Parler à un spécialiste`.

> **Mise à jour D-079 :** le contrat courant V4 génère uniquement les Actions
> et le `systemId`. La Stratégie V3 est temporairement masquée et non générée ;
> sa lecture historique reste tolérante sans migration destructive.

## Contexte

La homepage publique reproduit actuellement le hub des Systèmes. Demaa veut y
proposer une première valeur plus directe : le dirigeant décrit librement sa
situation et reçoit un plan d'action concret, associé à l'un des 115 Systèmes
existants.

Le changement ne doit ni dupliquer les données Système, ni créer un second
catalogue, ni rendre privées les destinations publiques existantes.

## Décision

1. `/` devient l'entrée canonique du générateur de plan d'action. Sa promesse
   exacte est : « Qu’est-ce qui freine votre entreprise ? »
2. Avant connexion, cette entrée affiche Demaa, `Se connecter` et un grand
   champ libre. Aucun questionnaire structuré ne précède la génération.
3. Une seule génération principale produit un JSON strict comprenant les
   Actions et un `systemId` égal à un slug canonique.
4. Le modèle reçoit uniquement le catalogue léger des 115 activités —
   identifiant, slug, libellé et alias validés — jamais leurs contenus complets.
5. Le résultat présente directement les Actions. La Stratégie est masquée sans
   laisser d'onglet ou de zone vide.
6. L'onglet Système charge les Process, Solutions et Ressources existants du
   Système sélectionné. Une dropdown permet de choisir l'un des 115 Systèmes
   sans appel IA et sans réécriture des Actions.
7. Pour un visiteur, le résultat reste dans l'état de la page ou de la session
   courante. Aucun `localStorage` durable n'est utilisé comme source de vérité
   du plan. Seul le slug du Système choisi est mémorisé dans le navigateur.
8. Après sauvegarde, Firebase/cloud est l'unique source persistante.
9. Le MVP ne lance aucune étude de marché ni recherche web automatique. La
   prospection ciblée et éthique demeure un levier possible lorsqu'elle est
   adaptée à la situation.
10. Le pricing reste ouvert ; le prix de 5 EUR n'est pas une décision produit.
11. Coaching, messagerie et gestion des phases gratuite/payante sont
    différés dans un lot autonome.
12. `/systemes` reste le hub public canonique des 115 Systèmes et `/academie`
    reste le hub public pédagogique. Leurs routes, métadonnées et contenus ne
    sont pas absorbés par la homepage.

## Conséquences

- La homepage ne peut plus réexporter silencieusement la page `/systemes`.
- Le catalogue léger est dérivé de la source canonique existante ; il ne forme
  pas un nouveau registre métier.
- Le moteur IA produit des Actions, tandis que le contenu Système reste
  déterministe et gouverné par ses catalogues actuels.
- Le changement de Système n'invalide pas le plan déjà généré.
- La persistance invitée et la persistance connectée ont une frontière nette :
  plan en mémoire éphémère et préférence locale du Système d'un côté, Firebase
  comme source du plan enregistré de l'autre.
- La navigation connectée et l'espace de sauvegarde peuvent être livrés par
  lots, sans modifier la disponibilité des univers publics.

## Hors périmètre

- étude de marché automatisée et recherche web ;
- tarification et paiement ;
- Coaching humain ;
- messagerie ;
- phases gratuite et payante du Coaching ;
- internationalisation ;
- remplacement des Process, Solutions ou Ressources existants par du contenu
  généré.

## Critères d'acceptation

1. `/` propose un champ libre et ne demande aucune information structurée avant
   le premier résultat ;
2. chaque réponse valide référence l'un des 115 slugs canoniques via `systemId` ;
3. Actions et quatre piliers sont présents dans le résultat ;
4. le changement de Système ne déclenche aucun appel IA ;
5. le résultat invité n'est pas dupliqué dans une persistance locale durable ;
   seul le slug valide du Système choisi peut être restauré localement ;
6. Firebase est l'unique source persistante après sauvegarde ;
7. aucune recherche web automatique n'est exécutée ;
8. les garde-fous de prospection sont testables et appliqués ;
9. `/systemes`, `/academie` et `/systemes/[slug]` gardent leur comportement,
   leur canonical et leur indexabilité ;
10. aucune offre Coaching ou prix non validé n'est exposé.
