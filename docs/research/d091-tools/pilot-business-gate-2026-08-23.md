# D-091 — Gate métier des cinq pilotes Outils

Date de revue : 23 août 2026
Candidate : `solutions-2026-08-23-d091-pilot-candidate-v2`
Statut : **prête pour Preview, non activée**.

## Décision appliquée

Le volume est le résultat de la revue, jamais une cible. Les cinq compositions
retiennent 34 placements au total : 4, 8, 8, 7 et 7. Aucun badge, repère
éditorial ni module d'aide au choix n'est ajouté. Services reste une destination
canonique distincte et son DTO contextuel est recomposé indépendamment des
placements Outils.

| Système | Sélection revue, dans l'ordre | Logique de composition |
| --- | --- | --- |
| Agence de recrutement | Nicoka CABS, Recruit CRM, Bullhorn, Google Workspace | Trois ATS-CRM réellement conçus pour les agences et différenciés par cible, plus un seul socle documentaire. Recruitee et les briques CRM, agenda, téléphonie ou automatisation génériques sortent du pilote. |
| SaaS | Stripe, Attio, GitHub, Vercel, Linear, Sentry, PostHog, Intercom | Chaîne revenu, vente, développement, déploiement, exécution produit, qualité, apprentissage et support. Chaque brique répond à un besoin distinct. |
| Agence web | Figma, Webflow, WordPress, GitHub, Vercel, Asana, Sellsy, n8n | Conception, deux modes de production non interchangeables, code, déploiement, delivery, commerce et automatisation maintenable. |
| Cabinet comptable | Pennylane, MyUnisoft, ACD, Silae, Dext, RCA, Lefebvre Dalloz | Trois suites principales à comparer, puis quatre briques distinctes pour social, collecte, conseil et documentation. |
| Bâtiment | Obat, Vertuoza, Graneet, Sage Batigest Connect, Alobees, Fieldwire, Kizeo Forms | Quatre profils de gestion différenciés par taille et profondeur, puis trois briques terrain complémentaires. |

Le détail opposable de chaque placement — besoins couverts, cible, usage,
disponibilité France, contraintes, URL officielle, claim et horodatage — se
trouve dans `pilot-reviewed-selections.v2.json`.

## Preuves et contrôles terminés

- 32 URL officielles distinctes contrôlées en lecture seule : 32 réponses HTTP
  200 après redirections ; la sous-page Nicoka devenue 404 a été remplacée par
  la page produit officielle valide ;
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
- audit pilote vert et 26 tests ciblés verts.

## Preview recettée

- URL : <https://demaa-5b4nh2fwb-hiteamdemaa-2292s-projects.vercel.app> ;
- déploiement Vercel `dpl_Gz9PWLW7bZ39ZfnS9oGpYQ8jhMS6`, cible `preview`,
  statut `Ready` ;
- build forcé sur les données locales de la candidate, sans lecture ni
  déplacement du pointeur Firebase ;
- API des cinq pilotes : 4/8/8/7/7 Outils, dans l'ordre revu, et Services
  contextuels présents séparément ;
- HTML et JSON-LD des cinq pages : chaque Outil apparaît une fois, avec les
  positions continues de 1 à N ;
- aucun log d'erreur Vercel relevé après la recette.

## Gate de validation métier

La Preview doit permettre de valider uniquement trois décisions éditoriales :

1. l'ordre des alternatives dans chaque système, notamment Nicoka CABS avant
   Recruit CRM et Bullhorn pour une audience française ;
2. l'acceptation de plusieurs suites principales quand elles correspondent à
   des profils réellement différents, sans laisser croire qu'elles doivent être
   cumulées ;
3. le niveau de sélectivité des listes 8/8/7/7, sans quota ni remplacement
   automatique si une carte est retirée.

Après ce GO métier seulement, la même méthode pourra être étendue aux 110 autres
systèmes. L'activation Firebase et toute fusion Production restent interdites
jusqu'à un GO PROD séparé.
