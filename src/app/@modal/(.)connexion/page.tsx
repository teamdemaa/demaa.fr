import CustomerSpaceLoginDialog from "@/components/CustomerSpaceLoginDialog";
import { redirect } from "next/navigation";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";
import { isGuestProductEnabled } from "@/lib/guest-action-plan-security.server";
import { getReturnToInterfaceLocale } from "@/lib/international-context";

export default async function CustomerLoginModalPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string | string[];
    returnTo?: string | string[];
  }>;
}) {
  if (isGuestProductEnabled()) redirect("/");
  const params = await searchParams;
  const rawMessage = Array.isArray(params.message) ? params.message[0] : params.message;
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const returnTo = getSafeCustomerReturnTo(rawReturnTo || "/plans/latest");
  const localeCode = getReturnToInterfaceLocale(returnTo);
  return (
    <CustomerSpaceLoginDialog
      localeCode={localeCode}
      message={localeCode === "en" && rawMessage ? "Sign in to continue." : rawMessage}
      returnTo={returnTo}
    />
  );
}
