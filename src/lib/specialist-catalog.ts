import "server-only";

import {
  getCanonicalServiceBySlug,
  type CanonicalService,
  type CanonicalServiceSlug,
} from "@/lib/canonical-service-catalog";

type SpecialistSectionDefinition = Readonly<{
  description: string;
  id: string;
  slugs: readonly CanonicalServiceSlug[];
  title: string;
}>;

export type SpecialistSection = Omit<SpecialistSectionDefinition, "slugs"> & Readonly<{
  services: readonly CanonicalService[];
}>;

const specialistSectionDefinitions = [
  {
    id: "digitaliser-et-automatiser",
    title: "Digitaliser et automatiser",
    description: "Supprimez les tâches répétitives et construisez les outils réellement utiles à votre équipe.",
    slugs: ["automatisation-ia", "application-metier", "assistance-administrative"],
  },
  {
    id: "structurer-et-piloter",
    title: "Structurer et piloter",
    description: "Installez une méthode claire pour suivre l’activité, décider et faire avancer l’entreprise.",
    slugs: ["automatisation-processus", "coach-business"],
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
    services: slugs.map((slug) => {
      const service = getCanonicalServiceBySlug(slug);
      if (!service) throw new Error(`Missing public specialist service: ${slug}`);
      return service;
    }),
  }));
}
