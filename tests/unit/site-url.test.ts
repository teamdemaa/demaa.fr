import { describe, expect, it } from "vitest";
import { getCanonicalSiteUrl } from "@/lib/site-url";

describe("site-url", () => {
  it("returns the production domain in production", () => {
    process.env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://preview.demaa.fr";

    expect(getCanonicalSiteUrl()).toBe("https://demaa.fr");
  });

  it("uses NEXT_PUBLIC_SITE_URL in non-production when it is not a vercel preview", () => {
    process.env.NODE_ENV = "development";
    process.env.VERCEL_ENV = "preview";
    process.env.NEXT_PUBLIC_SITE_URL = "https://staging.demaa.fr/";

    expect(getCanonicalSiteUrl()).toBe("https://staging.demaa.fr");
  });

  it("falls back to the canonical domain for vercel preview URLs", () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_SITE_URL = "https://demaa-preview.vercel.app";

    expect(getCanonicalSiteUrl()).toBe("https://demaa.fr");
  });
});
