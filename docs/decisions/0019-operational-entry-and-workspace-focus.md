# ADR 0019 — Entrée opérationnelle et espace de travail recentré

- Décision : D-093
- Statut : `validated`
- Date : 22 août 2026
- Portée : entrée du générateur, règles IA, sous-navigation du Plan, visibilité
  de Stratégie et présentation du catalogue Services
- Autorisation : implémentation autorisée ; Preview, fusion, Production et
  mutations Firebase conservent leurs gates propres

## Contexte

L'entrée « Qu’est-ce qui freine votre entreprise ? » accepte des situations
larges, mais ne guide pas assez directement vers les opérations qui consomment
du temps : tâches manuelles, ressaisies, attentes, validations, reprises et
informations dispersées. En parallèle, l'espace du Plan expose plusieurs
surfaces de pilotage et le catalogue Services affiche en permanence les sept
prestations de partenaires.

Demaa doit donner une première valeur opérationnelle sans devenir un
générateur automatique d'automatisations, un comparateur de logiciels ou un
catalogue de recommandations commerciales. Les Actions restent produites par
l'IA ; les processus, ressources, outils et Services restent déterministes,
gouvernés et capables de s'abstenir.

## Décision

### 1. Promesse et entrée

La promesse française devient exactement :

> Qu’est-ce qui vous prend trop de temps aujourd’hui ?

Le titre est stable. Le typewriter `entreprise / agence / cabinet` disparaît.
Les exemples continuent de tourner uniquement dans le champ vide. Les CTA
`Créer mon plan d’action` et `Commencer avec un plan vierge` restent inchangés,
sans sous-titre explicatif supplémentaire.

Le nom accessible du champ est :

> Décrivez les tâches, blocages ou opérations qui vous prennent du temps

La nouvelle entrée privilégie les tâches répétitives, doubles saisies,
recherches d'information, validations, attentes, relances, erreurs, reprises et
manques de visibilité. Elle doit néanmoins traiter honnêtement un problème de
marge, ventes, recrutement, qualité, trésorerie ou organisation lorsque la
situation décrite n'est pas principalement un problème de temps.

### 2. Génération IA

La génération conserve le contrat ActionPlan V4, un `systemId` canonique et
trois ou quatre Actions par défaut. Une cinquième Action reste autorisée
uniquement lorsqu'elle est distincte et réellement nécessaire.

Le prompt français et son équivalent anglais doivent :

1. identifier les tâches ou décisions qui consomment du temps, créent de
   l'attente, provoquent des reprises ou dépendent excessivement du dirigeant ;
2. utiliser, lorsqu'ils sont fournis, la fréquence, le volume, les personnes,
   les outils, les ressaisies, les validations, les erreurs et le résultat
   attendu ;
3. chercher la réponse la plus simple dans l'ordre : supprimer, simplifier,
   clarifier les responsabilités, standardiser ou documenter, déléguer,
   automatiser ;
4. ne jamais automatiser automatiquement un processus encore confus ;
5. transformer les informations manquantes en première Action de mesure ou
   d'observation terrain au lieu d'inventer ;
6. ne jamais inventer ou introduire une marque, un prestataire ou un service ;
   une marque explicitement citée peut rester un fait de contexte sans devenir
   automatiquement une recommandation ;
7. conserver une seule opération de génération principale et au maximum
   l'appel de réparation déjà gouverné ; aucun appel autonome de matching ou
   d'évaluation n'est ajouté en Production.

`channelOrTool` peut désigner un canal ou une capacité générique utile. La
génération ne produit aucune Stratégie, aucun tableau ou modèle, et ne choisit
pas directement un logiciel ou un prestataire.

### 3. Écran de génération

L'animation d'attente présente des questions cohérentes avec la nouvelle
promesse : tâches récurrentes, ressaisies, recherches, validations, options de
simplification et résultat observable. Elle ne collecte aucune nouvelle donnée
et ne déclenche aucun appel IA supplémentaire.

