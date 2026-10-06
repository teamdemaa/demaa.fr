# Native English Studio — 6 October 2026

## Public routes

- /en permanently redirects to /en/studio.
- /en/studio, /en/ventures, /en/team, /en/studio/build-with-us.
- /en/insights, with Jago, Tiimora and Dumaan episode indexes.
- Twelve translated articles: three episodes per venture, plus the Studio introduction, Why DEMAA and the go-to-market system.
- French and English counterparts have reciprocal language links and their own canonicals. English pages are indexable and included in the sitemap.
- The existing English product flag still controls /en/plans. Publishing the Studio does not enable that product.

## Editorial choices

British English; venture studio, Ventures, Insights. APOP becomes Audience, Positioning, Offer, Promotion. Audience first is preserved. The action stages are Attract, Convert and Retain, with Nurturing and Referrals throughout.

The French content remains authoritative. Paragraph structure, examples, prices and hypotheses are retained. Jago manages sourcing, the supplier relationship and order follow-up. Dumaan prioritises families while testing some preparations with restaurants and caterers. Tiimora’s test price remains €199/month; setup fees remain unvalidated.

The same source images are used. The Tiimora UI illustration is in French, explicitly identified in its English caption. Legal documents remain in French, identified in the footer. Newsletter registration uses the existing endpoint and explicitly states that updates are currently sent in French. No broadcasts are sent by this release.

## Maintaining translations

English articles live in src/lib/learning-episodes-en.json. Each records the reviewed French publication version (SHA-256 of title, description and text, using publicationVersion).

An unpublished or changed French article is excluded from English publication until its translation is reviewed and sourceVersion updated. It must not fall back silently to French or serve a translation of an older business model. The English index and sitemap include only current published translations. EN links use the known route mapping; an unavailable translation responds 404.

The Airtable execution article stays hidden in both languages. Unpublished update episodes remain “Coming soon”.

## Validation

- All twelve translations were compared with the French texts currently in production; exact title, description and paragraph content matched the reviewed source versions.
- Production build, TypeScript and targeted lint passed.
- Full test run: 328 suites / 1,790 tests passed, with a worker startup timeout affecting system-process-routines-decoupling. Rerunning that suite and native-english-studio passed all ten tests (five in each suite).
- Local SEO audit: 45 sitemap URLs passed canonical, H1, social metadata and redirect checks.
- Browser verification: desktop Studio and mobile Insights, Jago strategy, English navigation, reciprocal language links and document language.
