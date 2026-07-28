# Déploiement des systèmes opérationnels

## Contrat produit

Demaa distribue un **système opérationnel prêt à l'emploi par métier**. Le
produit n'est ni une bibliothèque abstraite, ni une prestation de
structuration réalisée manuellement pour chaque prospect.

Le contrat commercial unique est :

- démonstration remplie gratuite, sans formulaire et en lecture seule ;
- copie modifiable gratuite, envoyée uniquement par e-mail ;
- prénom et adresse e-mail collectés pour remettre la copie demandée ;
- consentement marketing facultatif et séparé de la livraison ;
- aucune session, assistance humaine ou réponse personnalisée incluse ;
- aucun abonnement.

Chaque page métier présente :

1. le système opérationnel au-dessus de la navigation ;
2. une démonstration remplie et consultable sans formulaire ;
3. une copie modifiable, livrée gratuitement par e-mail après la demande ;
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

### Copie modifiable

- structure strictement identique à la démonstration ;
- données fictives retirées des zones que l'utilisateur doit compléter ;
- recommandations, modes d'emploi, listes et formules conservés ;
- mention `VERSION MODIFIABLE` visible ;
- URL remise sous la forme `/copy` ;
- accès envoyé uniquement par e-mail après une demande valide.

Le lien `/copy` ne doit jamais être renvoyé par l'API, injecté dans le HTML ou
affiché après le formulaire. Il reste résolu côté serveur à partir du métier
demandé et n'est présent que dans l'e-mail transactionnel.

## Livraison par e-mail

La livraison utilise l'endpoint `POST /api/systeme-kit/request`. La requête
canonique contient :

- `firstName` ;
- `email` ;
- `systemSlug` ;
- `idempotencyKey` ;
- l'attribution et le honeypot facultatifs.

La réponse publique de succès est toujours `{ "ok": true }`. Elle ne contient
ni lien `/copy`, ni identifiant de lead, ni identifiant Resend.

Le serveur valide la demande, applique les limites par IP et par adresse,
déduplique l'envoi, puis résout la copie depuis un registre privé fourni par la
variable serveur `OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON`. Ce registre n'est
jamais suivi par Git, inclus dans le bundle, renvoyé par l'API ou écrit dans les
logs. Les autres variables serveur nécessaires sont `RESEND_API_KEY` et
`RESEND_FROM_EMAIL`.

Un échec d'envoi est journalisé pour les tentatives automatiques. L'inscription
à des communications marketing reste désactivée par défaut et ne peut pas être
déduite de la seule demande de copie.

Une démonstration ne doit jamais pointer vers la copie modifiable et les deux
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

Chaque processus possède une référence de support. L'interface affiche son nom
et la mention discrète `Modèle disponible dans le système`, sans exposer de
lien de copie séparé sur chaque processus.

Les supports doivent être dédupliqués par usage avant création. Plusieurs
métiers peuvent réutiliser un socle commun lorsque le contenu reste réellement
pertinent.

## Barrière de publication

Un métier n'est publiable que si :

- ses 74 contenus sont présents ;
- sa démonstration et sa copie modifiable sont deux fichiers distincts ;
- les sept onglets existent dans le bon ordre ;
- l'Écosystème contient des noms concrets ;
- les liens de démonstration et de copie sont valides ;
- l'e-mail remet la bonne copie modifiable ;
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

Les cent quinze métiers sont désormais publiés avec une paire distincte, une
démonstration en lecture seule et une copie modifiable livrée gratuitement par
e-mail :

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
- Paysagiste ;
- Nettoyage professionnel ;
- Architecte ;
- Pisciniste ;
- Couvreur ;
- Peintre en bâtiment ;
- Carreleur ;
- Climatisation ;
- Serrurier ;
- Géomètre ;
- Fast-food ;
- Traiteur événementiel B2B ;
- Dark kitchen ;
- Boulangerie ;
- Café ;
- Food truck ;
- Diagnostiqueur immobilier ;
- Entreprise de sécurité ;
- Agence immobilière professionnelle ;
- Chasseur immobilier ;
- Agence de recrutement ;
- Cabinet RH externalisé ;
- Centre d'appels / support client ;
- Salle de sport ;
- Coach sportif ;
- Organisme de formation ;
- CFA ;
- Formation en ligne ;
- Centre de formation conduite pro ;
- Association ;
- Syndic ;
- Gestion locative pour investisseurs ;
- Conciergerie multi-biens ;
- Marchand de biens ;
- Investissement locatif ;
- Investissement immobilier ;
- Investissement entreprise ;
- Investissement financier ;
- Agence de voyage ;
- Centre d’affaires / coworking ;
- Laverie automatique ;
- Pressing ;
- Événementiel professionnel ;
- Hôtel & hébergement indépendant ;
- Garage automobile ;
- Carrosserie ;
- Production & Industrie ;
- Institut de beauté ;
- Salon de coiffure ;
- Esthétique ;
- Cabinet d’assurance ;
- Courtier crédit / assurance ;
- Gestionnaire de patrimoine dirigeant ;
- Société de recouvrement ;
- Cabinet comptable ;
- Cabinet d’avocat ;
- Gestionnaire de paie indépendant ;
- Notaire ;
- Cabinet médical ;
- Cabinet paramédical ;
- Dentiste ;
- Ostéopathe ;
- Psychologue ;
- Vétérinaire ;
- Déménagement professionnel ;
- Livraison dernier kilomètre ;
- Transport de marchandises ;
- Transport de personnes B2B ;
- VTC ;
- Cabinet de conseil ;
- Freelance B2B ;
- Agence web ;
- Création de contenu ;
- Marketplace ;
- Média ;
- SaaS ;
- Commerce de détail ;
- E-commerce ;
- Services à la personne ;
- Commerce alimentaire ;
- Boutique spécialisée ;
- Tabac / presse / point relais ;
- Infirmier libéral ;
- Aide à domicile & ménage ;
- Maintenance informatique B2B ;
- Photographe / vidéaste corporate ;
- Opticien ;
- Fleuriste événementiel B2B ;
- Consultant indépendant ;
- Coach professionnel ;
- Librairie ;
- DAF externalisé ;
- Office manager externalisé ;
- Assistant administratif externalisé ;
- Secrétariat externalisé ;
- Cabinet QHSE / conformité ;
- Bureau d’études ;
- Cabinet d’études ;
- Infogérance informatique ;
- Cybersécurité PME ;
- Intégrateur CRM / ERP ;
- Consultant data / BI ;
- Agence SEO ;
- Agence acquisition paid ads ;
- Studio branding / design.

Les contrôles de l'échantillon et des familles BTP, restauration rapide et
immobilier expertise, services terrain et immobilier transaction complètes
ainsi que des familles services RH et support et sport & accompagnement
et des lots Formation, gestion immobilière, investissement immobilier,
investissement financier et accueil & services
ainsi que les lots Entretien textile et Hospitalité & événements complets
et les lots Ateliers & production, Beauté, Services financiers, Cabinets
réglementés, Cabinets de santé et Logistique & transport complets confirment :

- 74 contenus opérationnels dans chaque fichier ;
- zéro personne, date commerciale ou solution retenue fictive dans les
  versions modifiables ;
- six actions datées, des personnes fictives et des solutions choisies dans
  les démonstrations ;
- des outils et fournisseurs nommés, avec EM2A Expertise dans chaque
  Écosystème ;
- des liens publics en lecture seule pour les démonstrations et des
  identifiants de copie conservés uniquement dans le secret serveur privé.

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
npm run register:operational-assets -- --slug <métier> --demo-id <id> --editable-id <id>
```
