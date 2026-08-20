import GoogleAuthCallbackClient from "@/components/GoogleAuthCallbackClient";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { getLocalizedActionPlanPath } from "@/lib/action-plan-localization";

export type GoogleAuthSearchParams = Promise<{
  returnTo?: string | string[];
}>;

export default async function GoogleAuthPage({
  localeCode,
  searchParams,
}: {
  localeCode: InterfaceLocaleCode;
  searchParams: GoogleAuthSearchParams;
}) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeCustomerReturnTo(
    rawReturnTo || getLocalizedActionPlanPath(localeCode, "/plans/latest"),
  );

  return <GoogleAuthCallbackClient localeCode={localeCode} returnTo={returnTo} />;
}
