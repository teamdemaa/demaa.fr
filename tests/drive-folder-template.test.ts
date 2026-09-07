import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildCompanyDriveFolderTemplate,
  COMPANY_DRIVE_DOSSIER_GUIDES,
  formatDriveFolderTree,
  selectDriveFolderSections,
  type DriveFolderNode,
} from "@/lib/drive-folder-templates";
import {
  createGoogleDriveFolderStructure,
  createGoogleDriveTemplateState,
  buildGoogleDriveAuthorizationUrl,
  getGoogleDriveOAuthConfig,
  GoogleDriveFolderCreationError,
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
    vi.unstubAllEnvs();
  });

  it("derives the local callback from the current request when no redirect is forced", () => {
    vi.stubEnv("GOOGLE_DRIVE_CLIENT_ID", "client-id");
    vi.stubEnv("GOOGLE_DRIVE_CLIENT_SECRET", "client-secret");
    vi.stubEnv("GOOGLE_DRIVE_OAUTH_STATE_SECRET", "a-secure-state-secret-with-at-least-32-characters");
    vi.stubEnv("GOOGLE_DRIVE_REDIRECT_URI", "");

    const config = getGoogleDriveOAuthConfig(new Request(
      "http://127.0.0.1:3001/api/modeles/structure-google-drive-entreprise/drive/authorize",
    ));

    expect(config?.redirectUri).toBe(
      "http://127.0.0.1:3001/api/modeles/structure-google-drive-entreprise/drive/callback",
    );
  });

  it("requests only the Drive file scope without incremental authorization", () => {
    const authorizationUrl = new URL(buildGoogleDriveAuthorizationUrl({
      clientId: "client-id",
      clientSecret: "client-secret",
      redirectUri: "https://demaa.fr/api/modeles/structure-google-drive-entreprise/drive/callback",
      stateSecret: "a-secure-state-secret-with-at-least-32-characters",
    }, "nonce-for-test-only"));

    expect(authorizationUrl.searchParams.get("scope")).toBe(
      "https://www.googleapis.com/auth/drive.file",
    );
    expect(authorizationUrl.searchParams.get("access_type")).toBe("online");
    expect(authorizationUrl.searchParams.has("include_granted_scopes")).toBe(false);
  });

  it("limits the wording exception to numbered Drive folder names", () => {
    const audit = readFileSync(
      new URL("../scripts/audit-public-wording.mjs", import.meta.url),
      "utf8",
    );

    expect(audit).toContain("isValidatedDriveFolderName");
    expect(audit).toContain('/["\']\\d{2} — /.test(line)');
  });

  it("keeps a lightweight document-only structure for small businesses", () => {
    const template = buildCompanyDriveFolderTemplate(2026);
    const names = flattenNames(template.sections);

    expect(template.sections.map((section) => section.id)).toEqual([
      "inbox",
      "finance",
      "clients",
      "team",
      "brand",
    ]);
    expect(names).toContain("01 — Administration & finance");
    expect(names).toContain("02 — Dossiers clients");
    expect(names).toContain("03 — Équipe");
    expect(names).not.toContain("2025");
    expect(names).toContain("2026");
    expect(names.some((name) => /Modèle|\[/.test(name))).toBe(false);
    expect(template.sections[0].children).toBeUndefined();
    expect(names).toContain("01 — Factures de vente");
    expect(names).toContain("02 — Factures d’achat");
    expect(names).toContain("03 — Relevés bancaires");
    expect(names).toContain("06 — Bilan & clôture");
    expect(names).not.toContain("01 — Stratégie et objectifs");
    expect(names).not.toContain("06 — Suivi commercial");
    expect(names).not.toContain("01 — Liste des outils");
    expect(names).not.toContain("Mots de passe");
  });

  it("selects top-level domains and formats a copyable tree", () => {
    const template = buildCompanyDriveFolderTemplate(2026);
    const selected = selectDriveFolderSections(template, ["finance", "team", "unknown"]);
    const tree = formatDriveFolderTree("Atelier Martin", selected);

    expect(selected.map((section) => section.id)).toEqual(["finance", "team"]);
    expect(tree).toContain("Atelier Martin");
    expect(tree).toContain("├── 01 — Administration & finance");
    expect(tree).toContain("└── 03 — Équipe");
    expect(tree).not.toContain("04 — Communication");
  });

  it("documents on-demand dossiers without adding fictitious records to the tree", () => {
    expect(COMPANY_DRIVE_DOSSIER_GUIDES).toHaveLength(4);
    const client = COMPANY_DRIVE_DOSSIER_GUIDES[0];
    expect(formatDriveFolderTree(client.rootName, client.children)).toContain("04 — Livrables & validations");
    const collaborator = COMPANY_DRIVE_DOSSIER_GUIDES[3];
    expect(flattenNames(collaborator.children)).toContain("03 — Paie");
    expect(flattenNames(collaborator.children)).toContain("06 — Documents de départ");
    const template = buildCompanyDriveFolderTemplate(2027);
    const names = flattenNames(template.sections);
    expect(names).toContain("2027");
    expect(names).not.toContain("2026");
    for (const guide of COMPANY_DRIVE_DOSSIER_GUIDES) {
      expect(names).not.toContain(guide.rootName);
    }
  });

  it("keeps accounting years and archives within their domain", () => {
    const template = buildCompanyDriveFolderTemplate(2026);
    expect(template.sections.some((section) => section.name === "99 — Archives")).toBe(false);
    const finance = template.sections.find((section) => section.id === "finance")!;
    const accounting = finance.children!.find((node) => node.name === "04 — Comptabilité")!;
    expect(accounting.children!.map((node) => node.name)).toEqual(["2026"]);
    const supplier = finance.children!.find((node) => node.name === "06 — Fournisseurs & abonnements")!;
    expect(supplier.children).toBeUndefined();
  });

  it("supports a solo selection and ignores duplicate or unknown domains", () => {
    const template = buildCompanyDriveFolderTemplate(2026);
    const solo = selectDriveFolderSections(template, ["brand", "finance", "inbox", "clients", "finance", "unknown"]);
    expect(solo.map((section) => section.id)).toEqual(["inbox", "finance", "clients", "brand"]);
    expect(formatDriveFolderTree("Mon entreprise", solo)).not.toContain("03 — Équipe");
    expect(selectDriveFolderSections(template, [])).toEqual([]);
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

  it("waits for in-flight folder requests before removing a failed tree", async () => {
    let postCount = 0;
    let siblingRequestFinished = false;
    let cleanupStartedAfterSibling = false;
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === "DELETE") {
        cleanupStartedAfterSibling = siblingRequestFinished;
        return new Response(null, { status: 204 });
      }
      postCount += 1;
      if (postCount === 1) return Response.json({ id: "created-root", name: "Entreprise" });
      if (postCount === 2) return Response.json({ error: "failed" }, { status: 500 });
      await new Promise((resolve) => setTimeout(resolve, 5));
      siblingRequestFinished = true;
      return Response.json({ id: "created-sibling", name: "Clients" });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(createGoogleDriveFolderStructure({
      accessToken: "short-lived-access-token",
      rootName: "Entreprise",
      sections: [{ name: "Finance" }, { name: "Clients" }],
    })).rejects.toMatchObject({
      cleanupSucceeded: true,
      name: "GoogleDriveFolderCreationError",
    });

    expect(cleanupStartedAfterSibling).toBe(true);
  });

  it("reports when cleanup of a failed tree cannot be confirmed", async () => {
    let postCount = 0;
    const fetchMock = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === "DELETE") return Response.json({ error: "failed" }, { status: 500 });
      postCount += 1;
      if (postCount === 2) return Response.json({ error: "failed" }, { status: 500 });
      return Response.json({ id: "created-root", name: "Entreprise" });
    });
    vi.stubGlobal("fetch", fetchMock);

    try {
      await createGoogleDriveFolderStructure({
        accessToken: "short-lived-access-token",
        rootName: "Entreprise",
        sections: [{ name: "Finance" }],
      });
      throw new Error("Expected Drive creation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(GoogleDriveFolderCreationError);
      expect((error as GoogleDriveFolderCreationError).cleanupSucceeded).toBe(false);
    }
  });

  it("sanitizes user-provided root folder names", () => {
    expect(sanitizeDriveFolderName("  Mon / entreprise\\  ")).toBe("Mon - entreprise-");
    expect(sanitizeDriveFolderName("\u0000\n")).toBe("Mon entreprise");
  });
});
