# Déploiement des systèmes opérationnels

## Contrat produit

Demaa distribue un **système opérationnel prêt à l'emploi par métier**. Le
produit n'est ni une bibliothèque abstraite, ni une prestation de
structuration réalisée manuellement pour chaque prospect.

Le contrat commercial unique est :

- démonstration remplie gratuite, sans formulaire et en lecture seule ;
- système modifiable vendu **49 € en paiement unique** ;
- adresse e-mail collectée au paiement pour remettre l'accès ;
- aucune session, assistance humaine ou réponse personnalisée incluse ;
- aucun abonnement.

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

Le lien `/copy` du modèle vierge ne doit jamais être envoyé au navigateur avant
confirmation du paiement. Il reste résolu côté serveur à partir du métier
acheté, puis il est affiché sur la page de confirmation et envoyé par e-mail.

## Configuration du paiement

Le paiement utilise Stripe Checkout en mode `payment`, sans abonnement. Les
variables serveur attendues sont :

- `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` en production ;
- `STRIPE_SECRET_KEY_TEST` et `STRIPE_WEBHOOK_SECRET_TEST` en environnement de
  test local ;
- `RESEND_API_KEY` et `RESEND_FROM_EMAIL` pour l'e-mail de livraison.

Le webhook Stripe doit cibler `/api/webhooks/stripe` et écouter :

- `checkout.session.completed` ;
- `checkout.session.async_payment_succeeded`.

La page de confirmation revérifie également la session Stripe. Elle peut donc
remettre le lien au client même si l'e-mail est momentanément indisponible,
mais jamais si le paiement, le montant, la devise ou le métier ne correspondent
pas au contrat.

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

Onze métiers sont désormais publiés avec une paire distincte, une démonstration
en lecture seule et un document modifiable livré après paiement :

- Plomberie & chauffage ;
- Agence marketing ;
- Restaurant ;
- Pharmacie ;
- Crèche ;
- Bâtiment ;
- Électricité générale ;
- Rénovation intérieure ;
- Menuiserie & agencement ;
- Maçonnerie & gros œuvre ;
- Paysagiste.

Les contrôles de l'échantillon et de la première vague BTP confirment :

- 74 contenus opérationnels dans chaque fichier ;
- zéro personne, date commerciale ou solution retenue fictive dans les
  versions modifiables ;
- six actions datées, des personnes fictives et des solutions choisies dans
  les démonstrations ;
- des outils et fournisseurs nommés, avec EM2A Expertise dans chaque
  Écosystème ;
- des liens publics en lecture seule pour les démonstrations et des liens
  `/copy` gardés côté serveur pour les versions vendues.

Les nouvelles paires sont créées dans le dossier Drive
`Demaa — Systèmes opérationnels publiés`. Le dossier porte le droit Lecteur
par lien : les fichiers créés à l'intérieur héritent du bon accès sans réglage
manuel fichier par fichier.

## Fabrique de classeurs

La fabrique `operational-workbook-factory` produit pour chacun des 115 métiers :

- une démonstration avec société et données fictives ;
- une version modifiable sans les affectations et chiffres fictifs ;
- les mêmes 74 contenus précis dans les deux variantes ;
- les actions de mise en place extraites du référentiel ;
- les rôles déduits des responsables recommandés ;
- les outils nommés, EM2A Expertise et les fournisseurs pertinents ;
- les sept onglets dans l'ordre canonique.

Le compilateur `operational-workbook-sheet-compiler` convertit ensuite une
variante en requêtes Google Sheets. Il accepte les identifiants d'onglets du
fichier cible afin de ne pas dépendre d'une édition manuelle.

Avant chaque écriture, il supprime les anciennes fusions présentes dans les
zones de données et répète le format de la première ligne. Cette normalisation
évite qu'un pied de tableau hérité du modèle masque une ligne lorsqu'un métier
possède davantage d'actions ou de rôles que le fichier source.

Commandes de contrôle :

```bash
npm run generate:operational-blueprints -- --summary
npm run generate:operational-blueprints -- --slug pharmacie
npm run generate:operational-blueprints -- --slug pharmacie --variant editable --sheet-batch-json
npm run register:operational-assets -- --slug <métier> --demo-id <id> --paid-id <id>
```
