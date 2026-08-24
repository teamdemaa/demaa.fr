# D-091 — Gate métier des cinq pilotes Outils

Date de revue : 24 août 2026
Candidate : `solutions-2026-08-24-d091-tpe-pilot-candidate-v4`
Statut : **candidate TPE recettée en Preview, non activée**.

## Décision appliquée

Le volume est le résultat de la revue, jamais une cible. Les cinq compositions
retiennent 32 placements au total : 3, 8, 8, 7 et 6. Aucun badge, repère
éditorial ni module d'aide au choix n'est ajouté. Services reste une destination
canonique distincte et son DTO contextuel est recomposé indépendamment des
placements Outils.

| Système | Sélection revue, dans l'ordre | Logique de composition |
| --- | --- | --- |
| Agence de recrutement | Nicoka CABS, Recruit CRM, Bullhorn | Trois ATS-CRM conçus pour les agences, différenciés par ancrage France, portée internationale et trajectoire de croissance. Google Workspace est retiré : utile mais trop évident et transversal pour apporter ici une valeur de décision. Aucun remplacement n'est ajouté pour conserver un volume. |
| SaaS | Stripe, Pipedrive, GitHub, Vercel, Linear, Sentry, PostHog, Intercom | Chaîne revenu, vente, développement, déploiement, exécution produit, qualité, apprentissage et support. Pipedrive n'est pertinent que lorsque le volume commercial justifie un CRM. |
| Agence web | Figma, Webflow, WordPress, GitHub, Vercel, Asana, Sellsy, n8n | Conception, deux modes de production non interchangeables, code, déploiement, delivery, commerce et automatisation maintenable. |
| Cabinet comptable | Pennylane, MyUnisoft, ACD, Silae, Dext, RCA, Lefebvre Dalloz | Trois suites principales à comparer, puis quatre briques distinctes pour social, collecte, conseil et documentation. |
| Bâtiment | Obat, Vertuoza, Sage Batigest Connect, Alobees, Fieldwire, Kizeo Forms | Trois profils de gestion adaptés aux TPE et petites PME, puis trois briques terrain complémentaires. Graneet reste hors pilote car sa cible annoncée commence autour de 2 M€ de chiffre d'affaires. |

Le détail opposable de chaque placement — besoins couverts, cible, usage,
disponibilité France, contraintes, URL officielle, claim et horodatage — se
trouve dans `pilot-reviewed-selections.v2.json`.

## Preuves et contrôles terminés

- 30 URL officielles distinctes contrôlées en lecture seule : 29 répondent en
  HTTP 2xx/3xx après redirections ; la page officielle Sage Batigest renvoie
  un `403` aux contrôles automatisés et reste à confirmer manuellement dans un
  navigateur ; la sous-page Nicoka devenue 404 a été remplacée par la page
  produit officielle valide ; les pages Pipedrive petite entreprise et
  Bullhorn petites agences répondent en HTTP 200 ;
- les trois outils agence absents du répertoire canonique ont été ajoutés avec
  source et date de revue : Nicoka CABS, Recruit CRM et Bullhorn ;
- ces trois entrées restent `hidden` dans l'annuaire public et le sitemap tant
  que la candidate D-091 n'a pas reçu son GO métier et son activation séparée ;
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
- audit pilote vert ; tests ciblés verts et `npm run check` vert : 273 fichiers,
  1 547 tests, lint strict, TypeScript, Académie et validations de données.

## Preview recettée

- URL : <https://demaa-7dxh2xtwp-hiteamdemaa-2292s-projects.vercel.app> ;
- déploiement Vercel `dpl_J8aGzwrwQ1hm1sKmgTfuhumFNpF3`, cible `preview`,
  statut `Ready` ;
- build et runtime forcés sur les données locales de la candidate v4, sans
  lecture ni déplacement du pointeur Firebase ;
- API des cinq pilotes : 3/8/8/7/6 Outils dans l'ordre revu ; les Services
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
3. le niveau de sélectivité des listes 3/8/8/7/6, sans quota ni remplacement
   automatique si une carte est retirée.

Après ce GO métier seulement, la même méthode pourra être étendue aux 110 autres
systèmes. L'activation Firebase et toute fusion Production restent interdites
jusqu'à un GO PROD séparé.
