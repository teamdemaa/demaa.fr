import type { Metadata } from "next";
import { getPublishedMethods } from "@/lib/tutorial-catalog";

export { default, generateStaticParams } from "@/app/apercu-sini/conseil/[slug]/page";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const method = getPublishedMethods().find((item) => item.slug === slug);
  return {
    title: method ? `${method.title} | sini` : "Méthode introuvable | sini",
    description: method?.summary,
    robots: { index: false, follow: false },
  };
}
