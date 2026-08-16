import type { Metadata } from "next";
import GoogleAuthCallbackClient from "./GoogleAuthCallbackClient";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

export const metadata: Metadata = {
  title: "Connexion Google | Demaa",
  robots: { index: false, follow: false },
};

export default async function GoogleAuthPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawReturnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const returnTo = getSafeCustomerReturnTo(rawReturnTo);

  return <GoogleAuthCallbackClient returnTo={returnTo} />;
}
