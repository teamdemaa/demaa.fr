import { permanentRedirect } from "next/navigation";

export default function LegacyOpportunityPage() {
  permanentRedirect("/opportunites");
}
