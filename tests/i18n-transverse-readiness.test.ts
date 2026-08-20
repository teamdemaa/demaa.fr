import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import EnglishPrivacyPage, {
  metadata as englishPrivacyMetadata,
} from "@/app/(english)/en/privacy/page";
import { metadata as englishLayoutMetadata } from "@/app/(english)/en/layout";
import { getPwaInstallUiCopy } from "@/lib/pwa-install-ui-copy";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("English transverse readiness", () => {
  it("localizes the install prompt and exposes the English manifest", async () => {
    expect(getPwaInstallUiCopy("en")).toEqual({
      install: "Install Demaa",
      later: "Later",
      iosHelp: "In Safari, tap Share, then “Add to Home Screen”.",
    });
    expect(englishLayoutMetadata.manifest).toBe("/en/manifest.webmanifest");

    const resultSource = await readSource("src/components/ActionPlanResult.tsx");
    expect(resultSource).toContain("<PwaInstallPrompt localeCode={localeCode} />");
    expect(resultSource).not.toContain('localeCode === "fr" ? <PwaInstallPrompt');
  });

  it("publishes a complete noindex English privacy projection when the beta is enabled", () => {
    const previous = process.env.DEMAA_ENGLISH_BETA_ENABLED;
    try {
      process.env.DEMAA_ENGLISH_BETA_ENABLED = "true";
      const markup = renderToStaticMarkup(createElement(EnglishPrivacyPage));

      expect(markup).toContain("This page explains what data Demaa collects");
      expect(markup).toContain("Data controller");
      expect(markup).toContain("Key figures and Strategy");
      expect(markup).toContain("Vercel AI Gateway");
      expect(markup).toContain("Your rights");
      expect(markup).not.toContain("Cadre légal Demaa");
      expect(englishPrivacyMetadata).toMatchObject({
        alternates: {
          canonical: "/en/privacy",
          languages: {
            en: "/en/privacy",
            fr: "/politique-de-confidentialite",
          },
        },
        robots: { follow: false, index: false },
      });
    } finally {
      if (previous === undefined) delete process.env.DEMAA_ENGLISH_BETA_ENABLED;
      else process.env.DEMAA_ENGLISH_BETA_ENABLED = previous;
    }
  });

  it("keeps the shared Service request form on the localized privacy route", async () => {
    const [formSource, copySource] = await Promise.all([
      readSource("src/components/ServiceCallbackForm.tsx"),
      readSource("src/lib/service-callback-ui-copy.ts"),
    ]);

    expect(formSource).toContain('localeCode === "en" ? "/en/privacy" : "/politique-de-confidentialite"');
    expect(copySource).toContain('privacy: "Privacy policy"');
    expect(copySource).not.toContain("Privacy policy (in French)");
  });

  it("provides localized English error and not-found boundaries", async () => {
    const [errorSource, notFoundSource] = await Promise.all([
      readSource("src/app/(english)/en/error.tsx"),
      readSource("src/app/(english)/en/not-found.tsx"),
    ]);

    expect(errorSource).toContain("Something went wrong");
    expect(errorSource).toContain("Try again");
    expect(notFoundSource).toContain("Page not found");
    expect(notFoundSource).toContain('localeCode="en"');
    expect(errorSource).not.toContain("Réessayer");
    expect(notFoundSource).not.toContain("Page introuvable");
  });

  it("requires every international PR to declare its scope and parity proof", async () => {
    const template = await readSource(".github/pull_request_template.md");

    expect(template).toContain("`shared` | `locale` | `market` | `country`");
    expect(template).toContain("Tests de parité");
    expect(template).toContain("Le navigateur ne fait pas autorité");
    expect(template).toContain("GO explicite distinct");
  });
});
