import { getTools } from "@/lib/data";
import Navbar from "@/components/Navbar";
import HomeToolsClient from "@/components/HomeToolsClient";

export const metadata = {
  title: "Demaa - Outils Gratuits pour Entrepreneurs",
  description: "Simplifiez votre gestion quotidienne avec nos outils gratuits : QR codes, tampons, signatures et plus encore.",
};

export default async function Home() {
  const tools = await getTools();

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-background">
        <HomeToolsClient initialTools={tools} />
      </main>
    </>
  );
}
