import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getNavbarAction } from "@/components/Navbar";

describe("contextual navbar navigation", () => {
  it("links system discovery pages to the Academy", () => {
    expect(getNavbarAction("/")).toBe("academy");
    expect(getNavbarAction("/kits-operationnels")).toBe("academy");
    expect(getNavbarAction("/kit-operationnel/batiment", true)).toBe(
      "academy",
    );
  });

  it("links Academy pages back to the system search", () => {
    expect(getNavbarAction("/academie")).toBe("system-search");
    expect(
      getNavbarAction("/academie/difference-chiffre-affaires-benefice"),
    ).toBe("system-search");
  });

  it("preserves the existing rules for other routes", () => {
    expect(getNavbarAction("/annuaire-services")).toBe("systems");
    expect(getNavbarAction("/annuaire-services/conseil")).toBe("systems");
    expect(getNavbarAction("/annuaire-services", true)).toBeNull();
    expect(getNavbarAction("/annuaire-outils")).toBeNull();
  });

  it("keeps the Academy action out of the system search hero", async () => {
    const source = await readFile(
      new URL("../src/components/SystemSearchHero.tsx", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain("Découvrir l’Académie");
    expect(source).not.toContain("BookOpen");
    expect(source).not.toContain("ArrowRight");
  });
  it("uses the shared secondary pill and the book icon without an arrow", async () => {
    const source = await readFile(
      new URL("../src/components/Navbar.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("demaa-secondary-button");
    expect(source).toContain("BookOpen");
    expect(source).not.toContain("ArrowRight");
    expect(source).not.toContain(
      "demaa-primary-button min-h-10 px-4 text-xs",
    );
  });
});
