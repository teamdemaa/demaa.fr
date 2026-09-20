import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";
import { buildContentSecurityPolicy } from "@/lib/content-security-policy";

const originalVercelEnv = process.env.VERCEL_ENV;
const originalEnglishBetaEnabled = process.env.DEMAA_ENGLISH_BETA_ENABLED;
const originalDemaaPreviewHosts = process.env.DEMAA_PREVIEW_HOSTS;
const originalSiniFormsEnabled = process.env.SINI_FORMS_ENABLED;

afterEach(() => {
  process.env.VERCEL_ENV = originalVercelEnv;
  process.env.DEMAA_ENGLISH_BETA_ENABLED = originalEnglishBetaEnabled;
  process.env.DEMAA_PREVIEW_HOSTS = originalDemaaPreviewHosts;
  process.env.SINI_FORMS_ENABLED = originalSiniFormsEnabled;
});

describe("proxy content security policy", () => {
  it("keeps Reprendre directly on the canonical root and preserves campaign parameters", () => {
    const response = proxy(new NextRequest(
      "https://demaa.fr/?utm_campaign=lancement&utm_source=newsletter",
      { headers: { host: "demaa.fr" } },
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("keeps the parked Specialists universe private and out of search results", () => {
    const response = proxy(new NextRequest("https://demaa.fr/specialistes", {
      headers: { host: "demaa.fr" },
    }));

    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("keeps the English beta disabled by default and marks its response", () => {
    delete process.env.DEMAA_ENGLISH_BETA_ENABLED;
    const response = proxy(new NextRequest("https://demaa.fr/en", {
      headers: { host: "demaa.fr" },
    }));
    expect(response.status).toBe(404);
    expect(response.headers.get("content-language")).toBe("en");
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("keeps the inherited English pages archived even if the old beta flag is enabled", () => {
    process.env.DEMAA_ENGLISH_BETA_ENABLED = "true";
    const english = proxy(new NextRequest("https://demaa.fr/en", {
      headers: { host: "demaa.fr" },
    }));
    expect(english.status).toBe(404);
    expect(english.headers.get("content-language")).toBe("en");
    expect(english.headers.get("x-robots-tag")).toBe("noindex, nofollow");

    const french = proxy(new NextRequest("https://demaa.fr/solutions", {
      headers: { host: "demaa.fr", "x-demaa-locale": "en" },
    }));
    expect(french.headers.get("content-language")).toBe("fr");
    expect(french.status).toBe(404);
    expect(french.headers.get("x-robots-tag")).toBe("noindex, nofollow");
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
      "frame-src 'self' https://airtable.com https://embed.fillout.com https://www.youtube-nocookie.com https://*.firebaseapp.com https://accounts.google.com",
    );
    expect(frameSource).toContain("'self'");
    expect(policy).toContain("https://apis.google.com");
    expect(policy).toContain("https://identitytoolkit.googleapis.com");
    expect(policy).toContain("https://securetoken.googleapis.com");
    expect(policy).toContain("form-action 'self' https://accounts.google.com");
    expect(policy).toContain("https://www.youtube-nocookie.com");
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });

  it("archives the inherited Firebase helper iframe", () => {
    const helperPolicy = buildContentSecurityPolicy({ allowSameOriginFraming: true });
    expect(helperPolicy).toContain("frame-ancestors 'self'");
    expect(helperPolicy).not.toContain("frame-ancestors 'none'");

    const response = proxy(
      new NextRequest("https://demaa.fr/__/auth/iframe", {
        headers: { host: "demaa.fr" },
      }),
    );
    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it.each(["demaa.co", "www.demaa.co", "www.demaa.fr"])(
    "does not claim the separate DEMAA host %s for SINI",
    (host) => {
      const response = proxy(
        new NextRequest(`https://${host}/systemes/restaurant?tab=solutions`, {
          headers: { host },
        }),
      );

      expect(response.status).toBe(404);
      expect(response.headers.get("location")).toBeNull();
    },
  );

  it("archives DEMAA-only APIs instead of exposing them on sini", () => {
    const response = proxy(
      new NextRequest("https://demaa.co/api/systeme-kit/request?source=legacy", {
        headers: { host: "demaa.co" },
        method: "POST",
      }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
  });

  it("blocks inherited demaa cron handlers in the sini deployment", () => {
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

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("does not expose archived admin pages on an allowed Preview alias", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.DEMAA_PREVIEW_HOSTS = "demaa-d094-preview.vercel.app";
    const response = proxy(
      new NextRequest("https://demaa-d094-preview.vercel.app/admin/demandes", {
        headers: { host: "demaa-d094-preview.vercel.app" },
      }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBeNull();
  });

  it("does not choose a canonical domain for an unlisted Preview host before SINI has one", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.DEMAA_PREVIEW_HOSTS = "demaa-d094-preview.vercel.app";
    const response = proxy(
      new NextRequest("https://unrelated.vercel.app/admin/demandes", {
        headers: { host: "unrelated.vercel.app" },
      }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
  });

  it("applies the retired-path 404 without redirecting to DEMAA", () => {
    const response = proxy(
      new NextRequest("https://demaa.co/structuration?source=legacy", {
        headers: { host: "demaa.co" },
      }),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("location")).toBeNull();
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

  it("archives the copyable model detail pages without deleting their source", () => {
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
      publishedSlugs.map(() => 404),
    );
    expect(unknown.status).toBe(404);
    expect(unknown.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("exposes only the sini journeys and hides inherited public hubs", () => {
    for (const pathname of ["/", "/transmettre", "/conseil", "/conseil/entreprise-fonctionner-sans-dirigeant", "/a-reprendre/exemple", "/accompagnement", "/mentions-legales", "/icon", "/opengraph-image"]) {
      const response = proxy(new NextRequest(`https://preview.vercel.app${pathname}`));
      expect(response.status).toBe(200);
    }
    for (const pathname of ["/academie", "/solutions/restaurant", "/tutoriels", "/studio", "/sitemap.xml"]) {
      const response = proxy(new NextRequest(`https://preview.vercel.app${pathname}`));
      expect(response.status).toBe(404);
      expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    }
  });

  it("keeps the six sini form APIs unavailable until the shared delivery backend is enabled", async () => {
    delete process.env.SINI_DEMAA_FORM_BACKEND_ENABLED;
    for (const pathname of [
      "/api/accompaniment-request",
      "/api/business-estimate",
      "/api/reprise-alerts",
      "/api/reprise-alerts/example",
      "/api/reprise-interest",
      "/api/reprise-project",
    ]) {
      const response = proxy(new NextRequest(`https://sini-three.vercel.app${pathname}`, {
        method: "POST",
      }));
      expect(response.status).toBe(503);
      expect(response.headers.get("cache-control")).toContain("no-store");
      expect((await response.json()).error).toContain("pas encore ouvertes");
    }
  });

  it("relays only the allowed sini form APIs to the shared DEMAA backend", () => {
    const original = process.env.SINI_DEMAA_FORM_BACKEND_ENABLED;
    try {
      process.env.SINI_DEMAA_FORM_BACKEND_ENABLED = "true";
      const response = proxy(new NextRequest("https://gosini.fr/api/reprise-interest?source=listing", {
        method: "POST",
        headers: { Origin: "https://gosini.fr" },
      }));
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-rewrite")).toBe("https://demaa.fr/api/reprise-interest?source=listing");
    } finally {
      if (original === undefined) delete process.env.SINI_DEMAA_FORM_BACKEND_ENABLED;
      else process.env.SINI_DEMAA_FORM_BACKEND_ENABLED = original;
    }
  });

  it("never exposes inherited admin, auth and unrelated API routes", () => {
    for (const pathname of ["/admin", "/auth", "/api/systeme-kit/request", "/api/admin/session"]) {
      const response = proxy(new NextRequest(`https://preview.vercel.app${pathname}`));
      expect(response.status).toBe(404);
      expect(response.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    }
  });
});
