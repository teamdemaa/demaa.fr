import NewsletterPageModal from "@/components/NewsletterPageModal";

export const metadata = {
  title: "Tarifs negocies et offres partenaires - Demaa",
  description:
    "Recevez les tarifs negocies, les offres partenaires et les opportunites utiles proposees par Demaa.",
  alternates: {
    canonical: "/newsletter",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function NewsletterPage() {
  return <NewsletterPageModal />;
}
