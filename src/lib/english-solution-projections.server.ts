import "server-only";

import { isCanonicalServicePublic } from "@/lib/canonical-service-visibility";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

type EnglishProjection = Readonly<{
  description: string;
  displayCategory: string;
  fitConstraints: readonly string[];
  fitRationale: string;
  name: string;
  usage: string;
}>;

const ENGLISH_TOOL_PROJECTIONS: Readonly<Record<string, EnglishProjection>> = {
  airtable: { name: "Airtable", displayCategory: "Operations", description: "Organise structured data, workflows and lightweight internal tools.", usage: "Centralise recurring operational information in a shared, flexible base.", fitRationale: "Useful when spreadsheets no longer provide enough structure or ownership.", fitConstraints: ["Define ownership and data rules before scaling the base."] },
  brevo: { name: "Brevo", displayCategory: "Email marketing", description: "Manage email campaigns, contact lists and simple marketing automations.", usage: "Structure newsletters and automated follow-ups from one place.", fitRationale: "A practical option for small teams that need an accessible email platform.", fitConstraints: ["Consent and list hygiene remain your responsibility."] },
  calendly: { name: "Calendly", displayCategory: "Scheduling", description: "Let prospects and clients book available time slots without back-and-forth.", usage: "Reduce manual scheduling and standardise booking rules.", fitRationale: "Useful for service businesses with recurring calls or consultations.", fitConstraints: ["Keep availability and meeting types deliberately limited."] },
  canva: { name: "Canva", displayCategory: "Design", description: "Create and organise repeatable visual content with shared templates.", usage: "Produce consistent day-to-day marketing assets without a full design workflow.", fitRationale: "Suitable when speed and brand consistency matter more than advanced production.", fitConstraints: ["Set up a small, governed template library."] },
  chatgpt: { name: "ChatGPT", displayCategory: "AI assistant", description: "Support research, drafting and repeatable knowledge work with clear safeguards.", usage: "Accelerate well-defined tasks while keeping human review in the workflow.", fitRationale: "Useful when the task, source material and expected output are explicit.", fitConstraints: ["Do not enter confidential data without an approved policy."] },
  figma: { name: "Figma", displayCategory: "Product design", description: "Design, review and document digital interfaces collaboratively.", usage: "Keep product design, feedback and reusable components in one workspace.", fitRationale: "Well suited to teams building and iterating digital experiences.", fitConstraints: ["Agree naming, libraries and review ownership early."] },
  github: { name: "GitHub", displayCategory: "Software delivery", description: "Host source code, review changes and automate software delivery workflows.", usage: "Make changes traceable and coordinate releases through shared repositories.", fitRationale: "A standard foundation for software teams that need controlled collaboration.", fitConstraints: ["Repository permissions and branch protections must be configured."] },
  "google-ads": { name: "Google Ads", displayCategory: "Paid acquisition", description: "Run search and display campaigns against measurable commercial goals.", usage: "Capture active demand and measure acquisition performance.", fitRationale: "Relevant when search intent and conversion tracking are sufficiently clear.", fitConstraints: ["Media budget and conversion tracking are required."] },
  "google-search-console": { name: "Google Search Console", displayCategory: "SEO", description: "Monitor how a website is indexed and performs in Google Search.", usage: "Identify visibility, indexing and search performance issues.", fitRationale: "A free baseline for any business relying on organic search.", fitConstraints: ["It does not replace analytics or an SEO strategy."] },
  "google-tag-manager": { name: "Google Tag Manager", displayCategory: "Measurement", description: "Manage analytics and marketing tags through a governed container.", usage: "Centralise tracking changes while reducing direct code edits.", fitRationale: "Useful when several platforms need consistent event tracking.", fitConstraints: ["A measurement plan and consent controls are still required."] },
  "meta-ads-manager": { name: "Meta Ads Manager", displayCategory: "Paid acquisition", description: "Create and manage paid campaigns across Facebook and Instagram.", usage: "Reach defined audiences and test offers with measurable campaigns.", fitRationale: "Relevant when the audience and creative testing process are explicit.", fitConstraints: ["Media budget, suitable creative and tracking are required."] },
  metricool: { name: "Metricool", displayCategory: "Social media", description: "Plan, publish and review social media activity from one workspace.", usage: "Coordinate a regular publishing rhythm and monitor performance.", fitRationale: "Useful for small teams managing several social channels.", fitConstraints: ["The tool does not replace an editorial strategy."] },
  n8n: { name: "n8n", displayCategory: "Automation", description: "Connect tools and automate multi-step workflows with flexible logic.", usage: "Remove repetitive hand-offs and orchestrate operational processes.", fitRationale: "Suitable when workflows need more control than basic point-to-point automation.", fitConstraints: ["Complex workflows require monitoring and maintenance ownership."] },
  notion: { name: "Notion", displayCategory: "Knowledge and operations", description: "Organise shared knowledge, projects and lightweight operating processes.", usage: "Create one accessible home for recurring information and coordination.", fitRationale: "Useful for small teams that need a flexible operating workspace.", fitConstraints: ["Avoid recreating every process before defining a simple structure."] },
  pipedrive: { name: "Pipedrive", displayCategory: "CRM", description: "Track prospects, opportunities and follow-ups through a visual sales pipeline.", usage: "Make commercial activity and next steps visible to the team.", fitRationale: "Well suited to B2B sales processes with clear stages and ownership.", fitConstraints: ["Pipeline stages and data discipline must be agreed first."] },
  "power-bi": { name: "Power BI", displayCategory: "Business intelligence", description: "Build governed dashboards from multiple operational data sources.", usage: "Turn recurring reporting into shared, decision-ready views.", fitRationale: "Relevant when source data is stable enough to support repeatable metrics.", fitConstraints: ["Data quality and metric definitions must be settled first."] },
  semrush: { name: "Semrush", displayCategory: "SEO", description: "Research keywords, competitors and organic search opportunities.", usage: "Prioritise search topics and monitor competitive visibility.", fitRationale: "Useful for teams running a structured SEO programme.", fitConstraints: ["Research must be converted into an editorial and technical plan."] },
  sentry: { name: "Sentry", displayCategory: "Reliability", description: "Monitor application errors and performance issues in production.", usage: "Detect failures faster and give developers actionable context.", fitRationale: "Useful for digital products where production reliability affects customers.", fitConstraints: ["Alerts need ownership and sensitive data must be filtered."] },
  stripe: { name: "Stripe", displayCategory: "Payments", description: "Accept online payments and manage subscriptions through a developer-friendly platform.", usage: "Standardise payment collection and recurring billing workflows.", fitRationale: "A strong fit for digital products and service businesses selling online.", fitConstraints: ["Tax, invoicing and local availability must be checked separately."] },
  teachable: { name: "Teachable", displayCategory: "Online learning", description: "Publish and sell structured online courses from a hosted platform.", usage: "Manage course delivery, learner access and checkout in one place.", fitRationale: "Useful for a focused training offer that does not require a custom platform.", fitConstraints: ["Confirm payment, tax and localisation needs for your market."] },
  thinkific: { name: "Thinkific", displayCategory: "Online learning", description: "Create, deliver and manage online learning programmes.", usage: "Structure course content and learner access without building a custom LMS.", fitRationale: "Suitable for businesses with a repeatable training catalogue.", fitConstraints: ["Advanced community or enterprise requirements may need other tools."] },
  webflow: { name: "Webflow", displayCategory: "Website", description: "Design and publish marketing websites with a visual development workflow.", usage: "Ship maintainable marketing pages without a fully custom front end.", fitRationale: "Useful for design-led teams managing a marketing site in-house.", fitConstraints: ["Complex application logic should remain outside the marketing site."] },
};

