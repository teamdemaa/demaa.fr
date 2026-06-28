import AssistantSuccessClient from "./AssistantSuccessClient";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type AssistantSuccessPageProps = {
  searchParams: Promise<{ access?: string | string[]; session_id?: string | string[] }>;
};

export default async function AssistantSuccessPage({
  searchParams,
}: AssistantSuccessPageProps) {
  const resolvedSearchParams = await searchParams;
  const rawAccessToken = resolvedSearchParams.access;
  const rawSessionId = resolvedSearchParams.session_id;
  const accessToken = Array.isArray(rawAccessToken) ? rawAccessToken[0] : rawAccessToken ?? null;
  const sessionId = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId ?? null;

  return <AssistantSuccessClient accessToken={accessToken} sessionId={sessionId} />;
}
