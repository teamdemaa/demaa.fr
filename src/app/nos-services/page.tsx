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
        <HomeClient 
          services={services} 
          allTags={allCategories} 
          title="Vos services experts au même endroit"
          placeholder="Rechercher un service (compta, juridique...)"
        />
      </main>
    </>
  );
}
