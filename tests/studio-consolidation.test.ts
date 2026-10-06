import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { studioProxy as proxy } from "@/proxy";
import { getPublishedCopyableModelRouteParams } from "@/lib/copyable-model-catalog";
import { ARCHIVED_STUDIO_PROJECTS } from "@/lib/demaa-studio-archive";
import { DEMAA_STUDIO_PROJECTS, DEMAA_PUBLISHED_STUDIO_PROJECTS, DEMAA_PRIORITY_STUDIO_PROJECTS, getDemaaStudioProject } from "@/lib/demaa-studio-projects";
import { DEMAA_DIRECTORY_NAVIGATION, DEMAA_PUBLIC_NAVIGATION, DEMAA_RESOURCE_NAVIGATION } from "@/lib/demaa-public-routes";

function request(path: string) {
  return new NextRequest(`https://demaa.fr${path}`, { headers: { host: "demaa.fr" } });
}

describe("Studio consolidation publication", () => {
  it("preserves every historical project and excludes unconfirmed archives from public lookup", () => {
    expect(new Set(DEMAA_STUDIO_PROJECTS.map(({ slug }) => slug)).size).toBe(DEMAA_STUDIO_PROJECTS.length);
    for (const project of ARCHIVED_STUDIO_PROJECTS) expect(DEMAA_STUDIO_PROJECTS.some(({ slug }) => slug === project.slug)).toBe(true);
    expect(getDemaaStudioProject("awamali")).toBeUndefined();
    expect(getDemaaStudioProject("unknown-project")).toBeUndefined();
    expect(getDemaaStudioProject("jagoya")?.name).toBe("Jago");
    expect(DEMAA_PRIORITY_STUDIO_PROJECTS.map(({ name }) => name)).toEqual(["Jago", "Tiimora", "Dumaan"]);
  });

  it("keeps three public universes and retires the accompaniment offer", () => {
    expect(DEMAA_PUBLIC_NAVIGATION.map(({ label, href }) => [label, href])).toEqual([
      ["Studio", "/studio"], ["Projets", "/projets"], ["Apprentissages", "/apprentissages"],
    ]);
    expect(DEMAA_RESOURCE_NAVIGATION.some(({ href }) => String(href) === "/accompagnement")).toBe(false);
    expect(readFileSync("src/archived-resource-routes/(marketing)/accompagnement/page.tsx", "utf8")).toContain('permanentRedirect("/tutoriels")');
  });

  it("provides an existing local image or logo for each published project that specifies one", () => {
    for (const project of DEMAA_PUBLISHED_STUDIO_PROJECTS) {
      const asset = project.image ?? project.logo;
      if (asset) expect(existsSync(resolve("public", asset.slice(1))), `${project.slug}: ${asset}`).toBe(true);
    }
    expect(existsSync(resolve("public/images/studio/cover.webp"))).toBe(true);
  });

  it("marks archived directory requests outside search indexes before configuration redirects", () => {
    for (const { href } of DEMAA_DIRECTORY_NAVIGATION) {
      for (const path of [href, `${href}/example-detail`]) {
        const response = proxy(request(path));
        expect(response.status, path).toBe(200);
        expect(response.headers.get("x-robots-tag"), path).toBe("noindex, follow");
      }
    }
    for (const path of ["/modeles", ...getPublishedCopyableModelRouteParams().map(({ slug }) => `/modeles/${slug}`)]) {
      const response = proxy(request(path));
      expect(response.status, path).toBe(200);
      expect(response.headers.get("x-robots-tag"), path).toBeNull();
    }
    expect(proxy(request("/modeles/unknown-model")).status).toBe(404);
    expect(proxy(request("/annuaire-newsletters")).headers.get("x-robots-tag")).toBe("noindex, follow");
    expect(proxy(request("/annuaire-outils-retired")).headers.get("x-robots-tag")).toBe("noindex, follow");
  });

  it("keeps explicit application entry points separate from the public Studio redirect", () => {
    expect(proxy(request("/?intent=structure-problem")).status).toBe(200);
    expect(proxy(request("/?view=plan")).status).toBe(200);
    const response = proxy(request("/?utm_source=canva"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("https://demaa.fr/studio?utm_source=canva");
  });
});
