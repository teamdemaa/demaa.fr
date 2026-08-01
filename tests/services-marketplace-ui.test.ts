import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("client-only", () => ({}));

import ServiceOfferDetails, { getServicePriceLabel } from "@/components/ServiceOfferDetails";
import {
  acquireServiceRequestSubmission,
  buildServiceRequestPayload,
  submitServiceRequest,
  validateServiceRequestFields,
} from "@/components/ServiceRequestForm";
import ServicesMarketplace from "@/components/ServicesMarketplace";
import { generateStaticParams } from "@/app/services/[slug]/page";
import {
  getPublishedServiceOfferV2BySlug,
  getPublishedServiceOffersV2,
} from "@/lib/service-catalog-v2";
import { publishedServiceOffersFixture } from "./fixtures/published-service-offers";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Services marketplace UI", () => {
  it("keeps the product routes fail-closed while all seven offers are draft", async () => {
    expect(getPublishedServiceOffersV2()).toEqual([]);
    expect(getPublishedServiceOfferV2BySlug("site-vitrine-prise-contact")).toBeNull();
    expect(generateStaticParams()).toEqual([]);

    const indexSource = await readSource("src/app/services/page.tsx");
    const detailSource = await readSource("src/app/services/[slug]/page.tsx");
    expect(indexSource).toContain("if (offers.length === 0) notFound()");
    expect(detailSource).toContain("export const dynamicParams = false");
    expect(detailSource).toContain("if (!offer) notFound()");
  });

  it("renders seven fixture offers in exactly two responsive sections", () => {
    const markup = renderToStaticMarkup(
      createElement(ServicesMarketplace, { offers: publishedServiceOffersFixture }),
    );

    expect(markup).toContain("Structurer et digitaliser votre activité");
    expect(markup).toContain("Développer votre visibilité");
    expect(markup.match(/data-service-offer-card/g)).toHaveLength(7);
    expect(markup.match(/Sur devis/g)).toHaveLength(5);
    expect(markup).toContain("950");
    expect(markup).toContain("490");
    expect(markup).not.toContain("Voir le service");
    expect(markup).not.toMatch(/interne|externe|placeholder|en cours|bientôt/i);
  });

  it("renders only validated DTO scope and the four-field request form", () => {
    const markup = renderToStaticMarkup(
      createElement(ServiceOfferDetails, { offer: publishedServiceOffersFixture[0] }),
    );

    expect(markup).toContain("Résultat attendu");
    expect(markup).toContain("Livrables");
    expect(markup).toContain("Prérequis");
    expect(markup).toContain("Non inclus");
    expect(markup).toContain("Votre participation");
    expect(markup.match(/<(?:input|textarea)\b/g)).toHaveLength(4);
    expect(markup).not.toMatch(/type="tel"|name="phone"|Téléphone/);
    expect(getServicePriceLabel(publishedServiceOffersFixture[0].pricing)).toBe("Sur devis");
    expect(getServicePriceLabel(publishedServiceOffersFixture[2].pricing)).toContain("950");
  });

  it("builds the backend payload without price, phone or raw catalog data", () => {
    const fields = {
      firstName: " Maya ",
      email: " MAYA@ATELIER-MARTIN.FR ",
      company: " Atelier Martin ",
      need: " Créer un site clair. ",
    };
    expect(validateServiceRequestFields(fields)).toEqual({});
    expect(buildServiceRequestPayload(
      fields,
      "site-vitrine-prise-contact",
      "web:service:12345678",
    )).toEqual({
      company: "Atelier Martin",
      email: "maya@atelier-martin.fr",
      firstName: "Maya",
      idempotencyKey: "web:service:12345678",
      marketingConsent: false,
      need: "Créer un site clair.",
      serviceSlug: "site-vitrine-prise-contact",
      systemSlug: null,
    });
    expect(validateServiceRequestFields({ ...fields, email: "maya@gmail.com" })).toEqual({
      email: "Utilisez votre adresse e-mail professionnelle.",
    });
  });

  it("requires the documented 202 JSON success contract", async () => {
    const payload = buildServiceRequestPayload(
      {
        firstName: "Maya",
        email: "maya@atelier-martin.fr",
        company: "Atelier Martin",
        need: "Créer un site clair.",
      },
      "site-vitrine-prise-contact",
      "web:service:12345678",
    );

    await expect(submitServiceRequest(
      "/api/service-request",
      payload,
      async () => new Response("<html>ok</html>", {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }),
    )).rejects.toThrow("service request failed");

    await expect(submitServiceRequest(
      "/api/service-request",
      payload,
      async () => new Response("not-json", {
        status: 202,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }),
    )).rejects.toThrow("service request failed");

    await expect(submitServiceRequest(
      "/api/service-request",
      payload,
      async () => new Response(JSON.stringify({ ok: true, extra: true }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }),
    )).rejects.toThrow("service request failed");

    await expect(submitServiceRequest(
      "/api/service-request",
      payload,
      async () => new Response(JSON.stringify({ ok: true }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      }),
    )).resolves.toBeUndefined();
  });

  it("retries a timeout with the same idempotency key and locks double clicks", async () => {
    const lock = { current: false };
    expect(acquireServiceRequestSubmission(lock)).toBe(true);
    expect(acquireServiceRequestSubmission(lock)).toBe(false);

    const payload = buildServiceRequestPayload(
      {
        firstName: "Maya",
        email: "maya@atelier-martin.fr",
        company: "Atelier Martin",
        need: "Créer un site clair.",
      },
      "site-vitrine-prise-contact",
      "web:service:stable-retry-key",
    );
    const bodies: string[] = [];
    const fetchRequest = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      bodies.push(String(init?.body));
      if (bodies.length === 1) throw new Error("timeout");
      return new Response(JSON.stringify({ ok: true }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      });
    });

    await expect(submitServiceRequest("/api/service-request", payload, fetchRequest))
      .rejects.toThrow("timeout");
    await expect(submitServiceRequest("/api/service-request", payload, fetchRequest))
      .resolves.toBeUndefined();
    expect(bodies.map((body) => JSON.parse(body).idempotencyKey)).toEqual([
      "web:service:stable-retry-key",
      "web:service:stable-retry-key",
    ]);
  });

  it("keeps RSC payloads serializable and server selectors out of clients", async () => {
    expect(JSON.parse(JSON.stringify(publishedServiceOffersFixture))).toEqual(
      publishedServiceOffersFixture,
    );

    const indexSource = await readSource("src/app/services/page.tsx");
    const marketplaceSource = await readSource("src/components/ServicesMarketplace.tsx");
    const detailsSource = await readSource("src/components/ServiceOfferDetails.tsx");
    const formSource = await readSource("src/components/ServiceRequestForm.tsx");
    expect(indexSource).toContain('from "@/lib/service-catalog-v2"');
    for (const source of [marketplaceSource, detailsSource, formSource]) {
      expect(source).not.toMatch(/service-catalog-v2(?:-contract|\.generated)?["']/);
      expect(source).not.toMatch(/service-catalog\.ts|service-catalog"/);
    }
    expect(marketplaceSource).toContain('import type { PublishedServiceOfferDto } from "@/lib/service-catalog-v2-dto"');
  });

  it("preserves modal focus, Escape, reset and form status accessibility", async () => {
    const marketplaceSource = await readSource("src/components/ServicesMarketplace.tsx");
    const dialogSource = await readSource("src/components/DirectoryDetailDialogShell.tsx");
    const hookSource = await readSource("src/components/useAccessibleDialog.ts");
    const formSource = await readSource("src/components/ServiceRequestForm.tsx");

    expect(marketplaceSource).toContain("DirectoryDetailDialogShell");
    expect(marketplaceSource).toContain("setSelected(null)");
    expect(dialogSource).toContain("data-dialog-initial-focus");
    expect(hookSource).toContain('event.key === "Escape"');
    expect(hookSource).toContain('event.key !== "Tab"');
    expect(hookSource).toContain("previouslyFocused?.focus()");
    expect(formSource).toContain("requestAnimationFrame");
    expect(formSource).toContain("submissionInFlightRef");
    expect(formSource).toContain("getLeadSubmissionKey(flowKey)");
    expect(formSource).toContain("getLeadAttributionPayload()");
    expect(formSource.indexOf("await submitServiceRequest(")).toBeLessThan(
      formSource.indexOf("clearLeadSubmissionKey(flowKey)"),
    );
    expect(formSource).not.toMatch(/track\(|gtag|fbq|randomUUID/);
    expect(formSource).toContain('href="/politique-de-confidentialite"');
    expect(formSource).toContain('role="alert"');
    expect(formSource).toContain('role="status"');
  });

  it("keeps rails and pages constrained against horizontal overflow", async () => {
    const marketplaceSource = await readSource("src/components/ServicesMarketplace.tsx");
    const indexSource = await readSource("src/app/services/page.tsx");

    expect(marketplaceSource).toContain("aspect-square min-w-0");
    expect(marketplaceSource).toContain("overflow-x-auto");
    expect(marketplaceSource).toContain("overscroll-x-contain");
    expect(marketplaceSource).toContain("auto-cols-[min(82%,293.55px)]");
    expect(marketplaceSource).toContain("gap-[15.92px]");
    expect(marketplaceSource).toContain("lg:auto-cols-[283.72px]");
    expect((883 - (2 * 15.92)) / 3).toBeCloseTo(283.72, 2);
    expect(marketplaceSource).toContain("{offer.categoryTitle}");
    expect(marketplaceSource).not.toContain("Voir le service");
    expect(marketplaceSource).not.toContain("ArrowRight");
    expect(marketplaceSource).not.toMatch(/\bposition\b/);
    expect(indexSource).toContain("max-w-[883px]");
  });

  it("owns canonical metadata for the index and direct detail page", async () => {
    const indexSource = await readSource("src/app/services/page.tsx");
    const detailSource = await readSource("src/app/services/[slug]/page.tsx");

    expect(indexSource).toContain("export function generateMetadata(): Metadata");
    expect(indexSource).toContain('alternates: { canonical: "/services" }');
    expect(indexSource).toContain('url: "/services"');
    expect(detailSource).toContain("alternates: { canonical }");
    expect(detailSource).toContain("url: canonical");
    expect(detailSource).toContain("if (!offer) notFound()");
    expect(detailSource).not.toContain("robots:");
  });
});
