import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PublicationArticleContent from "@/components/PublicationArticleContent";
import articles from "@/lib/learning-episodes-data.json";
import { publicationSlot, publicationRouteAllowed, publicationTitles } from "@/lib/publication-contract";
import { publicationEmail } from "@/lib/publication-email";
describe("Notion editorial import", () => {
  it("imports thirteen ready articles and leaves all project updates unpublished", () => {
    expect(articles).toHaveLength(13);
    expect(new Set(articles.map(a => `${a.project}-${a.number}`)).size).toBe(13);
    for (const project of ["jago", "dumaan", "tiimora", "demaa"]) {
      expect(articles.filter(a => a.project === project).map(a => a.number)).toEqual(project === "demaa" ? [0, 1, 2, 3] : [0, 1, 2]);
    }
    expect(articles.every(a => a.sourceStatus === "Prêt" && a.paragraphs.length > 10 && a.sourceUrl.startsWith("https://app.notion.com/p/"))).toBe(true);
    expect(articles.some(a => a.title.includes("Où suivre"))).toBe(false);
  });
  it("supports four Studio article slots", () => {
    expect(publicationTitles("demaa")).toHaveLength(4);
    for (const article of articles) {
      expect(publicationSlot(article.project, article.number).slug).toBe(article.slug);
      expect(publicationRouteAllowed(article.project, article.slug)).toBe(true);
    }
    expect(() => publicationSlot("demaa", 4)).toThrow();
    expect(publicationRouteAllowed("demaa", "strategie")).toBe(false);
  });
  it("renders GTM headings and emphasis while escaping authored HTML", () => {
    const html = renderToStaticMarkup(createElement(PublicationArticleContent, { text: 'Audience\n\n**Une promesse claire**\navec une suite\n\n<script>alert(1)</script>' }));
    expect(html).toContain("<h2"); expect(html).toContain("<strong>Une promesse claire</strong>"); expect(html).toContain("<br");
    expect(html).not.toContain("<script>"); expect(html).toContain("&lt;script&gt;");
  });
  it("keeps the same emphasis and headings in the newsletter without exposing raw HTML", () => {
    const a = articles.find(a => a.project === "demaa" && a.number === 1)!;
    const email = publicationEmail({ ...a, project: "demaa", text: a.paragraphs.join("\n\n") });
    expect(email.html).toContain("<h2"); expect(email.html).toContain("<strong>"); expect(email.html).not.toContain("**");
    expect(email.html).not.toContain("EP01"); expect(email.html).toContain("RESEND_UNSUBSCRIBE_URL");
  });
});
