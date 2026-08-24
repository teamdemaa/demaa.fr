import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { requireAdminIdentity } from "@/lib/admin-auth.server";

export const metadata: Metadata = {
  title: "Administration | Demaa",
  robots: { follow: false, index: false },
};

const SECTIONS = [
  {
    href: "/admin/demandes",
    label: "Demandes",
    description: "Récapitulatif des demandes reçues via le site, avec coordonnées et contexte.",
  },
  {
    href: "/admin/opportunites",
    label: "Annonces",
    description: "Créer, publier et gérer les annonces (Reprises, Missions et partenariats).",
  },
  {
    href: "/admin/outils",
    label: "Outils",
    description: "Contrôler en lecture seule les sélections par métier et leurs preuves.",
  },
] as const;

export default async function AdminHomePage() {
  await connection();
  await requireAdminIdentity("/admin");
  return (
    <>
      <Navbar adminControls minimal />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-center text-4xl font-light tracking-[-0.04em] text-brand-blue">
            Administration
          </h1>
          <p className="mt-3 text-center text-sm text-dema-muted">
            Accès Team Demaa. Choisis une section.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="demaa-card block rounded-2xl px-6 py-5"
              >
                <h2 className="text-base font-semibold text-brand-blue">{section.label}</h2>
                <p className="mt-1.5 text-sm text-dema-muted">{section.description}</p>
                <span className="mt-3 inline-block text-sm font-medium text-dema-forest">
                  Ouvrir →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
