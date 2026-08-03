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
    expect(detailSource).toContain("deliveryAvailable && !hasLevierSolution");
    expect(detailSource).toContain("onOpenSystemDelivery");
    expect(modalSource).toContain('"overview" | "form" | "success"');
    expect(modalSource).toContain("Recevoir Levier");
    expect(modalSource).toContain("Levier vous a été envoyé par e-mail");
    expect(modalSource).toContain("Gratuit · Envoyé par e-mail");
    expect(modalSource).toContain("Tableau de pilotage opérationnel");
    expect(modalSource).not.toMatch(/Voir la démonstration|Google Drive/);
    expect(modalSource).not.toContain(
      "Des process concrets, des outils recommandés",
    );
    expect(modalSource).toContain('fetch("/api/systeme-kit/request"');
    expect(modalSource).not.toMatch(/Stripe|checkout|\/copy/);
  });

  it("renders the organisation exchange once after the active panel", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const processCallSource = await readSource(
      "src/components/SystemProcessCallCta.tsx",
    );
    const solutionsSource = await readSource(
      "src/components/SystemSolutionsTab.tsx",
    );
    const panelEnd = detailSource.indexOf("</section>");
    const processCall = detailSource.indexOf("<SystemProcessCallCta");
    const academyStart = detailSource.indexOf("academyVideos.length");

    expect(panelEnd).toBeGreaterThan(-1);
    expect(processCall).toBeGreaterThan(panelEnd);
    expect(processCall).toBeLessThan(academyStart);
    expect(detailSource.match(/<SystemProcessCallCta\b/g)).toHaveLength(1);
    expect(processCallSource).toContain(
      'import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton"',
    );
    expect(processCallSource).toContain(
      "Besoin d’y voir plus clair dans votre organisation ?",
    );
    expect(processCallSource).toContain(
      "identifier ce qui dépend encore de vous et la priorité à structurer.",
    );
    expect(processCallSource).toContain('label="Réserver mon échange"');
    expect(detailSource).toContain(
      "source={getSystemDetailBookingSource(activeTab)}",
    );
    expect(processCallSource).toContain("source={source}");
    expect(processCallSource).toContain("sourceIsAuthoritative");
    expect(processCallSource).toContain("systemSlug={systemSlug}");
    expect(processCallSource).not.toMatch(
      /Diagnostic offert|Demander mon diagnostic|filloutId|fillout\.com|https?:\/\//,
    );
    expect(solutionsSource).not.toMatch(
      /SystemProcessCallCta|Diagnostic offert|appel gratuit/,
    );
  });
});