### 4. Sous-navigation et Stratégie

L'ordre visuel devient :

> Plan / Solutions / Chiffres

Les valeurs techniques `actions`, `solutions` et `figures`, les URL
historiques, les règles d'accès et la section par défaut restent inchangées.
Chiffres reste lisible avant connexion et seule l'écriture demande une
authentification.

La surface Stratégie est temporairement masquée. Ce masquage est réversible et
ne supprime ni composant métier, ni API, ni document `company_strategies`, ni
cycle, réponse, historique, règle de concurrence ou règle de suppression
d'entreprise. Les anciennes URL `section=strategy` et l'intention
`open-company-strategy` sont normalisées vers le Plan afin de ne jamais rendre
une page vide ou un retour d'authentification bloqué.

D-084 reste techniquement livré. D-093 supersède seulement sa présentation
courante de Stratégie sous le Plan.

### 5. Services

`Nos accompagnements` reste une section ouverte présentant les deux services
directement réalisés par Demaa. Les sept Services tiers sont placés dans un
dépliant `Avec nos partenaires de confiance`, fermé par défaut mais consultable
par tous sans authentification.

Le dépliant réutilise le catalogue, les cartes, fiches, prix, formulaires et
ordre existants. Il est rendu de la même manière dans la destination Services
de l'application et sur `/services`. Les pages détaillées, leurs liens et leur
SEO restent accessibles.

La modale Service réserve l'espace du bouton de fermeture au seul bloc
supérieur. La liste incluse, le séparateur, les forfaits et le formulaire
occupent toute la largeur intérieure disponible.

### 6. Frontière avec D-091

D-091 reste le seul contrat d'exécution de la curation des Outils. D-093 ne
crée aucune sélection, révision Firebase ou activation anglaise et ne modifie
pas le pointeur actif.

Le résolveur contextuel actuel conserve ses plafonds, sa déduplication et son
abstention. Le futur chaînage `Action → besoin opérationnel → processus → outil`
appartiendra à une décision séparée après validation du pilote D-091. Aucun
`capabilityId`, `improvementMode` ou élargissement opportuniste des expressions
régulières n'est introduit par D-093.

## Supersessions limitées

D-093 supersède uniquement :

- la promesse de présentation de D-076 et de l'ADR 0008 ;
- l'ordre visuel `Plan / Chiffres / Solutions` de D-084 et D-090 ;
- l'exposition courante de Stratégie sous le Plan ;
- la présentation ouverte permanente des Services partenaires dans D-090.

D-093 ne remet pas en cause Plan V4, les identifiants canoniques, Firebase, la
propriété des plans, les contrats Chiffres et Stratégie, les données
historiques, les routes et API, l'authentification avant génération, D-091,
D-092 ou la pause de l'English Beta.

## Séquencement

1. décision et documentation ;
2. entrée opérationnelle et prompt IA dans une même release ;
3. ordre du Plan et masquage réversible de Stratégie ;
4. présentation Services et correction de la modale ;
5. recette intégrée ;
6. matching par capacité dans une décision ultérieure, après D-091.

## Critères d'acceptation

1. le nouveau titre n'est jamais publié avec l'ancien prompt ;
2. les situations non centrées sur le temps restent traitées honnêtement ;
3. aucune automatisation, marque ou prestation n'est forcée ;
4. le schéma V4, les limites et la réparation existante sont conservés ;
5. les anciennes URL et intentions Stratégie reviennent au Plan sans page vide ;
6. aucune donnée Stratégie n'est modifiée ou supprimée ;
7. les deux Services Demaa restent visibles et les partenaires restent
   consultables sans compte dans un dépliant accessible ;
8. aucune donnée D-091, révision Firebase, activation anglaise ou recommandation
   contextuelle n'est élargie ;
9. desktop, mobile, PWA, clavier et lecteur d'écran sont recettés avant fusion ;
10. la fusion ou le déploiement Production exige un GO distinct.
