import "server-only";

import {
  getCanonicalServiceBySlug,
  getCanonicalServiceRecordBySlug,
  type CanonicalService,
  type CanonicalServiceSlug,
} from "@/lib/canonical-service-catalog";

type SpecialistSectionDefinition = Readonly<{
  description: string;
  id: string;
  slugs: readonly CanonicalServiceSlug[];
  title: string;
}>;

export type SpecialistDirectory = Readonly<{
  kind: "coach" | "accountant";
  title: string;
  description: string;
  href: string;
}>;

export type SpecialistSection = Omit<SpecialistSectionDefinition, "slugs"> & Readonly<{
  services: readonly CanonicalService[];
  directories: readonly SpecialistDirectory[];
}>;

const specialistSectionDefinitions = [
  {
    id: "automatisation-et-ia",
    title: "Automatisation & IA",
    description: "Supprimez les tâches répétitives et construisez les outils réellement utiles à votre équipe.",
    slugs: ["automatisation-ia", "application-metier"],
  },
  {
    id: "piloter-et-s-entourer",
    title: "Piloter & s’entourer",
    description: "Trouvez un appui pour vos décisions, votre comptabilité et la gestion quotidienne de l’entreprise.",
    slugs: ["assistance-administrative", "formalites-entreprise"],
  },
  {
    id: "developper-l-activite",
    title: "Développer l’activité",
    description: "Activez les bons leviers d’acquisition avec un périmètre et des responsabilités clairement définis.",
    slugs: ["publicite-en-ligne", "gestion-reseaux-sociaux", "prospection-ciblee"],
  },
] as const satisfies readonly SpecialistSectionDefinition[];

export function getSpecialistSections(): readonly SpecialistSection[] {
  return specialistSectionDefinitions.map(({ slugs, ...section }) => ({
    ...section,
    directories: section.id === "piloter-et-s-entourer" ? [
      {
        kind: "coach" as const,
        title: "Trouver un coach business",
        description: "Comparez des profils de coachs selon votre besoin et contactez-les directement.",
        href: "/annuaire-coachs",
      },
      {
        kind: "accountant" as const,
        title: "Trouver un expert-comptable",
        description: "Consultez l’annuaire et choisissez un professionnel adapté à votre activité.",
        href: "/annuaire-experts-comptables",
      },
    ] : [],
    services: slugs.map((slug) => {
      // This day-rate offer is intentionally exposed only in the Specialists index.
      const service = slug === "automatisation-ia"
        ? getCanonicalServiceRecordBySlug(slug)
        : getCanonicalServiceBySlug(slug);
      if (!service) throw new Error(`Missing public specialist service: ${slug}`);
      return service;
    }),
  }));
}
