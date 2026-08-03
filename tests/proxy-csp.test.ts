import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

describe("proxy content security policy", () => {
  it("allows only the active Fillout embed consumer while preserving the policy", () => {
    const response = proxy(
      new NextRequest("https://demaa.fr/cours/exemple", {
        headers: { host: "demaa.fr" },
      }),
    );
    const policy = response.headers.get("content-security-policy");
    const frameSource = policy
      ?.split(";")
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith("frame-src "));

    expect(frameSource).toBe("frame-src https://embed.fillout.com");
    expect(policy).not.toContain("youtube");
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });
});
