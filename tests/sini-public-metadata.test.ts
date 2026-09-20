import { describe, expect, it } from "vitest";
import { metadata as sellerMetadata } from "@/app/(marketing)/transmettre/page";
import { generateMetadata as opportunityMetadata } from "@/app/(marketing)/a-reprendre/[slug]/page";
import { repriseOpportunities } from "@/lib/reprise-opportunities";

describe("sini public page metadata before domain launch", () => {
  it("brands the seller journey as sini and leaves it unindexed", () => {
    expect(sellerMetadata.title).toBe("Vendre son entreprise | sini");
    expect(sellerMetadata.robots).toMatchObject({ index: false, follow: false });
    expect(sellerMetadata.openGraph).toMatchObject({ siteName: "sini" });
    expect(sellerMetadata.alternates).toBeUndefined();
  });

  it("brands direct opportunity pages as sini without a demaa canonical", async () => {
    const metadata = await opportunityMetadata({
      params: Promise.resolve({ slug: repriseOpportunities[0].id }),
    });

    expect(metadata.title).toContain("| sini");
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(metadata.openGraph).toMatchObject({ siteName: "sini" });
    expect(metadata.alternates).toBeUndefined();
  });
});
