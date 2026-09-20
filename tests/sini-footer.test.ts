import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

describe("sini public footer", () => {
  it("renders after the Reprendre marketplace at the application root", async () => {
    const home = await readSource("src/app/(application)/page.tsx");
    expect(home.indexOf("<RepriseMarketplaceClient")).toBeLessThan(home.indexOf("<SiniFooter />"));
  });

  it("covers the three public journeys without inherited demaa links", async () => {
    const footer = await readSource("src/components/SiniFooter.tsx");
    expect(footer).toContain('data-brand="sini"');
    expect(footer).toContain('{ label: "Reprendre", href: "/" }');
    expect(footer).toContain('{ label: "Vendre", href: "/transmettre" }');
    expect(footer).toContain('{ label: "Conseil", href: "/conseil" }');
    expect(footer).toContain('href="mailto:contact@sini.fr"');
    expect(footer).not.toMatch(/Demaa|DEMAA|demaa\.fr/);
  });

  it("uses only the sini footer for marketing pages, including legal pages", async () => {
    const layout = await readSource("src/app/(marketing)/layout.tsx");
    expect(layout).toContain("<SiniFooter />");
    expect(layout).not.toContain("<Footer />");
  });
});
