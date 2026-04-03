import { getTools, getServices, getSystems } from "@/lib/api";
import Navbar from "@/components/Navbar";
import HomeToolsClient from "@/components/HomeToolsClient";

export const metadata = {
  title: "Demaa - Outils Gratuits pour Entrepreneurs",
  description: "Simplifiez votre gestion quotidienne avec nos outils gratuits : QR codes, tampons, signatures et plus encore.",
};

export default async function Home() {
  const [tools, services, systems] = await Promise.all([
    getTools(),
    getServices(),
    getSystems()
  ]);

  return (
    <>
      <Navbar minimal={true} />
      <main className="flex-1 w-full bg-background">
        <HomeToolsClient 
          initialTools={tools} 
          initialServices={services}
          initialSystems={systems}
          title="Gagnez du temps au quotidien"
          placeholder="Que cherchez-vous aujourd'hui ? (ex: QR code, Compta, SAS...)"
        />
      </main>
    </>
  );
}
