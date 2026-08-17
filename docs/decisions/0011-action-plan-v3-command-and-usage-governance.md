# ADR 0011 — Plan versionné, génération et gouvernance de l'usage IA

- Statut : `validated`
- Date : 2026-08-12
- Révision : 2026-08-17
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

## Retrait de la commande IA après génération

La commande IA qui ajoutait, modifiait ou supprimait des actions après la
génération est retirée. Elle créait une seconde manière de modifier le plan,
rendait les changements difficiles à anticiper et envoyait de nouveau les
actions visibles au modèle.

La seule barre IA conservée apparaît sur un plan manuel encore entièrement
vierge. Elle recueille une situation puis déclenche le parcours de génération
durable existant. Dès que le plan contient une action ou un contenu à
conserver, cette barre disparaît. Les actions restent ensuite modifiables
directement et explicitement dans l'interface.

La route `/api/action-plan/command`, son moteur, son contrat d'opérations et
son événement de ledger dédié sont supprimés. La génération initiale conserve
ses contrôles d'authentification, d'entreprise, d'idempotence, de validation et
de mesure existants.
