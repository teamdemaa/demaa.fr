"use client";

import { useState } from "react";
import {
  Blocks,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileCheck,
  FolderKanban,
  Mail,
  Users,
} from "lucide-react";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";
import type { SystemeDetail } from "@/lib/systeme-catalog";

type ServiceExpandedContentProps = {
  serviceSlug: string;
  variant?: "modal" | "page";
  systemName?: string;
  systeme?: SystemeDetail | null;
};

const organisationSignals = [
  {
    icon: FileCheck,
    title: "Tout passe encore par vous",
    description:
      "Quand chaque validation, relance ou décision revient vers vous, l’entreprise ralentit et vous épuise.",
  },
  {
    icon: Users,
    title: "Votre quotidien est trop chargé",
    description:
      "Vous passez trop de temps à gérer, rappeler, vérifier et rattraper au lieu d’avancer sur l’essentiel.",
  },
  {
    icon: Blocks,
    title: "L’activité avance, mais pas de façon autonome",
    description:
      "Sans cadre clair, l’équipe dépend encore de vous pour faire tourner les sujets correctement.",
  },
] as const;

const organisationSteps = [
  {
    title: "On fait le point sur votre organisation",
    description:
      "On identifie les tâches répétitives, les outils, les documents, les validations et les points de friction.",
  },
  {
    title: "On repère les priorités à traiter",
    description:
      "On voit ce qui bloque vraiment, ce qui dépend trop de vous et ce qui mérite d'être structuré en premier.",
  },
  {
    title: "On vous oriente vers la suite utile",
    description:
      "Vous repartez avec une lecture claire des besoins. Si nécessaire, vous pourrez ensuite choisir le bon service à lancer.",
  },
] as const;

const organisationPillars = [
  "Direction et priorités",
  "Marketing et vente",
  "Opérations et suivi client",
  "Finance et administratif",
  "Équipe et responsabilités",
] as const;

const organisationFaq = [
  {
    question: "Est-ce que le diagnostic offert m'engage à acheter quelque chose ?",
    answer:
      "Non. Le diagnostic sert à faire le point sur votre organisation et à clarifier vos besoins. Vous décidez ensuite librement de la suite.",
  },
  {
    question: "Qu'est-ce que vous regardez pendant le diagnostic ?",
    answer:
      "On regarde les tâches répétitives, les outils, les documents, les validations, les zones de flou et les sujets qui vous font perdre du temps au quotidien.",
  },
  {
    question: "Est-ce utile si mon activité est encore très manuelle ?",
    answer:
      "Oui. Le but n'est pas de forcer une solution technique, mais d'identifier ce qui doit d'abord être clarifié, structuré ou mieux réparti.",
  },
  {
    question: "Qu'est-ce que je récupère à la fin ?",
    answer:
      "Vous repartez avec un regard extérieur, des priorités plus claires et une lecture concrète des actions ou services utiles pour la suite.",
  },
  {
    question: "Quel gain peut-on espérer ?",
    answer:
      "En général, ce type de travail permet d'identifier 20 à 30 % de temps récupérable sur les routines qui encombrent le quotidien.",
  },
] as const;

const organisationKeyFacts = [
  {
    label: "Offert",
    title: "Premier diagnostic",
    description:
      "Le diagnostic sert à faire le point sur votre organisation avant de décider quoi lancer ensuite.",
  },
  {
    label: "Sans engagement",
    title: "Vous choisissez la suite",
    description:
      "Vous repartez avec une lecture plus claire, sans obligation d'acheter un service derrière.",
  },
  {
    label: "Résultat attendu",
    title: "Priorités plus lisibles",
    description:
      "On repère ce qui bloque le plus, ce qui dépend trop de vous et ce qu'il faut traiter d'abord.",
  },
  {
    label: "Repère de gain",
    title: "20 à 30 % de temps",
    description:
      "C'est souvent le volume de temps récupérable qu'on arrive à identifier sur les routines qui encombrent le quotidien.",
  },
] as const;

const assistantTimeline = [
  {
    step: "Étape 1",
    title: "2 mois de formation sur le contexte de votre entreprise",
    description:
      "La formation pose les bases de l'organisation, de la structuration et des routines administratives utiles avant l'arrivée en entreprise.",
  },
  {
    step: "Étape 2",
    title: "12 mois d'alternance",
    description:
      "L'assistante est en entreprise 4 jours par semaine pour reprendre progressivement l'administratif du quotidien.",
  },
] as const;

