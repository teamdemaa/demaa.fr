import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AssistantHub from "@/components/AssistantHub";
import NewsletterPrompt from "@/components/NewsletterPrompt";
import { getSystems } from "@/lib/api";
import { buildOperationalSystemDetail } from "@/lib/system-operations";

export const metadata: Metadata = {
  title: "Automatiser mes tâches - Demaa",
  description:
    "Décrivez vos tâches répétitives et identifiez les systèmes utiles pour automatiser ce qui vous ralentit.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const systems = await getSystems();
  const detailsBySlug = Object.fromEntries(
    await Promise.all(
      systems.map(async (system) => [system.slug, await buildOperationalSystemDetail(system)] as const)
    )
  ) as Record<string, Awaited<ReturnType<typeof buildOperationalSystemDetail>>>;

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full bg-[#FFF9F8] min-h-screen">
        <AssistantHub systems={systems} detailsBySlug={detailsBySlug} />
      </main>
      <NewsletterPrompt />
    </>
  );
}
