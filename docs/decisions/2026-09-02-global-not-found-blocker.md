# Global 404 and parallel-route compatibility

## Decision

Do not enable Next.js 16 `experimental.globalNotFound` while the root layout uses the `@modal/[...catchAll]` parallel route.

## Verification

The experiment was enabled locally with a complete `src/app/global-not-found.tsx` document. The production build succeeded, but an unknown URL still returned HTTP 200 with `noindex`.

The parallel-slot catch-all is emitted by Next.js as `ƒ /[...catchAll]`. It matches unknown paths before `global-not-found` can handle them. Removing it is not considered safe in this audit because it currently clears intercepted modals during client navigation.

## Follow-up

Treat a true HTTP 404 as a separate routing migration. It must include regression coverage for direct navigation, intercepted modal opening, modal closure, browser back/forward navigation, and unknown routes before the catch-all can be removed or replaced.