const assistantResponsibilities = [
  {
    icon: FolderKanban,
    title: "Devis, factures, suivi",
    description: "Préparer les devis, émettre les factures et suivre les dossiers en cours.",
  },
  {
    icon: Mail,
    title: "Relances et paiements",
    description: "Suivre les échéances, relancer les retards et garder le fil sur les encaissements.",
  },
  {
    icon: CircleDollarSign,
    title: "Collecte et transmission comptable",
    description: "Récupérer les pièces utiles et les intégrer dans l'outil comptable ou les envoyer au comptable.",
  },
  {
    icon: Clock3,
    title: "Routine de facturation cadrée",
    description: "Structurer les routines, les dossiers et les outils pour éviter les retards et les oublis.",
  },
] as const;

const assistantComparison = [
  {
    title: "Assistante facturation salariée",
    amount: "2 579,56 € / mois",
    description: "Repère de coût employeur pour 1 700 € net / mois.",
    emphasis: false,
  },
  {
    title: "Avec Demaa (POEI + alternance)",
    amount: "Entre 572,85 € et 1 450,35 € / mois",
    description: "Aides déduites, selon l'âge et le profil recruté.",
    emphasis: true,
  },
] as const;

const assistantFaq = [
  {
    question: "Quelles tâches l'assistant(e) peut-il ou elle reprendre concrètement ?",
    answer:
      "Les tâches liées au cycle devis, facture, relance et transmission comptable : préparation des devis, émission des factures, suivi des paiements, relances, collecte des pièces et intégration dans l'outil comptable ou envoi au comptable.",
  },
  {
    question: "À partir de quand la personne peut-elle être opérationnelle dans l'entreprise ?",
    answer:
      "Le parcours est pensé pour qu'une base solide soit déjà posée avant l'arrivée en entreprise, puis que l'autonomie monte progressivement pendant l'alternance.",
  },
  {
    question: "Pourquoi ce format est-il plus accessible qu'une embauche classique ?",
    answer:
      "Le coût est allégé par le cadre du dispositif et les aides mobilisables, tout en sécurisant la montée en compétence sur un périmètre concret et utile dès le départ.",
  },
  {
    question: "Combien de temps dois-je prévoir de mon côté pour l'intégration ?",
    answer:
      "Il faut prévoir un cadrage au départ, puis un suivi régulier mais raisonnable. L'objectif est justement d'éviter que toute la transmission repose sur vous seul.",
  },
] as const;

const fiscalAuditFaq = [
  {
    question: "À quoi sert cet audit si je travaille déjà avec un comptable ?",
    answer:
      "Il sert à prendre un regard complémentaire sur vos pratiques du quotidien : TVA, caisse, justificatifs, notes de frais, cohérence bancaire et zones de risque ou d'optimisation possibles.",
  },
  {
    question: "Qu'est-ce que je récupère à la fin ?",
    answer:
      "Vous repartez avec les points sensibles identifiés, les optimisations fiscales ou administratives repérées, et une liste d'actions concrètes à corriger ou sécuriser.",
  },
  {
    question: "Est-ce utile même sans contrôle fiscal en cours ?",
    answer:
      "Oui. L'intérêt est justement d'anticiper, de corriger ce qui doit l'être et de repérer les optimisations possibles avant qu'un problème ou un contrôle ne vous y oblige.",
  },
] as const;

export default function ServiceExpandedContent({
  serviceSlug,
  variant = "modal",
  systemName,
  systeme,
}: ServiceExpandedContentProps) {
  const service = getDemaaServiceBySlug(serviceSlug);

  if (!service) {
    return null;
  }

  if (serviceSlug === "organisation-automatisation") {
    return (
      <OrganisationExpandedContent
        variant={variant}
        systemName={systemName}
        systeme={systeme}
      />
    );
  }

  if (serviceSlug === "recrutement-assistante-facturation") {
    return <AssistantExpandedContent variant={variant} />;
  }

  if (serviceSlug === "audit-conformite-fiscale") {
    return <FiscalAuditExpandedContent variant={variant} />;
  }

  return <GenericServiceExpandedContent serviceSlug={serviceSlug} variant={variant} />;
}

