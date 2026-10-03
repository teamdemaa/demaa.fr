import { describe, expect, it } from "vitest";
import { allowsLocalSolutionsSnapshot } from "@/lib/local-solutions-preview";

describe("local Solutions preview", () => {
  it("allows an explicitly enabled loopback preview", () => {
    expect(allowsLocalSolutionsSnapshot("localhost:3013", { NODE_ENV: "production", DEMAA_LOCAL_SOLUTIONS_PREVIEW: "true" })).toBe(true);
  });
  it("keeps deployed and public production requests on the active registry", () => {
    const env = { NODE_ENV: "production", DEMAA_LOCAL_SOLUTIONS_PREVIEW: "true" };
    expect(allowsLocalSolutionsSnapshot("demaa.fr", env)).toBe(false);
    expect(allowsLocalSolutionsSnapshot("localhost:3013", { ...env, VERCEL: "1" })).toBe(false);
    expect(allowsLocalSolutionsSnapshot("localhost:3013", { ...env, VERCEL_ENV: "preview" })).toBe(false);
    expect(allowsLocalSolutionsSnapshot("localhost:3013", { NODE_ENV: "production" })).toBe(false);
  });
});
