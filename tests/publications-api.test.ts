import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ identity: vi.fn(), origin: vi.fn(), list: vi.fn(), change: vi.fn(), newsletter: vi.fn() }));
vi.mock("@/lib/admin-auth.server", () => ({ getCurrentAdminIdentity: mocks.identity }));
vi.mock("@/lib/request-guard", () => ({ enforceAllowedHost: () => null, enforceSameOrigin: mocks.origin }));
vi.mock("@/lib/api-security", () => ({ enforceRateLimit: () => null, readJsonBody: async (r: Request) => ({ data: await r.json() }) }));
vi.mock("@/lib/publications.server", () => ({ listPublications: mocks.list, changePublication: mocks.change, PublicationConflict: class extends Error {} }));
vi.mock("@/lib/publication-newsletter.server", () => ({ runPublicationNewsletter: mocks.newsletter, newsletterReady: () => true }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { GET, POST } from "@/app/api/admin/publications/route";
beforeEach(() => { vi.clearAllMocks(); mocks.identity.mockResolvedValue(null); mocks.origin.mockReturnValue(null); mocks.list.mockResolvedValue([]); });
const request = (body: unknown) => new Request("https://demaa.fr/api/admin/publications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
describe("Publication API access", () => {
  it("denies both reading drafts and writing without admin authentication", async () => {
    expect((await GET()).status).toBe(401);
    expect((await POST(request({}))).status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled(); expect(mocks.change).not.toHaveBeenCalled();
  });
  it("rejects cross-origin authenticated writes", async () => {
    mocks.identity.mockResolvedValue({ uid: "admin", email: "admin@example.com" }); mocks.origin.mockReturnValue(new Response(null, { status: 403 }));
    expect((await POST(request({ project: "jago", number: 0, revision: 0, action: "save" }))).status).toBe(403);
    expect(mocks.change).not.toHaveBeenCalled();
  });
  it("publishes without triggering any email", async () => {
    mocks.identity.mockResolvedValue({ uid: "admin", email: "admin@example.com" });
    const response = await POST(request({ project: "jago", number: 0, revision: 0, action: "publish" }));
    expect(response.status).toBe(200); expect(mocks.change).toHaveBeenCalledOnce(); expect(mocks.newsletter).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
});
