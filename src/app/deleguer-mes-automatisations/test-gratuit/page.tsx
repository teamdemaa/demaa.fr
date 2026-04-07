import { redirect } from "next/navigation";

export default function DeleguerMesAutomatisationsTestGratuitPage() {
  redirect("/?delegation=free");
}
