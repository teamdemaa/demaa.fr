import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GoogleAuthPage, {
  type GoogleAuthSearchParams,
} from "@/components/GoogleAuthPage";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Google sign-in | Demaa",
  robots: { index: false, follow: false },
};

export default function EnglishGoogleAuthPage({
  searchParams,
}: {
  searchParams: GoogleAuthSearchParams;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  return <GoogleAuthPage localeCode="en" searchParams={searchParams} />;
}
