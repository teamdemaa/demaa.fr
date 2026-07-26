# Industrialisation des systèmes opérationnels

## Principe

Un métier n’est jamais généré par simple remplacement de mots.

Chaque système est composé dans cet ordre :

1. **socle de famille** : processus, règles et contrôles communs ;
2. **profil métier** : interventions, risques, recherches locales, habilitations,
   contrôles techniques et stock critique ;
3. **exceptions éditoriales** : remplacement explicite d’un contenu ou d’une
   définition lorsque le métier le nécessite ;
4. **validation humaine** : aucune publication ni synchronisation Google Sheet
   avant validation du contenu généré.

Les couches modifient un contenu identifié par son `processId` et son index.
Une cible inconnue fait échouer la génération ; il n’existe pas de remplacement
global silencieux.

## Vagues BTP préparées

Le pilote Plomberie reste la référence validée. Le socle BTP neutralise les
termes propres à la plomberie, puis les douze autres profils de la famille sont
générés :

- Électricité générale ;
- Climatisation ;
- Serrurerie ;
- Rénovation intérieure ;
- Menuiserie et agencement ;
- Maçonnerie et gros œuvre ;
- Entreprise générale du bâtiment ;
- Paysagisme ;
- Pisciniste ;
- Couverture ;
- Peinture en bâtiment ;
- Carrelage.

Chaque brouillon conserve :

- 18 processus ;
- 74 contenus ;
- les quatre types `implementation_action`, `operational_step`,
  `operating_rule` et `recurring_control`.

Les profils précisent notamment les recherches Google Ads, les interventions
récurrentes, les contrôles de mise en service, les habilitations et le stock
critique.

### Relecture interne par lots

Le statut `internal_review_complete` signifie que les 74 contenus ont été
contrôlés en interne et que les exceptions métier les plus importantes ont été
ajoutées. Il ne vaut ni validation finale, ni autorisation de publication.

Lots relus :

- Électricité générale ;
- Climatisation ;
- Serrurerie ;
- Rénovation intérieure ;
- Menuiserie et agencement ;
- Maçonnerie et gros œuvre ;
- Entreprise générale du bâtiment ;
- Paysagisme ;
- Pisciniste ;
- Couverture ;
- Peinture en bâtiment ;
- Carrelage.

Les douze profils adaptent au moins 19 contenus par rapport au socle BTP,
notamment la qualification de la demande, le devis, le suivi d’intervention, la
préparation, la clôture, les imprévus, l’intégration d’un salarié et les écarts
de marge.

## Barrière de publication

Les douze métiers ont d’abord été préparés comme brouillons locaux testables.
Ils sont désormais tous synchronisés dans le référentiel maître.

Avant publication :

1. relire les 74 contenus métier par métier ;
2. vérifier les obligations réglementaires et les formulations à risque ;
3. valider les outils, fournisseurs et supports associés ;
4. injecter le contenu validé dans le Google Sheet maître ;
5. régénérer les fichiers techniques ;
6. créer ou mettre à jour les deux Google Sheets du métier :
   démonstration remplie et tableau vierge ;
7. exécuter les tests, l’audit visuel desktop/mobile et la vérification des
   liens de copie.

Le script `scripts/audit-btp-publication-staging.ts` prépare le diff de
publication sans écrire dans Google Sheets. Il indique pour chaque métier le
nombre de contenus actuels, les placeholders restants, la cible de 74 contenus,
le nombre d’adaptations métier et les libellés à ajouter ou retirer.

La valeur `readyForHumanApproval` signifie uniquement que le lot peut être
présenté pour validation. Elle ne déclenche aucune synchronisation. La valeur
`synchronized` signifie que les libellés du miroir technique correspondent
exactement à la cible générée.

Le moteur commun `scripts/sync-process-waves.ts` applique ensuite les vagues
validées en conservant les formats, les tables natives, les audits et le miroir
technique.

### Synchronisation BTP — famille terminée

Les profils suivants sont synchronisés dans le référentiel maître et dans le
miroir technique :

