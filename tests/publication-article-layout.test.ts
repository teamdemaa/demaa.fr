import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PublicationArticleContent from "@/components/PublicationArticleContent";
import articles from "@/lib/learning-episodes-data.json";

describe("Publication illustrations and reading order", () => {
  it("places the general plan after its heading and introduction", () => {
    const article = articles.find(a => a.project === "demaa" && a.number === 1)!;
    const html = renderToStaticMarkup(createElement(PublicationArticleContent, { text: article.paragraphs.join("\n\n"), framework: { project: "demaa", kind: "strategy" } }));
    const heading = html.indexOf("2. Le plan d’action");
    const intro = html.indexOf("Le plan d’action précise");
    const plan = html.indexOf("Le plan d’action", intro + 100);
    expect(heading).toBeGreaterThan(-1);
    expect(intro).toBeGreaterThan(heading);
    expect(plan).toBeGreaterThan(intro);
  });
  it("illustrates each genesis in context and preserves every paragraph", () => {
    for (const project of ["jago", "dumaan", "tiimora"]) {
      const article = articles.find(a => a.project === project && a.number === 0)!;
      const html = renderToStaticMarkup(createElement(PublicationArticleContent, { text: article.paragraphs.join("\n\n"), genesisProject: project }));
      expect((html.match(/<figure/g) ?? []).length).toBe(project === "tiimora" ? 2 : 1);
      for (const paragraph of article.paragraphs) expect(html).toContain(paragraph);
      if (project === "tiimora") { expect(html).toContain("tiimora-admin-dispersee"); expect(html).not.toContain("tiimora-interface"); }
    }
  });
  it("keeps family priority without postponing professional tests", () => {
    for (const article of articles.filter(a => a.project === "dumaan")) {
      const text = article.paragraphs.join(" ");
      expect(text).toContain("restaurants et de traiteurs");
      expect(text).not.toContain("possible pour plus tard");
      expect(text).not.toContain("pourra venir ensuite");
    }
  });
});
