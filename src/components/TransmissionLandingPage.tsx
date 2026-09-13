import Image from "next/image";
import { CalendarCheck2, Check, ChevronDown, ClipboardCheck, FileCheck2, Gauge, Inbox, Network, ReceiptText, UsersRound } from "lucide-react";
import AccompanimentContactControl from "@/components/AccompanimentContactControl";
import Navbar from "@/components/Navbar";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

const systems = [
  { icon: Network, title: "Commercial et clients", text: "Demandes, devis, relances et suivi client." },
  { icon: ClipboardCheck, title: "Missions et opérations", text: "Interventions, chantiers ou missions, avec les bonnes informations." },
  { icon: FileCheck2, title: "Administration et finance", text: "Documents, facturation, échéances et données utiles." },
  { icon: UsersRound, title: "Équipe", text: "Rôles, savoir-faire et transmission des informations." },
  { icon: Gauge, title: "Pilotage", text: "Chiffres utiles, rythme de suivi et décisions." },
] as const;

const flow = [
  { icon: Inbox, title: "Demande", text: "Appel, email ou formulaire" },
  { icon: FileCheck2, title: "Devis", text: "Informations prêtes à utiliser" },
  { icon: CalendarCheck2, title: "Planning", text: "Intervention, chantier ou mission" },
  { icon: ClipboardCheck, title: "Compte rendu", text: "Notes et documents regroupés" },
  { icon: ReceiptText, title: "Facturation", text: "Éléments transmis sans ressaisie" },
] as const;

const faq = [
  { question: "À qui s’adresse cet accompagnement ?", answer: "Aux entreprises de services, sur le terrain comme au bureau, dont le fonctionnement repose encore sur beaucoup de ressaisies, de relances ou de connaissances gardées par quelques personnes." },
  { question: "Faut-il préparer la vente de l’entreprise ?", answer: "Non. Structurer un système aide d’abord l’équipe et le dirigeant au quotidien. Si une transmission est prévue, le même travail rend aussi l’entreprise plus simple à expliquer et à reprendre." },
  { question: "Utilisez-vous toujours de l’IA ?", answer: "Non. Nous utilisons l’IA seulement lorsqu’elle apporte un gain concret, par exemple pour classer une demande, résumer des notes ou préparer un document. Une automatisation simple suffit souvent." },
  { question: "Faut-il changer nos outils ?", answer: "Pas nécessairement. Nous conservons ce qui fonctionne et proposons un changement seulement lorsqu’un outil bloque réellement le travail." },
  { question: "Que peut-on mettre en place en un mois ?", answer: "Nous regardons l’ensemble du fonctionnement, puis choisissons avec vous un périmètre prioritaire qui peut être construit, testé et transmis correctement pendant le mois." },
] as const;

const primaryButtonClassName = "inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-7 py-3 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35";

