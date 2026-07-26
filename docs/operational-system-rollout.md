# Déploiement des systèmes opérationnels

## Contrat produit

Demaa distribue un **système opérationnel prêt à l'emploi par métier**. Le
produit n'est ni une bibliothèque abstraite, ni une prestation de
structuration réalisée manuellement pour chaque prospect.

Chaque page métier présente :

1. le système opérationnel au-dessus de la navigation ;
2. une démonstration remplie et consultable sans formulaire ;
3. une version vierge et modifiable, livrée après paiement ;
4. deux onglets, dans cet ordre : **Process**, **Outils**.

Le terme `Système opérationnel` est le libellé public de référence. Les anciens
chemins contenant `kit-operationnel` peuvent rester temporairement actifs pour
la compatibilité des liens, sans réintroduire le mot `kit` dans l'interface.

## Paire de classeurs obligatoire

Chaque métier possède deux Google Sheets distincts :

### Démonstration

- données cohérentes d'une société fictive du métier ;
- mention `DÉMONSTRATION` visible ;
- accès Lecteur ;
- URL normalisée en `/edit?usp=sharing` pour conserver l'interface habituelle
  de Google Sheets ;
- aucune collecte d'e-mail avant consultation.

### Modèle vierge

- structure strictement identique à la démonstration ;
- données fictives retirées des zones que l'utilisateur doit compléter ;
- recommandations, modes d'emploi, listes et formules conservés ;
- mention `MODÈLE VIERGE` visible ;
- URL remise sous la forme `/copy` ;
- accès obtenu après confirmation du paiement unique de 49 €.

Une démonstration ne doit jamais pointer vers le modèle vierge et les deux
documents ne doivent jamais partager le même identifiant Google Drive.

## Structure canonique du classeur

L'ordre des onglets est figé :

1. Synthèse ;
2. Actions ;
3. Process ;
4. Équipe ;
5. Prévisionnel financier ;
6. Calendrier marketing ;
7. Écosystème.

L'onglet Écosystème reste toujours en dernier. Les rôles actuels et futurs
restent des lignes d'un tableau unique dans l'onglet Équipe ; aucun tableau
imbriqué n'est autorisé.

## Contenu métier

Chaque classeur reçoit :

- les 74 contenus opérationnels du métier ;
- les processus et piliers du référentiel maître ;
- des exemples et chiffres fictifs adaptés au métier dans la démonstration ;
- des outils et fournisseurs désignés par leur nom réel ;
- les liens vers les solutions lorsqu'ils sont connus ;
- EM2A Expertise pour le besoin d'expertise comptable ;
- aucune prestation humaine Demaa.

Le libellé autorisé dans l'Écosystème est `Solution recommandée`. Les textes
`Recommandé par Demaa` et les préfixes répétés `Demaa —` sont proscrits.

## Ressources de l'Écosystème

L'Écosystème peut contenir des liens autonomes vers :

- EM2A Expertise ;
- les outils métier ;
- les fournisseurs ;
- les assurances, financements et ressources externes utiles.

Il ne contient aucune session, prestation sur devis, création, modification ou
fermeture de société vendue par Demaa.

## Supports liés aux processus

Chaque processus possède une référence de support. Lorsqu'un support est
publié, l'interface propose séparément :

- la consultation de l'exemple ;
- la copie du modèle vierge.

Les supports doivent être dédupliqués par usage avant création. Plusieurs
métiers peuvent réutiliser un socle commun lorsque le contenu reste réellement
pertinent.

## Barrière de publication

Un métier n'est publiable que si :

- ses 74 contenus sont présents ;
- sa démonstration et son modèle vierge sont deux fichiers distincts ;
- les sept onglets existent dans le bon ordre ;
- l'Écosystème contient des noms concrets ;
- les liens de démonstration et de copie sont valides ;
- l'e-mail remet le bon modèle vierge ;
- la page affiche uniquement Process et Outils ;
- les contrôles desktop, mobile et Google Sheets sont validés ;
- les tests automatisés passent.

## Déploiement

Après Plomberie & chauffage, l'usine est validée sur :

- Agence marketing ;
- Restaurant ;
- Pharmacie ;
- Crèche.

La généralisation se fait ensuite par famille de métiers. Une erreur découverte
dans un échantillon doit être corrigée dans le générateur avant la vague
suivante, jamais manuellement dans des dizaines de fichiers.
