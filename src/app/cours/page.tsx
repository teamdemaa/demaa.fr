import { permanentRedirect } from "next/navigation";

type LegacyCoursesPageProps = {
  searchParams: Promise<{ retourSysteme?: string | string[] }>;
};

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LegacyCoursesPage({ searchParams }: LegacyCoursesPageProps) {
  const resolvedSearchParams = await searchParams;
  const returnSystemSlug = getParamValue(resolvedSearchParams.retourSysteme);
  const destination = returnSystemSlug
    ? `/academie?retourSysteme=${encodeURIComponent(returnSystemSlug)}`
    : "/academie";

  permanentRedirect(destination);
}
