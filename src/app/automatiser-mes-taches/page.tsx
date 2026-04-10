import Navbar from "@/components/Navbar";
import AssistantHub from "@/components/AssistantHub";
import NewsletterPrompt from "@/components/NewsletterPrompt";

export const metadata = {
  title: "Automatiser mes tâches - Demaa",
  description:
    "Expliquez votre problématique business et recevez un plan d'actions concret pour automatiser les tâches qui vous ralentissent.",
};

export default function AutomatiserMesTachesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-[#FFF9F8] min-h-screen">
        <AssistantHub />
      </main>
      <NewsletterPrompt />
    </>
  );
}
