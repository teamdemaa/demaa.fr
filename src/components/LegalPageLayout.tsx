import Navbar from "@/components/Navbar";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { LEGAL } from "@/lib/legal";

type LegalPageLayoutProps = {
  children: React.ReactNode;
  description: string;
  title: string;
  titleAccent?: string;
  localeCode?: InterfaceLocaleCode;
};

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white px-6 py-7 md:px-8 md:py-9">
      <h2 className="text-2xl font-black tracking-tight text-brand-blue">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function LegalPageLayout({
  children,
  description,
  title,
  titleAccent,
  localeCode = "fr",
}: LegalPageLayoutProps) {
  const isEnglish = localeCode === "en";
  return (
    <>
      <Navbar localeCode={localeCode} />
      <main className="min-h-screen bg-dema-cream pb-20 text-brand-blue">
        <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:pt-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              {isEnglish ? "Demaa legal information" : "Cadre légal Demaa"}
            </p>
            <h1 className="demaa-section-title mt-2 text-4xl tracking-tight text-brand-blue md:text-5xl">
              {title}{" "}
              {titleAccent ? <span className="text-dema-forest">{titleAccent}</span> : null}
            </h1>
            <p className="mx-auto mt-2 max-w-3xl text-sm font-normal leading-relaxed text-dema-muted">
              {description}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-dema-line bg-dema-paper px-3 py-1 text-xs font-medium text-brand-blue/70">
              {isEnglish ? "Last updated: August 5, 2026" : `Dernière mise à jour : ${LEGAL.lastUpdatedLabel}`}
            </p>
          </div>
        </section>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-10 md:gap-8 md:pt-14">
          {children}
        </div>
      </main>
    </>
  );
}
