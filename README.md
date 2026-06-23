This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Configure the server-side Firebase credentials before using API routes that write
leads, generations, assistant cache, or Stripe payment confirmations:

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
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Validation

For the sector taxonomy, SEO routing, fallback coverage, and system-page foundations, run:

```bash
npm run audit:seo-foundations
```

This project also exposes:

- `npm run validate:data`
- `npm run audit:seo-foundations:ci`
- `npm run audit:system-pages`
- `npm run audit:internal-linking`
- `npm run build:stable`
- `npm test`
- `npm run test:e2e`

If `next build` ever flakes locally because of a Turbopack temp-file issue, use `npm run build:stable`.
The production `build` and `start` scripts both use the isolated `.next-build` directory.

## Tests

The project now has three complementary layers of automated checks:

- `npm test`: Vitest unit and API-route tests
- `npm run test:e2e`: Playwright browser scenarios against a local Next.js server
- `npm run validate:data`: editorial/data/runtime consistency checks

Recommended local validation before opening a PR:

```bash
npm run lint
npm test
npm run test:e2e
npm run validate:data
npm run build
```

Notes:

- Playwright writes artifacts to `/private/tmp/demaa-playwright` to avoid filling the repository workspace.
- The current browser scenarios cover member-space access and assistant-success payment flows.
- Most API routes are covered with mocked external services such as Stripe, Slack, Resend, Anthropic, and Firestore-facing persistence wrappers.

## Security Note

`npm audit --omit=dev` still reports a small residual set of moderate vulnerabilities through the optional `@google-cloud/storage` subtree pulled by `firebase-admin`.

Current status:

- `0` high severity vulnerabilities
- residual `moderate` findings only
- no direct use of `firebase-admin/storage` in the application code audited here

This residual risk should stay tracked as dependency debt unless a future upstream fix removes it cleanly.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