function GenericServiceExpandedContent({
  serviceSlug,
  variant,
}: {
  serviceSlug: string;
  variant: "modal" | "page";
}) {
  const service = getDemaaServiceBySlug(serviceSlug);

  if (!service) {
    return null;
  }

  const faqItems =
    serviceSlug === "assistante-facturation"
      ? [
          {
            question: "Quelle est la différence entre Standard et Confort ?",
            answer:
              "Les deux forfaits couvrent la collecte WhatsApp des factures fournisseurs, l'émission des factures clients et la transmission comptable. Le forfait Confort ajoute les relances clients et le reporting mensuel, avec un volume plus large.",
          },
          {
            question: "Qu'est-ce qui est vraiment pris en charge chaque mois ?",
            answer:
              "Le cœur du service, c'est la reprise du flux de facturation courant : collecte des factures fournisseurs, émission des factures clients et transmission dans votre outil ou au comptable. L'objectif est que le sujet avance sans repasser par vous à chaque étape.",
          },
          {
            question: "Est-ce que les relances clients sont incluses ?",
            answer:
              "Oui, mais uniquement dans le forfait Confort. Le forfait Standard reste centré sur la gestion courante du flux fournisseurs et clients, sans relances ni reporting mensuel.",
          },
          {
            question: "Est-ce que c'est adapté si je n'ai pas d'assistante en interne ?",
            answer:
              "Oui. Ce service est justement pensé pour les petites entreprises qui veulent remettre de l'ordre dans la facturation sans recruter tout de suite, ni porter seules le suivi administratif.",
          },
          {
            question: "Comment cela se passe avec mon comptable ou mon logiciel ?",
            answer:
              "Demaa reprend le flux, rassemble les bonnes pièces et les transmet proprement dans votre outil ou à votre comptable. Le but est de fluidifier le process, pas de rajouter une couche de complexité.",
          },
        ] as const
      : [
          {
            question: "Ce service est-il adapté à mon activité ?",
            answer: service.bestFor,
          },
          {
            question: "Qu'est-ce qui est inclus concrètement ?",
            answer: `Le service inclut ${joinAsSentence(service.deliverables)}.`,
          },
          {
            question: "Combien de temps faut-il prévoir ?",
            answer: `Le cadrage prévu pour cette prestation est de ${service.duration}, avec un démarrage organisé autour de vos priorités et des éléments à réunir.`,
          },
          {
            question: "Comment la mission démarre-t-elle ?",
            answer:
              "On commence par qualifier le besoin, valider le périmètre utile et rassembler les informations nécessaires pour lancer la mission de façon fluide.",
          },
        ] as const;

  return <FaqSection title="Questions fréquentes" items={faqItems} variant={variant} />;
}

