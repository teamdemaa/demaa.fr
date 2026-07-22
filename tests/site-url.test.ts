import { afterEach, describe, expect, it } from "vitest";
import { isAllowedRequestHost, isVercelPreviewHost } from "@/lib/site-url";

const originalVercelEnv = process.env.VERCEL_ENV;
const originalVercelUrl = process.env.VERCEL_URL;
const originalVercelBranchUrl = process.env.VERCEL_BRANCH_URL;

afterEach(() => {
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.VERCEL_URL = originalVercelUrl;
  process.env.VERCEL_BRANCH_URL = originalVercelBranchUrl;
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
