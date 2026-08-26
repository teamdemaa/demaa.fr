import type { Metadata } from "next";
import DemaaStudioLandingPage from "@/components/DemaaStudioLandingPage";

const title = "Demaa Studio | Logiciels métier conçus sur le terrain";
const description =
  "Découvrez les logiciels spécialisés conçus par Demaa à partir de problèmes métier observés auprès de dirigeants et de leurs équipes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/studio" },
  openGraph: {
    title,
    description,
    url: "/studio",
    siteName: "Demaa",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function StudioPage() {
  return <DemaaStudioLandingPage />;
}
