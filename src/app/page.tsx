import { getServices } from "@/lib/data";
import Navbar from "@/components/Navbar";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
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