export default function TransmissionLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="services" />
      <main className="overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,1.06fr)_minmax(24rem,0.94fr)] lg:gap-12">
            <div className="text-left">
              <h1 className={`${satoshiHeroTitleClassName} max-w-5xl`}>Une entreprise qui fonctionne mieux. <span className="demaa-section-title block text-dema-forest">Et dépend moins de vous.</span></h1>
              <p className="mt-7 max-w-3xl text-base leading-7 text-dema-muted sm:text-lg sm:leading-8">Nous structurons et automatisons un fonctionnement prioritaire pour faire gagner du temps à votre équipe et rendre l’entreprise plus simple à piloter ou à transmettre.</p>
              <div className="mt-8"><AccompanimentContactControl className={primaryButtonClassName} /></div>
            </div>
            <Image src="/illustrations/accompagnement/hero-entreprise-terrain-v3.png" alt="" aria-hidden="true" width={1536} height={1024} sizes="(max-width: 1023px) 92vw, 42vw" preload className="h-auto w-full object-contain" />
          </div>
        </section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-14 sm:px-8 sm:py-16"><div className="mx-auto max-w-6xl"><h2 className="demaa-marketing-section-title max-w-4xl">Un système clair, du premier contact au travail terminé.</h2><p className="mt-5 max-w-3xl text-base leading-7 text-dema-muted">Demandes, devis, planning, interventions, chantiers ou missions, comptes rendus et facturation : les informations avancent sans être recopiées partout.</p><ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{flow.map(({ icon: Icon, title, text }) => <li key={title} className="rounded-[1.4rem] border border-dema-line bg-dema-cream/45 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" /></span><h3 className="mt-5 text-base font-medium">{title}</h3><p className="mt-2 text-xs leading-5 text-dema-muted">{text}</p></li>)}</ol></div></section>

        <section className="px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-6xl"><div className="max-w-4xl"><h2 className="demaa-marketing-section-title">Nous structurons ce qui fait tourner votre entreprise.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-dema-muted">Un système à la fois, en partant de ce qui fait perdre le plus de temps ou dépend le plus de vous.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{systems.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-[1.5rem] border border-dema-line bg-dema-paper p-6"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest"><Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" /></span><h3 className="mt-5 text-lg font-medium leading-snug tracking-[-0.02em]">{title}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{text}</p></article>)}</div></div></section>

        <section id="automatisation" className="scroll-mt-24 bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20"><div><h2 className="demaa-marketing-section-title">Nous ne vous laissons pas avec un rapport.</h2><p className="mt-6 max-w-xl text-base leading-7 text-dema-paper/72">Nous observons, simplifions, documentons et mettons en place avec votre équipe. L’automatisation et l’IA prennent le répétitif lorsque cela apporte un vrai gain.</p></div><ol className="divide-y divide-dema-paper/18 border-y border-dema-paper/18">{[["01", "Comprendre", "Votre activité, vos outils et les pertes de temps."], ["02", "Choisir", "Le système prioritaire et le résultat attendu."], ["03", "Mettre en place", "Les étapes, outils, automatisations et contrôles utiles."], ["04", "Tester et transmettre", "Un fonctionnement utilisé par l’équipe et documenté simplement."]].map(([number, title, text]) => <li key={number} className="grid grid-cols-[3rem_1fr] gap-4 py-5"><span className="demaa-section-title text-2xl text-dema-sage">{number}</span><span><strong className="block font-medium text-dema-paper">{title}</strong><span className="mt-1 block text-sm leading-6 text-dema-paper/65">{text}</span></span></li>)}</ol></div></section>

        <section className="px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center"><div><h2 className="demaa-marketing-section-title">Du client au terrain. Du terrain au bureau.</h2><p className="mt-6 max-w-2xl text-base leading-7 text-dema-muted">Vos équipes gardent la relation client, leur savoir-faire et les décisions importantes. Les informations utiles arrivent au bon endroit au bon moment.</p></div><Image src="/illustrations/accompagnement/flux-client-bureau-terrain-v3.png" alt="" aria-hidden="true" width={2048} height={768} sizes="(max-width: 1023px) 92vw, 48vw" className="h-auto w-full object-contain" /></div></section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-6xl"><h2 className="demaa-marketing-section-title">La même logique, adaptée à votre métier.</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{[{ title: "Services terrain", text: "Maintenance, installation, dépannage, BTP, entretien ou propreté." }, { title: "Services professionnels", text: "Cabinets, agences, conseil, informatique, recrutement ou formation." }, { title: "Entreprise à transmettre", text: "Un fonctionnement plus clair, documenté et moins dépendant du dirigeant." }].map((item, index) => <article key={item.title} className="border-t border-dema-line pt-5"><div className="relative aspect-square overflow-hidden" aria-hidden="true"><Image src="/illustrations/accompagnement/metiers-terrain-v3.png" alt="" fill sizes="(max-width: 767px) 92vw, 30vw" className="object-cover" style={{ objectPosition: ["left center", "center", "right center"][index] }} /></div><h3 className="mt-5 text-lg font-medium">{item.title}</h3><p className="mt-3 text-sm leading-6 text-dema-muted">{item.text}</p></article>)}</div></div></section>

        <section id="tarif" className="px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-6xl gap-12 rounded-[2rem] bg-dema-forest p-7 text-dema-paper sm:p-10 lg:grid-cols-[1fr_0.88fr] lg:gap-16 lg:p-12"><div><h2 className="demaa-marketing-section-title">Un mois pour mettre en place un système prioritaire.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-dema-paper/72">Nous examinons l’ensemble du fonctionnement, choisissons avec vous le périmètre le plus utile, puis le construisons et le testons en entier.</p><p className="demaa-section-title mt-8 text-4xl text-dema-paper">{AUTOMATION_OFFER.price.label}</p></div><div><ul className="divide-y divide-dema-paper/18 border-y border-dema-paper/18">{["Analyse du fonctionnement actuel", "Liste des améliorations et automatisations possibles", "Choix du périmètre prioritaire", "Construction et connexion avec les outils", "Tests et ajustements avec l’équipe", "Documentation et prise en main"].map((item) => <li key={item} className="flex gap-3 py-3 text-sm leading-6 text-dema-paper/78"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-sage" aria-hidden="true" />{item}</li>)}</ul><div className="mt-7"><AccompanimentContactControl className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-dema-paper px-7 py-3 text-sm font-semibold text-dema-forest transition hover:bg-dema-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-paper/50" /></div></div></div></section>

        <section className="border-y border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.38fr_1.62fr] md:items-center md:gap-14"><p className="demaa-section-title whitespace-nowrap text-7xl text-dema-forest sm:text-8xl">30 %</p><blockquote className="border-t border-dema-line pt-7 md:border-l md:border-t-0 md:pl-10 md:pt-0"><p className="text-lg leading-8">“En mettant en place ces systèmes, nous avons gagné environ 30 % de temps. Maîtriser les outils et savoir les relier a vraiment changé notre manière de travailler.”</p><footer className="mt-5 text-sm text-dema-muted">Chef de mission comptable</footer><p className="mt-3 text-xs leading-5 text-dema-muted">Résultat constaté chez ce client sur le travail automatisé. Le gain dépend du fonctionnement, du volume et des tâches concernées.</p></blockquote></div></section>

        <section id="faq" className="px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-5xl"><h2 className="demaa-marketing-section-title">Avant de commencer</h2><div className="mt-9 divide-y divide-dema-line border-y border-dema-line">{faq.map((item) => <details key={item.question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-medium marker:hidden"><span>{item.question}</span><ChevronDown className="h-4 w-4 shrink-0 text-dema-forest transition group-open:rotate-180" aria-hidden="true" /></summary><p className="mt-3 max-w-3xl pr-9 text-sm leading-6 text-dema-muted">{item.answer}</p></details>)}</div></div></section>

        <section className="border-t border-dema-line bg-dema-paper px-5 py-16 text-center sm:px-8 sm:py-20"><div className="mx-auto max-w-3xl"><h2 className="demaa-marketing-section-title">Qu’est-ce qui vous fait perdre du temps ou dépend encore de vous ?</h2><p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-dema-muted">Faisons le point sur ce qu’il faut structurer, automatiser ou préparer en premier.</p><div className="mt-8"><AccompanimentContactControl className={primaryButtonClassName} /></div></div></section>
      </main>
    </>
  );
}
