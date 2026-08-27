import { describe, expect, it } from "vitest";
import {
  buildPublicPageMetadata,
  PUBLIC_SOCIAL_IMAGE,
} from "@/lib/public-page-metadata";

describe("public page metadata", () => {
  it("keeps canonical, Open Graph and Twitter metadata aligned", () => {
    const metadata = buildPublicPageMetadata({
      title: "Titre de test | Demaa",
      description: "Description de test.",
      path: "/page-test",
      type: "article",
      keywords: ["test", "Demaa"],
    });

    expect(metadata.alternates).toEqual({ canonical: "/page-test" });
    expect(metadata.openGraph).toMatchObject({
      title: "Titre de test | Demaa",
      description: "Description de test.",
      url: "/page-test",
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
      images: [PUBLIC_SOCIAL_IMAGE],
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Titre de test | Demaa",
      description: "Description de test.",
      images: ["/twitter-image"],
    });
  });
});
