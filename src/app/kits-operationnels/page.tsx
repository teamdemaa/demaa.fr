import { permanentRedirect } from "next/navigation";

export default function LegacyOperationalKitsPage() {
  permanentRedirect("/systemes");
}
