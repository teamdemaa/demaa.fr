import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("client-only", () => ({}));

import ServicesCatalog from "@/components/ServicesCatalog";
import {
  isValidCallbackPhone,
  submitCallbackRequest,
  validateCallbackFields,
} from "@/components/ServiceCallbackForm";
import { generateStaticParams } from "@/app/services/[slug]/page";
import {
  CANONICAL_SERVICE_SLUGS,
  getCanonicalServiceBySlug,
  getCanonicalServices,
} from "@/lib/canonical-service-catalog";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("canonical Services marketplace", () => {
  it("publishes exactly the four approved services from one immutable source", () => {
    const services = getCanonicalServices();

    expect(services.map((service) => service.slug)).toEqual(CANONICAL_SERVICE_SLUGS);
    expect(services.map((service) => service.name)).toEqual([
      "Automatisation des processus",
      "Expert-comptable",
      "Marketing et prospection",
      "Assistance facturation",
    ]);
    expect(generateStaticParams()).toEqual(CANONICAL_SERVICE_SLUGS.map((slug) => ({ slug })));
    expect(Object.isFrozen(services)).toBe(true);
    expect(Object.isFrozen(services[0].included)).toBe(true);
    expect(getCanonicalServiceBySlug("ancienne-offre")).toBeNull();
  });

  it("locks the approved marketing commercial terms", () => {
    const marketing = getCanonicalServiceBySlug("marketing-vente");

    expect(marketing?.pricing).toEqual({
      amountMinor: 95000,
      currency: "EUR",
      heading: "Tarif",
      label: "950 € HT / mois",
      mode: "fixed-monthly",
      note: "Engagement initial de trois mois, puis reconduction mensuelle.",
    });
    expect(marketing?.conditions).toContain("Engagement initial de trois mois");
    expect(marketing?.included).toContain("Rapport d’avancement chaque semaine");
    expect(marketing?.included).toContain("Point de pilotage mensuel");
    expect(marketing?.included).toContain(
      "Espace d’échange dédié avec une réponse sous 24 à 48 heures",
    );
    expect(marketing?.cta).toEqual({
      kind: "callback",
      label: "Être rappelé",
    });
  });

  it("places process automation first with the simple callback journey", () => {
    const automation = getCanonicalServiceBySlug("automatisation-processus");

    expect(getCanonicalServices()[0]).toBe(automation);
    expect(automation).toMatchObject({
      name: "Automatisation des processus",
      pricing: {
        amountMinor: 50000,
        label: "500 € HT / jour",
        mode: "fixed-daily",
      },
      cta: { kind: "callback", label: "Être rappelé" },
    });
  });

  it("publishes the validated billing and accounting price references", () => {
    expect(getCanonicalServiceBySlug("assistance-facturation")?.pricing).toMatchObject({
      amountMinor: 50000,
      hourlyRateMinor: 2500,
      includedHours: 20,
      label: "500 € HT / mois",
      mode: "fixed-monthly-hours",
    });
    expect(getCanonicalServiceBySlug("expert-comptable")?.pricing).toMatchObject({
      amountMinor: 25000,
      heading: "Honoraires du cabinet",
      label: "À partir de 250 € HT / mois",
      mode: "third-party-starting-monthly",
    });
  });

  it("renders four linked cards without exposing retired catalog prices", () => {
    const markup = renderToStaticMarkup(
      createElement(ServicesCatalog, { services: getCanonicalServices() }),
    );

    expect(markup.match(/<article/g)).toHaveLength(4);
    for (const slug of CANONICAL_SERVICE_SLUGS) {
      expect(markup).toContain(`/services/${slug}`);
    }
    expect(markup).toContain("950 € HT / mois");
    expect(markup).toContain("500 € HT / jour");
    expect(markup).toContain("À partir de 250 € HT / mois");
    expect(markup).not.toMatch(/750 €|350 €|600 €|490 €/);
  });

  it("keeps the callback form strict to company and phone", async () => {
    expect(validateCallbackFields({
      company: "Atelier Martin",
      phone: "+33 6 12 34 56 78",
      website: "",
    })).toEqual({});
    expect(validateCallbackFields({ company: "", phone: "123", website: "" })).toEqual({
      company: "Indiquez le nom de votre entreprise.",
      phone: "Indiquez un numéro de téléphone valide.",
    });
    expect(isValidCallbackPhone("+33 (0)6 12 34 56 78")).toBe(true);
    expect(isValidCallbackPhone("javascript:alert(1)")).toBe(false);

    const formSource = await readSource("src/components/ServiceCallbackForm.tsx");
    expect(formSource).toContain('name="company"');
    expect(formSource).toContain('name="phone"');
    expect(formSource).not.toContain('name="email"');
    expect(formSource).not.toContain('name="firstName"');
  });

  it("requires a strict 202 JSON acknowledgement", async () => {
    await expect(submitCallbackRequest({}, async () => new Response("ok", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    }))).rejects.toThrow("callback request failed");

    await expect(submitCallbackRequest({}, async () => Response.json(
      { ok: true, leadId: "private" },
      { status: 202 },
    ))).rejects.toThrow("callback request failed");

    await expect(submitCallbackRequest({}, async () => Response.json(
      { ok: true },
      { status: 202 },
    ))).resolves.toBeUndefined();
  });

  it("keeps legacy catalogs out of every canonical public Services module", async () => {
    const publicModules = await Promise.all([
      "src/app/services/page.tsx",
      "src/app/services/[slug]/page.tsx",
      "src/app/@modal/(.)services/[slug]/page.tsx",
      "src/components/CanonicalServiceDetails.tsx",
      "src/components/ServicesCatalog.tsx",
      "src/components/ServicesLandingPage.tsx",
      "src/lib/services-seo.ts",
    ].map(readSource));

    for (const source of publicModules) {
      expect(source).not.toMatch(/service-catalog-v2|services-page-catalog/);
      expect(source).not.toMatch(/from ["']@\/lib\/service-catalog["']/);
    }
    expect(publicModules.join("\n")).toContain("canonical-service-catalog");
  });

  it("implements the documented intercepted modal contract", async () => {
    const [layout, modalDefault, modalPage, routeDialog, systemSolutions] = await Promise.all([
      readSource("src/app/layout.tsx"),
      readSource("src/app/@modal/default.tsx"),
      readSource("src/app/@modal/(.)services/[slug]/page.tsx"),
      readSource("src/components/ServiceRouteDialog.tsx"),
      readSource("src/components/SystemSolutionsTab.tsx"),
    ]);

    expect(layout).toContain("modal: React.ReactNode");
    expect(layout).toContain("{modal}");
    expect(modalDefault).toContain("return null");
    expect(modalPage).toContain("ServiceRouteDialog");
    expect(modalPage).toContain('variant="modal"');
    expect(routeDialog).toContain("router.back()");
    expect(routeDialog).toContain('maxWidthClassName="max-w-3xl"');
    expect(systemSolutions).toContain('group.section === "services"');
    expect(systemSolutions).toContain('href={resource.interaction.href}');
  });
});
