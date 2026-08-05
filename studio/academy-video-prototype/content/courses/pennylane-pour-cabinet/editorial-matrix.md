# Pennylane pour un cabinet — storyboard de captation

Statut : brouillon éditorial, à valider avant voix et production.

## Intention

Parler aux dirigeants, associés et collaborateurs de cabinets comme à des
professionnels intelligents et pressés, sans supposer la taille de leur
structure. Employer des mots simples, expliquer les termes utiles au moment où
ils apparaissent et montrer un parcours réel, sans prétendre couvrir tout
Pennylane ni reprendre les promesses commerciales de l'éditeur. Chaque capture
devra porter discrètement la mention « Interface observée le [date de captation] ».

Garde-fous éditoriaux : ne jamais transformer une suggestion du logiciel en
validation comptable, ne pas promettre un gain de temps, rappeler que le bon
fonctionnement dépend du paramétrage, de la reprise des données, de la formation
et de l'adoption par les clients.

## Découpage

| Scène | Capture ou visuel à obtenir | Action montrée | Précaution |
| --- | --- | --- | --- |
| 1. Le flux complet | Montage de quatre écrans | Facture client → transaction → production → révision | Flouter toute donnée réelle ; afficher la date de captation |
| 2. Client et cabinet | Vue client puis `Production > Saisie` | Déposer une pièce côté client, puis repérer le dossier côté cabinet | Utiliser un dossier de démonstration ; aucun logo client |
| 3. Autopilot | Centre de contrôle Autopilot et transaction fictive de 120 € | Montrer lecture, classement, rapprochement et demande de pièce | Afficher le réglage par dossier ; ne pas présenter une règle comme un jugement comptable |
| 4. Facturation électronique | Tableau de déploiement PA et facture électronique fictive | Montrer mandat, activation, réception et statut de la facture | Revérifier le calendrier légal et le statut PA le jour du tournage |
| 5. Production | Menu comptable d'un dossier de démonstration | Parcourir achats, banque, TVA, déclarations, liasse et états financiers | Ne lancer aucun envoi fiscal ; conserver des données fictives |
| 6. Révision | Dossier de travail, revue automatique et ComptAssistant | Ouvrir une anomalie, un justificatif et une proposition de synthèse | Montrer les limites actuelles et la validation humaine |
| 7. Pilotage du cabinet | Gestion interne et connectivité | Montrer mission, facturation, temps, rentabilité puis intégrations | Ne montrer aucun taux horaire, budget ou résultat réel |
| 8. Décider | Écran Demaa, sans interface Pennylane | Afficher les tests à réaliser sur un dossier représentatif | Aucun CTA agressif ; Demaa reste tiers de confiance |

## Sources éditoriales à revérifier le jour du tournage

- Centre d'aide Pennylane — Naviguer dans l'espace cabinet :
  https://help.pennylane.com/fr/articles/72794-naviguer-dans-l-espace-cabinet
- Centre d'aide Pennylane — Ajouter un dossier et inviter un client :
  https://help.pennylane.com/fr/articles/18744-ajouter-un-dossier-et-inviter-un-client
- Centre d'aide Pennylane — Tenir un dossier sur Pennylane :
  https://help.pennylane.com/fr/articles/18698-tenir-un-dossier-sur-pennylane
- Centre d'aide Pennylane — Paramétrer le régime de TVA :
  https://help.pennylane.com/fr/articles/18650-parametrer-le-regime-de-tva
- Centre d'aide Pennylane — Utiliser le dossier de travail :
  https://help.pennylane.com/fr/articles/18699-utiliser-le-dossier-de-travail
- Centre d'aide Pennylane — Automatiser la tenue avec Autopilot :
  https://help.pennylane.com/fr/articles/523853-automatiser-la-tenue-comptable-d-un-dossier-avec-l-autopilot
- Pennylane — Plateforme Agréée pour les cabinets :
  https://www.pennylane.com/fr/expert-comptable/pdp
- Centre d'aide Pennylane — Revue automatique des diligences :
  https://help.pennylane.com/fr/articles/724975-utiliser-la-revue-automatique-des-diligences
- Pennylane — Gestion interne du cabinet :
  https://www.pennylane.com/fr/expert-comptable/gestion-interne
- Centre d'aide Pennylane — Intégrations et API :
  https://help.pennylane.com/fr/collections/4134-integrations-et-api

## Captation et droits

Privilégier un compte de démonstration auquel Demaa est autorisé à accéder.
Les pages publiques du centre d'aide peuvent servir de référence pour trouver
les bons écrans, mais leurs visuels ne doivent pas être réutilisés tels quels
sans vérifier les droits. Les captures finales doivent être réalisées par
Demaa, avec des données fictives ou intégralement anonymisées.

## Adaptation nécessaire du moteur

Le moteur actuel sait produire la voix, les timings et les scènes graphiques,
mais ne possède pas encore de type de scène dédié à la capture d'interface.
Après validation du script, ajouter un composant de démonstration d'écran
capable d'afficher des vidéos ou captures, de cadrer une zone, de masquer les
données sensibles et d'ajouter des repères visuels discrets.
