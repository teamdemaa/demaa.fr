import treasury from "../../studio/academy-course-pack-v1/courses/piloter-sa-tresorerie.json";
import revenueAndProfit from "../../studio/academy-course-pack-v1/courses/comprendre-chiffre-affaires-benefice.json";
import pricing from "../../studio/academy-course-pack-v1/courses/fixer-ses-prix-sans-vendre-a-perte.json";
import marketingSystem from "../../studio/academy-course-pack-v1/courses/construire-systeme-marketing-vente.json";
import inboundToClient from "../../studio/academy-course-pack-v1/courses/transformer-demande-en-client.json";
import delegation from "../../studio/academy-course-pack-v1/courses/deleguer-sans-perdre-le-controle.json";
import offer from "../../studio/academy-course-pack-v1/courses/construire-offre-facile-a-acheter.json";
import serviceDelivery from "../../studio/academy-course-pack-v1/courses/livrer-prestation-sans-tout-reinventer.json";
import consultingCase from "../../studio/academy-course-pack-v1/cases/cabinet-conseil-acquisition.json";
import trainingCase from "../../studio/academy-course-pack-v1/cases/formation-b2b-acquisition.json";
import itMaintenanceCase from "../../studio/academy-course-pack-v1/cases/maintenance-informatique-acquisition.json";
import engineeringCase from "../../studio/academy-course-pack-v1/cases/bureau-etudes-acquisition.json";
import cleaningCase from "../../studio/academy-course-pack-v1/cases/nettoyage-professionnel-acquisition.json";
import recruitmentCase from "../../studio/academy-course-pack-v1/cases/cabinet-recrutement-acquisition.json";

export type AcademyContentKind = "course" | "case-study";

export type AcademyVisualType =
  | "comparison"
  | "timeline"
  | "calculation"
  | "metrics"
  | "steps"
  | "pipeline"
  | "brand-case"
  | "story";

export interface AcademyLesson {
  id: string;
  type: "concept" | "example" | "method" | "decision" | "case";
  eyebrow: string;
  title: string;
  body: string;
  visual: {
    type: AcademyVisualType;
    data: Record<string, unknown>;
  };
  takeaway: string;
}

export interface AcademyQuizChoice {
  id: string;
  label: string;
}

export interface AcademyQuizQuestion {
  id: string;
  question: string;
  choices: AcademyQuizChoice[];
  correctChoiceId: string;
  explanation: string;
}

export interface AcademyAction {
  resourceType: "tool" | "template" | "directory-filter";
  resourceId: string;
  title: string;
  description: string;
  ctaLabel: string;
  deliveryMode: "email" | "internal" | "external";
}

export interface AcademyContentDefinition {
  version: "1.0";
  kind: AcademyContentKind;
  status: "draft" | "review" | "ready";
  identity: {
    slug: string;
    title: string;
    shortTitle: string;
    category: string;
    promise: string;
    audience: string;
    durationMinutes: number;
    card: {
      section: string;
      title: string;
      meta: string;
      image: string | null;
      imageAlt: string;
    };
  };
  outline?: Array<{
    title: string;
    description: string;
  }>;
  lessons: AcademyLesson[];
  recap: {
    title: string;
    points: string[];
  };
  quiz: {
    title: string;
    questions: AcademyQuizQuestion[];
  };
  action: AcademyAction | null;
}

const fundamentals = [
  treasury,
  revenueAndProfit,
  pricing,
  marketingSystem,
  inboundToClient,
  delegation,
  offer,
  serviceDelivery,
] as unknown as AcademyContentDefinition[];

const caseStudies = [
  consultingCase,
  itMaintenanceCase,
  recruitmentCase,
  cleaningCase,
  trainingCase,
  engineeringCase,
] as unknown as AcademyContentDefinition[];

const allAcademyContent = [...fundamentals, ...caseStudies].filter(
  (content) => content.status === "ready",
);

export function getAcademyFundamentals() {
  return fundamentals.filter((content) => content.status === "ready");
}

export function getAcademyCaseStudies() {
  return caseStudies.filter((content) => content.status === "ready");
}

export function getAllAcademyContent() {
  return allAcademyContent;
}

export function getAcademyContentBySlug(slug: string) {
  return allAcademyContent.find((content) => content.identity.slug === slug) ?? null;
}

export function getAcademyActionHref(action: AcademyAction) {
  if (action.resourceId === "pilotage-marketing-vente") {
    return "/modeles-de-documents/pilotage-marketing-vente";
  }

  if (action.resourceId === "levier") {
    return "/systemes-operationnels";
  }

  return "/";
}
