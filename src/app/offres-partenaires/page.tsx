import { redirect } from "next/navigation";

export const metadata = {
  title: "Demaa",
  description: "Organisation, systèmes et ressources utiles pour dirigeants de TPE.",
  alternates: {
    canonical: "/offres-partenaires",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PartnerOffersPage() {
  redirect("/");
}
