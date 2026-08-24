# D-091 — Gate métier des cinq pilotes Outils

Date de revue : 24 août 2026
Candidate : `solutions-2026-08-24-d091-tpe-pilot-candidate-v3`
Statut : **candidate TPE prête pour Preview, non activée**.

## Décision appliquée

Le volume est le résultat de la revue, jamais une cible. Les cinq compositions
retiennent 33 placements au total : 4, 8, 8, 7 et 6. Aucun badge, repère
éditorial ni module d'aide au choix n'est ajouté. Services reste une destination
canonique distincte et son DTO contextuel est recomposé indépendamment des
placements Outils.

| Système | Sélection revue, dans l'ordre | Logique de composition |
| --- | --- | --- |
| Agence de recrutement | Nicoka CABS, Recruit CRM, Bullhorn, Google Workspace | Trois suites conçues pour les agences, différenciées par cible, plus un seul socle documentaire. Recruitee et Teamtailor restent hors pilote car ils ciblent d'abord le recrutement interne et ne gèrent pas nativement la relation multi-clients d'une agence. |
| SaaS | Stripe, Pipedrive, GitHub, Vercel, Linear, Sentry, PostHog, Intercom | Chaîne revenu, vente, développement, déploiement, exécution produit, qualité, apprentissage et support. Pipedrive n'est pertinent que lorsque le volume commercial justifie un CRM. |
| Agence web | Figma, Webflow, WordPress, GitHub, Vercel, Asana, Sellsy, n8n | Conception, deux modes de production non interchangeables, code, déploiement, delivery, commerce et automatisation maintenable. |
| Cabinet comptable | Pennylane, MyUnisoft, ACD, Silae, Dext, RCA, Lefebvre Dalloz | Trois suites principales à comparer, puis quatre briques distinctes pour social, collecte, conseil et documentation. |
| Bâtiment | Obat, Vertuoza, Sage Batigest Connect, Alobees, Fieldwire, Kizeo Forms | Trois profils de gestion adaptés aux TPE et petites PME, puis trois briques terrain complémentaires. Graneet reste hors pilote car sa cible annoncée commence autour de 2 M€ de chiffre d'affaires. |

Le détail opposable de chaque placement — besoins couverts, cible, usage,
disponibilité France, contraintes, URL officielle, claim et horodatage — se
trouve dans `pilot-reviewed-selections.v2.json`.

## Preuves et contrôles terminés

- 31 URL officielles distinctes contrôlées en lecture seule : 30 répondent en
  HTTP 2xx/3xx après redirections ; la page officielle Sage Batigest renvoie
  un `403` aux contrôles automatisés et reste à confirmer manuellement dans un
  navigateur ; la sous-page Nicoka devenue 404 a été remplacée par la page
  produit officielle valide ; la page Pipedrive dédiée aux petites entreprises
  répond en HTTP 200 ;
- les trois outils agence absents du répertoire canonique ont été ajoutés avec
  source et date de revue : Nicoka CABS, Recruit CRM et Bullhorn ;
- manifeste placement-level fail-closed : cible, France, usage, justification,
  contrainte, HTTPS, preuve et date sont obligatoires ;
- candidate complète des 115 systèmes, `draft`, sans déplacement du pointeur
  Firebase ; seuls les cinq pilotes changent ;
- rangs continus de 1 à N, aucune ressource dupliquée, aucune entrée cachée,
  aucune carte Fournisseur ou Réseau non revue sur les pilotes ;
- parité de rendu des 110 systèmes hors pilote ;
- Services contextuels identiques avant et après composition Outils ;
- chaque Outil pilote apparaît exactement une fois et dans le même ordre dans
  le JSON-LD public ; aucune troncature à huit ou dix ;
- audit pilote vert et 11 tests ciblés verts.

## Preview recettée

- URL : <https://demaa-pj8qu8cq5-hiteamdemaa-2292s-projects.vercel.app> ;
- déploiement Vercel `dpl_7fmy7MZYmspmAX6YK88XaL9qib3r`, cible `preview`,
  statut `Ready` ;
- build et runtime forcés sur les données locales de la candidate, sans lecture
  ni déplacement du pointeur Firebase ;
- API des cinq pilotes : 4/8/8/7/6 Outils dans l'ordre revu ; les Services
  contextuels restent présents dans une section distincte ;
- les cinq pages répondent correctement et leur JSON-LD contient chaque Outil
  une fois, sans troncature, avec les positions continues de 1 à N ;
- aucun log runtime de niveau erreur relevé après la recette.

## Gate de validation métier

La Preview doit permettre de valider uniquement trois décisions éditoriales :

1. l'ordre des alternatives dans chaque système, notamment Nicoka CABS avant
   Recruit CRM et Bullhorn pour une audience française ;
2. l'acceptation de plusieurs suites principales quand elles correspondent à
   des profils réellement différents, sans laisser croire qu'elles doivent être
   cumulées ;
3. le niveau de sélectivité des listes 4/8/8/7/6, sans quota ni remplacement
   automatique si une carte est retirée.

Après ce GO métier seulement, la même méthode pourra être étendue aux 110 autres
systèmes. L'activation Firebase et toute fusion Production restent interdites
jusqu'à un GO PROD séparé.
