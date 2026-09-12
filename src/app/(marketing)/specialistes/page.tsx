import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import SpecialistsCatalog from "@/components/SpecialistsCatalog";
import StructureNewsletterBlock from "@/components/StructureNewsletterBlock";
import { getSpecialistSections } from "@/lib/specialist-catalog";
import {
  buildPublicIndexJsonLd,
  serializePublicJsonLd,
} from "@/lib/public-index-json-ld";
import { buildPublicPageMetadata } from "@/lib/public-page-metadata";
import { PUBLIC_SPECIALISTS_ENABLED } from "@/lib/public-feature-flags";

const title = "Spécialistes pour structurer et développer votre entreprise | Demaa";
const description =
  "Trouvez la prestation adaptée pour automatiser, structurer, administrer ou développer votre entreprise, avec un périmètre clair avant de démarrer.";

export const metadata = buildPublicPageMetadata({
  title,
  description,
  path: "/specialistes",
});

export default function SpecialistsPage() {
  if (!PUBLIC_SPECIALISTS_ENABLED) notFound();

  const sections = getSpecialistSections();
  const services = sections.flatMap((section) => section.services);
  const jsonLd = buildPublicIndexJsonLd({
    name: "Spécialistes",
    description,
    path: "/specialistes",
    items: services.map((service) => ({
      name: service.name,
      path: service.detailHref,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializePublicJsonLd(jsonLd) }}
      />
      <Navbar minimal publicNavigationActiveView="services" />
      <main className="min-h-screen min-w-0 bg-dema-cream">
        <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16 lg:px-8">
          <h1
            aria-label="Faites avancer votre entreprise avec le bon spécialiste"
            className="text-balance font-light leading-[0.94] tracking-tight"
            style={{ fontSize: "clamp(2.4rem, 6.8vw, 4.6rem)" }}
          >
            <span aria-hidden="true">
              <span className="block text-brand-blue/62">Faites avancer votre entreprise</span>
              <span className="demaa-hero-title block text-dema-forest">
                avec le bon spécialiste
              </span>
            </span>
          </h1>
        </header>
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <SpecialistsCatalog sections={sections} />
        </div>
        <div className="px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          <StructureNewsletterBlock />
        </div>
      </main>
    </>
  );
}
