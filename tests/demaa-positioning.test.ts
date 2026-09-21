import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { DEMAA_HOME_DESCRIPTION, DEMAA_HOME_TITLE } from "@/lib/demaa-positioning";

const readSource = (path: string) => readFile(
  new URL(`../${path}`, import.meta.url),
  "utf8",
);

describe("Demaa positioning", () => {
  it("uses the Academy, Solutions and Specialists promise across shared metadata", async () => {
    const [layout, homePage] = await Promise.all([
      readSource("src/app/layout.tsx"),
      readSource("src/app/(application)/page.tsx"),
    ]);

    expect(DEMAA_HOME_TITLE).toBe(
      "Demaa — Academy, solutions et spécialistes",
    );
    expect(DEMAA_HOME_DESCRIPTION).toBe(
      "Des cours, des solutions et des spécialistes pour organiser et piloter votre entreprise.",
    );
    expect(layout).toContain("title: DEMAA_HOME_TITLE");
    expect(layout).toContain("description: DEMAA_HOME_DESCRIPTION");
    expect(homePage).toContain('permanentRedirect("/academie")');
    expect(homePage).not.toContain("Un plan d’action concret pour votre entreprise");
  });
});
