import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("standalone system processes close control", () => {
  it("returns to the matching public solution while keeping the modal close separate", async () => {
    const [page, content] = await Promise.all([
      readFile(new URL("../src/app/(marketing)/systemes/[slug]/processus/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/SystemProcessesContent.tsx", import.meta.url), "utf8"),
    ]);

    expect(page).toContain('closeHref={`/solutions/${data.system.slug}`}');
    expect(content).toContain("Fermer les processus et revenir à");
    expect(content).toContain("<X");
    expect(content).toContain("print:hidden");
  });
});
