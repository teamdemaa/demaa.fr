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
      <Navbar minimal publicNavigationVariant="sini" publicNavigationActiveView="none" />
      <main className="min-h-screen bg-sini-background pb-20 text-[#17283e]">
        <section className="w-full border-b border-[#d8e0e7] bg-sini-background px-4 pb-5 pt-8 md:pt-10">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#597391]">
              Informations légales de sini
            </p>
            <h1 className="demaa-section-title mt-2 text-4xl tracking-tight text-[#17283e] md:text-5xl">
              {title}{" "}
              {titleAccent ? <span className="text-[#244a68]">{titleAccent}</span> : null}
            </h1>
            <p className="mx-auto mt-2 max-w-3xl text-sm font-normal leading-relaxed text-[#627181]">
              {description}
            </p>
            <p className="mt-4 inline-flex rounded-full border border-[#d8e0e7] bg-white px-3 py-1 text-xs font-medium text-[#627181]">
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
