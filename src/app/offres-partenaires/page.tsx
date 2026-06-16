import PartnerOffersPageModal from "@/components/PartnerOffersPageModal";

export const metadata = {
  title: "Tarifs négociés et offres partenaires - Demaa",
  description:
    "Recevez les tarifs négociés, les offres partenaires et les opportunités utiles proposées par Demaa.",
  alternates: {
    canonical: "/offres-partenaires",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function PartnerOffersPage() {
  return <PartnerOffersPageModal />;
}
