import { afterEach, describe, expect, it } from "vitest";
import {
  getCanonicalOrigin,
  getCanonicalSiteUrl,
  getTrustedRequestOrigin,
  isAllowedRequestHost,
  isAllowedRequestOrigin,
  isVercelPreviewHost,
} from "@/lib/site-url";

const originalVercelEnv = process.env.VERCEL_ENV;
const originalVercelUrl = process.env.VERCEL_URL;
const originalVercelBranchUrl = process.env.VERCEL_BRANCH_URL;
const originalDemaaPreviewHosts = process.env.DEMAA_PREVIEW_HOSTS;
const originalSiteUrl = process.env.SITE_URL;
const originalPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

afterEach(() => {
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.VERCEL_URL = originalVercelUrl;
  process.env.VERCEL_BRANCH_URL = originalVercelBranchUrl;
  process.env.DEMAA_PREVIEW_HOSTS = originalDemaaPreviewHosts;
  process.env.SITE_URL = originalSiteUrl;
  process.env.NEXT_PUBLIC_SITE_URL = originalPublicSiteUrl;
});

describe("canonical domain migration", () => {
  it("uses demaa.fr as the canonical origin and normalizes the retired domain", () => {
    delete process.env.SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getCanonicalSiteUrl()).toBe("https://demaa.fr");
    expect(getCanonicalOrigin()).toBe("https://demaa.fr");

    process.env.SITE_URL = "https://demaa.co";
    expect(getCanonicalSiteUrl()).toBe("https://demaa.fr");
  });

  it("keeps the old controlled host available during redirects without trusting third parties", () => {
    process.env.SITE_URL = "https://demaa.fr";
    const canonicalRequest = new Request("https://demaa.fr/api/test");
    const legacyRequest = new Request("https://demaa.co/api/test");

    expect(isAllowedRequestHost(canonicalRequest)).toBe(true);
    expect(isAllowedRequestHost(legacyRequest)).toBe(true);
    expect(isAllowedRequestOrigin(canonicalRequest, "https://demaa.co")).toBe(true);
    expect(isAllowedRequestOrigin(legacyRequest, "https://demaa.fr")).toBe(true);
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
    expect(
      getTrustedRequestOrigin(
        new Request("https://demaa-git-feature.vercel.app/api/customer-space/firebase-session"),
      ),
    ).toBe("https://demaa-git-feature.vercel.app");
  });

  it("does not allow a preview host in production", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_URL = "demaa-preview-123.vercel.app";

    expect(isVercelPreviewHost("demaa-preview-123.vercel.app")).toBe(false);
    expect(
      getTrustedRequestOrigin(
        new Request("https://demaa-preview-123.vercel.app/api/customer-space/firebase-session"),
      ),
    ).toBe("https://demaa.fr");
  });

  it("allows only explicitly configured stable aliases in Preview", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.DEMAA_PREVIEW_HOSTS =
      "demaa-d094-preview.vercel.app, another-reviewed-preview.vercel.app";

    expect(isVercelPreviewHost("DEMAA-D094-PREVIEW.VERCEL.APP")).toBe(true);
    expect(isVercelPreviewHost("another-reviewed-preview.vercel.app")).toBe(true);
    expect(isVercelPreviewHost("unrelated.vercel.app")).toBe(false);
  });

  it("never trusts a configured Preview alias outside Vercel Preview", () => {
    process.env.VERCEL_ENV = "production";
    process.env.DEMAA_PREVIEW_HOSTS = "demaa-d094-preview.vercel.app";

    expect(isVercelPreviewHost("demaa-d094-preview.vercel.app")).toBe(false);
  });
});
