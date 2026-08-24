import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { DEMAA_HOME_DESCRIPTION, DEMAA_HOME_TITLE } from "@/lib/demaa-positioning";

const readSource = (path: string) => readFile(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

describe("Demaa positioning", () => {
  it("uses one canonical systems promise across home metadata", async () => {
    const [layout, homePage] = await Promise.all([
      readSource("src/app/layout.tsx"),
      readSource("src/app/(application)/page.tsx"),
    ]);

    expect(DEMAA_HOME_TITLE).toBe(
      "Demaa : gagnez du temps grâce à des systèmes adaptés",
    );
    expect(DEMAA_HOME_DESCRIPTION).toBe(
      "Demaa aide les dirigeants à gagner du temps grâce à la mise en place de systèmes simples, d’automatisations et d’usages IA adaptés à leur entreprise.",
    );
    expect(layout).toContain("title: DEMAA_HOME_TITLE");
    expect(layout).toContain("description: DEMAA_HOME_DESCRIPTION");
    expect(homePage).toContain("title: DEMAA_HOME_TITLE");
    expect(homePage).toContain("description: DEMAA_HOME_DESCRIPTION");
    expect(homePage).not.toContain("Un plan d’action concret pour votre entreprise");
  });
});
