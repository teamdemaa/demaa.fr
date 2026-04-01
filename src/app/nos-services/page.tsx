import { getServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import HomeClient from "@/components/HomeClient";

export const metadata = {
  title: "Nos Services d'Accompagnement - Demaa",
  description: "Découvrez nos prestations pour simplifier la vie de votre entreprise : Finance, Juridique et Opérations."
};

export default async function NosServicesPage() {
  const services = await getServices();
  const allCategories = Array.from(new Set(services.map(s => s.category)));

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background">
        <HomeClient services={services} allTags={allCategories} />
      </main>
    </>
  );
}
