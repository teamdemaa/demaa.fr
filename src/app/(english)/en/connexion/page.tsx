import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CustomerConnexionPage, {
  type CustomerConnexionSearchParams,
} from "@/components/CustomerConnexionPage";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure sign-in | Demaa",
  robots: { index: false, follow: false },
};

export default function EnglishConnexionPage({
  searchParams,
}: {
  searchParams: CustomerConnexionSearchParams;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  return <CustomerConnexionPage localeCode="en" searchParams={searchParams} />;
}
