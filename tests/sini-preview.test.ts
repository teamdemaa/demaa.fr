import { access, readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SiniPreviewPage, { generateMetadata } from "@/app/apercu-sini/page";

describe("SINI editorial preview", () => {
  it("keeps the former French editorial preview available as source content", async () => {
    const markup = renderToStaticMarkup(await SiniPreviewPage({ searchParams: Promise.resolve({ lang: "fr" }) }));

    expect(markup).toContain('lang="fr"');
    expect(markup).toContain("La suite d’une entreprise se construit ensemble.");
    expect(markup).toContain("Reprendre");
    expect(markup).toContain("Transmettre");
    expect(markup).toContain("Conseils");
    expect(markup).toContain('href="/a-reprendre"');
    expect(markup).toContain('href="/transmettre"');
    expect(markup).toContain('href="/accompagnement"');
    expect(markup).toContain('href="/apercu-sini?lang=en"');
    expect(markup).toContain('role="group"');
    expect(markup).not.toContain("TIIMORA");
    expect(markup).not.toContain("JAGOYA");
  });

  it("switches all editorial content to English while keeping live journeys unchanged", async () => {
    const markup = renderToStaticMarkup(await SiniPreviewPage({ searchParams: Promise.resolve({ lang: "en" }) }));

    expect(markup).toContain('lang="en"');
    expect(markup).toContain("The next chapter of a business is built together.");
    expect(markup).toContain("Acquire");
    expect(markup).toContain("Transfer");
    expect(markup).toContain("Advice");
    expect(markup).toContain('href="/apercu-sini?lang=fr"');
    expect(markup).toMatch(/<a aria-current="page"[^>]*href="\/apercu-sini\?lang=en"/);
    expect(markup).toContain("Coastal landscape at sunset");
    expect(markup).toContain("Existing guides currently open in French.");
  });

  it("stays noindex and outside the sitemap", async () => {
    const sitemap = await readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");
    const proxy = await readFile(new URL("../src/proxy.ts", import.meta.url), "utf8");

    const frMetadata = await generateMetadata({ searchParams: Promise.resolve({ lang: "fr" }) });
    const enMetadata = await generateMetadata({ searchParams: Promise.resolve({ lang: "en" }) });
    expect(frMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(enMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(enMetadata.title).toContain("editorial preview");
    expect(enMetadata.openGraph).toMatchObject({ locale: "en_GB" });
    expect(sitemap).not.toContain("/apercu-sini");
    expect(proxy).toContain('pathname === "/apercu-sini"');
    await Promise.all([
      access(new URL("../public/sini-preview/coast.webp", import.meta.url)),
      access(new URL("../public/sini-preview/architecture.webp", import.meta.url)),
    ]);
  });
});
