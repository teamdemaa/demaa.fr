import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Page retirée : les modèles vivent désormais dans Académie et dans
// l'onglet Ressources des systèmes, en accès direct sans page intermédiaire.
// Le sandbox d'exécution ne peut pas supprimer ce fichier (permission refusée
// sur le dossier monté) — à supprimer manuellement :
//   rm -rf src/app/modeles-de-documents

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export async function generateStaticParams() {
  return [];
}

export default function DocumentModelDetailPage() {
  notFound();
}
