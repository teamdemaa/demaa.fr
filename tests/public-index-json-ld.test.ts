import { describe, expect, it } from "vitest";
import {
  buildPublicIndexJsonLd,
  buildSiteIdentityJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";

describe("public structured data", () => {
  it("describes Demaa as one organization and one website", () => {
    const jsonLd = buildSiteIdentityJsonLd();
    const types = jsonLd["@graph"].map((entry) => entry["@type"]);

    expect(types).toEqual(["Organization", "WebSite"]);
  });

  it("describes an index as a collection, breadcrumb and ordered list", () => {
    const jsonLd = buildPublicIndexJsonLd({
      name: "Modèles à copier",
      description: "Description",
      path: "/modeles",
      items: [
        { name: "CRM", path: "/modeles/crm" },
        { name: "Chantiers", path: "/modeles/chantiers" },
      ],
    });

    expect(jsonLd.map((entry) => entry["@type"])).toEqual([
      "CollectionPage",
      "BreadcrumbList",
      "ItemList",
    ]);
    expect(jsonLd[2]).toMatchObject({ numberOfItems: 2 });
  });

  it("escapes markup before injecting JSON-LD", () => {
    expect(serializePublicJsonLd({ value: "<script>" })).toContain("\\u003cscript>");
  });
});
