import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantCreditsClient from "@/components/AssistantCreditsClient";

export const metadata: Metadata = {
  title: "J'ai besoin d'un assistant - Demaa",
  description:
    "Achetez des crédits assistant et déléguez les tâches qui vous prennent du temps : facturation, contenu, prospection, subventions ou appels d'offres.",
};

export default function AssistantPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <AssistantCreditsClient />
      </main>
    </>
  );
}
