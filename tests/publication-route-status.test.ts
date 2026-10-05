import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ publishedArticle: vi.fn() }));
vi.mock("@/lib/publications.server", () => mocks);
import { proxy } from "@/proxy";
beforeEach(() => { mocks.publishedArticle.mockReset(); });
const request = () => new NextRequest("https://demaa.fr/tutoriels/jago/strategie", { headers: { host: "demaa.fr" } });
it("returns HTTP 404 before rendering unpublished episodes", async () => {
  mocks.publishedArticle.mockResolvedValue(undefined);
  expect((await proxy(request())).status).toBe(404);
});
it("allows published episodes", async () => {
  mocks.publishedArticle.mockResolvedValue({ title: "Publié" });
  expect((await proxy(request())).headers.get("x-middleware-next")).toBe("1");
});
it("fails closed with a retryable 503 when publication storage is unavailable", async () => {
  mocks.publishedArticle.mockRejectedValue(new Error("storage unavailable"));
  expect((await proxy(request())).status).toBe(503);
});
