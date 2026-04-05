import { permanentRedirect } from "next/navigation";

export const metadata = {
  title: "Redirection - Demaa",
  description: "Redirection vers Le Kit du Dirigeant Organisé."
};

export default function TemplatesPage() {
  permanentRedirect("/outils/kit-du-dirigeant-organise");
}
