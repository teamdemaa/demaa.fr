import Navbar from "@/components/Navbar";
import ServicesCatalog from "@/components/ServicesCatalog";

export default function ServicesLandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-dema-cream">
        <header className="border-b border-dema-line/65 px-5 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="mx-auto max-w-4xl text-balance text-4xl font-light tracking-[-0.045em] text-brand-blue sm:text-5xl lg:text-6xl">
              Les services clés pour{" "}
              <span className="demaa-section-title text-dema-forest">
                structurer et développer votre entreprise.
              </span>
            </h1>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <ServicesCatalog />
        </div>
      </main>
    </>
  );
}
