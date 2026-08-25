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
      "Demaa : organisez votre entreprise avec des systèmes simples",
    );
    expect(DEMAA_HOME_DESCRIPTION).toBe(
      "On aide les TPE à mieux s’organiser grâce à des applications métier adaptées.",
    );
    expect(layout).toContain("title: DEMAA_HOME_TITLE");
    expect(layout).toContain("description: DEMAA_HOME_DESCRIPTION");
    expect(homePage).toContain("title: DEMAA_HOME_TITLE");
    expect(homePage).toContain("description: DEMAA_HOME_DESCRIPTION");
    expect(homePage).not.toContain("Un plan d’action concret pour votre entreprise");
  });
});
