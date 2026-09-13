import Link from "next/link";
import { ArrowRight, Check, ClipboardList, FileCheck2, Gauge, Network, UsersRound } from "lucide-react";
import Navbar from "@/components/Navbar";
import BusinessEstimateControl from "@/components/BusinessEstimateControl";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const systems = [
  { icon: Network, title: "Commercial et clients", text: "Demandes, devis, relances et suivi client." },
  { icon: ClipboardList, title: "Missions et opérations", text: "Étapes du travail, responsabilités et points de contrôle." },
  { icon: FileCheck2, title: "Administration et finance", text: "Documents, facturation, échéances et informations clés." },
  { icon: UsersRound, title: "Équipe", text: "Rôles, savoir-faire et transmission des informations." },
  { icon: Gauge, title: "Pilotage", text: "Chiffres utiles, rythme de suivi et décisions." },
] as const;

const headerButtonClassName = "inline-flex min-h-10 items-center rounded-full border border-dema-forest/18 bg-dema-paper px-3 text-xs font-medium text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage/45 sm:min-h-11 sm:px-5 sm:text-sm";
const primaryButtonClassName = "inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35";

export default function TransmissionLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="services" publicCta={<BusinessEstimateControl className={headerButtonClassName} label="Prendre rendez-vous" />} />
      <main className="overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="px-5 pb-16 pt-16 text-center sm:px-8 sm:pb-24 sm:pt-24">
          <div className="mx-auto max-w-6xl">
            <h1 className={`${satoshiHeroTitleClassName} mx-auto max-w-5xl`}>Préparez votre entreprise à être reprise.</h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">Nous clarifions son fonctionnement, ses processus, ses outils et ses informations pour qu’elle soit plus simple à présenter, à transmettre et à faire fonctionner sans vous.</p>
            <div className="mt-9 flex justify-center"><BusinessEstimateControl className={primaryButtonClassName} /></div>
            <p className="mt-3 text-xs text-dema-muted">Premier échange de 30 minutes · Sans engagement</p>
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
            <h2 className="demaa-marketing-section-title">Une entreprise peut fonctionner. Et rester difficile à transmettre.</h2>
            <div className="space-y-4 text-base leading-7 text-dema-muted"><p>Quand les informations sont dispersées, les méthodes restent dans la tête du dirigeant et chacun travaille à sa façon, un repreneur voit surtout du risque.</p><p>Nous rendons le fonctionnement visible, simple à expliquer et plus facile à reprendre par une autre personne.</p></div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end"><h2 className="demaa-marketing-section-title">Nous structurons ce qui fait tourner votre entreprise.</h2><p className="text-base leading-7 text-dema-muted">Un système à la fois, en partant de ce qui dépend le plus de vous aujourd’hui.</p></div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {systems.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span><h3 className="mt-5 text-lg font-medium leading-snug tracking-[-0.02em]">{title}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div><h2 className="demaa-marketing-section-title">Nous ne vous laissons pas avec un rapport.</h2><p className="mt-6 max-w-xl text-base leading-7 text-dema-paper/72">Nous observons, simplifions, documentons et mettons en place avec votre équipe.</p></div>
            <ol className="divide-y divide-dema-paper/18 border-y border-dema-paper/18">
              {[["01", "Comprendre", "Votre activité, vos chiffres et ce qui repose encore sur vous."], ["02", "Choisir", "Le système prioritaire à rendre clair et transmissible."], ["03", "Mettre en place", "Les étapes, outils, documents et responsabilités utiles."], ["04", "Transmettre", "Une documentation simple, testée dans le travail réel."]].map(([number, title, text]) => <li key={number} className="grid grid-cols-[3rem_1fr] gap-4 py-5"><span className="demaa-section-title text-2xl text-dema-sage">{number}</span><span><strong className="block font-medium text-dema-paper">{title}</strong><span className="mt-1 block text-sm leading-6 text-dema-paper/65">{text}</span></span></li>)}
            </ol>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-dema-line bg-dema-paper p-7 sm:p-10 lg:grid lg:grid-cols-[1fr_0.85fr] lg:gap-16 lg:p-12">
            <div><h2 className="demaa-marketing-section-title">Un premier système structuré et documenté.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">Nous commençons par le fonctionnement qui réduit le plus la dépendance au dirigeant ou facilite le plus la transmission.</p><p className="demaa-section-title mt-8 text-4xl text-dema-forest">À partir de 2 500 € HT</p><p className="mt-2 text-xs text-dema-muted">Un mois · Un système prioritaire · Mise en place par Demaa</p></div>
            <div className="mt-9 lg:mt-0"><ul className="divide-y divide-dema-line border-y border-dema-line">{["Analyse du fonctionnement actuel", "Choix du système prioritaire", "Processus et responsabilités clarifiés", "Outils et documents organisés", "Mise en place et test avec l’équipe", "Documentation prête à transmettre"].map((item) => <li key={item} className="flex gap-3 py-3 text-sm leading-6 text-dema-muted"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />{item}</li>)}</ul><div className="mt-7"><BusinessEstimateControl className={`${primaryButtonClassName} w-full`} /></div></div>
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-sage/55 px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl text-center"><h2 className="demaa-marketing-section-title">Une entreprise plus claire inspire davantage confiance.</h2><p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-dema-muted">Une entreprise documentée et moins dépendante de son dirigeant est plus simple à comprendre, à auditer et à défendre au moment de la vente.</p></div></section>

        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
            <article className="rounded-[2rem] bg-dema-forest p-8 text-dema-paper sm:p-10"><h2 className="demaa-marketing-section-title">Automatisation & IA</h2><p className="mt-5 text-base leading-7 text-dema-paper/72">Quand un flux repose sur des ressaisies et des tâches répétitives, nous pouvons aussi l’automatiser avec vos outils.</p><Link href="/automatisation" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-dema-paper underline decoration-dema-paper/35 underline-offset-4">Voir l’accompagnement Automatisation & IA <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>
            <article className="rounded-[2rem] border border-dema-line bg-dema-paper p-8 sm:p-10"><h2 className="demaa-marketing-section-title">Application métier sur mesure</h2><p className="mt-5 text-base leading-7 text-dema-muted">Quand les outils existants ne suivent pas votre manière de travailler, Demaa conçoit une application adaptée à votre activité.</p><Link href="/sur-mesure" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-dema-forest underline decoration-dema-forest/30 underline-offset-4">Découvrir le sur mesure <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></article>
          </div>
        </section>

        <section className="border-t border-dema-line bg-dema-paper px-5 py-16 text-center sm:px-8 sm:py-20"><div className="mx-auto max-w-3xl"><h2 className="demaa-marketing-section-title">Qu’est-ce qui dépend encore de vous aujourd’hui ?</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-dema-muted">Faisons le point sur votre entreprise et sur ce qu’il faut préparer en premier.</p><div className="mt-8 flex justify-center"><BusinessEstimateControl className={primaryButtonClassName} /></div></div></section>
      </main>
    </>
  );
}
