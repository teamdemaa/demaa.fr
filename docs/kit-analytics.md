# Suivi des kits opérationnels

## Parcours

Les cartes de pilotage ouvrent une route Demaa :

```text
/api/kits/[slug]/open
```

La route enregistre des compteurs agrégés dans Firestore, puis répond par une
redirection temporaire vers le Google Sheet `/copy`. Une panne du stockage ne
bloque jamais l'accès au document.

## Données enregistrées

- slug et nom du kit ;
- date d'ouverture, selon le fuseau `Europe/Paris` ;
- page interne d'origine ;
- source, support et campagne UTM lorsqu'ils sont présents.

Aucun email, nom, numéro de téléphone, identifiant visiteur ou adresse IP n'est
enregistré dans les collections de suivi.

Collections Firestore :

- `kit_open_totals` : total par kit ;
- `kit_open_daily` : total quotidien par kit ;
- `kit_open_sources` : total quotidien par kit et attribution agrégée.

## Historique avant le suivi

Le tableau sépare les ouvertures suivies depuis la mise en place du compteur des
distributions historiques. Le backfill historique utilise trois preuves :

- un ancien abonnement dont la source est explicitement un kit ;
- une séquence kit actuelle ;
- un email du kit marqué comme envoyé.

Une même personne et un même kit ne sont comptés qu'une fois, même lorsque la
preuve existe dans plusieurs collections. Les demandes sans preuve d'envoi et
les abonnés newsletter sans kit sont exclus. Les emails servent uniquement à la
déduplication en mémoire : ni l'email ni son hash ne sont écrits dans les
collections analytiques.

Collections Firestore :

- `kit_historical_download_totals` : distributions historiques par kit ;
- `kit_historical_download_summaries/v1` : nombre total de distributions et de
  personnes historiques.

Le script est sans effet par défaut et n'écrit qu'avec l'option `--apply` :

```text
npm run backfill:kit-history
npm run backfill:kit-history -- --apply
```

## Tableau privé

Le tableau est disponible sur `/suivi-kits`. Définir en production :

```text
KIT_ANALYTICS_DASHBOARD_PASSWORD
```

Le mot de passe n'est jamais stocké dans le navigateur. Une session HTTP-only
valable 12 heures est créée après authentification. Le tableau permet de filtrer
sur 7, 30 ou 90 jours et d'exporter les résultats au format CSV.
