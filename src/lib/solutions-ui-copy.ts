import type { SolutionSection } from "@/lib/solution-registry-dto";
import { defineLocaleDictionary } from "@/lib/international-publication";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import type { RenderableSolutionPlacementDto } from "@/lib/system-solutions-ui-dto";

type VisibleSolutionSection = Exclude<SolutionSection, "models">;
type ResourceType = RenderableSolutionPlacementDto["resource"]["resourceType"];

const copy = defineLocaleDictionary({
  fr: {
    sectionLabels: {
      software: "Outils et logiciels",
      services: "Accompagnement",
      providers: "Fournisseurs",
      financing: "Financement et aides",
      aids: "Aides et subventions",
      networks: "Réseaux professionnels",
    } satisfies Record<VisibleSolutionSection, string>,
    resourceLabels: {
      tool: "Outil",
      software: "Logiciel",
      provider: "Fournisseur",
      directory: "Organisation professionnelle",
      expertise: "Prestation",
      financing: "Financement",
      aid: "Aide publique",
    } satisfies Record<ResourceType, string>,
    detailsFor: (resourceName: string) => `Détails de ${resourceName}`,
    close: "Fermer",
    gain: "Ce que vous y gagnez",
    fit: "Pourquoi cette solution",
    price: "Tarif indicatif",
    constraints: "À vérifier avant de choisir",
    discover: "Découvrir la solution",
    empty: "Nous vérifions encore les solutions les plus pertinentes pour ce métier.",
    selection: "Votre sélection",
    open: (resourceName: string) => `Ouvrir ${resourceName}`,
    removeFromSelection: (resourceName: string) =>
      `Retirer ${resourceName} de votre sélection`,
    save: (resourceName: string) => `Enregistrer ${resourceName}`,
    previous: "Voir les solutions précédentes",
    next: "Voir les solutions suivantes",
  },
  en: {
    sectionLabels: {
      software: "Tools",
      services: "Services",
      providers: "Providers",
      financing: "Finance",
      aids: "Grants and support",
      networks: "Professional networks",
    } satisfies Record<VisibleSolutionSection, string>,
    resourceLabels: {
      tool: "Tool",
      software: "Software",
      provider: "Provider",
      directory: "Professional organisation",
      expertise: "Service",
      financing: "Finance",
      aid: "Public support",
    } satisfies Record<ResourceType, string>,
    detailsFor: (resourceName: string) => `Details for ${resourceName}`,
    close: "Close",
    gain: "What this helps you achieve",
    fit: "Why it may fit",
    price: "Indicative price",
    constraints: "Before you decide",
    discover: "Discover this solution",
    empty: "We are still reviewing the most relevant solutions for this business type.",
    selection: "Your selection",
    open: (resourceName: string) => `Open ${resourceName}`,
    removeFromSelection: (resourceName: string) =>
      `Remove ${resourceName} from your selection`,
    save: (resourceName: string) => `Save ${resourceName}`,
    previous: "View previous solutions",
    next: "View next solutions",
  },
});

export function getSolutionsUiCopy(localeCode: InterfaceLocaleCode) {
  return copy[localeCode];
}