function OrganisationExpandedContent({
  variant,
  systemName,
  systeme,
}: {
  variant: "modal" | "page";
  systemName?: string;
  systeme?: SystemeDetail | null;
}) {
  const sectionGap = variant === "modal" ? "space-y-16" : "space-y-8";
  const sectionClass =
    variant === "modal"
      ? ""
      : "rounded-[1.15rem] border border-dema-line bg-dema-paper p-5";
  const pillarCards = systeme?.cards?.length
    ? systeme.cards.map((card) => card.pillar)
    : organisationPillars;
  const contextualTitle = systemName
    ? `Les grands piliers analysés pour ${withArticle(systemName)}`
    : "Ce qui va être analysé";

  return (
    <div className={sectionGap}>
      <section className={sectionClass}>
        <div className="max-w-3xl">
          <h3 className="text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
            Quand l’organisation devient indispensable
          </h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {organisationSignals.map((item) => (
            <article
              key={item.title}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-cream/60 px-5 py-5 sm:rounded-[1rem] sm:px-6 sm:py-6"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h4 className="mt-3 text-base font-normal leading-snug text-brand-blue">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
          Comment ça se passe concrètement
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {organisationSteps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-paper/95 px-4 py-4 sm:rounded-[1rem]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dema-sage/55 text-sm font-semibold text-dema-forest">
                {index + 1}
              </span>
              <h4 className="mt-3 text-base font-semibold leading-snug text-brand-blue">
                {step.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
          {contextualTitle}
        </h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {pillarCards.map((pillar, index) => (
            <div
              key={pillar}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-cream/60 px-4 py-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest/75">
                Pilier {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-brand-blue">
                {pillar}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
          Infos clés du diagnostic
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue md:text-2xl">
          Ce que vous devez savoir avant de le demander
        </h3>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {organisationKeyFacts.map((item) => (
            <article
              key={item.title}
              className="rounded-[0.95rem] border border-dema-line/70 bg-dema-cream/60 px-4 py-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest/75">
                {item.label}
              </p>
              <h4 className="mt-2 text-base font-semibold leading-snug text-brand-blue">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <FaqSection title="Questions fréquentes" items={organisationFaq} />
    </div>
  );
}

function AssistantExpandedContent({
  variant,
}: {
  variant: "modal" | "page";
}) {
  const sectionGap = variant === "modal" ? "space-y-5 sm:space-y-6" : "space-y-8";
  const sectionClass =
    variant === "modal"
      ? "rounded-[1.05rem] border border-dema-line bg-dema-paper p-4 sm:rounded-[1.15rem] sm:p-5"
      : "rounded-[1.15rem] border border-dema-line bg-dema-paper p-5";

  return (
    <div className={sectionGap}>
      <section className={sectionClass}>
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
            Récap de l&apos;offre
          </p>
          <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-brand-blue md:text-[1.85rem]">
            Un parcours pensé pour sécuriser la facturation sans tout construire seul
          </h3>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {assistantTimeline.map((item) => (
            <article
              key={item.step}
              className="rounded-[0.95rem] bg-dema-sage/35 px-4 py-4 sm:rounded-[1rem]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest/80">
                {item.step}
              </p>
              <h4 className="mt-2 text-base font-semibold leading-snug text-brand-blue">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h3 className="text-[1.5rem] font-semibold tracking-tight text-brand-blue md:text-[1.85rem]">
          Ce qui peut être pris en charge
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {assistantResponsibilities.map((item) => (
            <article
              key={item.title}
              className="rounded-[0.95rem] bg-dema-sage/18 px-4 py-4 sm:rounded-[1rem]"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-dema-sage/55 text-dema-forest">
                <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <h4 className="mt-3 text-base font-semibold leading-snug text-brand-blue">
                {item.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dema-forest">
          Repère de coût
        </p>
        <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-brand-blue md:text-[1.85rem]">
          Un coût plus accessible qu&apos;une embauche classique
        </h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {assistantComparison.map((item) => (
            <article
              key={item.title}
              className={`rounded-[0.95rem] border px-4 py-4 sm:rounded-[1rem] ${
                item.emphasis
                  ? "border-dema-forest/15 bg-dema-sage/35"
                  : "border-dema-line/70 bg-dema-paper"
              }`}
            >
              <p className="text-sm font-medium text-brand-blue">{item.title}</p>
              <p
                className={`mt-2 text-2xl font-medium tracking-tight ${
                  item.emphasis ? "text-dema-forest" : "text-brand-blue"
                }`}
              >
                {item.amount}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <FaqSection title="Questions fréquentes" items={assistantFaq} />
    </div>
  );
}

function withArticle(systemName: string) {
  const lowerName = systemName.trim().toLowerCase();

  if (
    lowerName.startsWith("cabinet ") ||
    lowerName.startsWith("agence ") ||
    lowerName.startsWith("entreprise ") ||
    lowerName.startsWith("organisme ")
  ) {
    return `un ${lowerName}`;
  }

  return lowerName;
}

function FiscalAuditExpandedContent({
  variant,
}: {
  variant: "modal" | "page";
}) {
  const sectionGap = variant === "modal" ? "space-y-5 sm:space-y-6" : "space-y-8";

  return (
    <div className={sectionGap}>
      <FaqSection title="Questions fréquentes" items={fiscalAuditFaq} variant={variant} />
    </div>
  );
}

function FaqSection({
  title,
  items,
  variant = "modal",
}: {
  title: string;
  items: readonly {
    question: string;
    answer: string;
  }[];
  variant?: "modal" | "page";
}) {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionClass =
    variant === "modal"
      ? "rounded-[1.05rem] border border-dema-line bg-dema-paper p-4 sm:rounded-[1.15rem] sm:p-5"
      : "rounded-[1.15rem] border border-dema-line bg-dema-paper p-5";

  return (
    <section className={sectionClass}>
      <h3 className="text-[1.5rem] font-semibold tracking-tight text-brand-blue md:text-[1.85rem]">
        {title}
      </h3>
      <div className="mt-5 divide-y divide-dema-line/70 rounded-[1rem] border border-dema-line/70 bg-dema-paper">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const answerId = `service-faq-answer-${title}-${index}`;

          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-dema-sage/35 sm:px-5"
                aria-expanded={isOpen}
                aria-controls={answerId}
              >
                <span className="text-[1rem] font-medium leading-snug text-brand-blue md:text-[1.08rem]">
                  {item.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-dema-forest transition ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen ? (
                <div id={answerId} className="px-4 pb-4 sm:px-5">
                  <p className="text-[1rem] leading-relaxed text-dema-muted md:text-[1.05rem]">
                    {item.answer}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function joinAsSentence(items: readonly string[]) {
  if (items.length === 0) {
    return "un accompagnement défini selon votre besoin";
  }

  if (items.length === 1) {
    return items[0].toLowerCase();
  }

  if (items.length === 2) {
    return `${items[0].toLowerCase()} et ${items[1].toLowerCase()}`;
  }

  return `${items
    .slice(0, -1)
    .map((item) => item.toLowerCase())
    .join(", ")} et ${items[items.length - 1].toLowerCase()}`;
}
