"use client";

import { FilloutPopupEmbed } from "@fillout/react";
import {
  ArrowRight,
  Building2,
  Calculator,
  FilePenLine,
  Network,
  Power,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import AccountingRecommendationDialog from "@/components/AccountingRecommendationDialog";
import ServiceIntroductionModal from "@/components/ServiceIntroductionModal";
import { getDemaaServiceBySlug, type DemaaService } from "@/lib/service-catalog";

type AccompagnementServicesProps = {
  source?: string;
  sectorLabel: string;
  systemName: string;
  systemSlug: string;
};

type AccompagnementConfig = {
  slug: string;
  serviceSlug: string;
  title: string;
  description: string;
  action: string;
  icon: LucideIcon;
  mode: "accounting-recommendation" | "booking" | "form";
};

const ACCOMPANIMENT_CARD_CLASS =
  "group flex min-h-[17rem] w-full flex-col rounded-[1.35rem] border border-dema-line bg-dema-paper p-6 text-left transition duration-200 hover:-translate-y-0.5 hover:border-dema-forest/20 hover:shadow-[0_18px_45px_rgba(23,35,29,0.07)]";

const accompagnements: readonly AccompagnementConfig[] = [
  {
    slug: "structuration",
    serviceSlug: "organisation-automatisation",
    title: "Structuration de l’entreprise",
    description:
      "Clarifier votre organisation, vos systèmes et vos priorités pour que l’entreprise repose moins sur vous.",
    action: "Prendre rendez-vous",
    icon: Network,
    mode: "booking",
  },
  {
    slug: "comptabilite",
    serviceSlug: "expert-comptable",
    title: "Trouver un comptable",
    description:
      "Recevoir la recommandation d’un professionnel adapté à votre activité.",
    action: "Recevoir ma recommandation",
    icon: Calculator,
    mode: "accounting-recommendation",
  },
  {
    slug: "creation-societe",
    serviceSlug: "creation-societe",
    title: "Création de société",
    description:
      "Choisir le bon statut et prendre en charge les formalités jusqu’à l’immatriculation.",
    action: "Démarrer ma demande",
    icon: Building2,
    mode: "form",
  },
  {
    slug: "modification-societe",
    serviceSlug: "modification-societe",
    title: "Modification de société",
    description:
      "Gérer un changement de siège, de dirigeant, d’activité, de capital ou de statuts.",
    action: "Décrire la modification",
    icon: FilePenLine,
    mode: "form",
  },
  {
    slug: "fermeture-societe",
    serviceSlug: "fermeture-societe",
    title: "Fermeture de société",
    description:
      "Organiser la dissolution, la liquidation et la radiation sans oublier d’étape.",
    action: "Démarrer ma demande",
    icon: Power,
    mode: "form",
  },
] as const;

function getFormService(config: AccompagnementConfig): DemaaService | null {
  const service = getDemaaServiceBySlug(config.serviceSlug);

  if (!service) {
    return null;
  }

  return {
    ...service,
    slug: config.slug,
    name: config.title,
    shortDescription: config.description,
    description: config.description,
  };
}

export default function AccompagnementServices({
  sectorLabel,
  source = "Accompagnement",
  systemName,
  systemSlug,
}: AccompagnementServicesProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get("service");
  const selectedConfig = accompagnements.find((item) => item.slug === selectedSlug) ?? null;
  const selectedService = selectedConfig ? getFormService(selectedConfig) : null;
  const filloutParameters = useMemo(
    () => ({ systemName, systemSlug, sector: sectorLabel, source }),
    [sectorLabel, source, systemName, systemSlug],
  );

  function openService(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("service", slug);
    params.set("systemSlug", systemSlug);
    params.set("sector", sectorLabel);
    params.set("source", source);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function closeService() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("service");
    params.delete("systemSlug");
    params.delete("sector");
    params.delete("source");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accompagnements.map((item) => {
          const Icon = item.icon;

          if (item.mode === "accounting-recommendation") {
            return (
              <AccountingRecommendationDialog
                key={item.slug}
                buttonClassName={ACCOMPANIMENT_CARD_CLASS}
                sectorLabel={sectorLabel}
                systemName={systemName}
                systemSlug={systemSlug}
                triggerContent={(
                  <>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest shadow-[0_6px_18px_rgba(23,35,29,0.04)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-6 text-[1.35rem] font-medium leading-[1.15] tracking-[-0.02em] text-brand-blue">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[0.9375rem] leading-6 text-dema-muted">
                      {item.description}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.9375rem] font-semibold text-dema-forest">
                      {item.action}
                      <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </>
                )}
              />
            );
          }

          return (
            <button
              key={item.slug}
              type="button"
              onClick={() => openService(item.slug)}
              className={ACCOMPANIMENT_CARD_CLASS}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest shadow-[0_6px_18px_rgba(23,35,29,0.04)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-[1.35rem] font-medium leading-[1.15] tracking-[-0.02em] text-brand-blue">
                {item.title}
              </h3>
              <p className="mt-3 text-[0.9375rem] leading-6 text-dema-muted">
                {item.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.9375rem] font-semibold text-dema-forest">
                {item.action}
                <ArrowRight
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </button>
          );
        })}
      </div>

      {selectedConfig?.mode === "booking" ? (
        <FilloutPopupEmbed
          filloutId="sWP6PSPRVLus"
          inheritParameters
          parameters={filloutParameters}
          isOpen
          onClose={closeService}
          width={720}
          height={720}
        />
      ) : null}

      {selectedConfig?.mode === "form" && selectedService ? (
        <ServiceIntroductionModal
          service={selectedService}
          source={source}
          systemSlug={systemSlug}
          onClose={closeService}
        />
      ) : null}
    </>
  );
}
