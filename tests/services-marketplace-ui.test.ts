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

describe("canonical Accompagnement catalog", () => {
  it("publishes exactly the six approved offers from one immutable source", () => {
    const services = getCanonicalServices();

    expect(services.map((service) => service.slug)).toEqual(CANONICAL_SERVICE_SLUGS);
    expect(services.map((service) => service.name)).toEqual([
      "Coach business",
      "Expert-comptable",
      "Automatisation des processus",
      "Gestion des réseaux sociaux",
      "Publicité en ligne",
      "Prospection ciblée",
    ]);
    expect(generateStaticParams()).toEqual(CANONICAL_SERVICE_SLUGS.map((slug) => ({ slug })));
    expect(Object.isFrozen(services)).toBe(true);
    expect(Object.isFrozen(services[0].included)).toBe(true);
    expect(getCanonicalServiceBySlug("ancienne-offre")).toBeNull();
  });

  it("locks the approved pricing and Coach business eligibility", () => {
    expect(getCanonicalServiceBySlug("publicite-en-ligne")?.pricing.label).toBe("750 € HT / mois");
    expect(getCanonicalServiceBySlug("gestion-reseaux-sociaux")?.pricing.label).toBe("Sur devis");
    expect(getCanonicalServiceBySlug("prospection-ciblee")?.pricing.label).toBe("Sur devis");
    expect(getCanonicalServiceBySlug("coach-business")?.monthlyAccompanimentDiscountEligible).toBe(false);
    expect(getCanonicalServiceBySlug("automatisation-processus")?.monthlyAccompanimentDiscountEligible).toBe(true);
    expect(getCanonicalServiceBySlug("expert-comptable")?.monthlyAccompanimentDiscountEligible).toBe(false);
    expect(getCanonicalServiceBySlug("expert-comptable")?.summary).toContain("inscrit à l’Ordre");
  });

  it("places Coach business first without discounting the subscription itself", () => {
    const coach = getCanonicalServiceBySlug("coach-business");
    expect(getCanonicalServices()[0]).toBe(coach);
    expect(coach).toMatchObject({
      cta: { kind: "callback", label: "Être recontacté(e)" },
      monthlyAccompanimentDiscountEligible: false,
      pricing: { label: "À partir de 350 € HT / mois" },
    });
  });

  it("keeps Coach business on the callback journey without public payment", async () => {
    const callbackForm = await readSource("src/components/CoachBusinessCallbackForm.tsx");
    expect(callbackForm).toContain('fetch("/api/coaching-request"');
    expect(callbackForm).toContain("Être rappelé(e)");
    expect(callbackForm).toContain('type="tel"');
    expect(callbackForm).toContain("Entreprise");
    expect(callbackForm).not.toContain("checkout.stripe.com");
    expect(callbackForm).not.toContain("CustomerSpaceAccessForm");
  });

  it("keeps process automation on the simple callback journey", () => {
    const automation = getCanonicalServiceBySlug("automatisation-processus");

    expect(automation).toMatchObject({
      name: "Automatisation des processus",
      pricing: {
        amountMinor: 50000,
        label: "500 € HT / jour",
        mode: "fixed",
      },
      cta: { kind: "callback", label: "Être recontacté(e)" },
    });
  });

  it("publishes the validated accounting price reference", () => {
    expect(getCanonicalServiceBySlug("expert-comptable")?.pricing).toMatchObject({
      amountMinor: 25000,
      heading: "Honoraires du cabinet",
      label: "À partir de 250 € HT / mois",
      mode: "starting",
    });
  });

  it("renders six equal linked accompaniment cards", () => {
    const markup = renderToStaticMarkup(
      createElement(ServicesCatalog, { services: getCanonicalServices() }),
    );

    expect(markup.match(/<article/g)).toHaveLength(6);
    for (const slug of CANONICAL_SERVICE_SLUGS) {
      expect(markup).toContain(`/services/${slug}`);
    }
    expect(markup).toContain("750 € HT / mois");
    expect(markup).toContain("500 € HT / jour");
    expect(markup).toContain("À partir de 250 € HT / mois");
    expect(markup).toContain("Coach business");
    expect(markup).toContain("À partir de 350 € HT / mois");
    expect(markup).toContain("−12 % sur les accompagnements Demaa");
    expect(markup).toContain("−12 % avec un accompagnement mensuel");
    expect(markup).not.toContain("−15 %");
    expect(markup.indexOf("−12 % avec un accompagnement mensuel"))
      .toBeGreaterThan(markup.indexOf("500 € HT / jour"));
    expect(markup).not.toContain("Découvrir le service");
  });

  it("keeps the callback form strict to company and phone", async () => {
    expect(validateCallbackFields({
      company: "Atelier Martin",
      phone: "+33 6 12 34 56 78",
      website: "",
    })).toEqual({});
    expect(validateCallbackFields({ company: "", phone: "123", website: "" })).toEqual({
      company: "Indiquez le nom de votre entreprise.",
      phone: "Indiquez un numéro WhatsApp valide.",
    });
    expect(isValidCallbackPhone("+33 (0)6 12 34 56 78")).toBe(true);
    expect(isValidCallbackPhone("javascript:alert(1)")).toBe(false);

    const formSource = await readSource("src/components/ServiceCallbackForm.tsx");
    expect(formSource).toContain('name="company"');
    expect(formSource).toContain('name="phone"');
    expect(formSource).toContain("Numéro WhatsApp");
    expect(formSource).toContain("uniquement au sujet de cette demande");
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
    const [layout, modalDefault, modalPage, routeDialog, systemSolutions, serviceDetails] = await Promise.all([
      readSource("src/app/layout.tsx"),
      readSource("src/app/@modal/default.tsx"),
      readSource("src/app/@modal/(.)services/[slug]/page.tsx"),
      readSource("src/components/ServiceRouteDialog.tsx"),
      readSource("src/components/SystemSolutionsTab.tsx"),
      readSource("src/components/CanonicalServiceDetails.tsx"),
    ]);

    expect(layout).toContain("modal: React.ReactNode");
    expect(layout).toContain("{modal}");
    expect(modalDefault).toContain("return null");
    expect(modalPage).toContain("ServiceRouteDialog");
    expect(modalPage).toContain('variant="modal"');
    expect(modalPage).toContain("if (!service) notFound()");
    expect(modalPage).not.toContain("dynamicParams = false");
    expect(routeDialog).toContain("router.back()");
    expect(routeDialog).toContain('maxWidthClassName="max-w-3xl"');
    expect(systemSolutions).toContain('placement.section === "services"');
    expect(systemSolutions).toContain('href={resource.interaction.href}');
    expect(serviceDetails).toContain('className="mt-7 grid min-w-0 gap-6"');
    expect(serviceDetails).not.toContain(
      "lg:grid-cols-[minmax(0,1fr)_18rem]",
    );
  });
});
