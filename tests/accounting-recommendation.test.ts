import { describe, expect, it } from "vitest";

import {
  getAccountingFirmBySlug,
  getSimilarAccountingFirms,
} from "../src/lib/accounting-directory";
import { ACCOUNTING_RECOMMENDATION } from "../src/lib/accounting-recommendation";

describe("accounting recommendation", () => {
  it("uses the canonical EM2A profile everywhere", () => {
    expect(ACCOUNTING_RECOMMENDATION).toEqual({
      firmName: "EM2A Expertise",
      firmSlug: "em2a-expertise",
      profilePath:
        "/annuaire-experts-comptables/cabinets/em2a-expertise",
      profileUrl:
        "https://demaa.fr/annuaire-experts-comptables/cabinets/em2a-expertise",
    });
  });

  it("recommends EM2A from every other accounting profile", async () => {
    const [em2a, anotherFirm] = await Promise.all([
      getAccountingFirmBySlug(ACCOUNTING_RECOMMENDATION.firmSlug),
      getAccountingFirmBySlug("ghm-consulting"),
    ]);

    expect(em2a).not.toBeNull();
    expect(anotherFirm).not.toBeNull();
    expect(await getSimilarAccountingFirms(anotherFirm!)).toEqual([em2a]);
    expect(await getSimilarAccountingFirms(em2a!)).toEqual([]);
  });
});
