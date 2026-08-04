import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getNavbarActiveSection } from "@/components/Navbar";

describe("permanent systems and Academy navbar", () => {
  it("marks system discovery pages as active", () => {
    expect(getNavbarActiveSection("/")).toBe("systems");
    expect(getNavbarActiveSection("/kits-operationnels")).toBe("systems");
    expect(getNavbarActiveSection("/kit-operationnel/batiment")).toBe(
      "systems",
    );
  });

  it("marks Academy and legacy course pages as active", () => {
    expect(getNavbarActiveSection("/academie")).toBe("academy");
    expect(
      getNavbarActiveSection(
        "/academie/difference-chiffre-affaires-benefice",
      ),
    ).toBe("academy");
    expect(getNavbarActiveSection("/cours")).toBe("academy");
    expect(getNavbarActiveSection("/cours/gestion-tresorerie")).toBe(
      "academy",
    );
  });

  it("does not mark a section active on neutral routes", () => {
    expect(getNavbarActiveSection("/annuaire-services")).toBeNull();
    expect(getNavbarActiveSection("/annuaire-outils")).toBeNull();
  });

  it("always renders the two tabs without legacy contextual actions", async () => {
    const source = await readFile(
      new URL("../src/components/Navbar.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("Workflow");
    expect(source).toContain("BookOpen");
    expect(source).toContain("<span>Systèmes</span>");
    expect(source).toContain("<span>Academy</span>");
    expect(source).toContain('aria-current={activeSection === "systems"');
    expect(source).toContain('aria-current={activeSection === "academy"');
    expect(source).not.toContain("Voir les services");
    expect(source).not.toContain("Trouver mon système");
    expect(source).not.toContain("Découvrir l’Académie");
  });
});
