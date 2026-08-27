import SystemsHubPage from "@/components/SystemsHubPage";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Solutions adaptées à votre activité | Demaa";
const description =
  "Choisissez votre activité pour découvrir les outils, fournisseurs, financements, aides et réseaux professionnels adaptés à votre entreprise.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/solutions",
});

export default async function SolutionsPage() {
  const enterprises = await getEnterpriseCatalog();
  const jsonLd = buildPublicIndexJsonLd({
    name: "Solutions",
    description,
    path: "/solutions",
    items: enterprises.map((enterprise) => ({
      name: enterprise.name,
      path: `/solutions/${enterprise.slug}`,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializePublicJsonLd(jsonLd) }}
      />
      <SystemsHubPage />
    </>
  );
}
