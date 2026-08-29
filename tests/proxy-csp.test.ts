import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";
import { buildContentSecurityPolicy } from "@/lib/content-security-policy";

const originalVercelEnv = process.env.VERCEL_ENV;
const originalEnglishBetaEnabled = process.env.DEMAA_ENGLISH_BETA_ENABLED;
const originalDemaaPreviewHosts = process.env.DEMAA_PREVIEW_HOSTS;

afterEach(() => {
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.DEMAA_ENGLISH_BETA_ENABLED = originalEnglishBetaEnabled;
  process.env.DEMAA_PREVIEW_HOSTS = originalDemaaPreviewHosts;
});

describe("proxy content security policy", () => {
  it("keeps the English beta disabled by default and marks its response", () => {
    delete process.env.DEMAA_ENGLISH_BETA_ENABLED;
    const response = proxy(new NextRequest("https://demaa.fr/en", {
      headers: { host: "demaa.fr" },
    }));
    expect(response.status).toBe(404);
    expect(response.headers.get("content-language")).toBe("en");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("forwards the centrally resolved locale only when the beta flag is enabled", () => {
    process.env.DEMAA_ENGLISH_BETA_ENABLED = "true";
    const english = proxy(new NextRequest("https://demaa.fr/en", {
      headers: { host: "demaa.fr" },
    }));
    expect(english.status).toBe(200);
    expect(english.headers.get("content-language")).toBe("en");
    expect(english.headers.get("x-middleware-request-x-demaa-locale")).toBe("en");

    const french = proxy(new NextRequest("https://demaa.fr/solutions", {
      headers: { host: "demaa.fr", "x-demaa-locale": "en" },
    }));
    expect(french.headers.get("content-language")).toBe("fr");
    expect(french.headers.get("x-middleware-request-x-demaa-locale")).toBe("fr");
  });

  it("allows the active embeds and Firebase Google Auth while preserving the policy", () => {
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

    expect(frameSource).toBe(
      "frame-src 'self' https://airtable.com https://embed.fillout.com https://*.firebaseapp.com https://accounts.google.com",
    );
    expect(frameSource).toContain("'self'");
    expect(policy).toContain("https://apis.google.com");
    expect(policy).toContain("https://identitytoolkit.googleapis.com");
    expect(policy).toContain("https://securetoken.googleapis.com");
    expect(policy).toContain("form-action 'self' https://accounts.google.com");
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
      new NextRequest("https://demaa.fr/__/auth/iframe", {
        headers: { host: "demaa.fr" },
      }),
    );
    expect(response.headers.get("content-security-policy")).toContain(
      "frame-ancestors 'self'",
    );
  });

  it.each(["demaa.co", "www.demaa.co", "www.demaa.fr"])(
    "redirects %s to the canonical domain while preserving path and query",
    (host) => {
      const response = proxy(
        new NextRequest(`https://${host}/systemes/restaurant?tab=solutions`, {
          headers: { host },
        }),
      );

      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(
        "https://demaa.fr/systemes/restaurant?tab=solutions",
      );
    },
  );

  it("redirects a legacy API request without dropping its query", () => {
    const response = proxy(
      new NextRequest("https://demaa.co/api/systeme-kit/request?source=legacy", {
        headers: { host: "demaa.co" },
        method: "POST",
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://demaa.fr/api/systeme-kit/request?source=legacy",
    );
  });

  it("lets Vercel production cron requests reach their secret-protected handlers", () => {
    process.env.VERCEL_ENV = "production";
    const response = proxy(
      new NextRequest(
        "https://demaa-fr-hiteamdemaa-2292s-projects.vercel.app/api/cron/system-kit-followups",
        {
          headers: {
            host: "demaa-fr-hiteamdemaa-2292s-projects.vercel.app",
            authorization: "Bearer cron-secret",
          },
        },
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps an explicitly allowed stable Preview alias on its own origin", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.DEMAA_PREVIEW_HOSTS = "demaa-d094-preview.vercel.app";
    const response = proxy(
      new NextRequest("https://demaa-d094-preview.vercel.app/admin/demandes", {
        headers: { host: "demaa-d094-preview.vercel.app" },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("still redirects an unlisted Vercel Preview host", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.DEMAA_PREVIEW_HOSTS = "demaa-d094-preview.vercel.app";
    const response = proxy(
      new NextRequest("https://unrelated.vercel.app/admin/demandes", {
        headers: { host: "unrelated.vercel.app" },
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://demaa.fr/admin/demandes",
    );
  });

  it("redirects a retired legacy path before applying the canonical 404 policy", () => {
    const response = proxy(
      new NextRequest("https://demaa.co/structuration?source=legacy", {
        headers: { host: "demaa.co" },
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://demaa.fr/structuration?source=legacy",
    );
  });

  it.each([
    "/academy/contenu-inconnu",
    "/ressources/ancien-modele",
  ])("returns a real 404 for retired route %s", (pathname) => {
    const response = proxy(
      new NextRequest(`https://demaa.fr${pathname}`, {
        headers: { host: "demaa.fr" },
      }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("serves only published copyable model detail paths", () => {
    const publishedSlugs = [
      "suivi-commercial-et-devis",
      "projets-et-missions-clients",
      "interventions-et-chantiers",
      "suivi-previsionnel-financier",
      "suivi-administratif-et-echeances",
      "planning-marketing-et-contenus",
      "recrutement-et-candidatures",
      "suivi-client-et-support",
    ];
    const published = publishedSlugs.map((slug) => proxy(
      new NextRequest(`https://demaa.fr/modeles/${slug}`, {
        headers: { host: "demaa.fr" },
      }),
    ));
    const unknown = proxy(
      new NextRequest("https://demaa.fr/modeles/modele-inconnu", {
        headers: { host: "demaa.fr" },
      }),
    );

    expect(published.map((response) => response.status)).toEqual(
      publishedSlugs.map(() => 200),
    );
    expect(unknown.status).toBe(404);
    expect(unknown.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });
});
