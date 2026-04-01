import { getServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import HomeClient from "@/components/HomeClient";

export const metadata = {
  title: "Nos Services - Demaa",
  description: "Découvrez nos services clés pour bien gérer votre entreprise : Finance, Juridique et Opérations.",
};

export default async function ServicesPage() {
  const services = await getServices();
  const allCategories = Array.from(new Set(services.map(s => s.category)));

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background min-h-screen">
        <div className="pt-8 pb-4 px-4 text-center bg-[#FFF9F8] border-b border-brand-coral/10 mb-8">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-brand-blue mb-4">
            Nos <span className="text-brand-coral">Services</span> Clés
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            Tout ce dont vous avez besoin pour structurer et développer votre entreprise sereinement.
          </p>
        </div>
        <HomeClient services={services} allTags={allCategories} />
      </main>
    </>
  );
}