- Électricité générale ;
- Climatisation ;
- Serrurerie ;
- Maçonnerie et gros œuvre ;
- Menuiserie et agencement ;
- Rénovation intérieure ;
- Entreprise générale du bâtiment ;
- Couverture ;
- Peinture en bâtiment ;
- Carrelage ;
- Paysagisme ;
- Pisciniste.

Avec le pilote Plomberie, les treize métiers de la famille BTP possèdent
désormais chacun 18 processus et 74 contenus typés. Aucun profil BTP ne reste
au stade `readyForHumanApproval`.

## Agences digitales et création — famille terminée

La famille suivante est industrialisée en deux vagues :

- Agence marketing ;
- Agence web ;
- Création de contenu ;
- Média ;
- Photographe / vidéaste corporate ;
- Agence SEO ;
- Agence acquisition paid ads ;
- Studio branding / design.

Le socle comporte 19 processus et 74 contenus concrets. Chaque profil remplace
explicitement 14 contenus liés à l’offre, la qualification, le périmètre, la
production, la validation, les indicateurs, l’équipe, la marge et la conformité.
Le script `scripts/audit-agency-publication-staging.ts` compare ces cibles au
miroir actuel sans écrire dans Google Sheets.

Les deux vagues sont synchronisées dans le référentiel maître et le miroir :

- Agence marketing ;
- Agence web ;
- Agence SEO ;
- Agence acquisition paid ads ;
- Création de contenu ;
- Média ;
- Photographe / vidéaste corporate ;
- Studio branding / design.

Les huit profils possèdent désormais 19 processus et 74 contenus typés. Aucun
profil de la famille ne reste au stade `readyForHumanApproval`.

## Commerce — famille terminée

Les sept systèmes Commerce sont préparés avec 17 processus et 74 contenus :
Commerce de détail, Commerce alimentaire, Boutique spécialisée, Tabac / presse
/ point relais, Opticien, Fleuriste et Librairie.

Chaque profil adapte explicitement 12 contenus concernant la vente, l’ouverture,
les postes, la présentation, le stock, l’inventaire, l’équipe, la caisse et les
contrôles propres au métier. Les sept systèmes sont synchronisés dans le
référentiel maître et le miroir ; aucun profil ne reste en staging.

## Fast Food — famille terminée

Les sept systèmes Restaurant, Fast-food, Traiteur événementiel B2B, Dark
kitchen, Boulangerie, Café et Food truck possèdent chacun 20 processus et 74
contenus typés.

Le socle couvre le pilotage, l’acquisition, la prise de commande, la production,
les postes, les stocks, la qualité, l’équipe, la caisse, l’hygiène, les
non-conformités et la maintenance. Chaque profil adapte explicitement 14
contenus aux canaux de vente, aux contraintes de production, aux risques
sanitaires, aux équipements et aux conditions d’exploitation de son métier.
Les sept systèmes sont synchronisés dans le référentiel maître et le miroir ;
aucun placeholder ni profil en staging ne subsiste dans cette famille.

## Conseil expert — famille terminée

Les douze systèmes Conseil expert possèdent chacun 19 processus et 74 contenus
typés. La famille a été synchronisée en trois vagues :

- conseil, freelance, coaching et data / BI ;
- DAF, office management, administratif et secrétariat externalisés ;
- bureau d’études, cabinet d’études et cabinet QHSE / conformité.

Le socle couvre le développement commercial, le cadrage, la collecte, la
production, la revue, la restitution, la transmission, la marge, les
encaissements et la confidentialité. Chaque profil adapte explicitement 14
contenus à ses données d’entrée, ses contrôles, ses risques et son modèle de
mission. Les douze systèmes sont synchronisés sans placeholder.

## Services tech B2B — famille terminée

Les cinq systèmes Cybersécurité PME, Infogérance informatique, Intégrateur CRM
/ ERP, Maintenance informatique B2B et SaaS possèdent chacun 19 processus et
74 contenus typés. La famille a été synchronisée en deux vagues :

- cybersécurité et infogérance ;
- intégration CRM / ERP, maintenance informatique B2B et SaaS.

