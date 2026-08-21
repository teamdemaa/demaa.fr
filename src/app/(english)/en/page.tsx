import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ActionPlanHomeView from "@/components/ActionPlanHomeView";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import {
  ENGLISH_BETA_DESCRIPTION,
  ENGLISH_BETA_TITLE,
} from "@/lib/english-beta-metadata";
import { loadActionPlanHomePage } from "@/lib/action-plan-pages.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/en", languages: { fr: "/", en: "/en" } },
  description: ENGLISH_BETA_DESCRIPTION,
  openGraph: {
    description: ENGLISH_BETA_DESCRIPTION,
    locale: "en",
    siteName: "Demaa",
    title: ENGLISH_BETA_TITLE,
    type: "website",
  },
  robots: { follow: false, index: false },
  title: ENGLISH_BETA_TITLE,
  twitter: {
    card: "summary_large_image",
    description: ENGLISH_BETA_DESCRIPTION,
    title: ENGLISH_BETA_TITLE,
  },
};

export default async function EnglishActionPlanPage({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    new?: string | string[];
    planTab?: string | string[];
    view?: string | string[];
  }>;
}) {
  if (!isEnglishBetaEnabled()) notFound();
  const query = await searchParams;
  return (
    <ActionPlanHomeView
      {...await loadActionPlanHomePage({ localeCode: "en", searchParams: query })}
    />
  );
}
