import { permanentRedirect } from "next/navigation";

// DEMAA starts in the Academy. The former homepage remains in Git history;
// no public landing page sits between the domain and the useful content.
export default function HomePage() {
  permanentRedirect("/academie");
}
