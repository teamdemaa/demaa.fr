import Image from "next/image";
import { Check } from "lucide-react";
import AccompanimentContactControl from "@/components/AccompanimentContactControl";
import Navbar from "@/components/Navbar";

const transformations = [
  { before: "Informations dispersées", after: "Un système centralisé" },
  { before: "Étapes implicites", after: "Des règles partagées" },
  { before: "Relances manuelles", after: "Des actions qui avancent" },
] as const;

const outcomes = [
  "Les demandes, clients et projets sont suivis au même endroit.",
  "Chaque personne voit sa responsabilité et sa prochaine action.",
  "Les informations circulent sans revenir systématiquement vers vous.",
] as const;

const foundations = [
  { title: "Le suivi", text: "Demandes, clients, devis, projets ou interventions." },
  { title: "L’information", text: "Documents, décisions et contexte accessibles." },
  { title: "Le rythme", text: "Responsabilités, prochaines actions et points de suivi." },
  { title: "L’assistance", text: "ChatGPT Work configuré lorsqu’il apporte un gain réel." },
] as const;

const weeks = [
  { number: "01", title: "Comprendre", text: "On observe ce qui bloque et on choisit un seul périmètre prioritaire." },
  { number: "02", title: "Installer", text: "On configure les espaces, les données et les règles utiles." },
  { number: "03", title: "Faire circuler", text: "On prépare les modèles, les consignes et les automatisations simples." },
  { number: "04", title: "Faire tenir", text: "L’équipe teste avec ses cas réels ; on ajuste et on transmet." },
] as const;

const frequentlyAskedQuestions = [
  { question: "Faut-il déjà savoir quels outils utiliser ?", answer: "Non. Le diagnostic sert précisément à choisir ce qu’il faut simplifier, conserver ou mettre en place." },
  { question: "Faut-il tout changer ?", answer: "Non. Nous partons de ce qui existe. Un nouvel outil n’est retenu que s’il débloque réellement le travail." },
  { question: "Qu’attend-on de nous ?", answer: "Vous nous montrez le fonctionnement réel, validez les décisions et faites tester l’équipe. On prend en charge la structuration et la mise en place." },
  { question: "Que reste-t-il à la fin des quatre semaines ?", answer: "Un premier système utilisé par l’équipe : les informations utiles, les responsabilités, les modèles et les routines sont installés sur le périmètre choisi." },
] as const;

