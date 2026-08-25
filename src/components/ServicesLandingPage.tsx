import Navbar from "@/components/Navbar";
import ServicesCatalog from "@/components/ServicesCatalog";
import { getCanonicalServices } from "@/lib/canonical-service-catalog";

export default function ServicesLandingPage() {
  const services = getCanonicalServices();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream">
        <header className="border-b border-dema-line/65 px-5 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="mx-auto max-w-4xl text-balance text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl lg:text-6xl">
              Des services pour gagner du temps et{" "}
              <span className="demaa-section-title text-dema-forest">
                faire en sorte que votre entreprise dépende moins de vous.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-dema-muted sm:text-lg">
              Choisissez le renfort adapté à votre besoin. Chaque service précise le résultat,
              le périmètre et la prochaine étape avant tout engagement.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <ServicesCatalog services={services} />
        </div>
      </main>
    </>
  );
}