Le socle couvre le pilotage des parcs et projets, la qualification technique,
le cadrage, les changements, le support, la documentation, les accès, les
astreintes, la marge, la facturation, les données et la continuité. Chaque
profil adapte explicitement 14 contenus à son environnement, ses preuves, ses
niveaux de service, ses risques et son modèle économique. Les cinq systèmes
sont synchronisés sans placeholder.

## Logistique et transport — famille terminée

Les cinq systèmes Déménagement professionnel, Livraison dernier kilomètre,
Transport de marchandises, Transport de personnes B2B et VTC possèdent chacun
11 processus et 74 contenus typés. La famille a été synchronisée en deux
vagues :

- déménagement, livraison du dernier kilomètre et transport de marchandises ;
- transport de personnes B2B et VTC.

Le socle couvre la qualification, la planification, l'affectation, la
préparation, l'exécution, la preuve de réalisation, les incidents, la flotte,
les conducteurs, la marge et la facturation. Chaque profil adapte explicitement
14 contenus à ses documents opérationnels, ses contraintes d'accès, ses
preuves, ses obligations applicables et son modèle d'exploitation. Les cinq
systèmes sont synchronisés sans placeholder.

## Immobilier — groupe opérationnel terminé

Les systèmes Syndic, Gestion locative pour investisseurs et Conciergerie
multi-biens possèdent chacun 12 processus et 74 contenus typés.

Le socle commun couvre le cap du portefeuille, les délégations, la visibilité,
l'acquisition des mandats, les réclamations, la reprise des dossiers,
l'exploitation, les événements sensibles, les remplacements, la marge, les
flux et la conformité. Chaque système adapte explicitement 15 contenus :

- copropriétés, assemblées générales, décisions, travaux et appels de fonds
  pour le Syndic ;
- mandats, baux, loyers, quittances, états des lieux, dépôts de garantie et
  relocation pour la Gestion locative ;
- annonces, calendriers, réservations, préparation des séjours, accès,
  maintenance et règles locales pour la Conciergerie.

Les trois systèmes sont synchronisés dans le référentiel maître et le miroir,
sans placeholder.

## Commerce numérique — groupe opérationnel terminé

E-commerce possède 13 processus et Marketplace 12 processus. Les deux systèmes
comptent chacun 74 contenus typés.

Le socle commun couvre le cap, les délégations, les accès critiques,
l'acquisition, les réclamations, les offres, les opérations, les retours,
l'équipe, la marge, les paiements fournisseurs et les rapprochements. Chaque
système adapte explicitement 15 contenus :

- parcours d'achat, catalogue SKU, stock, préparation, transporteurs,
  rétractation applicable et marge contributive pour E-commerce ;
- liquidité des deux côtés, vérification des vendeurs, contrôle des offres,
  signalements, modération, coordination et reversements pour Marketplace.

Les formulations de conformité restent liées au modèle réel et aux obligations
applicables : le système ne suppose pas que la plateforme détient elle-même les
fonds. Les deux systèmes sont synchronisés dans le référentiel maître et le
miroir, sans placeholder.

## Formation — groupe opérationnel terminé

Organisme de formation possède 18 processus, CFA 20 processus et Formation en
ligne 17 processus. Les trois systèmes comptent chacun 74 contenus typés.

Le socle couvre la stratégie d’offre, les délégations, les inscriptions, la
conception pédagogique, la planification, la réalisation, les preuves, les
formateurs, la marge, la facturation et la qualité. Chaque système adapte
explicitement 15 contenus :

- conventions, financeurs, sessions, émargements, évaluations, attestations,
  déclaration d’activité et BPF pour l’Organisme de formation ;
- candidats, employeurs, contrats d’apprentissage, maîtres d’apprentissage,
  alternance, ruptures, missions CFA et résultats publiés pour le CFA ;
- acquisition, LMS, accès, assistance technique et pédagogique, activités à
  distance, évaluations, support et remboursements pour la Formation en ligne.

Qualiopi est formulée selon son périmètre réel d’accès aux financements publics
ou mutualisés. Les trois systèmes sont synchronisés dans le référentiel maître
et le miroir, sans placeholder.
