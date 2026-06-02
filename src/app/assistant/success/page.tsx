import AssistantSuccessClient from "./AssistantSuccessClient";

type AssistantSuccessPageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function AssistantSuccessPage({
  searchParams,
}: AssistantSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawSessionId = resolvedSearchParams.session_id;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId ?? null;

  return <AssistantSuccessClient sessionId={sessionId} />;
}
