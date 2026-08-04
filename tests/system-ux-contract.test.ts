import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("system UX contract", () => {
  it("keeps the Levier preview, e-mail form and confirmation in one modal", async () => {
    const detailSource = await readSource(
      "src/components/SystemDetailContent.tsx",
    );
    const modalSource = await readSource(
      "src/components/OperationalSystemCopyRequestModal.tsx",
    );
    const historicalModalSource = await readSource(
      "src/components/HistoricalOperationalSystemCopyRequestModal.tsx",
    );
    const pageSource = await readSource(
      "src/app/kit-operationnel/[slug]/page.tsx",
    );

    expect(detailSource.match(/Voir le système/g)).toHaveLength(1);
    expect(detailSource).not.toContain("Recevoir ma copie modifiable");
    expect(detailSource).toContain("deliveryAvailable && !hasLevierSolution");
    expect(detailSource).toContain("onOpenSystemDelivery");
    expect(detailSource).toContain("isSystemModalOpen && hasLevierSolution");
    expect(detailSource).toContain("isSystemModalOpen && !hasLevierSolution");
    expect(detailSource).toContain("HistoricalOperationalSystemCopyRequestModal");
    expect(modalSource).not.toMatch(/"overview"\s*\|\s*"form"/);
    expect(modalSource).toContain("Recevoir Levier");
    expect(modalSource).toContain("Levier est dans votre boîte mail.");
    expect(modalSource).toContain(
      "Vous y trouverez le lien pour créer votre copie personnelle.",
    );
    expect(modalSource).toContain(
      "Pensez à vérifier vos courriers indésirables.",
    );
    expect(modalSource).not.toContain("Votre demande de Levier pour");
    expect(modalSource).toContain("Tableau de pilotage opérationnel");
    expect(modalSource).toContain('name="email"');
    expect(modalSource).not.toContain('name="firstName"');
    expect(modalSource).not.toContain("Prénom");
    expect(modalSource).not.toContain("openForm");
    expect(modalSource).not.toMatch(/Voir la démonstration|Google Drive/);
    expect(modalSource).not.toContain(
      "Des process concrets, des outils recommandés",
    );
    expect(modalSource).toContain('fetch("/api/systeme-kit/request"');
    expect(modalSource).not.toMatch(/Stripe|checkout|\/copy|\.xlsx/);
    expect(historicalModalSource).toContain('name="firstName"');
    expect(historicalModalSource).toContain("Prénom");
    expect(historicalModalSource).toContain("Voir la démonstration");
    expect(historicalModalSource).toContain("Recevoir ma copie modifiable");
    expect(historicalModalSource).toContain('firstName: normalizedFirstName');
    expect(historicalModalSource).toContain('const flowKey = `system-copy:${systemSlug}`');
    expect(pageSource).toContain("getOperationalSystemDemoUrl(data.system.slug)");
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
      "Faites le point en 30 minutes avec un spécialiste Demaa pour identifier",
    );
    expect(processCallSource).toContain("les priorités qui rendront");
    expect(processCallSource).toContain(
      '<strong className="font-semibold text-brand-blue">',
    );
    expect(
      processCallSource.match(
        /votre entreprise moins dépendante de vous au quotidien/g,
      ),
    ).toHaveLength(1);
    expect(processCallSource).toContain(
      'label="Réserver mon échange offert"',
    );
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
