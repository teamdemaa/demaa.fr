import { describe, expect, it } from "vitest";
import {
  buildLocalizedConnexionHref,
  buildLocalizedGoogleAuthHref,
} from "@/lib/localized-auth-path";

describe("localized authentication paths", () => {
  it("keeps French authentication on the canonical unprefixed routes", () => {
    expect(buildLocalizedConnexionHref({
      localeCode: "fr",
      returnTo: "/plans/latest",
    })).toBe("/connexion?returnTo=%2Fplans%2Flatest");
    expect(buildLocalizedGoogleAuthHref({
      localeCode: "fr",
      returnTo: "/plans/latest",
    })).toBe("/auth/google?locale=fr&returnTo=%2Fplans%2Flatest");
  });

  it("keeps the English callback and return destination under /en", () => {
    expect(buildLocalizedConnexionHref({
      localeCode: "en",
      message: "Sign in to open this plan.",
      returnTo: "/en/plans/plan-1?view=academy",
    })).toBe(
      "/en/connexion?returnTo=%2Fen%2Fplans%2Fplan-1%3Fview%3Dacademy&message=Sign+in+to+open+this+plan.",
    );
    expect(buildLocalizedGoogleAuthHref({
      localeCode: "en",
      returnTo: "/en/plans/plan-1?view=academy",
    })).toBe(
      "/en/auth/google?locale=en&returnTo=%2Fen%2Fplans%2Fplan-1%3Fview%3Dacademy",
    );
  });
});
