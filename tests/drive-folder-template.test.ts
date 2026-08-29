import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildCompanyDriveFolderTemplate,
  formatDriveFolderTree,
  selectDriveFolderSections,
  type DriveFolderNode,
} from "@/lib/drive-folder-templates";
import {
  createGoogleDriveFolderStructure,
  createGoogleDriveTemplateState,
  matchesGoogleDriveTemplateNonce,
  readGoogleDriveTemplateState,
  sanitizeDriveFolderName,
} from "@/lib/google-drive-template.server";

function flattenNames(nodes: readonly DriveFolderNode[]): string[] {
  return nodes.flatMap((node) => [
    node.name,
    ...(node.children ? flattenNames(node.children) : []),
  ]);
}

describe("Google Drive folder template", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("limits the wording exception to numbered Drive folder names", () => {
    const audit = readFileSync(
      new URL("../scripts/audit-public-wording.mjs", import.meta.url),
      "utf8",
    );

    expect(audit).toContain("isValidatedDriveFolderName");
    expect(audit).toContain('/["\']\\d{2} — /.test(line)');
  });

  it("keeps stable domains and uses years only where documents are recurrent", () => {
    const template = buildCompanyDriveFolderTemplate(2026);
    const names = flattenNames(template.sections);

    expect(template.sections.map((section) => section.id)).toEqual([
      "inbox",
      "direction",
      "finance",
      "administration",
      "commercial",
      "clients",
      "team",
      "marketing",
      "processes",
      "it",
      "archives",
    ]);
    expect(names).toContain("02 — Finance & comptabilité");
    expect(names).toContain("06 — Équipe & RH");
    expect(names).toContain("2025");
    expect(names).toContain("2026");
    expect(names).toContain("01 — Janvier");
    expect(names).toContain("00 — Modèle de dossier client");
    expect(names).not.toContain("Mots de passe");
  });

  it("selects top-level domains and formats a copyable tree", () => {
    const template = buildCompanyDriveFolderTemplate(2026);
    const selected = selectDriveFolderSections(template, ["finance", "team", "unknown"]);
    const tree = formatDriveFolderTree("Atelier Martin", selected);

    expect(selected.map((section) => section.id)).toEqual(["finance", "team"]);
    expect(tree).toContain("Atelier Martin");
    expect(tree).toContain("├── 02 — Finance & comptabilité");
    expect(tree).toContain("└── 06 — Équipe & RH");
    expect(tree).not.toContain("Marketing & communication");
  });

  it("signs short-lived OAuth state and rejects tampering or expiry", () => {
    const secret = "a-secure-state-secret-with-at-least-32-characters";
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);
    const state = createGoogleDriveTemplateState({
      redirectUri: "https://demaa.co/api/modeles/structure-google-drive-entreprise/drive/callback",
      rootName: "Atelier Martin",
      sectionIds: ["finance", "team"],
      year: 2026,
    }, secret);

    expect(readGoogleDriveTemplateState(state.cookieValue, secret, now)?.rootName)
      .toBe("Atelier Martin");
    expect(matchesGoogleDriveTemplateNonce(state.request.nonce, state.request.nonce)).toBe(true);
    expect(matchesGoogleDriveTemplateNonce(state.request.nonce, "wrong-state")).toBe(false);
    expect(readGoogleDriveTemplateState(`${state.cookieValue}x`, secret, now)).toBeNull();
    expect(readGoogleDriveTemplateState(state.cookieValue, secret, now + 11 * 60 * 1000)).toBeNull();
    vi.restoreAllMocks();
  });

  it("creates the tree level by level with no refresh token storage", async () => {
    let counter = 0;
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === "DELETE") return new Response(null, { status: 204 });
      counter += 1;
      const body = JSON.parse(String(init?.body)) as { name: string };
      return Response.json({ id: `folder-${counter}`, name: body.name });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await createGoogleDriveFolderStructure({
      accessToken: "short-lived-access-token",
      rootName: "Atelier / Martin",
      sections: [{
        name: "Finance",
        children: [{ name: "2026", children: [{ name: "Factures" }] }],
      }],
    });

    expect(result).toEqual({
      createdCount: 4,
      rootId: "folder-1",
      webUrl: "https://drive.google.com/drive/folders/folder-1",
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(String(fetchMock.mock.calls[0]?.[1]?.body)).toContain("Atelier - Martin");
  });

  it("removes the exact root it created when a nested folder fails", async () => {
    let postCount = 0;
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === "DELETE") return new Response(null, { status: 204 });
      postCount += 1;
      if (postCount === 2) return Response.json({ error: "failed" }, { status: 500 });
      return Response.json({ id: "created-root", name: "Entreprise" });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(createGoogleDriveFolderStructure({
      accessToken: "short-lived-access-token",
      rootName: "Entreprise",
      sections: [{ name: "Finance" }],
    })).rejects.toThrow("status 500");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2]?.[1]?.method).toBe("DELETE");
    expect(String(fetchMock.mock.calls[2]?.[0])).toContain("/created-root");
  });

  it("sanitizes user-provided root folder names", () => {
    expect(sanitizeDriveFolderName("  Mon / entreprise\\  ")).toBe("Mon - entreprise-");
    expect(sanitizeDriveFolderName("\u0000\n")).toBe("Mon entreprise");
  });
});
