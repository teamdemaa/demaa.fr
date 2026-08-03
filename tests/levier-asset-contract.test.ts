import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  LEVIER_ASSET_REVISION,
  LEVIER_ASSET_SHA256,
  LEVIER_ATTACHMENT_FILENAME,
  readLevierAttachment,
} from "@/lib/levier-asset.server";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Levier private attachment contract", () => {
  it("reads only the independently reviewed canonical workbook", async () => {
    expect(LEVIER_ASSET_REVISION).toBe("levier-v1-2026-08-03");
    expect(LEVIER_ASSET_SHA256).toBe(
      "424ea3b1b342898650fa14f776cc10d9590157abe15597fd18d271f2d306f22e",
    );
    expect(LEVIER_ATTACHMENT_FILENAME).toBe("Levier.xlsx");
    const attachment = await readLevierAttachment();
    expect(attachment?.subarray(0, 2)).toEqual(Buffer.from([0x50, 0x4b]));
    await expect(readdir(new URL("../private-assets/levier/", import.meta.url)))
      .resolves.toEqual(["Levier.xlsx"]);
  });

  it("keeps the asset server-only and bundles it only into delivery routes", async () => {
    const assetSource = await readSource("src/lib/levier-asset.server.ts");
    const configSource = await readSource("next.config.ts");
    const cronSource = await readSource(
      "src/app/api/cron/system-kit-followups/route.ts",
    );
    const leadNotificationsSource = await readSource(
      "src/lib/lead-notifications.ts",
    );
    const vercelIgnoreSource = await readSource(".vercelignore");

    expect(assetSource.startsWith('import "server-only";')).toBe(true);
    expect(assetSource).toContain('"private-assets"');
    expect(assetSource).not.toMatch(/public|https?:\/\//);
    expect(assetSource).toContain("createHash");
    expect(configSource).toContain("'/api/systeme-kit/request'");
    expect(configSource).toContain("'/api/cron/system-kit-followups'");
    expect(configSource.match(/\.\/private-assets\/levier\/Levier\.xlsx/g)).toHaveLength(2);
    expect(leadNotificationsSource).not.toContain(
      'from "@/lib/operational-system-delivery-email.server"',
    );
    expect(cronSource).toContain(
      'from "@/lib/operational-system-delivery-email.server"',
    );
    expect(cronSource).toContain(
      "retryFailedLeadDeliveries(\n    30,\n    sendOperationalSystemDeliveryEmail,",
    );
    expect(vercelIgnoreSource).toContain("!private-assets/levier/Levier.xlsx");
  });

  it("separates the public demonstration preview from the blank attachment", async () => {
    const previewSource = await readSource("src/lib/system-kit-previews.ts");
    const modalSource = await readSource(
      "src/components/OperationalSystemCopyRequestModal.tsx",
    );

    expect(previewSource).toContain(
      'src: "/images/levier/levier-tableau-de-bord-preview.webp"',
    );
    expect(previewSource).toContain("width: 1400");
    expect(previewSource).toContain("height: 933");
    expect(previewSource).not.toContain(".xlsx");
    expect(modalSource).toContain(
      "Aperçu avec des données d’exemple. Le fichier reçu sera vierge",
    );
    expect(modalSource).toContain("et prêt à compléter.");
    const preview = await readFile(
      new URL(
        "../public/images/levier/levier-tableau-de-bord-preview.webp",
        import.meta.url,
      ),
    );
    expect(createHash("sha256").update(preview).digest("hex")).toBe(
      "94be8ec327e6a1275a8fe11a11dc61dd6825ca201c5a9ef84e3bc9013079faf6",
    );
  });
});
