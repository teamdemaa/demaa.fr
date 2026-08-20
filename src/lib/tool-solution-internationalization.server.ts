import "server-only";

import type { InternationalContext, MarketCode } from "@/lib/international-context";
import {
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
} from "@/lib/tool-directory";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";

/**
 * Tools with an English editorial draft. This is deliberately not a
 * publication list: the canonical registry remains authoritative for resource
 * and placement publication, and each projection has its own status gate.
 */
export const ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS = [
  "airtable",
  "brevo",
  "calendly",
  "canva",
  "chatgpt",
  "figma",
  "github",
  "google-ads",
  "google-search-console",
  "google-tag-manager",
  "meta-ads-manager",
  "metricool",
  "n8n",
  "notion",
  "pipedrive",
  "power-bi",
  "semrush",
  "sentry",
  "stripe",
  "teachable",
  "thinkific",
  "webflow",
] as const;

type EnglishBetaToolProjectionSlug =
  (typeof ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS)[number];

type ToolSolutionProjection = Readonly<{
  description: string;
  displayCategory: string;
  fitConstraints: readonly string[];
  fitRationale: string;
  name: string;
  publicationStatus: "draft" | "published";
  usage: string;
}>;

const ENGLISH_TOOL_SOLUTION_PROJECTIONS: Readonly<
  Record<EnglishBetaToolProjectionSlug, ToolSolutionProjection>
