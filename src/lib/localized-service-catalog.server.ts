import "server-only";

import {
  getCanonicalServiceBySlug,
  getCanonicalServices,
} from "@/lib/canonical-service-catalog";
import type {
  CanonicalService,
  CanonicalServicePackage,
  CanonicalServicePackageSlug,
  CanonicalServiceSlug,
} from "@/lib/canonical-service-contract";
import type {
  InternationalContext,
  MarketCode,
} from "@/lib/international-context";

type ServicePackageProjection = Readonly<{
  included: readonly string[];
  name: string;
  slug: CanonicalServicePackageSlug;
  summary: string;
}>;

type ServiceProjection = Readonly<{
  conditions: readonly string[];
  description: string;
  eyebrow: string;
  included: readonly string[];
  name: string;
  notIncluded: readonly string[];
  packages: readonly ServicePackageProjection[];
  result: string;
  slug: CanonicalServiceSlug;
  summary: string;
}>;

const ENGLISH_SERVICE_PROJECTIONS: Readonly<
  Partial<Record<CanonicalServiceSlug, ServiceProjection>>
> = {
  "automatisation-processus": {
    slug: "automatisation-processus",
    name: "Process automation and AI",
    eyebrow: "Operations, automation and AI",
    summary: "Reduce manual work with reliable workflows and targeted AI, integrated with the tools you already use.",
    description: "We simplify the process first, automate repetitive steps, then introduce AI only where it creates a concrete gain with human checks.",
    result: "A simpler, more reliable and documented process with fewer manual tasks to monitor.",
    included: ["Process review and prioritisation", "Approved integrations, automations and AI use cases", "Testing, human checks, documentation and handover"],
    conditions: ["Scope and acceptance criteria are agreed before work starts", "Access, licences and usage costs remain under your control"],
    notIncluded: ["An open-ended redesign of every process", "Third-party licences, AI usage and software fees", "Fully autonomous AI or a guaranteed business outcome"],
    packages: [
      {
        slug: "automatisation-essentielle",
        name: "Essential automation",
        summary: "One complete business workflow, scoped and automated from end to end.",
        included: ["One process", "Up to two standard tools", "Up to five deterministic business steps", "Testing, documentation and handover"],
      },
      {
        slug: "automatisation-avancee-ia",
        name: "Advanced automation and AI",
        summary: "A richer workflow with conditions, an API or a targeted, controlled AI use case.",
        included: ["One process", "Up to four standard tools", "Up to ten business steps", "One documented API or targeted AI use case with human approval", "Error handling, testing, documentation and handover"],
      },
    ],
  },
  "application-metier": {
    slug: "application-metier",
    name: "Business application",
    eyebrow: "A tailored operational workspace",
    summary: "Bring a business process into one clear application when your current tools no longer fit the way you work.",
    description: "We clarify the process, design the useful screens and build a bounded business application around the agreed use case.",
    result: "A shared workspace that centralises the useful data, steps and responsibilities.",
    included: ["Process and acceptance-criteria workshop", "Design, development and testing of the agreed scope", "Launch, training and documentation"],
    conditions: ["Data, access and review timelines are agreed before work starts", "Any material scope change is quoted separately"],
    notIncluded: ["Large-scale data migration or complex ERP integration", "Native mobile apps, critical engines or highly granular permissions", "Licences, specialist hosting and external fees"],
    packages: [
      {
        slug: "application-metier-essentielle",
        name: "Essential business application",
        summary: "One complete process, its database and the screens needed for day-to-day work.",
        included: ["One process and one database", "Up to four screens", "One main user role and one administrator role", "Standard authentication and simple automations", "Launch, training and thirty days of defect correction"],
      },
      {
        slug: "application-metier-avancee",
        name: "Advanced business application",
        summary: "Several journeys and roles with advanced business logic and a documented integration.",
        included: ["Up to two processes and one database", "Up to eight screens", "Two to three roles", "Advanced business logic, automations and one documented integration", "Launch, training, documentation and thirty days of defect correction"],
      },
    ],
  },
  "coach-business": {
    slug: "coach-business",
    name: "Business coaching",
    eyebrow: "Ongoing support for the business owner",
    summary: "A monthly partnership to clarify priorities, make stronger decisions and keep moving forward.",
    description: "Demaa clarifies your needs and matches you with a relevant business coach. The support includes two individual 60-minute sessions each month, preparation of priorities and follow-up between sessions on the topics being worked on.",
    result: "A regular space to step back, decide faster and keep the business moving in the right direction.",
    included: ["Needs assessment and coach matching", "Two individual 60-minute sessions each month", "Priority preparation and follow-up between sessions"],
    conditions: ["The match is confirmed before the engagement starts", "Follow-up stays focused on the agreed priorities"],
    notIncluded: ["Executing the actions on your behalf", "Ongoing support on topics unrelated to the agreed priorities"],
    packages: [],
  },
  "expert-comptable": {
    slug: "expert-comptable",
    name: "Qualified accountant in France",
    eyebrow: "Accounting and management information",
    summary: "Find a French chartered accountant registered with the professional body and suited to your activity and organisation.",
    description: "Demaa clarifies your needs and introduces you to a French chartered accountant registered with the Ordre. You remain free to choose whether to work with the selected firm.",
    result: "A conversation with firms that understand your context, without searching through dozens of profiles yourself.",
    included: ["Assessment of your activity and needs", "Search for a suitable accounting firm", "Introduction to the selected contact"],
    conditions: ["You remain free to proceed", "The engagement is contracted directly with the selected firm"],
    notIncluded: ["Bookkeeping or payroll performed by Demaa", "A guarantee that a firm will accept the engagement before assessment"],
    packages: [],
  },
  "assistance-administrative": {
    slug: "assistance-administrative",
    name: "Administrative assistant",
    eyebrow: "Administrative support",
    summary: "Find suitable administrative support to delegate clearly defined tasks and regain time.",
    description: "Demaa clarifies the tasks, volume and expected rhythm, then introduces you to a suitable administrative assistant. You remain free to proceed with the selected professional.",
    result: "Structured administrative support with responsibilities and working arrangements agreed before the engagement starts.",
    included: ["Assessment of tasks, volume and rhythm", "Search for a suitable administrative assistant", "Introduction and transfer of the useful context"],
    conditions: ["You remain free to proceed", "Scope and working arrangements are confirmed before the engagement starts"],
    notIncluded: ["Bookkeeping or payroll", "Management decisions made on your behalf"],
    packages: [],
  },
  "formalites-entreprise": {
    slug: "formalites-entreprise",
    name: "French company formalities",
    eyebrow: "Formation, changes and closure",
    summary: "Have a French company formation, change or closure handled by an appropriate professional.",
    description: "Demaa clarifies the required formality and introduces you to an authorised professional. You remain free to proceed with the selected professional.",
    result: "A clearly scoped formality entrusted to an appropriate professional without searching for the right contact alone.",
    included: ["Assessment of the formation, change or closure required", "Search for an appropriate professional", "Introduction and transfer of the useful context"],
    conditions: ["You remain free to proceed", "The professional confirms the scope before work starts"],
    notIncluded: ["Individual legal advice provided by Demaa", "Registry, publication or other administrative fees"],
    packages: [],
  },
  "gestion-reseaux-sociaux": {
    slug: "gestion-reseaux-sociaux",
    name: "Social media management",
    eyebrow: "Communication",
    summary: "Build a regular and consistent presence on the social channels that matter to your business.",
    description: "Editorial scope, publishing rhythm, formats and approval process are agreed before recurring production begins.",
    result: "Consistent communication that fits the time and resources genuinely available in the business.",
    included: ["Editorial planning", "Content calendar and agreed production", "Approval and publication follow-up"],
    conditions: ["Rhythm and responsibilities are agreed before work starts", "Account access remains under your control"],
    notIncluded: ["Media spend", "Heavy audiovisual production not included in the quote"],
    packages: [],
  },
  "prospection-ciblee": {
    slug: "prospection-ciblee",
    name: "Targeted B2B prospecting",
    eyebrow: "Business development",
    summary: "Build focused prospecting around the right companies, clear messages and a consistent follow-up process.",
    description: "Target profiles, qualification criteria, messages and volume are agreed before research and outreach begin.",
    result: "A more focused and traceable prospecting process with shared criteria and organised follow-up.",
    included: ["Targeting criteria", "Research and qualification within the agreed scope", "Messages and outreach follow-up"],
    conditions: ["Scope and permitted outreach practices are agreed", "Meetings are never guaranteed"],
    notIncluded: ["Buying non-compliant contact lists", "Untargeted bulk outreach"],
    packages: [],
  },
  "publicite-en-ligne": {
    slug: "publicite-en-ligne",
    name: "Paid acquisition",
    eyebrow: "Customer acquisition",
    summary: "Plan, launch and improve paid campaigns around a clear commercial objective.",
    description: "The offer, audience, messages, budget and measures of success are agreed before campaigns are launched and managed.",
    result: "Campaigns with clear objectives, budgets and optimisation decisions.",
    included: ["Audience and campaign planning", "Set-up and ongoing management", "Regular reviews and optimisation"],
    conditions: ["Media budget is agreed separately", "Access to advertising accounts is provided"],
    notIncluded: ["Media spend", "A complete redesign of the website or offer"],
    packages: [],
  },
};

