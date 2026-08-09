import { afterEach, describe, expect, it } from "vitest";
import {
  getCanonicalOrigin,
  getCanonicalSiteUrl,
  isAllowedRequestHost,
  isAllowedRequestOrigin,
  isVercelPreviewHost,
} from "@/lib/site-url";

const originalVercelEnv = process.env.VERCEL_ENV;
const originalVercelUrl = process.env.VERCEL_URL;
const originalVercelBranchUrl = process.env.VERCEL_BRANCH_URL;
const originalSiteUrl = process.env.SITE_URL;
const originalPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.VERCEL_URL = originalVercelUrl;
  process.env.VERCEL_BRANCH_URL = originalVercelBranchUrl;
  process.env.SITE_URL = originalSiteUrl;
  process.env.NEXT_PUBLIC_SITE_URL = originalPublicSiteUrl;
});

describe("canonical domain migration", () => {
  it("uses demaa.co as the canonical origin and normalizes the retired domain", () => {
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getCanonicalSiteUrl()).toBe("https://demaa.co");
    expect(getCanonicalOrigin()).toBe("https://demaa.co");

    process.env.SITE_URL = "https://demaa.fr";
    expect(getCanonicalSiteUrl()).toBe("https://demaa.co");
  });

  it("keeps the old controlled host available during redirects without trusting third parties", () => {
    process.env.SITE_URL = "https://demaa.co";
    const canonicalRequest = new Request("https://demaa.co/api/test");
    const legacyRequest = new Request("https://demaa.fr/api/test");

    expect(isAllowedRequestHost(canonicalRequest)).toBe(true);
    expect(isAllowedRequestHost(legacyRequest)).toBe(true);
    expect(isAllowedRequestOrigin(canonicalRequest, "https://demaa.fr")).toBe(true);
    expect(isAllowedRequestOrigin(legacyRequest, "https://demaa.co")).toBe(true);
    expect(isAllowedRequestOrigin(canonicalRequest, "https://evil.example")).toBe(false);
  });
});

describe("Vercel preview hosts", () => {
  it("allows only the deployment and branch hosts supplied by Vercel", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "demaa-preview-123.vercel.app";
    process.env.VERCEL_BRANCH_URL = "demaa-git-feature.vercel.app";

    expect(isVercelPreviewHost("demaa-preview-123.vercel.app")).toBe(true);
    expect(isVercelPreviewHost("DEMAA-GIT-FEATURE.VERCEL.APP")).toBe(true);
    expect(isVercelPreviewHost("unrelated.vercel.app")).toBe(false);
    expect(
      isAllowedRequestHost(new Request("https://demaa-git-feature.vercel.app/api/test")),
    ).toBe(true);
  });

  it("does not allow a preview host in production", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "demaa-preview-123.vercel.app";

    expect(isVercelPreviewHost("demaa-preview-123.vercel.app")).toBe(false);
  });
});
