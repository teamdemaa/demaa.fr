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

The application uses local Satoshi and Gambetta font files through `next/font/local`.