> = {
  airtable: { publicationStatus: "draft", name: "Airtable", displayCategory: "Operations", description: "Organise structured data, workflows and lightweight internal tools.", usage: "Centralise recurring operational information in a shared, flexible base.", fitRationale: "Useful when spreadsheets no longer provide enough structure or ownership.", fitConstraints: ["Define ownership and data rules before scaling the base."] },
  brevo: { publicationStatus: "draft", name: "Brevo", displayCategory: "Email marketing", description: "Manage email campaigns, contact lists and simple marketing automations.", usage: "Structure newsletters and automated follow-ups from one place.", fitRationale: "A practical option for small teams that need an accessible email platform.", fitConstraints: ["Consent and list hygiene remain your responsibility."] },
  calendly: { publicationStatus: "draft", name: "Calendly", displayCategory: "Scheduling", description: "Let prospects and clients book available time slots without back-and-forth.", usage: "Reduce manual scheduling and standardise booking rules.", fitRationale: "Useful for service businesses with recurring calls or consultations.", fitConstraints: ["Keep availability and meeting types deliberately limited."] },
  canva: { publicationStatus: "draft", name: "Canva", displayCategory: "Design", description: "Create and organise repeatable visual content with shared templates.", usage: "Produce consistent day-to-day marketing assets without a full design workflow.", fitRationale: "Suitable when speed and brand consistency matter more than advanced production.", fitConstraints: ["Set up a small, governed template library."] },
  chatgpt: { publicationStatus: "draft", name: "ChatGPT", displayCategory: "AI assistant", description: "Support research, drafting and repeatable knowledge work with clear safeguards.", usage: "Accelerate well-defined tasks while keeping human review in the workflow.", fitRationale: "Useful when the task, source material and expected output are explicit.", fitConstraints: ["Do not enter confidential data without an approved policy."] },
  figma: { publicationStatus: "draft", name: "Figma", displayCategory: "Product design", description: "Design, review and document digital interfaces collaboratively.", usage: "Keep product design, feedback and reusable components in one workspace.", fitRationale: "Well suited to teams building and iterating digital experiences.", fitConstraints: ["Agree naming, libraries and review ownership early."] },
  github: { publicationStatus: "draft", name: "GitHub", displayCategory: "Software delivery", description: "Host source code, review changes and automate software delivery workflows.", usage: "Make changes traceable and coordinate releases through shared repositories.", fitRationale: "A standard foundation for software teams that need controlled collaboration.", fitConstraints: ["Repository permissions and branch protections must be configured."] },
  "google-ads": { publicationStatus: "draft", name: "Google Ads", displayCategory: "Paid acquisition", description: "Run search and display campaigns against measurable commercial goals.", usage: "Capture active demand and measure acquisition performance.", fitRationale: "Relevant when search intent and conversion tracking are sufficiently clear.", fitConstraints: ["Media budget and conversion tracking are required."] },
  "google-search-console": { publicationStatus: "draft", name: "Google Search Console", displayCategory: "SEO", description: "Monitor how a website is indexed and performs in Google Search.", usage: "Identify visibility, indexing and search performance issues.", fitRationale: "A free baseline for any business relying on organic search.", fitConstraints: ["It does not replace analytics or an SEO strategy."] },
  "google-tag-manager": { publicationStatus: "draft", name: "Google Tag Manager", displayCategory: "Measurement", description: "Manage analytics and marketing tags through a governed container.", usage: "Centralise tracking changes while reducing direct code edits.", fitRationale: "Useful when several platforms need consistent event tracking.", fitConstraints: ["A measurement plan and consent controls are still required."] },
  "meta-ads-manager": { publicationStatus: "draft", name: "Meta Ads Manager", displayCategory: "Paid acquisition", description: "Create and manage paid campaigns across Facebook and Instagram.", usage: "Reach defined audiences and test offers with measurable campaigns.", fitRationale: "Relevant when the audience and creative testing process are explicit.", fitConstraints: ["Media budget, suitable creative and tracking are required."] },
  metricool: { publicationStatus: "draft", name: "Metricool", displayCategory: "Social media", description: "Plan, publish and review social media activity from one workspace.", usage: "Coordinate a regular publishing rhythm and monitor performance.", fitRationale: "Useful for small teams managing several social channels.", fitConstraints: ["The tool does not replace an editorial strategy."] },
  n8n: { publicationStatus: "draft", name: "n8n", displayCategory: "Automation", description: "Connect tools and automate multi-step workflows with flexible logic.", usage: "Remove repetitive hand-offs and orchestrate operational processes.", fitRationale: "Suitable when workflows need more control than basic point-to-point automation.", fitConstraints: ["Complex workflows require monitoring and maintenance ownership."] },
  notion: { publicationStatus: "draft", name: "Notion", displayCategory: "Knowledge and operations", description: "Organise shared knowledge, projects and lightweight operating processes.", usage: "Create one accessible home for recurring information and coordination.", fitRationale: "Useful for small teams that need a flexible operating workspace.", fitConstraints: ["Avoid recreating every process before defining a simple structure."] },
  pipedrive: { publicationStatus: "draft", name: "Pipedrive", displayCategory: "CRM", description: "Track prospects, opportunities and follow-ups through a visual sales pipeline.", usage: "Make commercial activity and next steps visible to the team.", fitRationale: "Well suited to B2B sales processes with clear stages and ownership.", fitConstraints: ["Pipeline stages and data discipline must be agreed first."] },
  "power-bi": { publicationStatus: "draft", name: "Power BI", displayCategory: "Business intelligence", description: "Build governed dashboards from multiple operational data sources.", usage: "Turn recurring reporting into shared, decision-ready views.", fitRationale: "Relevant when source data is stable enough to support repeatable metrics.", fitConstraints: ["Data quality and metric definitions must be settled first."] },
  semrush: { publicationStatus: "draft", name: "Semrush", displayCategory: "SEO", description: "Research keywords, competitors and organic search opportunities.", usage: "Prioritise search topics and monitor competitive visibility.", fitRationale: "Useful for teams running a structured SEO programme.", fitConstraints: ["Research must be converted into an editorial and technical plan."] },
  sentry: { publicationStatus: "draft", name: "Sentry", displayCategory: "Reliability", description: "Monitor application errors and performance issues in production.", usage: "Detect failures faster and give developers actionable context.", fitRationale: "Useful for digital products where production reliability affects customers.", fitConstraints: ["Alerts need ownership and sensitive data must be filtered."] },
  stripe: { publicationStatus: "draft", name: "Stripe", displayCategory: "Payments", description: "Accept online payments and manage subscriptions through a developer-friendly platform.", usage: "Standardise payment collection and recurring billing workflows.", fitRationale: "A strong fit for digital products and service businesses selling online.", fitConstraints: ["Tax, invoicing and local availability must be checked separately."] },
  teachable: { publicationStatus: "draft", name: "Teachable", displayCategory: "Online learning", description: "Publish and sell structured online courses from a hosted platform.", usage: "Manage course delivery, learner access and checkout in one place.", fitRationale: "Useful for a focused training offer that does not require a custom platform.", fitConstraints: ["Confirm payment, tax and localisation needs for your market."] },
  thinkific: { publicationStatus: "draft", name: "Thinkific", displayCategory: "Online learning", description: "Create, deliver and manage online learning programmes.", usage: "Structure course content and learner access without building a custom LMS.", fitRationale: "Suitable for businesses with a repeatable training catalogue.", fitConstraints: ["Advanced community or enterprise requirements may need other tools."] },
  webflow: { publicationStatus: "draft", name: "Webflow", displayCategory: "Website", description: "Design and publish marketing websites with a visual development workflow.", usage: "Ship maintainable marketing pages without a fully custom front end.", fitRationale: "Useful for design-led teams managing a marketing site in-house.", fitConstraints: ["Complex application logic should remain outside the marketing site."] },
};

