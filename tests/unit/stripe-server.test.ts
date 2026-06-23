import { describe, expect, it } from "vitest";
import {
  getStripeCartSummary,
  getStripeCredits,
  getStripeCustomerEmail,
  getStripeCustomerName,
  getStripeMetadataList,
  getStripeOfferLabel,
  isStripeSessionPaid,
} from "@/lib/stripe-server";

describe("stripe-server helpers", () => {
  const session = {
    payment_status: "paid",
    status: "open",
    customer_email: "fallback@demaa.fr",
    customer_details: {
      email: "client@demaa.fr",
      name: "Client Demaa",
    },
    metadata: {
      credits: "12",
      offer_label: "Pack Credits",
      cart_summary: "Pack Credits x 12",
      service_slugs: "creation-societe, fermeture-societe",
    },
  };

  it("extracts paid status from Stripe session", () => {
    expect(isStripeSessionPaid(session)).toBe(true);
    expect(isStripeSessionPaid({ payment_status: "unpaid", status: "complete" })).toBe(true);
    expect(isStripeSessionPaid({ payment_status: "unpaid", status: "open" })).toBe(false);
  });

  it("reads customer information with proper fallbacks", () => {
    expect(getStripeCustomerEmail(session)).toBe("client@demaa.fr");
    expect(getStripeCustomerName(session)).toBe("Client Demaa");
    expect(getStripeCustomerEmail({ customer_email: "fallback@demaa.fr" })).toBe("fallback@demaa.fr");
  });

  it("extracts labels, summaries, credits, and metadata lists", () => {
    expect(getStripeOfferLabel(session, "Offre Demaa")).toBe("Pack Credits");
    expect(getStripeCartSummary(session, "Offre Demaa")).toBe("Pack Credits x 12");
    expect(getStripeCredits(session)).toBe(12);
    expect(getStripeMetadataList(session.metadata?.service_slugs)).toEqual([
      "creation-societe",
      "fermeture-societe",
    ]);
  });
});
