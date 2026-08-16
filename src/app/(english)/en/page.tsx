import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocumentLocale from "@/components/DocumentLocale";
import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import { getInterfaceDictionary } from "@/lib/i18n/dictionaries";
import { resolveRequestInternationalContext } from "@/lib/international-context.server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/en", languages: { fr: "/", en: "/en" } },
  description:
    "Clarify your priorities and build a more profitable business that depends less on you.",
  openGraph: {
    locale: "en",
    title: "Demaa | Build a business that depends less on you",
  },
  robots: { follow: false, index: false },
  title: "Demaa | Build a business that depends less on you",
};

export default async function EnglishBetaFoundationPage() {
  if (!isEnglishBetaEnabled()) notFound();
  const context = await resolveRequestInternationalContext({ pathname: "/en" });
  const dictionary = getInterfaceDictionary(context.localeCode);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(context.localeCode)}`,
        }}
      />
      <DocumentLocale localeCode={context.localeCode} />
      <main className="flex min-h-dvh items-center justify-center bg-dema-cream px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] text-brand-blue">
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-dema-forest">
            {dictionary.betaLabel}
          </p>
          <h1 className="mt-5 text-4xl font-light tracking-[-0.045em] md:text-6xl">
            {dictionary.betaHeading}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-dema-gray md:text-lg">
            {dictionary.betaDescription}
          </p>
        </section>
      </main>
    </>
  );
}
