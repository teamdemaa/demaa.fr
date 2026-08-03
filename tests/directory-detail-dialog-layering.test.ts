import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

function readExplicitZIndex(source: string) {
  const match = source.match(/z-\[(\d+)\]/);
  if (!match) throw new Error("Explicit z-index not found");
  return Number(match[1]);
}

describe("directory detail dialog layering", () => {
  it("keeps resource dialogs above the unresolved cookie banner", async () => {
    const dialogSource = await readSource("src/components/DirectoryDetailDialogShell.tsx");
    const cookieSource = await readSource("src/components/CookieConsentManager.tsx");

    expect(readExplicitZIndex(dialogSource)).toBeGreaterThan(
      readExplicitZIndex(cookieSource),
    );
    expect(dialogSource).toContain("useAccessibleDialog({ onClose })");
    expect(dialogSource).toContain('role="dialog"');
    expect(dialogSource).toContain('aria-modal="true"');
    expect(cookieSource).toContain("Tout refuser");
    expect(cookieSource).toContain("Tout accepter");
  });
});