const ENGLISH_SERVICE_PROJECTIONS: Readonly<Record<string, EnglishProjection>> = {
  "coach-business": { name: "Business coaching", displayCategory: "Leadership support", description: "A monthly partnership to develop your business, make stronger decisions and keep moving forward.", usage: "Work with a regular thinking partner on the priorities that will move the business forward.", fitRationale: "Useful when the owner needs sustained perspective and accountability, not a one-off answer.", fitConstraints: ["The coach supports decisions and progress; execution remains with your business."] },
  "automatisation-processus": { name: "Process automation and AI", displayCategory: "Operations", description: "Simplify a process, connect the right tools and use AI where it creates a reliable operational gain.", usage: "Reduce repetitive work, re-entry and manual follow-ups in a defined process.", fitRationale: "Best for recurring work with clear inputs, rules and ownership.", fitConstraints: ["The process and delivery scope are confirmed before work starts."] },
  "prospection-ciblee": { name: "Targeted B2B prospecting", displayCategory: "Business development", description: "Define the right accounts, messages and follow-up process for focused B2B outreach.", usage: "Build a traceable prospecting motion around qualified target companies.", fitRationale: "Useful when the target market and commercial offer are sufficiently clear.", fitConstraints: ["Meetings are never guaranteed and outreach rules must be approved."] },
  "publicite-en-ligne": { name: "Paid acquisition", displayCategory: "Acquisition", description: "Plan, launch and improve paid campaigns around a specific commercial objective.", usage: "Test and scale acquisition with clear targets, budgets and measurement.", fitRationale: "Relevant when the offer, audience and conversion path are ready.", fitConstraints: ["Media spend is separate and paid directly to the platforms."] },
};

export function projectEnglishSolutionSections(
  sections: readonly RenderableSolutionSectionDto[],
): RenderableSolutionSectionDto[] {
  return sections.flatMap((section) => {
    if (section.section !== "software" && section.section !== "services") return [];
    const projections = section.section === "software"
      ? ENGLISH_TOOL_PROJECTIONS
      : ENGLISH_SERVICE_PROJECTIONS;
    const placements = section.placements.flatMap((placement) => {
      if (
        section.section === "services" &&
        !isCanonicalServicePublic(placement.resource.resourceSlug)
      ) return [];
      const projection = projections[placement.resource.resourceSlug];
      if (!projection) return [];
      return [{
        ...placement,
        fitConstraints: projection.fitConstraints,
        fitRationale: projection.fitRationale,
        usage: projection.usage,
        resource: {
          ...placement.resource,
          ctaLabel: section.section === "services" ? "Send my request" : "Visit website",
          description: projection.description,
          displayCategory: projection.displayCategory,
          name: projection.name,
          indicativePricing: placement.resource.indicativePricing
            ?.replace("Sur devis", "Quote")
            .replace("À partir de ", "From ")
            .replace(" HT / mois", " excl. VAT / month")
            .replace(" HT / jour", " excl. VAT / day"),
        },
      }];
    });
    return placements.length ? [{ section: section.section, placements }] : [];
  });
}
