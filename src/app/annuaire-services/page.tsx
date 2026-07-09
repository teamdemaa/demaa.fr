import { permanentRedirect } from "next/navigation";

type AnnuaireServicesPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    q?: string | string[];
    retourSysteme?: string | string[];
  }>;
};

export default async function AnnuaireServicesPage({
  searchParams,
}: AnnuaireServicesPageProps) {
  const params = await searchParams;
  const nextSearchParams = new URLSearchParams();
  const category = getParamValue(params.category);
  const searchQuery = getParamValue(params.q);
  const retourSysteme = getParamValue(params.retourSysteme);

  if (category) {
    nextSearchParams.set("category", category);
  }

  if (searchQuery) {
    nextSearchParams.set("q", searchQuery);
  }

  if (retourSysteme) {
    nextSearchParams.set("retourSysteme", retourSysteme);
  }

  const destination =
    nextSearchParams.size > 0 ? `/organisation?${nextSearchParams.toString()}` : "/organisation";

  permanentRedirect(destination);
}

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
