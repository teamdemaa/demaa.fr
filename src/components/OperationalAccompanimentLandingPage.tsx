import Image from "next/image";
import AccompanimentContactControl from "@/components/AccompanimentContactControl";
import Navbar from "@/components/Navbar";

const deliverables = [
  { title: "Un suivi partagé", text: "Demandes, clients, devis, projets ou interventions." },
  { title: "Des informations accessibles", text: "Documents, décisions et contexte au même endroit." },
  { title: "Des responsabilités claires", text: "Chaque personne sait ce qu’elle a à faire et ce qui vient ensuite." },
  { title: "Des routines qui tiennent", text: "Règles, modèles et automatisations simples pour ne pas repartir de zéro." },
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
        <section className="border-b border-dema-line px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">
            <div>
              <h1 className="max-w-3xl text-5xl font-light leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl">On organise votre entreprise pour qu’elle repose moins sur vous.</h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-dema-muted sm:text-xl">En quatre semaines, on met en place un système centralisé pour que l’information circule, que le travail avance et que vous n’ayez plus à tout porter.</p>
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

        <section className="bg-dema-paper px-5 py-24 sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-4xl">
            <h2 className="max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Le problème n’est pas le manque d’outils. C’est l’absence d’un fonctionnement partagé.</h2>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-dema-muted sm:text-xl">Les demandes arrivent par plusieurs canaux. Les projets attendent vos relances. L’équipe cherche l’information ou attend une décision. Tout finit par revenir vers vous.</p>
          </div>
        </section>

        <section className="bg-dema-forest px-5 py-24 text-dema-paper sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-16">
            <div>
              <h2 className="max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">On commence par ce qui vous revient trop souvent.</h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-dema-paper/78">Une demande client, un devis, un projet, une intervention ou le suivi de l’équipe : on part de votre fonctionnement et de vos outils actuels pour organiser le suivi, les documents, les responsabilités et les règles qui permettent à ce flux d’avancer sans vous.</p>
            </div>
            <figure className="overflow-hidden rounded-[2rem] bg-dema-paper p-4 sm:p-6"><Image src="/images/accompagnement/atelier-organisation-equipe.png" alt="Une équipe travaille ensemble sur son fonctionnement." width={1536} height={1024} sizes="(min-width: 1024px) 50vw, 100vw" className="h-auto w-full mix-blend-multiply" /></figure>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-cream px-5 py-24 sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Ce que vous repartez avec.</h2>
            <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-dema-line bg-dema-line sm:grid-cols-2">{deliverables.map((deliverable) => <article key={deliverable.title} className="bg-dema-paper p-9 sm:p-10"><h3 className="text-xl font-medium tracking-[-0.03em]">{deliverable.title}</h3><p className="mt-4 max-w-md text-sm leading-7 text-dema-muted">{deliverable.text}</p></article>)}</div>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-paper px-5 py-24 sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div><h2 className="text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Du fonctionnement réel à une première version qui tient.</h2></div>
            <ol className="divide-y divide-dema-line border-y border-dema-line">{weeks.map((week) => <li key={week.number} className="grid gap-4 py-6 sm:grid-cols-[4rem_12rem_1fr] sm:gap-6"><span className="text-2xl font-light text-dema-forest/60">{week.number}</span><h3 className="text-xl font-medium tracking-[-0.03em]">{week.title}</h3><p className="max-w-2xl text-sm leading-7 text-dema-muted">{week.text}</p></li>)}</ol>
          </div>
        </section>

        <section className="border-b border-dema-line bg-dema-sage/35 px-5 py-24 sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div><h2 className="text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">Ce qu’il faut savoir avant de commencer.</h2></div>
            <div className="border-t border-dema-line">{frequentlyAskedQuestions.map(({ question, answer }) => <details key={question} className="group border-b border-dema-line"><summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-base font-medium leading-6 tracking-[-0.01em] [&::-webkit-details-marker]:hidden"><span>{question}</span><span className="mt-0.5 text-2xl font-light leading-none text-dema-forest transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-dema-muted">{answer}</p></details>)}</div>
          </div>
        </section>

        <section className="bg-dema-forest px-5 py-24 text-dema-paper sm:px-8 sm:py-28 lg:py-32">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-dema-sage">Accompagnement de quatre semaines</p><h2 className="mt-4 max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">On installe une première version avec vous.</h2><p className="mt-7 text-5xl font-light tracking-[-0.05em] text-dema-paper sm:text-6xl">3 500 € HT</p><p className="mt-6 max-w-2xl text-base leading-7 text-dema-paper/72">Mise en place, documentation, tests avec l’équipe et transmission inclus. Décrivez ce qui vous revient sans cesse : nous vous dirons franchement si cet accompagnement est adapté.</p></div>
            <div className="flex flex-col items-start gap-3 lg:items-end"><AccompanimentContactControl className="inline-flex min-h-12 items-center justify-center rounded-full bg-dema-paper px-7 py-3 text-sm font-semibold text-brand-blue transition hover:bg-dema-sage" label="Réserver un diagnostic offert" /><p className="text-xs text-dema-paper/65">30 minutes · Sans engagement</p></div>
          </div>
        </section>
      </main>
    </>
  );
}