/**
 * Commercial availability for markets that do not inherit the canonical
 * French registry. Translation and availability intentionally remain separate:
 * an English-speaking member of a French company can use an English projection
 * while the canonical registry continues to decide whether the Tool is
 * published in France.
 */
const TOOL_SOLUTION_MARKET_ALLOWLIST: Partial<
  Record<MarketCode, ReadonlySet<string>>
> = {
  "global-en-beta": new Set<string>(ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS),
};

function assertCanonicalToolReferences() {
  for (const slug of ENGLISH_BETA_DRAFT_TOOL_PROJECTION_SLUGS) {
    const tool = getToolDirectoryItemBySlug(slug);
    if (!tool || getToolDirectorySlug(tool) !== slug) {
      throw new Error(`Unknown canonical tool slug in English publication: ${slug}`);
    }
  }
}

assertCanonicalToolReferences();

export function hasToolSolutionProjectionForContext(
  resourceSlug: string,
  context: Pick<InternationalContext, "localeCode" | "marketCode">,
) {
  if (context.localeCode !== "en") return false;
  const projection = ENGLISH_TOOL_SOLUTION_PROJECTIONS[
    resourceSlug as EnglishBetaToolProjectionSlug
  ];
  if (!projection) return false;

  if (context.marketCode === "fr-fr") return true;
  return TOOL_SOLUTION_MARKET_ALLOWLIST[context.marketCode]?.has(resourceSlug) ?? false;
}

export function getToolSolutionProjectionPublicationStatus(
  resourceSlug: string,
  context: Pick<InternationalContext, "localeCode" | "marketCode">,
) {
  if (!hasToolSolutionProjectionForContext(resourceSlug, context)) return null;
  return ENGLISH_TOOL_SOLUTION_PROJECTIONS[
    resourceSlug as EnglishBetaToolProjectionSlug
  ]?.publicationStatus ?? null;
}

export function projectToolSolutionPlacementForContext(
  placement: RenderableSolutionPlacementDto,
  context: Pick<InternationalContext, "localeCode" | "marketCode">,
): RenderableSolutionPlacementDto | null {
  const resourceSlug = placement.resource.resourceSlug;
  if (!hasToolSolutionProjectionForContext(resourceSlug, context)) return null;

  const projection = ENGLISH_TOOL_SOLUTION_PROJECTIONS[
    resourceSlug as EnglishBetaToolProjectionSlug
  ];
  if (!projection || projection.publicationStatus !== "published") return null;

  return {
    ...placement,
    fitConstraints: projection.fitConstraints,
    fitRationale: projection.fitRationale,
    usage: projection.usage,
    resource: {
      ...placement.resource,
      ctaLabel: "Visit website",
      description: projection.description,
      displayCategory: projection.displayCategory,
      name: projection.name,
    },
  };
}

export function projectToolSolutionSectionForContext(
  section: RenderableSolutionSectionDto,
  context: Pick<InternationalContext, "localeCode" | "marketCode">,
): RenderableSolutionSectionDto | null {
  if (section.section !== "software") return null;
  const placements = section.placements.flatMap((placement) => {
    const projected = projectToolSolutionPlacementForContext(placement, context);
    return projected ? [projected] : [];
  });
  return placements.length > 0 ? { ...section, placements } : null;
}
