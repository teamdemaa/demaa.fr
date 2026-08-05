import { permanentRedirect } from "next/navigation";

type OperationalKitPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function OperationalKitPage({
  params,
  searchParams,
}: OperationalKitPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const tab = Array.isArray(resolvedSearchParams.tab)
    ? resolvedSearchParams.tab[0]
    : resolvedSearchParams.tab;
  const query = tab ? `?tab=${encodeURIComponent(tab)}` : "";

  permanentRedirect(
    `/systemes-operationnels/${encodeURIComponent(slug)}${query}`,
  );
}
