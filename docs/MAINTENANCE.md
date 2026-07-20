# Maintenance Demaa

Ce fichier sert de repere court pour modifier l'app sans ajouter de complexite inutile.

## Structure

- `src/app`: pages App Router, routes API, metadata et redirects.
- `src/components`: composants client et blocs d'interface reutilises.
- `src/lib`: donnees, acces Firebase, helpers serveur, catalogues et logique metier.
- `scripts`: scripts ponctuels de migration ou seed.
- `public`: images et assets statiques.

## Donnees

Les catalogues sont encore repartis entre plusieurs sources:

- `src/lib/tool-directory.json`: annuaire logiciel principal.
- `src/lib/enterprise-annuaire.json`: kits operationnels par activite.
- `src/lib/service-catalog.ts`: catalogue officiel des services Demaa.
- `src/lib/service-recommendations.ts`: ordre des services recommandes par kit.
- `src/lib/supplier-catalog.ts`: annuaire fournisseurs, banques, assurances, mutuelles et partenaires metier.
- `src/lib/supplier-recommendations.ts`: ordre des fournisseurs recommandes par kit.
- Firestore: source distante avec fallback local pour certains catalogues.

Regle pragmatique: avant d'ajouter un outil, un service ou un kit, verifier quelle page le consomme. Eviter d'ajouter la meme donnee dans plusieurs fichiers si un mapping suffit.

Pour `src/lib/enterprise-annuaire.json`, Git est la source de verite editoriale. Firestore sert de base de lecture runtime et doit rester synchronise via:

```bash
npm run sync:enterprise-annuaire
```

Apres chaque merge sur `main` qui touche `src/lib/enterprise-annuaire.json`, le workflow GitHub Actions `Sync enterprise annuaire` pousse automatiquement le JSON vers la collection Firestore `enterprise_annuaire`. Pour corriger un seul kit:

```bash
npm run sync:enterprise-annuaire -- --only cabinet-comptable
```

Si les secrets Firebase ne sont pas configures dans GitHub Actions, le workflow passe sans synchroniser Firestore. Dans ce cas, ajouter les secrets ci-dessous ou lancer la synchronisation depuis un environnement qui les possede.

## Environnement

Variables serveur principales:

- `SITE_URL` (recommande, ex. `https://demaa.fr`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` ou `FIREBASE_SERVICE_ACCOUNT_KEY`
- `SLACK_WEBHOOK_URL`
- `RESEND_API_KEY`
- `CRON_SECRET`

Variable publique:

- `NEXT_PUBLIC_SITE_URL` (compatibilite legacy uniquement si besoin)

Ne pas prefixer les secrets serveur avec `NEXT_PUBLIC_`.

## Design

Base commune:

- couleurs et fonts dans `src/app/globals.css`;
- classes existantes: `demaa-input`, `demaa-textarea`, `demaa-section-title`, `demaa-hero-title`;
- icones via `lucide-react`.

Regle simple: reutiliser les classes ou composants existants avant d'ajouter des classes Tailwind arbitraires. Si le meme style revient 3 fois, extraire un petit composant ou une classe utilitaire.

## API

Routes critiques:

- `/api/systeme-kit/request`: envoie le Google Sheet du kit et programme les suivis.
- `/api/cron/system-kit-followups`: envoie les suivis programmes.
- `/api/customer-space/*`: acces securise a Mon espace.
- `/api/service-introduction-request`: demande de mise en relation avec un service.

Helpers utiles:

- `src/lib/firebase-admin.ts`: initialisation Firebase unique.
- `src/lib/generations-db.ts`: acces Firestore pour les suivis de kits, l'authentification et la lecture des historiques de Mon espace.
- `src/lib/slack.ts`: envoi Slack commun.

## Checklist avant livraison

```bash
npm run lint
npm run build
```

Si `next build` panique localement sur un fichier temporaire Turbopack, utiliser:

```bash
npm run build:stable
```

Le cycle `npm run build` -> `npm run start` utilise volontairement le dossier `.next-build` pour ne pas se battre avec un `next dev` local.

Si le changement touche la taxonomie secteur, les pages SEO, les fallbacks outils, les hubs secteur ou les kits operationnels, lancer aussi:

```bash
npm run audit:seo-foundations
```

Pour un usage CI explicite, utiliser:

```bash
npm run audit:seo-foundations:ci
```

Ce script rejoue en une fois:

- `validate:data`
- validation taxonomie secteur
- validation routes SEO
- validation liens editoriaux secteur
- validation coherence build/start/distDir
- audit couverture free tools / fallbacks
- audit maillage interne
- audit qualite des kits operationnels

Regles utiles sur ce lot:

- `src/lib/sector-taxonomy.json` est la source de verite pour les secteurs publics et leur mode de fallback.
- `src/lib/free-tool-fallbacks.json` centralise les priorites exactes, generiques et manuelles.
- si un secteur `generic` devient trop faible, preferer un mapping de kit dedie avant de dupliquer la taxonomie.
- ne pas reintroduire `/ressources/[slug]`; l'index legacy `/ressources` doit seulement rediriger vers `/modeles-de-documents`.

Puis verifier manuellement les parcours touches:

- page modifiee charge sans erreur;
- formulaire modifie affiche bien succes/erreur;
- route API modifiee garde ses statuts attendus;
- email de kit recu et lien `/copy` fonctionnel.
