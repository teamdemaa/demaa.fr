import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("cookie consent first level", () => {
  it("stays compact, neutral and delayed only until the first paint", async () => {
    const source = await readFile(
      new URL("../src/components/CookieConsentManager.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("const BANNER_REVEAL_DELAY_MS = 500");
    expect(source).toContain("bannerReady && preferences === null");
    expect(source).toContain("sm:w-[min(32rem,calc(100vw-2.5rem))]");
    expect(source).toContain("Mesure d’audience et des campagnes publicitaires, avec votre accord.");
    expect(source).toContain("consentChoiceButtonClassName");
    expect(source).toContain("min-h-9");
    expect(source).toContain("px-2.5");
    expect(source).not.toContain("min-h-11");
    expect(source).toContain("grid grid-cols-2 gap-2");
    expect(source).toContain('href="/politique-de-cookies"');
    expect(source).not.toContain("Vous pouvez tout accepter, tout refuser");
    expect(source).not.toContain("demaa-primary-button");
  });

  it("starts every optional custom purpose disabled", async () => {
    const source = await readFile(
      new URL("../src/components/CookieConsentManager.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("const [analyticsChoice, setAnalyticsChoice] = useState(false)");
    expect(source).toContain("const [marketingChoice, setMarketingChoice] = useState(false)");
  });
});
