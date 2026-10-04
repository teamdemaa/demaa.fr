import SystemsHubPage from "@/components/SystemsHubPage";
import { getEnterpriseCatalog } from "@/lib/enterprise-annuaire-server";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";

const title = "Outils et logiciels adaptés à votre activité | Demaa";
const description =
  "Choisissez votre activité pour découvrir et comparer les logiciels utiles à votre entreprise.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/outils",
});

export default async function ToolsPage() {
  const enterprises = await getEnterpriseCatalog();
  const jsonLd = buildPublicIndexJsonLd({
    name: "Outils",
    description,
    path: "/outils",
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
      <SystemsHubPage enterprises={enterprises} />
    </>
  );
}
