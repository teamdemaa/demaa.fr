# D-094 — Plan d'exécution du produit public sans compte

- Base : `origin/main` au commit `dbb8b723`
- Date : 22 août 2026
- Production : inchangée pendant la préparation
- Anglais : en pause
- D-091 : conservé, sans mutation Firebase pendant ce programme

Chaque lot est une PR autonome, rebasée sur le `main` courant, avec ses propres
tests. `main` déclenchant Production, aucune fusion n'est implicite.

Inventaire de départ : [d094-runtime-inventory.md](d094-runtime-inventory.md).

## PR 0 — Décision et assainissement

- enregistrer D-094 et ses supersessions ;
- versionner le handover The Done Studio en pause ;
- corriger l'état de D-093 et de `Recruter un alternant` ;
- figer l'inventaire des routes, collections et consommateurs ;
- ne modifier aucun runtime.

Gate : diff documentaire cohérent, aucun fichier runtime, `git diff --check`
et validations documentaires verts.

## PR 1 — Session Team Demaa indépendante

- cookie admin distinct du cookie client historique ;
- route de connexion admin dédiée ;
- validation Firebase puis allowlist avant création du cookie ;
- aucune création d'entreprise ou d'appartenance ;
- DAL admin appliqué aux pages et Route Handlers ;
- logout et expiration propres ;
- anciens secrets statiques retirés seulement après recette réelle.

Gate : e-mail/Google autorisé, identité non autorisée, cookie falsifié,
expiration, noindex, GET/POST admin, zéro document entreprise créé.

## PR 2 — Génération invitée derrière flag

- contrat et stockage temporaire dédiés ;
- secret opaque et empreinte serveur ;
- états durables et reprise ;
- réutilisation du moteur V4, des validations et du ledger ;
- rate limit fiable, idempotence, budget quotidien global et circuit breaker ;
- lecture et écriture avec contrôle du secret ;
- TTL initial de 24 heures ;
- flag `DEMAA_GUEST_PRODUCT_ENABLED` désactivé par défaut.

Gate : doublon, concurrence, interruption, échec IA, réparation, mauvaise clé,
expiration, quota IP/global, indisponibilité Firestore, absence de PII/log de
secret et absence de création UID/company.

## PR 3 — Livraison du plan et Diagnostic

- CTA `Recevoir mon plan par e-mail` ;
- e-mail transactionnel contenant le plan ;
- CTA `Demander un diagnostic` ;
- e-mail obligatoire, téléphone facultatif, instantané du plan ;
- stockage idempotent et notification Team ;
- détail et statut dans l'administration ;
- aucune conversation ou compte client ;
- aucune inscription marketing implicite.

Gate : lien invité valide/invalide/expiré, double clic, échec d'e-mail et
reprise, consentement, contenu échappé, notification admin, rétention.

## PR 4 — Formulaires publics et boîte de demandes

- convertir uniquement les formulaires encore artificiellement liés à l'UID ;
- retirer les doublons conversationnels ;
- conserver les collections spécialisées et les agréger par adaptateurs ;
- pagination, filtres, détail, statut et état de livraison ;
- garder l'administration Opportunités spécialisée ;
- vérification manuelle de l'avantage commercial sans UID client.

Gate : chaque formulaire fonctionne sans compte, anti-abus uniforme, absence de
PII dans les logs, pagination stable, aucune fuite inter-source, politique et
CGV alignées.

## PR 5 — Bascule de l'interface publique

- connecter l'accueil à la génération invitée ;
- afficher le plan éditable dans la session invitée ;
- retirer les entrées Connexion, Profil, Mes plans et chat client ;
- masquer Chiffres et Stratégie ;
- retirer les redirections automatiques vers le dernier plan ;
- traiter explicitement les anciennes routes client ;
- préserver Services, Solutions, Académie, Opportunités et D-091 ;
- conserver les composants historiques hors rendu pendant le rollback.

Gate : parcours complet sans compte, retour arrière, rafraîchissement,
expiration, mobile/PWA, clavier/lecteur d'écran, noindex, aucun lien cassé ni
appel API authentifié résiduel dans le parcours public.

## PR 6 — Recette et activation

1. suite ciblée de chaque PR ;
2. `npm run check` ;
3. build Production ;
4. E2E local et Preview ;
5. génération avec vrai modèle sous budget borné ;
6. e-mail réel contrôlé ;
7. demandes visibles dans l'admin ;
8. tests de charge/anti-abus bornés ;
9. smoke desktop/mobile/PWA ;
10. GO Production explicite ;
11. activation progressive du flag et observation 24–48 heures.

## PR 7 — Nettoyage différé

Après stabilité et autorisation destructive : inventorier puis supprimer les
comptes de test, entreprises, appartenances, plans et conversations identifiés.
Retirer ensuite seulement le code client orphelin, les cookies et les anciens
contrats. Conserver les adaptateurs de lecture tant qu'une donnée historique ou
un rollback peut les nécessiter.

## Ordre et collisions

```text
PR 0 → PR 1 → PR 2 → PR 3 → PR 4 → PR 5 → PR 6 → PR 7
```

D-091 peut poursuivre ses recherches éditoriales hors registre actif, mais pas
modifier les mêmes surfaces pendant PR 5. L'anglais et The Done Studio restent
gelés. Toute correction française commune est faite sur `main`, jamais copiée
manuellement dans la branche anglaise en pause.
