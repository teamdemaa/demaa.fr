import CustomerSpaceLoginDialog from "@/components/CustomerSpaceLoginDialog";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

export default async function CustomerLoginModalPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string | string[];
    returnTo?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const rawMessage = Array.isArray(params.message) ? params.message[0] : params.message;
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  return (
    <CustomerSpaceLoginDialog
      message={rawMessage}
      returnTo={getSafeCustomerReturnTo(rawReturnTo || "/plans/latest")}
    />
  );
}