const ENGLISH_SERVICE_PUBLICATION: Readonly<
  Partial<Record<CanonicalServiceSlug, Readonly<{
    contentVersion: string;
    publicationStatus: "published";
  }>>>
> = Object.fromEntries(
  Object.keys(ENGLISH_SERVICE_PROJECTIONS).map((slug) => [
    slug,
    { contentVersion: "2026-08-20.1", publicationStatus: "published" },
  ]),
) as Partial<Record<CanonicalServiceSlug, {
  contentVersion: string;
  publicationStatus: "published";
}>>;

const SERVICE_MARKETS: Readonly<Record<CanonicalServiceSlug, readonly MarketCode[]>> = {
  "automatisation-processus": ["fr-fr", "global-en-beta"],
  "application-metier": ["fr-fr", "global-en-beta"],
  "coach-business": ["fr-fr", "global-en-beta"],
  "expert-comptable": ["fr-fr"],
  "assistance-administrative": ["fr-fr"],
  "formalites-entreprise": ["fr-fr"],
  "gestion-reseaux-sociaux": ["fr-fr"],
  "publicite-en-ligne": ["fr-fr", "global-en-beta"],
  "prospection-ciblee": ["fr-fr", "global-en-beta"],
};

function formatMoney(amountMinor: number, context: InternationalContext) {
  return new Intl.NumberFormat(context.localeCode === "en" ? "en-GB" : "fr-FR", {
    currency: context.currencyCode,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(amountMinor / 100);
}

function localizePricing(
  pricing: NonNullable<CanonicalService["pricing"]>,
  context: InternationalContext,
): NonNullable<CanonicalService["pricing"]> {
  if (context.localeCode === "fr") return pricing;
  const amount = pricing.amountMinor == null
    ? null
    : formatMoney(pricing.amountMinor, context);
  const label = pricing.mode === "quote"
    ? "Quote"
    : `${pricing.mode === "starting" ? "From " : ""}${amount} excl. VAT${pricing.label.includes("/ mois") ? " / month" : pricing.label.includes("/ jour") ? " / day" : ""}`;
  return {
    ...pricing,
    heading: pricing.heading === "Forfait" ? "Package" : "Price",
    label,
    note: pricing.mode === "quote"
      ? "The scope and price are confirmed before work starts. No payment is triggered by this request."
      : "The price applies within the agreed scope. No payment is triggered by this request.",
  };
}

function localizePackage(
  servicePackage: CanonicalServicePackage,
  projection: ServicePackageProjection,
  context: InternationalContext,
): CanonicalServicePackage {
  return {
    ...servicePackage,
    ...projection,
    pricing: {
      ...servicePackage.pricing,
      ...localizePricing(servicePackage.pricing, context),
      amountMinor: servicePackage.pricing.amountMinor,
      currency: "EUR",
      mode: "fixed",
    },
  };
}

export function getLocalizedCanonicalService(
  slug: unknown,
  context: InternationalContext,
): CanonicalService | null {
  const canonical = getCanonicalServiceBySlug(slug);
  if (
    !canonical
    || context.currencyCode !== "EUR"
    || !SERVICE_MARKETS[canonical.slug].includes(context.marketCode)
  ) {
    return null;
  }
  if (context.localeCode === "fr") return canonical;

  const projection = ENGLISH_SERVICE_PROJECTIONS[canonical.slug];
  const publication = ENGLISH_SERVICE_PUBLICATION[canonical.slug];
  if (!projection || publication?.publicationStatus !== "published") return null;
  const packages = canonical.packages.map((servicePackage) => {
    const packageProjection = projection.packages.find(({ slug: packageSlug }) =>
      packageSlug === servicePackage.slug,
    );
    if (!packageProjection) {
      throw new Error(`Missing English package projection: ${servicePackage.slug}`);
    }
    return localizePackage(servicePackage, packageProjection, context);
  });

  return {
    ...canonical,
    ...projection,
    cta: { kind: "callback", label: "Send my request" },
    detailHref: `/en/services/${canonical.slug}`,
    packages,
    pricing: canonical.pricing
      ? localizePricing(canonical.pricing, context)
      : null,
  };
}

export function getLocalizedCanonicalServices(context: InternationalContext) {
  return getCanonicalServices().flatMap((service) => {
    const localized = getLocalizedCanonicalService(service.slug, context);
    return localized ? [localized] : [];
  });
}
