import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import french from "@/lib/learning-episodes-data.json";
import english from "@/lib/learning-episodes-en.json";
import { currentEnglishTranslations } from "@/lib/english-publications.server";
import { studioProxy } from "@/proxy";
import { STUDIO_LANGUAGE_ROUTES, studioLanguagePaths } from "@/lib/studio-language-routes";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { DEMAA_PRIORITY_STUDIO_PROJECTS } from "@/lib/english-studio-projects";
import EnglishArticleContent from "@/components/EnglishArticleContent";
import type { Publication } from "@/lib/publication-contract";
const published = french.filter(a => !(a.project === "demaa" && a.number === 2)).map(a => ({ ...a, text: a.paragraphs.join("\n\n") })) as Publication[];
describe("native English Studio", () => {
  it("opens only the new public English routes without enabling the old product", () => {
    const previous = process.env.DEMAA_ENGLISH_BETA_ENABLED;
    delete process.env.DEMAA_ENGLISH_BETA_ENABLED;
    try {
      for (const path of ["/en", ...STUDIO_LANGUAGE_ROUTES.map(([, en]) => en)]) {
        const response = studioProxy(new NextRequest("https://demaa.fr" + path));
        expect(response.status).toBe(200);
        expect(response.headers.get("content-language")).toBe("en");
        expect(response.headers.get("x-robots-tag")).toBeNull();
      }
      for (const path of ["/en/plans", "/en/insights/demaa/execution-airtable", "/en/insights/jago/update-1"]) {
        expect(studioProxy(new NextRequest("https://demaa.fr" + path)).status).toBe(404);
      }
    } finally { process.env.DEMAA_ENGLISH_BETA_ENABLED = previous; }
  });
  it("includes all 12 published translations without losing paragraphs or reversing venture order", () => {
    expect(currentEnglishTranslations(published)).toHaveLength(12);
    for (const a of english) {
      expect(a.paragraphs.length).toBe(french.find(f => f.project === a.project && f.number === a.number)!.paragraphs.length);
      expect(studioLanguagePaths(`/en/insights/${a.project}/${a.slug}`)?.fr).toBe(`/apprentissages/${a.project}/${a.sourceSlug}`);
    }
    expect(DEMAA_PRIORITY_STUDIO_PROJECTS.map(p => p.name)).toEqual(["Jago", "Tiimora", "Dumaan"]);
  });
  it("never publishes an English translation of an unpublished or changed source", () => {
    const source = published.find(a => a.project === "jago" && a.number === 1)!;
    expect(currentEnglishTranslations([])).toEqual([]);
    expect(currentEnglishTranslations([{ ...source, text: source.text + "\n\nChanged scope." }])).toEqual([]);
    expect(currentEnglishTranslations([{ ...source, description: "New business model." }])).toEqual([]);
    expect(currentEnglishTranslations([source])).toHaveLength(1);
    expect(currentEnglishTranslations(published).some(a => a.project === "demaa" && a.number === 2)).toBe(false);
  });
  it("uses reciprocal language links, an English canonical and English social metadata", () => {
    const en = buildPublicPageMetadata({ title: "Our ventures", description: "Our ventures", path: "/en/ventures" });
    expect(en.alternates).toEqual({ canonical: "/en/ventures", languages: { fr: "/projets", en: "/en/ventures" } });
    expect(en.openGraph).toMatchObject({ locale: "en_GB", url: "/en/ventures" });
    const fr = buildPublicPageMetadata({ title: "Projets", description: "Projets", path: "/projets" });
    expect(fr.alternates?.languages).toEqual(en.alternates?.languages);
    expect(new Set(STUDIO_LANGUAGE_ROUTES.map(([, en]) => en)).size).toBe(STUDIO_LANGUAGE_ROUTES.length);
  });
  it("renders the project-specific strategy, generic method and action plan after their introductions", () => {
    const html = (project: string, number: number) => {
      const a = english.find(a => a.project === project && a.number === number)!;
      return renderToStaticMarkup(createElement(EnglishArticleContent, { project, number, paragraphs: a.paragraphs }));
    };
    const dumaan = html("dumaan", 1);
    expect(dumaan).toContain("Families and busy working people first");
    expect(dumaan).toContain("restaurants and caterers");
    const jago = html("jago", 2);
    expect(jago.indexOf("Once we")).toBeLessThan(jago.indexOf('aria-label="Actions to test"'));
    expect(jago).toContain("Priced offer, supported order");
    const generic = html("demaa", 1);
    expect(generic).toContain("Who faces this problem?");
    expect(generic).toContain("What next step should we offer?");
    expect(generic).not.toContain("€199");
    expect(html("tiimora", 0)).toContain("tiimora-interface.webp");
  });
});
