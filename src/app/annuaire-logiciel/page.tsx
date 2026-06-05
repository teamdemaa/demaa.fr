import { permanentRedirect } from "next/navigation";

type AnnuaireLogicielPageProps = {
  searchParams: Promise<{
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AnnuaireLogicielPage({
  searchParams,
}: AnnuaireLogicielPageProps) {
  const params = await searchParams;
  const nextParams = new URLSearchParams();
  const secteur = getParamValue(params.secteur);
  const categorie = getParamValue(params.categorie);

  if (secteur) nextParams.set("secteur", secteur);
  if (categorie) nextParams.set("categorie", categorie);

  const query = nextParams.toString();
  permanentRedirect(query ? `/annuaire-outils?${query}` : "/annuaire-outils");
}
