import Navbar from "@/components/Navbar";
import { LEGAL } from "@/lib/legal";

type LegalPageLayoutProps = {
  children: React.ReactNode;
  description: string;
  title: string;
  titleAccent?: string;
};

export default function LegalPageLayout({
  children,
  description,
  title,
  titleAccent,
}: LegalPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-dema-cream pb-20 text-brand-blue">
        <section className="w-full border-b border-dema-line/65 bg-dema-cream px-4 pb-5 pt-8 md:pt-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
              Cadre légal Demaa
            </p>
            <h1 className="demaa-section-title mt-2 text-4xl tracking-tight text-brand-blue md:text-5xl">
              {title}{" "}
              {titleAccent ? <span className="text-dema-forest">{titleAccent}</span> : null}
            </h1>
            <p className="mx-auto mt-2 max-w-3xl text-sm font-normal leading-relaxed text-dema-muted">
              {description}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-dema-line bg-dema-paper px-3 py-1 text-xs font-medium text-brand-blue/70">
              Dernière mise à jour : {LEGAL.lastUpdatedLabel}
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
