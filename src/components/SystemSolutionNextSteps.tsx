import { ArrowRight, Copy, PanelsTopLeft } from "lucide-react";
import Link from "next/link";

export default function SystemSolutionNextSteps({ systemId, systemName }: { systemId: string; systemName: string }) {
  return (
    <section aria-labelledby="system-next-steps-heading" className="grid gap-4 border-t border-dema-line pt-10 md:grid-cols-2">
      <h2 id="system-next-steps-heading" className="sr-only">
        Choisir la prochaine étape pour {systemName}
      </h2>
      <article className="flex min-h-64 flex-col rounded-[1.35rem] bg-dema-forest p-6 text-dema-paper sm:p-7">
        <Copy className="h-5 w-5 text-dema-sage" aria-hidden="true" />
        <h3 className="mt-7 text-2xl font-light leading-tight tracking-[-0.035em]">Commencer avec une structure prête à copier</h3>
        <p className="mt-3 text-sm leading-6 text-dema-paper/72">Retrouvez les modèles gratuits qui peuvent servir de base à cette activité.</p>
        <Link href={`/modeles?metier=${encodeURIComponent(systemId)}`} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dema-paper px-5 text-sm font-medium text-dema-forest transition hover:bg-dema-sage">
          Voir les modèles adaptés
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </article>

      <article className="flex min-h-64 flex-col rounded-[1.35rem] border border-dema-forest/28 bg-dema-paper p-6 sm:p-7">
        <PanelsTopLeft className="h-5 w-5 text-dema-forest" aria-hidden="true" />
        <h3 className="mt-7 text-2xl font-light leading-tight tracking-[-0.035em] text-brand-blue">Aucune solution ne correspond à votre fonctionnement ?</h3>
        <p className="mt-3 text-sm leading-6 text-dema-muted">Une application métier peut reprendre votre manière de travailler sans vous imposer un outil standard.</p>
        <Link href={`/application-metier?system=${encodeURIComponent(systemId)}`} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dema-forest px-5 text-sm font-medium text-dema-forest transition hover:bg-dema-sage/55">
          Découvrir l’Application métier
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </article>
    </section>
  );
}
