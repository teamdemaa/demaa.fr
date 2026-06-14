import PartnerOffersPageModal from "@/components/PartnerOffersPageModal";

export const metadata = {
  title: "Tarifs negocies et offres partenaires - Demaa",
  description:
    "Recevez les tarifs negocies, les offres partenaires et les opportunites utiles proposees par Demaa.",
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
