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
import { generateStaticParams } from "@/app/(marketing)/services/[slug]/page";
import {
  CANONICAL_SERVICE_SLUGS,
  HIDDEN_CANONICAL_SERVICE_SLUGS,
  getCanonicalServiceBySlug,
  getCanonicalServiceRecordBySlug,
  getCanonicalServiceRecords,
  getCanonicalServices,
} from "@/lib/canonical-service-catalog";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("canonical Accompagnement catalog", () => {
  it("keeps ten canonical records and publishes only the nine visible offers", () => {
    const services = getCanonicalServices();

    expect(getCanonicalServiceRecords().map((service) => service.slug))
      .toEqual(CANONICAL_SERVICE_SLUGS);
    expect(HIDDEN_CANONICAL_SERVICE_SLUGS.every((slug) =>
      CANONICAL_SERVICE_SLUGS.includes(slug)
    )).toBe(true);
    expect(services.map((service) => service.name)).toEqual([
      "Automatisation des processus et IA",
      "Application métier",
      "Coach business",
      "Assistante administrative",
      "Formalités d’entreprise",
      "Gestion des réseaux sociaux",
      "Publicité en ligne",
      "Prospection ciblée",
      "Recruter un alternant",
    ]);
    expect(generateStaticParams()).toEqual(
      CANONICAL_SERVICE_SLUGS
        .filter((slug) => !["application-metier", "expert-comptable"].includes(slug))
        .map((slug) => ({ slug })),
    );
    expect(getCanonicalServiceBySlug("expert-comptable")).toBeNull();
    expect(getCanonicalServiceRecordBySlug("expert-comptable")?.name)
      .toBe("Expert-comptable");
    expect(Object.isFrozen(services)).toBe(true);
    expect(Object.isFrozen(services[0].included)).toBe(true);
    expect(getCanonicalServiceBySlug("ancienne-offre")).toBeNull();
  });

  it("locks the approved pricing and Coach business eligibility", () => {
    expect(getCanonicalServiceBySlug("publicite-en-ligne")?.pricing?.label).toBe("750 € HT / mois");
    expect(getCanonicalServiceBySlug("gestion-reseaux-sociaux")?.pricing).toMatchObject({
      amountMinor: 80000,
      label: "800 € HT / mois",
      mode: "fixed",
    });
    expect(getCanonicalServiceBySlug("prospection-ciblee")?.pricing).toMatchObject({
      amountMinor: 150000,
      label: "1 500 € HT / mois",
      mode: "fixed",
    });
    expect(getCanonicalServiceBySlug("assistance-administrative")?.pricing).toMatchObject({
      amountMinor: 50000,
      label: "À partir de 500 € HT / mois",
      mode: "starting",
    });
    expect(getCanonicalServiceBySlug("assistance-administrative")?.pricing?.note).toContain("20 heures");
    expect(getCanonicalServiceBySlug("assistance-administrative")?.pricing?.note).toContain("25 € HT");
    expect(getCanonicalServiceBySlug("coach-business")?.monthlyAccompanimentDiscountEligible).toBe(false);
    expect(getCanonicalServiceBySlug("automatisation-processus")?.monthlyAccompanimentDiscountEligible).toBe(true);
    expect(getCanonicalServiceRecordBySlug("expert-comptable")?.monthlyAccompanimentDiscountEligible).toBe(false);
    expect(getCanonicalServiceRecordBySlug("expert-comptable")?.summary).toContain("inscrit à l’Ordre");
    expect(getCanonicalServiceBySlug("formalites-entreprise")).toMatchObject({
      delivery: "third-party",
      monthlyAccompanimentDiscountEligible: false,
      pricing: { label: "Sur devis" },
    });
    expect(getCanonicalServiceBySlug("recruter-un-alternant")).toMatchObject({
      delivery: "third-party",
      monthlyAccompanimentDiscountEligible: false,
      pricing: {
        amountMinor: 0,
        label: "Gratuit",
        mode: "fixed",
      },
    });
    for (const slug of [
      "gestion-reseaux-sociaux",
      "publicite-en-ligne",
      "prospection-ciblee",
    ] as const) {
      expect(getCanonicalServiceBySlug(slug)).toMatchObject({
        delivery: "third-party",
        monthlyAccompanimentDiscountEligible: false,
      });
      expect(getCanonicalServiceBySlug(slug)?.description).toContain(
        "organise la mise en relation",
      );
      expect(getCanonicalServiceBySlug(slug)?.pricing?.note).toContain(
        "facture directement son intervention",
      );
    }
  });

  it("places Automation first and keeps Coach business undiscounted", () => {
    const coach = getCanonicalServiceBySlug("coach-business");
    expect(getCanonicalServices()[0]?.slug).toBe("automatisation-processus");
    expect(coach).toMatchObject({
      cta: { kind: "callback", label: "Envoyer ma demande" },
      monthlyAccompanimentDiscountEligible: false,
      pricing: {
        amountMinor: 75000,
        label: "750 € HT / mois",
        mode: "fixed",
      },
    });
  });

  it("keeps Coach business on the callback journey without public payment", async () => {
    const callbackForm = await readSource("src/components/CoachBusinessCallbackForm.tsx");
    expect(callbackForm).toContain('fetch("/api/coaching-request"');
    expect(callbackForm).toContain("Être rappelé(e)");
    expect(callbackForm).toContain('requestKind: "accompaniment"');
    expect(callbackForm).toContain('offer: COACH_BUSINESS_OFFER');
    expect(callbackForm).toContain('type="tel"');
    expect(callbackForm).toContain("Entreprise");
    expect(callbackForm).not.toContain("Rythme envisagé");
    expect(callbackForm).not.toContain("pilotage_1");
    expect(callbackForm).not.toContain("pilotage_2");
    expect(callbackForm).not.toContain("checkout.stripe.com");
    expect(callbackForm).not.toContain("CustomerSpaceAccessForm");
  });

  it("packages process automation and the business application without a checkout", () => {
    const automation = getCanonicalServiceBySlug("automatisation-processus");
    const application = getCanonicalServiceBySlug("application-metier");

    expect(automation).toMatchObject({
      name: "Automatisation des processus et IA",
      pricing: null,
      cta: { kind: "callback", label: "Envoyer ma demande" },
    });
    expect(automation?.packages.map(({ slug, pricing }) => [slug, pricing.amountMinor])).toEqual([
      ["automatisation-essentielle", 150000],
      ["automatisation-avancee-ia", 300000],
    ]);
    expect(automation?.packages[0]).toMatchObject({
      name: "Automatisation essentielle + IA",
    });
    expect(automation?.packages[0]?.included).toContain(
      "Un usage IA simple et contrôlé lorsqu’il est pertinent",
    );
    expect(application).toMatchObject({
      detailHref: "/sur-mesure",
      name: "Application métier",
      pricing: null,
    });
    expect(application?.packages.map(({ slug, pricing }) => [slug, pricing.amountMinor])).toEqual([
      ["application-metier-essentielle", 450000],
      ["application-metier-avancee", 750000],
    ]);
  });

  it("retains the hidden accounting price only in the historical record", () => {
    expect(getCanonicalServiceRecordBySlug("expert-comptable")?.pricing).toMatchObject({
      amountMinor: 25000,
      heading: "Honoraires du cabinet",
      label: "À partir de 250 € HT / mois",
      mode: "starting",
    });
  });

  it("renders two direct Demaa services followed by seven trusted-partner services", async () => {
    const markup = renderToStaticMarkup(
      createElement(ServicesCatalog, { services: getCanonicalServices() }),
    );
    const [
      academySource,
      catalogSource,
      opportunitySource,
      sharedCardTitleSource,
      systemSolutionsSource,
    ] = await Promise.all([
      readSource("src/components/AcademyIndexClient.tsx"),
      readSource("src/components/ServicesCatalog.tsx"),
      readSource("src/components/PublicOpportunitiesClient.tsx"),
      readSource("src/lib/library-card-ui.ts"),
      readSource("src/components/SystemSolutionsTab.tsx"),
    ]);

    expect(markup.match(/<article/g)).toHaveLength(9);
    expect(getCanonicalServices().filter(({ delivery }) => delivery === "demaa")).toHaveLength(2);
    expect(getCanonicalServices().filter(({ delivery }) => delivery === "third-party")).toHaveLength(7);
    for (const service of getCanonicalServices()) {
      expect(markup).toContain(service.detailHref);
    }
    expect(markup).toContain("/sur-mesure");
    expect(markup).toContain("Coach business");
    expect(markup).toContain("Assistante administrative");
    expect(markup).toContain("Recruter un alternant");
    expect(markup).not.toContain("Expert-comptable");
    expect(markup).toContain("À partir de 1 500 € HT");
    expect(markup).toContain("À partir de 4 500 € HT");
    expect(markup).toContain("750 € HT / mois");
    expect(markup).toContain("Sur devis");
    expect(markup).toContain("Gratuit");
    expect(markup).toContain("Nos accompagnements");
    expect(markup).toContain("Conçus et réalisés directement par Demaa.");
    expect(markup).toContain("Avec nos partenaires de confiance");
    expect(markup).toContain("Demaa qualifie votre besoin et organise la mise en relation.");
    expect(markup).toContain("<details");
    expect(markup).toContain("<summary");
    expect(markup).not.toContain("<details open");
    expect(markup).toContain('<details class="group">');
    expect(markup).not.toContain(
      'group rounded-[1.25rem] border border-dema-line bg-dema-paper',
    );
    expect(markup).not.toContain("Catalogue Demaa");
    expect(markup).not.toContain("L’accompagnement utile, au même endroit");
    expect(markup).not.toContain("Le professionnel confirme son tarif et facture directement son intervention.");
    expect(markup.indexOf("Nos accompagnements")).toBeLessThan(
      markup.indexOf("Avec nos partenaires de confiance"),
    );
    expect(markup.indexOf("Assistante administrative")).toBeLessThan(
      markup.indexOf("Coach business"),
    );
    expect(markup.indexOf("Coach business")).toBeLessThan(
      markup.indexOf("Recruter un alternant"),
    );
    expect(markup).not.toMatch(/Avantage abonné|−12 %/);
    expect(markup).not.toContain("−15 %");
    expect(markup).not.toContain("Découvrir le service");
    expect(catalogSource).toContain("service.pricing.label");
    expect(catalogSource).toContain('service.delivery === "demaa"');
    expect(catalogSource).toContain('service.delivery === "third-party"');
    expect(catalogSource).toContain("<details");
    expect(catalogSource).toContain("<summary");
    expect(catalogSource).toContain("group-open:rotate-180");
    expect(catalogSource).not.toContain("<details open");
    for (const source of [academySource, catalogSource, opportunitySource]) {
      expect(source).toContain("LIBRARY_CARD_TITLE_CLASSNAME");
    }
    expect(sharedCardTitleSource).toContain("text-[1.05rem] font-normal leading-[1.3]");
    expect(sharedCardTitleSource).toContain("sm:text-lg");
    expect(catalogSource).toContain('className="text-xl font-normal leading-[1.3] text-brand-blue"');
    expect(catalogSource).toContain("<h2");
    expect(catalogSource).toContain("<h3");
    expect(catalogSource).not.toContain("<h4");
    expect(catalogSource).toContain("mt-6 text-sm font-normal text-dema-muted md:mt-auto md:pt-5");
    expect(catalogSource).toContain('className="min-w-0 md:h-[19rem]"');
    expect(catalogSource).not.toContain('className="h-[19rem] min-w-0"');
    expect(systemSolutionsSource).not.toContain("service.pricing.label");
    for (const source of [catalogSource, systemSolutionsSource]) {
      expect(source).not.toContain("mt-auto shrink-0 border-t");
      expect(source).not.toContain("Avantage abonné : −12 %");
    }
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
    expect(formSource).toContain('name="packageSlug"');
    expect(formSource).toContain('disabled={status === "submitting"}');
    expect(formSource).toContain('sourcePage: pathname');
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
      "src/app/(marketing)/services/page.tsx",
      "src/app/(marketing)/services/[slug]/page.tsx",
      "src/app/@modal/(.)services/[slug]/page.tsx",
      "src/app/@modal/(.)sur-mesure/page.tsx",
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
    const [layout, modalDefault, modalPage, applicationModalPage, routeDialog, systemSolutions, serviceDetails, actionPlanServices] = await Promise.all([
      readSource("src/app/layout.tsx"),
      readSource("src/app/@modal/default.tsx"),
      readSource("src/app/@modal/(.)services/[slug]/page.tsx"),
      readSource("src/app/@modal/(.)sur-mesure/page.tsx"),
      readSource("src/components/ServiceRouteDialog.tsx"),
      readSource("src/components/SystemSolutionsTab.tsx"),
      readSource("src/components/CanonicalServiceDetails.tsx"),
      readSource("src/components/ActionPlanServicesPanel.tsx"),
    ]);

    expect(layout).toContain("modal: React.ReactNode");
    expect(layout).toContain("{modal}");
    expect(modalDefault).toContain("return null");
    expect(modalPage).toContain("ServiceRouteDialog");
    expect(modalPage).toContain('variant="modal"');
    expect(modalPage).toContain("if (!service || service.detailHref");
    expect(modalPage).not.toContain("dynamicParams = false");
    expect(applicationModalPage).toContain('getCanonicalServiceBySlug("application-metier")');
    expect(applicationModalPage).toContain("ServiceRouteDialog");
    expect(routeDialog).toContain("router.back()");
    expect(routeDialog).toContain('maxWidthClassName="max-w-3xl"');
    expect(systemSolutions).toContain('placement.section === "services"');
    expect(systemSolutions).toContain('href={resource.interaction.href}');
    expect(systemSolutions).not.toContain('resource.interaction.href.startsWith("/services/")');
    expect(serviceDetails).toContain('className="mt-7 grid min-w-0 gap-6"');
    expect(serviceDetails).not.toContain(
      "lg:grid-cols-[minmax(0,1fr)_18rem]",
    );
    expect(serviceDetails).toContain('<div className="pr-12">');
    expect(actionPlanServices).not.toContain('<div className="pr-12">');
  });
});
