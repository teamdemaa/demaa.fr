import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system UX contract", () => {
  it("keeps the system overview and copy request in one modal", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const modalSource = await readSource(
      "src/components/OperationalSystemCopyRequestModal.tsx",
    );

    expect(detailSource.match(/Voir le système/g)).toHaveLength(1);
    expect(detailSource).not.toContain("Recevoir ma copie modifiable");
    expect(modalSource).toContain('"overview" | "form" | "success"');
    expect(modalSource).toContain("Voir la démonstration");
    expect(modalSource).toContain("Recevoir ma copie modifiable");
    expect(modalSource).toContain("Gratuit · Envoyé par e-mail");
    expect(modalSource).toContain('fetch("/api/systeme-kit/request"');
    expect(modalSource).not.toMatch(/Stripe|checkout|\/copy/);
  });

  it("reuses the canonical Fillout booking behavior for the shared diagnostic", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const diagnosticSource = await readSource(
      "src/components/SystemDiagnosticCta.tsx",
    );

    expect(detailSource.match(/<SystemDiagnosticCta\b/g)).toHaveLength(1);
    expect(diagnosticSource).toContain(
      'import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton"',
    );
    expect(diagnosticSource).toContain("Diagnostic offert");
    expect(diagnosticSource).toContain(
      "Faites le point sur vos priorités avec un spécialiste Demaa.",
    );
    expect(diagnosticSource).toContain('label="Demander mon diagnostic"');
    expect(diagnosticSource).not.toMatch(/filloutId|fillout\.com|https?:\/\//);
  });
});
