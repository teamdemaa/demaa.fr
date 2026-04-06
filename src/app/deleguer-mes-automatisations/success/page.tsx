import SuccessPageClient from "./SuccessPageClient";

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function DeleguerMesAutomatisationsSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawSessionId = resolvedSearchParams.session_id;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId ?? null;

  return <SuccessPageClient sessionId={sessionId} />;
}
