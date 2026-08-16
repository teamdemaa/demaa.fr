import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";
import { buildContentSecurityPolicy } from "@/lib/content-security-policy";

describe("proxy content security policy", () => {
  it("allows the active embeds and Firebase Google Auth while preserving the policy", () => {
    const response = proxy(
      new NextRequest("https://demaa.co/cours/exemple", {
        headers: { host: "demaa.co" },
      }),
    );
    const policy = response.headers.get("content-security-policy");
    const frameSource = policy
      ?.split(";")
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith("frame-src "));

    expect(frameSource).toBe(
      "frame-src https://embed.fillout.com https://*.firebaseapp.com https://accounts.google.com",
    );
    expect(policy).toContain("https://apis.google.com");
    expect(policy).toContain("https://identitytoolkit.googleapis.com");
    expect(policy).toContain("https://securetoken.googleapis.com");
    expect(policy).not.toContain("youtube");
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });

  it("allows only the same-origin Firebase helper iframe on its dedicated path", () => {
    const helperPolicy = buildContentSecurityPolicy({ allowSameOriginFraming: true });
    expect(helperPolicy).toContain("frame-ancestors 'self'");
    expect(helperPolicy).not.toContain("frame-ancestors 'none'");

    const response = proxy(
      new NextRequest("https://demaa.co/__/auth/iframe", {
        headers: { host: "demaa.co" },
      }),
    );
    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'self'",
    );
  });

  it.each(["demaa.fr", "www.demaa.fr", "www.demaa.co"])(
    "redirects %s to the canonical domain while preserving path and query",
    (host) => {
      const response = proxy(
        new NextRequest(`https://${host}/systemes/restaurant?tab=solutions`, {
          headers: { host },
        }),
      );

      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(
        "https://demaa.co/systemes/restaurant?tab=solutions",
      );
    },
  );

  it("redirects a legacy API request without dropping its query", () => {
    const response = proxy(
      new NextRequest("https://demaa.fr/api/systeme-kit/request?source=legacy", {
        headers: { host: "demaa.fr" },
        method: "POST",
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://demaa.co/api/systeme-kit/request?source=legacy",
    );
  });

  it("redirects a retired legacy path before applying the canonical 404 policy", () => {
    const response = proxy(
      new NextRequest("https://demaa.fr/structuration?source=legacy", {
        headers: { host: "demaa.fr" },
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://demaa.co/structuration?source=legacy",
    );
  });

  it.each([
    "/academy/contenu-inconnu",
    "/modeles-de-documents/ancien-modele",
    "/ressources/ancien-modele",
  ])("returns a real 404 for retired route %s", (pathname) => {
    const response = proxy(
      new NextRequest(`https://demaa.co${pathname}`, {
        headers: { host: "demaa.co" },
      }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
