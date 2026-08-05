import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getNavbarActiveSection } from "@/components/Navbar";

describe("permanent systems, Academy and Sur mesure navbar", () => {
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

  it("marks the canonical Sur mesure page and its former URL as active", () => {
    expect(getNavbarActiveSection("/sur-mesure")).toBe("sur-mesure");
    expect(getNavbarActiveSection("/accompagnement")).toBe("sur-mesure");
  });

  it("does not mark a section active on neutral routes", () => {
    expect(getNavbarActiveSection("/annuaire-services")).toBeNull();
    expect(getNavbarActiveSection("/annuaire-outils")).toBeNull();
  });

  it("always renders the three tabs without legacy contextual actions", async () => {
    const source = await readFile(
      new URL("../src/components/Navbar.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("Workflow");
    expect(source).toContain("BookOpen");
    expect(source).toContain("PencilRuler");
    expect(source).toContain("<span>Systèmes</span>");
    expect(source).toContain("<span>Academy</span>");
    expect(source).toContain("<span>Sur mesure</span>");
    expect(source).toContain('href="/sur-mesure"');
    expect(source).toContain('aria-current={activeSection === "systems"');
    expect(source).toContain('aria-current={activeSection === "academy"');
    expect(source).toContain('aria-current={activeSection === "sur-mesure"');
    expect(source).toContain("data-navbar-section-selector");
    expect(source).toContain("max-w-[55.2rem]");
    expect(source).toContain("grid-cols-3");
    expect(source).toContain("bg-dema-sage text-dema-forest");
    expect(source).toContain("border border-dema-line bg-dema-paper p-1");
    expect(source).not.toContain("md:absolute md:left-1/2");
    expect(source).not.toContain("Voir les services");
    expect(source).not.toContain("Trouver mon système");
    expect(source).not.toContain("Découvrir l’Académie");
  });

  it("keeps the permanent selector on system detail and loading states", async () => {
    const [pageSource, loadingSource] = await Promise.all([
      readFile(new URL("../src/app/kit-operationnel/[slug]/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/kit-operationnel/[slug]/loading.tsx", import.meta.url), "utf8"),
    ]);

    expect(pageSource).toContain("<Navbar minimal />");
    expect(loadingSource).toContain("<Navbar minimal />");
    expect(pageSource.indexOf("<Navbar minimal />")).toBeLessThan(pageSource.indexOf("<main"));
    expect(loadingSource.indexOf("<Navbar minimal />")).toBeLessThan(loadingSource.indexOf("<main"));
  });
});
