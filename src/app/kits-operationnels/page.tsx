import { permanentRedirect } from "next/navigation";

export default async function OperationalKitsPage() {
  permanentRedirect("/systemes-operationnels");
}
