import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText } from "@/lib/api-security";

type CompanySearchApiResponse = {
  results?: Array<{
    nom_complet?: string | null;
    nom_raison_sociale?: string | null;
    siren?: string | null;
    siege?: {
      adresse?: string | null;
      code_postal?: string | null;
      libelle_commune?: string | null;
      siret?: string | null;
    } | null;
    activite_principale?: string | null;
    categorie_entreprise?: string | null;
    nature_juridique?: string | null;
  }>;
};

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, {
    keyPrefix: "company-search",
    limit: 25,
    windowMs: 5 * 60 * 1000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const query = normalizeText(searchParams.get("q"), 120);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const upstream = new URL("https://recherche-entreprises.api.gouv.fr/search");
    upstream.searchParams.set("q", query);
    upstream.searchParams.set("page", "1");
    upstream.searchParams.set("per_page", "6");

    const response = await fetch(upstream.toString(), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 60 * 60 * 12 },
    });

    if (!response.ok) {
      throw new Error(`Company search failed with ${response.status}`);
    }

    const payload = (await response.json()) as CompanySearchApiResponse;

    return NextResponse.json({
      results: (payload.results ?? []).map((result) => ({
        name:
          result.nom_complet?.trim() ||
          result.nom_raison_sociale?.trim() ||
          "Entreprise",
        siren: result.siren?.trim() || "",
        siret: result.siege?.siret?.trim() || "",
        address: result.siege?.adresse?.trim() || "",
        postalCode: result.siege?.code_postal?.trim() || "",
        city: result.siege?.libelle_commune?.trim() || "",
        activity: result.activite_principale?.trim() || "",
        legalForm: result.nature_juridique?.trim() || "",
        category: result.categorie_entreprise?.trim() || "",
      })),
    });
  } catch (error) {
    console.error("Company search route error →", error);
    return NextResponse.json(
      {
        error:
          "La recherche d'entreprise est temporairement indisponible. Vous pouvez continuer en saisie libre.",
        results: [],
      },
      { status: 503 }
    );
  }
}
