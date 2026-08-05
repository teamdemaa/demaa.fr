import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

async function readSource(relativePath: string) {
  return readFile(path.join(root, relativePath), "utf8");
}

describe("solution proposal UI contract", () => {
  it("exposes one neutral public entry without promising a partnership", async () => {
    const [footer, page, sitemap] = await Promise.all([
      readSource("src/components/Footer.tsx"),
      readSource("src/app/partenaires/page.tsx"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(footer).toContain('{ label: "Proposer votre solution", href: "/partenaires" }');
    expect(page).toContain("Proposer votre solution");
    expect(page).not.toMatch(/partenaire Demaa|devenir partenaire|partenariat garanti/i);
    expect(sitemap).toContain("`${base}/partenaires`");
  });

  it("keeps consent, limits and publication review explicit", async () => {
    const [form, contract] = await Promise.all([
      readSource("src/components/PartnerSubmissionForm.tsx"),
      readSource("src/lib/partner-submission-contract.ts"),
    ]);

    expect(contract).toContain("MAX_PARTNER_SELECTED_SYSTEMS = 12");
    expect(form).toContain("Chaque proposition est étudiée manuellement");
    expect(form).toContain("L’envoi ne garantit pas le");
    expect(form).toContain("PARTNER_SUBMISSION_CONSENT_TEXT");
    expect(form).toContain('href="/politique-de-confidentialite"');
    expect(form).toContain('role="alert"');
    expect(form).toContain('role="status"');
  });
});
