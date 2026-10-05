import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const fake = vi.hoisted(() => {
  const records = new Map<string, Record<string, unknown>>();
  const ref = (id: string) => ({ id, get: async () => ({ exists: records.has(id), data: () => records.get(id) }), update: async (data: Record<string, unknown>) => records.set(id, { ...records.get(id), ...data }), collection: (name: string) => ({ doc: (n: string) => ref(`${id}/${name}/${n}`) }) });
  return { records, ref, db: { collection: () => ({ doc: ref, get: async () => ({ docs: [...records].filter(([id]) => !id.includes("/")).map(([id, data]) => ({ id, data: () => data })) }) }), runTransaction: async <T,>(fn: (tx: { get: (r: ReturnType<typeof ref>) => ReturnType<ReturnType<typeof ref>["get"]>; set: (r: ReturnType<typeof ref>, data: Record<string, unknown>) => void }) => Promise<T>) => fn({ get: r => r.get(), set: (r, data) => { records.set(r.id, data); } }) } };
});
vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => fake.db, hasFirebaseAdminConfiguration: () => true }));
vi.mock("@/lib/transactional-email.server", () => ({ sendTransactionalEmail: vi.fn() }));
import { encodePublication, decodePublication } from "@/lib/publication-storage.server";
import { changePublication, publishedArticles, PublicationConflict, initialPublication, publicationVersion } from "@/lib/publications.server";
import { runPublicationNewsletter } from "@/lib/publication-newsletter.server";
import { publicationEmail } from "@/lib/publication-email";
import { ArticleSchema, publicationSlot } from "@/lib/publication-contract";
const draft = { title: "Un vrai article", description: "Une description suffisamment précise.", text: "Un contenu privé qui explique concrètement la stratégie de ce projet." };
beforeEach(() => {
  fake.records.clear(); vi.unstubAllGlobals();
  vi.stubEnv("STUDIO_PUBLICATIONS_KEY", "1".repeat(64));
  vi.stubEnv("RESEND_API_KEY", "test"); vi.stubEnv("RESEND_FROM_EMAIL", "test@example.com"); vi.stubEnv("RESEND_NEWSLETTER_SEGMENT_ID", "segment-newsletter");
});
describe("Studio publication lifecycle", () => {
  it("hides the execution article while keeping the GTM article visible and both editable", async () => {
    const record = initialPublication("demaa", 2);
    expect(record.published).not.toBeNull();
    fake.records.set(record.id, encodePublication(record));
    expect((await publishedArticles()).some(a => a.project === "demaa" && a.number === 2)).toBe(false);
    expect((await publishedArticles()).some(a => a.project === "demaa" && a.number === 1)).toBe(true);
    expect(decodePublication(record.id, fake.records.get(record.id)!).published).toEqual(record.published);
    expect((await publishedArticles()).some(a => a.project === "jago" && a.number === 1)).toBe(true);
  });
  it("encrypts private records and rejects tampering or swapping document identities", () => {
    const record = { ...initialPublication("dumaan", 3), draft };
    const stored = encodePublication(record);
    expect(JSON.stringify(stored)).not.toContain(draft.text);
    expect(decodePublication(record.id, stored)).toEqual(record);
    expect(() => decodePublication("jago-0", stored)).toThrow();
    expect(() => decodePublication(record.id, { ...stored, payload: stored.payload.slice(0, -8) + "AAAAAAAA" })).toThrow();
  });
  it("never exposes a draft, keeps edits private, and withdraws without deleting content", async () => {
    await changePublication({ project: "dumaan", number: 3, revision: 0, action: "save", draft }, "admin");
    expect((await publishedArticles()).some(a => a.project === "dumaan" && a.number === 3)).toBe(false);
    await changePublication({ project: "dumaan", number: 3, revision: 1, action: "publish" }, "admin");
    await changePublication({ project: "dumaan", number: 3, revision: 2, action: "save", draft: { ...draft, title: "Nouvelle version privée" } }, "admin");
    expect((await publishedArticles()).find(a => a.project === "dumaan" && a.number === 3)?.title).toBe(draft.title);
    await changePublication({ project: "dumaan", number: 3, revision: 3, action: "unpublish" }, "admin");
    expect((await publishedArticles()).some(a => a.project === "dumaan" && a.number === 3)).toBe(false);
    expect(decodePublication("dumaan-3", fake.records.get("dumaan-3")!).draft).toEqual({ ...draft, title: "Nouvelle version privée" });
    expect(fake.records.has("dumaan-3/history/4")).toBe(true);
  });
  it("saves incomplete drafts but refuses their publication", async () => {
    const saved = await changePublication({ project: "dumaan", number: 0, revision: 0, action: "save", draft: { title: "", description: "", text: "Quelques notes" } }, "admin");
    expect(saved.draft.text).toBe("Quelques notes");
    await expect(changePublication({ project: "dumaan", number: 0, revision: 1, action: "publish" }, "admin")).rejects.toThrow();
  });
  it("rejects concurrent stale revisions", async () => {
    await changePublication({ project: "dumaan", number: 3, revision: 0, action: "save", draft }, "admin");
    await expect(changePublication({ project: "dumaan", number: 3, revision: 0, action: "save", draft }, "admin")).rejects.toBeInstanceOf(PublicationConflict);
  });
  it("rejects invalid slots and incomplete articles", () => {
    expect(() => publicationSlot("other", 0)).toThrow(); expect(() => publicationSlot("jago", -1)).toThrow(); expect(() => publicationSlot("jago", 6)).toThrow();
    expect(ArticleSchema.safeParse({ ...draft, text: "" }).success).toBe(false);
  });
  it("escapes authored HTML in emails and includes native Resend unsubscribe", () => {
    const email = publicationEmail({ ...draft, title: '<script>alert("x")</script>', text: "<img src=x onerror=alert(1)>", project: "jago", number: 0, slug: "la-genese" });
    expect(email.html).not.toContain("<script>"); expect(email.html).not.toContain("<img"); expect(email.html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  });
  it("requires publication, preparation, test and explicit confirmation before sending", async () => {
    vi.stubGlobal("fetch", vi.fn());
    await expect(runPublicationNewsletter("dumaan", 3, "test", "admin@example.com")).rejects.toThrow("Publie");
    await expect(runPublicationNewsletter("jago", 0, "send", "admin@example.com")).rejects.toThrow("Confirme");
    await expect(runPublicationNewsletter("jago", 0, "send", "admin@example.com", "jago-0")).rejects.toThrow("Prépare");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("creates a draft only and refreshes the same draft without duplicating it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "broadcast-1" })));
    vi.stubGlobal("fetch", fetchMock);
    await runPublicationNewsletter("jago", 0, "prepare", "admin@example.com");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ send: false, segment_id: "segment-newsletter" });
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ status: "draft" }))).mockResolvedValueOnce(new Response(JSON.stringify({ id: "broadcast-1" })));
    await runPublicationNewsletter("jago", 0, "prepare", "admin@example.com");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[2][1].method).toBe("PATCH");
  });
  it("locks uncertain operations instead of retrying a potentially accepted send", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    await expect(runPublicationNewsletter("jago", 0, "prepare", "admin@example.com")).rejects.toThrow("timeout");
    expect(decodePublication("jago-0", fake.records.get("jago-0")!).newsletter!.status).toBe("uncertain");
    await expect(runPublicationNewsletter("jago", 0, "prepare", "admin@example.com")).rejects.toThrow("opération en cours");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("refuses to send an externally changed Resend draft", async () => {
    const record = initialPublication("jago", 0);
    const { publicationVersion } = await import("@/lib/publications.server");
    const version = publicationVersion(record.published!);
    fake.records.set(record.id, encodePublication({ ...record, newsletter: { status: "prepared", version, testedVersion: version, broadcastId: "broadcast-1" } }));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "draft", subject: "changed", html: "changed", segment_id: "segment-newsletter" }))));
    await expect(runPublicationNewsletter("jago", 0, "send", "admin@example.com", "jago-0")).rejects.toThrow("a changé");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("sends the verified draft once and rejects a second send", async () => {
    const record = initialPublication("jago", 0);
    const version = publicationVersion(record.published!);
    fake.records.set(record.id, encodePublication({ ...record, newsletter: { status: "prepared", version, testedVersion: version, broadcastId: "broadcast-1" } }));
    const email = publicationEmail(record.published!);
    const mock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ status: "draft", ...email, segment_id: "segment-newsletter" }))).mockResolvedValueOnce(new Response(JSON.stringify({ id: "broadcast-1" })));
    vi.stubGlobal("fetch", mock);
    await runPublicationNewsletter("jago", 0, "send", "admin@example.com", "jago-0");
    expect(mock.mock.calls[1][0]).toContain("/broadcasts/broadcast-1/send");
    expect(decodePublication(record.id, fake.records.get(record.id)!).newsletter?.status).toBe("sent");
    await expect(runPublicationNewsletter("jago", 0, "send", "admin@example.com", "jago-0")).rejects.toThrow("déjà envoyée");
    expect(mock).toHaveBeenCalledTimes(2);
  });
  it("rejects an old test after the published content changes", async () => {
    const record = initialPublication("jago", 0);
    const version = publicationVersion(record.published!);
    fake.records.set(record.id, encodePublication({ ...record, published: { ...record.published!, title: "Une version différente" }, newsletter: { status: "prepared", version, testedVersion: version, broadcastId: "broadcast-1" } }));
    vi.stubGlobal("fetch", vi.fn());
    await expect(runPublicationNewsletter("jago", 0, "send", "admin@example.com", "jago-0")).rejects.toThrow("version publiée");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("prevents publication changes while a newsletter is being sent", async () => {
    const record = initialPublication("jago", 0);
    fake.records.set(record.id, encodePublication({ ...record, newsletter: { status: "sending", version: publicationVersion(record.published!) } }));
    await expect(changePublication({ project: "jago", number: 0, revision: 0, action: "unpublish" }, "admin")).rejects.toThrow("en cours");
  });

});