export default function OperationalAccompanimentLandingPage() {
  return (
    <>
      <Navbar minimal publicNavigationActiveView="accompagnement" publicNavigationVariant="demaa" />
      <main className="min-h-screen overflow-x-clip bg-dema-cream text-brand-blue">
        <section className="border-b border-dema-line px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:pt-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">
            <div>
              <h1 className="max-w-3xl text-5xl font-light leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">On organise votre entreprise pour qu’elle repose moins sur vous.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-dema-muted sm:text-xl">En quatre semaines, on met en place un système centralisé pour que l’information circule, que le travail avance et que vous n’ayez plus à tout porter.</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-dema-muted">On part de vos outils actuels. On ne change que ce qui bloque réellement le travail.</p>
              <div className="mt-9 flex flex-col items-start gap-3">
                <AccompanimentContactControl label="Réserver un diagnostic offert" />
                <p className="text-xs text-dema-muted">Diagnostic de 30 minutes · Sans engagement</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-[2rem] border border-dema-line bg-dema-sage/45 p-3 sm:p-5">
              <Image src="/images/accompagnement/organisation-claire.png" alt="Des informations dispersées sont réunies dans un système de travail clair." width={1536} height={1024} sizes="(min-width: 1024px) 50vw, 100vw" className="h-auto w-full mix-blend-multiply" priority />
            </div>
          </div>
        </section>

        <section className="bg-dema-paper px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">Le moment où cela bloque</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">L’activité avance, mais trop de choses reviennent encore vers vous.</h2>
              </div>
              <div className="space-y-4 text-base leading-7 text-dema-muted sm:text-lg sm:leading-8"><p>Les demandes arrivent par plusieurs canaux. Les projets avancent quand vous relancez. L’équipe cherche les informations ou attend une décision.</p><p className="text-brand-blue">Le problème n’est pas le manque d’outils. C’est l’absence d’un fonctionnement partagé.</p></div>
            </div>
            <div className="mt-11 grid overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper md:grid-cols-3">
              {transformations.map((item, index) => <article key={item.before} className={`p-6 sm:p-7 ${index > 0 ? "border-t border-dema-line md:border-l md:border-t-0" : ""}`}><p className="text-sm text-dema-muted line-through decoration-dema-muted/45">{item.before}</p><p className="mt-4 text-xl font-medium tracking-[-0.025em] text-dema-forest">{item.after}</p></article>)}
            </div>
          </div>
        </section>

        <section className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-sage">Ce que nous faisons</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">On met en place un système qui fait circuler le travail.</h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-dema-paper/72">Pas un audit à laisser dans un dossier. Un fonctionnement utilisé dès le lundi suivant.</p>
              <p className="mt-7 max-w-2xl text-base leading-7 text-dema-paper/72">Vous connaissez votre activité et vous validez les décisions. On structure, configure, documente et teste le système avec vos vrais cas.</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-dema-paper/72">On commence par un flux prioritaire : une demande client, un devis, un projet, une intervention ou le suivi de l’équipe.</p>
              <ul className="mt-8 divide-y divide-dema-paper/18 border-y border-dema-paper/18">{outcomes.map((item) => <li key={item} className="flex gap-3 py-4 text-sm leading-6 text-dema-paper/82"><Check className="mt-1 h-4 w-4 shrink-0 text-dema-sage" aria-hidden="true" />{item}</li>)}</ul>
            </div>
            <figure className="overflow-hidden rounded-[2rem] bg-dema-paper p-3 sm:p-5"><Image src="/images/accompagnement/atelier-organisation-equipe.png" alt="Une équipe travaille ensemble sur son fonctionnement." width={1536} height={1024} sizes="(min-width: 1024px) 50vw, 100vw" className="h-auto w-full mix-blend-multiply" /></figure>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-cream px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">Le système centralisé</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Ce que nous mettons en place, concrètement.</h2>
            <div className="mt-11 grid gap-px overflow-hidden rounded-[1.75rem] border border-dema-line bg-dema-line sm:grid-cols-2">{foundations.map((foundation) => <article key={foundation.title} className="bg-dema-paper p-7 sm:p-8"><h3 className="text-xl font-medium tracking-[-0.03em]">{foundation.title}</h3><p className="mt-3 max-w-md text-sm leading-7 text-dema-muted">{foundation.text}</p></article>)}</div>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-paper px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">La méthode</p><h2 className="mt-4 text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Du fonctionnement réel à une première version qui tient.</h2></div>
            <ol className="divide-y divide-dema-line border-y border-dema-line">{weeks.map((week) => <li key={week.number} className="grid gap-4 py-6 sm:grid-cols-[4rem_12rem_1fr] sm:gap-6"><span className="text-2xl font-light text-dema-forest/60">{week.number}</span><h3 className="text-xl font-medium tracking-[-0.03em]">{week.title}</h3><p className="max-w-2xl text-sm leading-7 text-dema-muted">{week.text}</p></li>)}</ol>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-sage/35 px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-forest">Questions fréquentes</p><h2 className="mt-4 text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Ce qu’il faut savoir avant de commencer.</h2></div>
            <div className="border-t border-dema-line">{frequentlyAskedQuestions.map(({ question, answer }) => <details key={question} className="group border-b border-dema-line"><summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-base font-medium leading-6 tracking-[-0.01em] [&::-webkit-details-marker]:hidden"><span>{question}</span><span className="mt-0.5 text-2xl font-light leading-none text-dema-forest transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-dema-muted">{answer}</p></details>)}</div>
          </div>
        </section>

        <section className="bg-dema-forest px-5 py-16 text-dema-paper sm:px-8 sm:py-20 lg:py-24">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-sage">Accompagnement de quatre semaines · 3 500 € HT</p><h2 className="mt-4 max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Quel fonctionnement vous prend le plus d’énergie aujourd’hui ?</h2><p className="mt-5 max-w-2xl text-base leading-7 text-dema-paper/72">Décrivez ce qui se perd, bloque ou vous revient sans cesse. Nous identifierons le premier système à centraliser et vous dirons franchement si cet accompagnement est adapté.</p></div>
            <div className="flex flex-col items-start gap-3 lg:items-end"><AccompanimentContactControl className="inline-flex min-h-12 items-center justify-center rounded-full bg-dema-paper px-7 py-3 text-sm font-semibold text-brand-blue transition hover:bg-dema-sage" label="Réserver un diagnostic offert" /><p className="text-xs text-dema-paper/65">30 minutes · Sans engagement</p></div>
          </div>
        </section>
      </main>
    </>
  );
}
