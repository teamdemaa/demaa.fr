# ADR 0011 — Plan versionné, commande et gouvernance de l'usage IA

- Statut : `working`
- Date : 2026-08-12
- Complète : ADR 0008, ADR 0009, ADR 0010 et contrat produit D-076

## Décisions validées du lot

Le contrat V3 a introduit les Actions, les supports typés et une Stratégie en
quatre piliers. La décision la plus récente simplifie la génération courante :
la V4 génère uniquement les Actions et le `systemId`. La Stratégie est masquée
et n'est plus demandée au modèle à partir d'une problématique ponctuelle.

La nouvelle Stratégie d'entreprise définie par D-084 et l'ADR 0013 est un
produit séparé, manuel et rattaché à l'entreprise. Elle ne réactive pas les
champs V3, ne les migre pas et ne modifie pas le périmètre IA défini ici.

La lecture reste non destructive : V1 est normalisé en V2 en mémoire ; V2, V3
et `manual` conservent leurs formes historiques. Les stratégies V3 restent
lisibles par le code de compatibilité mais ne sont pas affichées. Aucun
document existant n'est réétiqueté ou réécrit silencieusement.

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
2. les actions visibles effectives.

La V4 n'affiche et ne génère plus de Stratégie. La commande courante transmet
donc moins que l'enveloppe initialement autorisée : commande et Actions
visibles uniquement.

Notes, identité, e-mail, situation source, historique, Systèmes, Process,
Solutions et catalogue des 115 activités restent exclus. Les opérations du
modèle sont validées puis appliquées déterministiquement ; le mode démo reste
sans appel externe et aucun contenu n'entre dans le ledger.

## Statut `working`

L'ADR reste `working` jusqu'à la recette complète du candidat V4, y compris la
commande, son annulation, ses limites d'usage, le mode démo et la persistance.
