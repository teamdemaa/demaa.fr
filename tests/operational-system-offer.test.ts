import { describe, expect, it } from "vitest";
import {
  getOperationalSystemAccessNote,
  getOperationalSystemProductName,
  getOperationalSystemPurchaseLabel,
  OPERATIONAL_SYSTEM_OFFER,
} from "@/lib/operational-system-offer";

describe("operational system commercial contract", () => {
  it("sells one editable system for 49 euros as a one-time payment", () => {
    expect(OPERATIONAL_SYSTEM_OFFER).toMatchObject({
      priceCents: 4_900,
      currency: "eur",
      displayPrice: "49 €",
      paymentMode: "one_time",
      deliveredFormat: "editable_google_sheet",
      emailCapturedAt: "checkout",
    });
  });

  it("keeps the demo free and read-only", () => {
    expect(OPERATIONAL_SYSTEM_OFFER.demoAccess).toBe("free_read_only");
    expect(getOperationalSystemAccessNote()).toBe(
      "Démonstration en lecture seule · Version modifiable après paiement",
    );
  });

  it("does not promise human support or a subscription", () => {
    expect(OPERATIONAL_SYSTEM_OFFER.humanSupportIncluded).toBe(false);
    expect(OPERATIONAL_SYSTEM_OFFER.subscriptionIncluded).toBe(false);
  });

  it("uses the validated public wording", () => {
    expect(getOperationalSystemProductName(" Plomberie & chauffage ")).toBe(
      "Système opérationnel — Plomberie & chauffage",
    );
    expect(getOperationalSystemPurchaseLabel()).toBe(
      "Obtenir le système — 49 €",
    );
  });
});
