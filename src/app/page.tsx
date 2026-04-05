import Navbar from "@/components/Navbar";
import AssistantHub from "@/components/AssistantHub";

export const metadata = {
  title: "Demaa - Votre Assistant Stratégique en Automatisation",
  description: "Expliquez votre problématique business et recevez un plan d'actions concret sur 5 piliers pour automatiser votre entreprise.",
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-[#FFF9F8] min-h-screen">
        <AssistantHub />
      </main>
    </>
  );
}
