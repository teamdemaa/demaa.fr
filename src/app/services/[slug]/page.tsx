import { notFound } from "next/navigation";

export async function generateMetadata() {
  return {
    title: "Page introuvable - Demaa",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function ServiceDetailPage() {
  notFound();
}
