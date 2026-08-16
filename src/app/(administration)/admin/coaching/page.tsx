import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CoachingAdminClient from "@/components/CoachingAdminClient";

export const metadata: Metadata = {
  title: "Conversations spécialiste | Demaa",
  robots: { follow: false, index: false },
};

export default function CoachingAdminPage() {
  return (
    <>
      <Navbar minimal />
      <main className="flex-1 bg-dema-cream px-5 pb-20 pt-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-4xl font-light tracking-[-0.04em] text-brand-blue">
            Conversations spécialiste
          </h1>
          <CoachingAdminClient />
        </div>
      </main>
    </>
  );
}
