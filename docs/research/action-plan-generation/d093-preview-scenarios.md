# D-093 — Matrice de recette du plan opérationnel

Cette matrice complète les tests déterministes du prompt. Elle sert à relire les
sorties du vrai modèle en Preview sans figer leur formulation exacte. Elle ne
doit pas déclencher de changement de modèle, de schéma, de donnée Firebase ou
de pointeur de production.

## Règles communes de validation

Chaque résultat doit :

- conserver le schéma ActionPlan V4 et sélectionner un `systemId` autorisé ;
- proposer trois ou quatre actions par défaut, cinq seulement si la situation
  le justifie clairement ;
- commencer par une action faisable ou observable cette semaine ;
- ne pas inventer de fréquence, volume, durée, erreur, attente, personne ou
  responsabilité ;
- examiner suppression, simplification, responsabilités et standardisation
  avant délégation puis automatisation ;
- ne pas introduire de marque, outil nommé, prestataire ou service absent du
  texte ; une marque citée peut rester un contexte sans devenir une
  recommandation automatique ;
- employer un canal ou une capacité générique dans `channelOrTool` lorsque le
  dirigeant n'a cité aucun outil ;
- traiter le problème réel lorsqu'il ne relève pas principalement du temps ;
- ne générer un support que pour une communication, une prospection ou une
  relance, conformément au contrat existant.

## Scénarios Preview

| # | Situation à saisir | Point de contrôle principal |
|---:|---|---|
| 1 | Je ressaisis les mêmes coordonnées entre les demandes reçues par email et notre outil de suivi. | Cartographier la double saisie avant toute automatisation. |
| 2 | Mes trois techniciens attendent souvent ma validation avant de poursuivre une intervention. | Clarifier la décision et la responsabilité, sans inventer de délai. |
| 3 | Je planifie les interventions de plomberie au fil des messages et je perds la vue d'ensemble. | Simplifier le flux et garder un canal générique. |
| 4 | Je relance chaque semaine les mêmes clients pour récupérer leurs pièces comptables. | Prévoir un support de relance directement utilisable. |
| 5 | Les documents d'un dossier sont répartis entre les emails, les messages et plusieurs dossiers. | Standardiser le rangement avant de proposer un outil. |
| 6 | La marge de mon restaurant baisse, mais je ne sais pas encore quels postes expliquent l'écart. | Traiter la marge comme problème réel et commencer par mesurer. |
| 7 | Je trouve difficilement de nouveaux clients pour mon activité de conseil. | Ne pas forcer le cadrage temps ; prospection uniquement si pertinente et éthique. |
| 8 | Notre processus de commande change selon la personne et personne ne suit les mêmes étapes. | Ne pas automatiser un processus encore confus. |
| 9 | Je manque de temps dans mon entreprise, mais je ne sais pas encore quelles tâches en prennent le plus. | Première action de mesure ou d'observation terrain. |
| 10 | Je veux déléguer la préparation des comptes rendus sans perdre les informations importantes. | Clarifier le résultat et standardiser avant la délégation. |
| 11 | Nous utilisons déjà Pennylane pour la comptabilité et je recopie encore certains montants à la main. | Garder la marque comme contexte, pas comme recommandation automatique. |
| 12 | Mon activité fonctionne correctement et je cherche seulement à vérifier où simplifier une opération. | Ne pas inventer un problème ni une prestation. |

Pour chaque scénario, consigner en Preview la date, le modèle réellement servi,
le nombre d'actions, le `systemId`, les faits éventuellement inventés, les
marques introduites et la décision `OK / à corriger`. Une formulation différente
est acceptable si les règles communes et le sens opérationnel restent respectés.
