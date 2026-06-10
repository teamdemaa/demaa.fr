# Maintenance Demaa

Ce fichier sert de repere court pour modifier l'app sans ajouter de complexite inutile.

## Structure

- `src/app`: pages App Router, routes API, metadata et redirects.
- `src/components`: composants client et blocs d'interface reutilises.
- `src/lib`: donnees, acces Firebase, helpers serveur, catalogues et logique metier.
- `content/blog`: articles Markdown du blog.
- `scripts`: scripts ponctuels de migration ou seed.
- `public`: images et assets statiques.

## Donnees

Les catalogues sont encore repartis entre plusieurs sources:

- `src/lib/tool-directory.json`: annuaire logiciel principal.
- `src/lib/enterprise-annuaire.json`: systemes par secteur.
- `src/lib/service-catalog.ts`: catalogue officiel des services Demaa.
- `src/lib/service-recommendations.ts`: ordre des services recommandes par systeme.
- `src/lib/supplier-catalog.ts`: annuaire fournisseurs, banques, assurances, mutuelles et partenaires metier.
- `src/lib/supplier-recommendations.ts`: ordre des fournisseurs recommandes par systeme.
- Firestore: source distante avec fallback local pour certains catalogues.

Regle pragmatique: avant d'ajouter un outil, un service ou un systeme, verifier quelle page le consomme. Eviter d'ajouter la meme donnee dans plusieurs fichiers si un mapping suffit.

Pour `src/lib/enterprise-annuaire.json`, Git est la source de verite editoriale. Firestore sert de base de lecture runtime et doit rester synchronise via:

```bash
npm run sync:enterprise-annuaire
```

Apres chaque merge sur `main` qui touche `src/lib/enterprise-annuaire.json`, le workflow GitHub Actions `Sync enterprise annuaire` pousse automatiquement le JSON vers la collection Firestore `enterprise_annuaire`. Pour corriger un seul systeme:

```bash
npm run sync:enterprise-annuaire -- --only cabinet-comptable
```

Si les secrets Firebase ne sont pas configures dans GitHub Actions, le workflow passe sans synchroniser Firestore. Dans ce cas, ajouter les secrets ci-dessous ou lancer la synchronisation depuis un environnement qui les possede.

## Environnement

Variables serveur principales:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` ou `FIREBASE_SERVICE_ACCOUNT_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `SLACK_WEBHOOK_URL`
- `STRIPE_SECRET_KEY` ou variables test Stripe
- `STRIPE_WEBHOOK_SECRET` ou variables test webhook

Variable publique:

- `NEXT_PUBLIC_SITE_URL`

Ne pas prefixer les secrets serveur avec `NEXT_PUBLIC_`.

## Design

Base commune:

- couleurs et fonts dans `src/app/globals.css`;
- classes existantes: `demaa-input`, `demaa-textarea`, `demaa-section-title`, `demaa-hero-title`;
- icones via `lucide-react`.

Regle simple: reutiliser les classes ou composants existants avant d'ajouter des classes Tailwind arbitraires. Si le meme style revient 3 fois, extraire un petit composant ou une classe utilitaire.

## API

Routes critiques:

- `/api/assistant`: genere le plan d'action IA.
- `/api/generations`: compte et sauvegarde les generations.
- `/api/newsletter`: inscription newsletter.
- `/api/lead`: envoi lead vers Slack.
- `/api/system-setup-request`: demande systeme vers Slack.
- `/api/stripe/*`: checkout et webhook paiement.

Helpers utiles:

- `src/lib/firebase-admin.ts`: initialisation Firebase unique.
- `src/lib/generations-db.ts`: acces Firestore generations, credits, newsletter, paiements.
- `src/lib/slack.ts`: envoi Slack commun.

## Checklist avant livraison

```bash
npm run lint
npm run build
```

Puis verifier manuellement les parcours touches:

- page modifiee charge sans erreur;
- formulaire modifie affiche bien succes/erreur;
- route API modifiee garde ses statuts attendus;
- lien Stripe ou webhook non modifie sans besoin clair.
