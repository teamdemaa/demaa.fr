# ADR 0011 — Plan V3, commande préparée et gouvernance de l'usage IA

- Statut : `working`
- Date : 2026-08-12
- Complète : ADR 0008, ADR 0009, ADR 0010 et contrat produit D-076

## Décisions validées du lot

Le nouveau contrat généré porte la version `3`. Il conserve Actions et les
quatre piliers, précise Alignement sous la forme `direction`, `startingPoint`
et `decisionRules`, et remplace le support générique historique par un support
typé dont la sélection suit des règles déterministes.

La lecture reste non destructive : V1 est normalisé en V2 en mémoire ; V2 et
`manual` conservent leurs formes historiques. Aucun document existant n'est
réétiqueté ou réécrit silencieusement.

L'application unique prend en charge plusieurs plans sauvegardés (titre,
sélecteur, renommage, création et suppression) et plusieurs Systèmes par plan.
Chaque Système garde séparément ses coches Process et sélections Solutions.
Le choix d'un Système ne consomme pas d'IA.

La dictée est centralisée dans un adaptateur navigateur partagé. Elle produit
uniquement du texte relisible et ne conserve aucun audio.

Le ledger d'usage IA conserve uniquement des métriques techniques et un sujet
pseudonymisé : opération, modèle, durée, tokens, requêtes, réparations et date.
Il ne stocke jamais prompt, situation, commande, plan, support, note ou e-mail
en clair.

## Activation de la commande IA

Le schéma de commande, les opérations déterministes, les limites et
l'enveloppe externe minimale sont préparés. L'utilisatrice a explicitement
autorisé le 12 août 2026 la transmission à AI Gateway et à son fournisseur de :

1. la commande de la personne ;
2. les actions visibles effectives ;
3. la vue visible minimale des quatre piliers de Stratégie.

Notes, identité, e-mail, situation source, historique, Systèmes, Process,
Solutions et catalogue des 115 activités restent exclus. Les opérations du
modèle sont validées puis appliquées déterministiquement ; le mode démo reste
sans appel externe et aucun contenu n'entre dans le ledger.

## Statut `working`

L'ADR reste `working` jusqu'à la recette complète du candidat V3, y compris la
commande, son annulation, ses limites d'usage, le mode démo et la persistance.
