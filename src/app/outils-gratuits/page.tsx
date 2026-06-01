import { redirect } from "next/navigation";

export const metadata = {
  title: "Outils Gratuits - Demaa",
  description:
    "Retrouvez les outils gratuits créés par Demaa pour générer un QR code, créer une signature email, signer un document et gagner du temps au quotidien.",
};

type OutilsGratuitsPageProps = {
  searchParams: Promise<{
    secteur?: string | string[];
    categorie?: string | string[];
  }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OutilsGratuitsPage({
  searchParams,
}: OutilsGratuitsPageProps) {
  const params = await searchParams;
  const query = new URLSearchParams({ tab: "boite-a-outils" });
  const category = getParamValue(params.categorie);
  const sector = getParamValue(params.secteur);

  if (category) {
    query.set("categorie", category);
  }

  if (sector) {
    query.set("secteur", sector);
  }

  redirect(`/?${query.toString()}`);
}
