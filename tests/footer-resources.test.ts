import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import config from "../next.config";

describe("footer resources access", () => {
  it("allows the resource landing page and keeps its entry in the footer", async () => {
    expect((await proxy(new NextRequest("https://demaa.fr/ressources", { headers: { host: "demaa.fr" } }))).status).toBe(200);
    expect(readFileSync("src/components/DemaaFooter.tsx", "utf8")).toContain('{ label: "Nos ressources", href: "/ressources" }');
    expect(readFileSync("src/app/(marketing)/ressources/page.tsx", "utf8")).toContain('href="/studio"');
  });

  it("serves the linked catalogs instead of redirecting them to the Studio", async () => {
    const redirects = await config.redirects!();
    for (const route of ["ressources", "solutions", "organiser", "modeles"]) {
      expect(existsSync(`src/app/(marketing)/${route}/page.tsx`)).toBe(true);
      expect(redirects.some(rule => [ `/${route}`, `/${route}/:path*` ].includes(rule.source))).toBe(false);
    }
  });
});
