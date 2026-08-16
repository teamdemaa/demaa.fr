import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

import nextConfig from "../next.config";

const root = path.resolve(import.meta.dirname, "..");

async function collectSourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(absolutePath);
      return /\.(?:ts|tsx)$/.test(entry.name) ? [absolutePath] : [];
    }),
  );
  return files.flat();
}

describe("canonical system detail routes", () => {
  it("serves system pages from the public Système métier namespace", async () => {
    await expect(access(path.join(root, "src/app/(marketing)/systemes/[slug]/page.tsx"))).resolves.toBeUndefined();
    await expect(
      access(path.join(root, "src/app/(marketing)/systemes/[slug]/recapitulatif/page.tsx")),
    ).resolves.toBeUndefined();
    await expect(
      access(path.join(root, "src/app/(marketing)/systemes/[slug]/processus/page.tsx")),
    ).resolves.toBeUndefined();
    await expect(access(path.join(root, "src/app/kit-operationnel/[slug]/page.tsx"))).rejects.toThrow();
  });

  it("redirects every historical detail namespace permanently", async () => {
    const redirects = await nextConfig.redirects?.();

    for (const source of [
      "/kit-operationnel/:slug",
      "/systemes-operationnels/:slug",
      "/kit-systeme/:slug",
    ]) {
      expect(redirects).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            source,
            destination: "/systemes/:slug",
            permanent: true,
          }),
        ]),
      );
    }
  });

  it("emits only canonical system links from active application source", async () => {
    const files = await collectSourceFiles(path.join(root, "src"));
    const violations: string[] = [];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      if (/\/kit-operationnel\/|\/systemes-operationnels\/|\/kit-systeme\/|tab=outils/.test(source)) {
        violations.push(path.relative(root, file));
      }
    }

    expect(violations).toEqual([]);
  });

  it("uses the canonical namespace in metadata and sitemap builders", async () => {
    const [detailSource, sitemapSource] = await Promise.all([
      readFile(path.join(root, "src/lib/system-detail-page.ts"), "utf8"),
      readFile(path.join(root, "src/app/sitemap.ts"), "utf8"),
    ]);

    expect(detailSource).toContain('const url = `/systemes/${data.system.slug}`');
    expect(detailSource).toContain('`${origin}/systemes/${data.system.slug}`');
    expect(sitemapSource).toContain('`${base}/systemes/${enterprise.slug}`');
    expect(sitemapSource).not.toContain('`${base}/kit-operationnel/${enterprise.slug}`');
  });
});
