import { permanentRedirect } from "next/navigation";

export default function OutilsGratuitsPage() {
  permanentRedirect("/annuaire-outils?categorie=QR%20Code");
}
