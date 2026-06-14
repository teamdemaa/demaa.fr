import NewsletterPageModal from "@/components/NewsletterPageModal";

export const metadata = {
  title: "Newsletter Demaa",
  description:
    "Inscrivez-vous à la newsletter Demaa pour recevoir des idées simples d'automatisation adaptées aux petites entreprises.",
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
