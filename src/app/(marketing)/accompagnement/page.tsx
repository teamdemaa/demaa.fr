import { permanentRedirect } from "next/navigation";

// Retain the historical address while retiring the commercial service offer.
export default function AccompagnementPage() {
  permanentRedirect("/tutoriels");
}
