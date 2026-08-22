This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Configure the server-side Firebase credentials before using the kit-email flow,
customer-space authentication, or lead forms:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

You can also provide the full service account JSON as `FIREBASE_SERVICE_ACCOUNT_KEY`
instead of the three variables above. Do not prefix these variables with
`NEXT_PUBLIC_`; they must stay server-side only.

Firebase Authentication uses e-mail/password as the primary customer flow and
Google as a secondary option. Both providers create the same native Firebase
session cookie and require all four public Firebase Web configuration values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-web-api-key
NEXT_PUBLIC_FIREBASE_APP_ID=your-web-app-id
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

Enable both e-mail/password and Google in Firebase Authentication and authorize
each Production/Preview domain before exposing them. No historical customer-access
route is kept. These public values identify the Firebase Web app;
server credentials and service-account values must never use the `NEXT_PUBLIC_`
prefix.

The English beta route is fail-closed. It returns a non-indexable 404 unless
the server-only flag below is explicitly enabled for a controlled Preview:

```bash
DEMAA_ENGLISH_BETA_ENABLED=true
```

Do not expose this flag in `NEXT_PUBLIC_*`. The French application remains the
default and `/en` must stay disabled in Production until the integrated beta
gate (Action Plan, Solutions, Academy, and Talk to us) is complete.

The public guest-plan foundation is also fail-closed and remains invisible
until its dedicated UI rollout. A controlled Preview requires all of the
following server-only values:

```bash
DEMAA_GUEST_PRODUCT_ENABLED=true
DEMAA_GUEST_AI_DAILY_LIMIT=25
SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET=a-random-secret-of-at-least-32-characters
```

`DEMAA_GUEST_AI_CIRCUIT_OPEN=true` immediately blocks new guest AI work without
affecting existing authenticated plans. Guest access keys are browser-held,
sent only in the request body or `Authorization` header, stored only as hashes,
and never placed in URLs. Guest generations expire after 24 hours; the
operational cleanup removes their expired documents and budget reservations.

The runtime service account also needs Firestore access plus the two Firebase
Auth permissions `firebaseauth.users.createSession` and
`firebaseauth.users.get`. Keep the latter in a minimal custom IAM role rather
than granting a broad Firebase administrator role.

Stripe remains the source of truth for an active Coach business subscription.
Production never falls back to test credentials:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_COACH_BUSINESS_PRICE_IDS=price_750...
```

Use the same names suffixed with `_TEST` outside Production. The configured
prices must be recurring monthly EUR prices of 750 EUR. Multiple identifiers
remain accepted during a controlled Stripe price rotation. Forward signed
local events with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`;
the 12% entitlement changes only after the signed webhook is processed. The
public callback never grants a discount and never creates a payment by itself.

Demaa also exposes `/manifest.webmanifest` and install icons for an installable
PWA shell. It intentionally has no service worker or offline plan storage:
Firebase stays the only durable source after a plan is saved.

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the home page in `src/app/page.tsx`.

## Validation

For the sector taxonomy, routing, fallback coverage, and operational-kit foundations, run:

```bash
npm run audit:seo-foundations
```

This project also exposes:

- `npm run validate:data`
- `npm run audit:seo-foundations:ci`
- `npm run audit:system-pages`
- `npm run audit:internal-linking`
- `npm run build:stable`

If `next build` ever flakes locally because of a Turbopack temp-file issue, use `npm run build:stable`.
The production `build` and `start` scripts both use the isolated `.next-build` directory.
After a production build, use `npm run start:local-data` to inspect the committed
local data candidate instead of the currently active remote Firebase revision.

The application uses local Satoshi and Gambetta font files through `next/font/local`.
