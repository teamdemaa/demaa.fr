import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getLocalizedCanonicalService,
  getLocalizedCanonicalServices,
} from "@/lib/localized-service-catalog.server";
import {
  ENGLISH_BETA_CONTEXT,
  FRANCE_COMMERCIAL_CONTEXT,
  createInternationalContext,
  normalizeCurrencyCode,
} from "@/lib/international-context";

describe("localized canonical Services", () => {
  it("publishes only the five market-approved services in the global English beta", () => {
    expect(getLocalizedCanonicalServices(ENGLISH_BETA_CONTEXT).map(({ slug }) => slug)).toEqual([
      "automatisation-processus",
      "application-metier",
      "coach-business",
      "publicite-en-ligne",
      "prospection-ciblee",
    ]);
  });

  it("keeps the complete French market catalogue under an English interface", () => {
    const context = createInternationalContext("en", FRANCE_COMMERCIAL_CONTEXT);
    const services = getLocalizedCanonicalServices(context);

    expect(services).toHaveLength(9);
    expect(services.find(({ slug }) => slug === "expert-comptable")?.name)
      .toBe("Qualified accountant in France");
    expect(services.find(({ slug }) => slug === "formalites-entreprise")?.name)
      .toBe("French company formalities");
  });

  it("formats canonical numeric prices without translating price strings", () => {
    const automation = getLocalizedCanonicalService(
      "automatisation-processus",
      ENGLISH_BETA_CONTEXT,
    );
    const coaching = getLocalizedCanonicalService(
      "coach-business",
      ENGLISH_BETA_CONTEXT,
    );

    expect(automation?.packages.map(({ pricing }) => pricing.label)).toEqual([
      "€1,500 excl. VAT",
      "€3,000 excl. VAT",
    ]);
    expect(coaching?.pricing).toMatchObject({
      amountMinor: 75000,
      currency: "EUR",
      label: "€750 excl. VAT / month",
    });
  });

  it("fails closed for a service unavailable in the selected market", () => {
    expect(getLocalizedCanonicalService("expert-comptable", ENGLISH_BETA_CONTEXT)).toBeNull();
    expect(getLocalizedCanonicalService("unknown", ENGLISH_BETA_CONTEXT)).toBeNull();
  });

  it("does not relabel an EUR amount as another currency without a market price", () => {
    const currencyCode = normalizeCurrencyCode("USD");
    expect(currencyCode).not.toBeNull();
    expect(getLocalizedCanonicalService("coach-business", {
      ...ENGLISH_BETA_CONTEXT,
      currencyCode: currencyCode!,
    })).toBeNull();
  });
});
