import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import type { PublicationStatus } from "@/lib/international-publication";

type ActionPlanSystemProjectionContent = Readonly<{
  aliases: readonly string[];
  label: string;
}>;

export type ActionPlanSystemProjection = Readonly<{
  content: ActionPlanSystemProjectionContent;
  contentVersion: string;
  publicationStatus: PublicationStatus;
  systemId: string;
}>;

const ENGLISH_PROJECTION_VERSION = "2026-08-20";

function published(
  label: string,
  aliases: readonly string[],
): Omit<ActionPlanSystemProjection, "systemId"> {
  return {
    content: { aliases, label },
    contentVersion: ENGLISH_PROJECTION_VERSION,
    publicationStatus: "published",
  };
}

/**
 * Projections éditoriales du catalogue métier canonique.
 *
 * Les clés sont exclusivement les slugs français persistés. Cette couche ne
 * peut donc ni créer un métier, ni introduire un identifiant anglais parallèle.
 */
const englishProjectionContentBySystemId: Readonly<
  Record<string, Omit<ActionPlanSystemProjection, "systemId">>
> = {
  "cabinet-comptable": published("Accounting firm", ["accountancy practice", "bookkeeping firm"]),
  "cabinet-davocat": published("Law firm", ["legal practice", "attorney firm"]),
  "cabinet-de-conseil": published("Consulting firm", ["advisory firm", "management consultancy"]),
  "agence-marketing": published("Marketing agency", ["digital marketing agency", "growth agency"]),
  freelance: published("B2B freelancer", ["independent professional", "B2B contractor"]),
  "agence-de-recrutement": published("Recruitment agency", ["staffing agency", "recruitment firm"]),
  "agence-web": published("Web agency", ["website agency", "web development agency"]),
  "creation-de-contenu": published("Content creation business", ["content studio", "content creator business"]),
  marketplace: published("Marketplace business", ["online marketplace", "platform marketplace"]),
  media: published("Media company", ["media business", "publishing business"]),
  saas: published("SaaS business", ["software as a service", "subscription software"]),
  batiment: published("Construction company", ["building contractor", "construction business"]),
  "nettoyage-professionnel": published("Commercial cleaning company", ["office cleaning business", "professional cleaning service"]),
  "agence-immobiliere": published("Commercial real estate agency", ["business property agency", "commercial property broker"]),
  syndic: published("Condominium management company", ["property management association", "block management company"]),
  "gestion-locative": published("Rental property management", ["lettings management", "rental management company"]),
  "marchand-de-biens": published("Property trading business", ["property trader", "real estate trading company"]),
  "investissement-locatif": published("Rental property investment", ["buy-to-let investment", "rental investment business"]),
  "conciergerie-airbnb": published("Short-term rental management", ["Airbnb management", "holiday rental management"]),
  "investissement-immobilier": published("Real estate investment", ["property investment", "real estate investor"]),
  "investissement-financier": published("Financial investment business", ["investment business", "financial investor"]),
  "investissement-entreprise": published("Business investment", ["company investment", "business investor"]),
  demenagement: published("Commercial removals company", ["business moving company", "office removals"]),
  "livraison-dernier-kilometre": published("Last-mile delivery company", ["local delivery service", "final-mile delivery"]),
  "transport-de-marchandise": published("Freight transport company", ["goods transport", "haulage company"]),
  "transport-de-personnes": published("B2B passenger transport", ["corporate transport service", "business passenger transport"]),
  restaurant: published("Restaurant", ["independent restaurant", "restaurant business"]),
  "fast-food": published("Quick-service restaurant", ["fast-food restaurant", "takeaway restaurant"]),
  traiteur: published("Corporate catering business", ["event caterer", "business catering company"]),
  "dark-kitchen": published("Dark kitchen", ["ghost kitchen", "delivery-only restaurant"]),
  boulangerie: published("Bakery", ["artisan bakery", "independent bakery"]),
  "commerce-de-detail": published("Retail business", ["retail shop", "independent retailer"]),
  "e-commerce": published("E-commerce business", ["online store", "online retail business"]),
  "institut-de-beaute": published("Beauty salon", ["beauty institute", "beauty treatment salon"]),
  "salon-de-coiffure": published("Hair salon", ["hairdressing salon", "barbershop"]),
  esthetique: published("Beauty services business", ["esthetician business", "beautician service"]),
  "services-a-la-personne": published("Personal services business", ["home support services", "personal care services"]),
  "organisme-de-formation": published("Training provider", ["training organisation", "professional training company"]),
  cfa: published("Apprenticeship training centre", ["vocational apprenticeship centre", "apprentice training provider"]),
  "formation-en-ligne": published("Online training business", ["online course business", "e-learning provider"]),
  "production-industrie": published("Manufacturing business", ["industrial production company", "manufacturer"]),
  "plomberie-chauffage": published("Plumbing and heating company", ["plumber", "heating contractor"]),
  "electricite-generale": published("Electrical contracting company", ["electrician", "electrical contractor"]),
  "renovation-interieur": published("Interior renovation company", ["home renovation contractor", "interior refurbishment business"]),
  "menuiserie-agencement": published("Joinery and fit-out company", ["carpentry business", "interior fit-out contractor"]),
  "maconnerie-gros-oeuvre": published("Masonry and structural works", ["masonry contractor", "structural building company"]),
  paysagiste: published("Landscaping company", ["landscape contractor", "garden design business"]),
  "garage-automobile": published("Auto repair garage", ["car repair shop", "vehicle maintenance garage"]),
  carrosserie: published("Auto body shop", ["car body repair", "collision repair shop"]),
  "commerce-alimentaire": published("Food retail business", ["food shop", "grocery retailer"]),
  "boutique-specialisee": published("Specialist retail shop", ["specialty store", "niche retailer"]),
  "tabac-presse-point-relais": published("Newsagent and parcel shop", ["convenience newsagent", "parcel collection point"]),
  "bar-cafe": published("Café", ["coffee shop", "independent café"]),
  "hotel-hebergement-independant": published("Independent hotel and accommodation", ["independent hotel", "guest accommodation business"]),
  "cabinet-medical": published("Medical practice", ["doctor's practice", "medical clinic"]),
  "cabinet-paramedical": published("Allied health practice", ["paramedical practice", "therapy clinic"]),
  "infirmier-liberal": published("Independent nursing practice", ["private nurse", "community nursing business"]),
  "aide-a-domicile-menage": published("Home help and cleaning service", ["domestic help business", "home cleaning service"]),
  "reparation-informatique-mobile": published("B2B IT support company", ["business computer repair", "managed IT support"]),
  "architecte-maitre-oeuvre": published("Architecture and project management practice", ["architectural practice", "construction project manager"]),
  "courtier-credit-assurance": published("Credit and insurance brokerage", ["finance broker", "insurance broker"]),
  "auto-ecole": published("Professional driver training centre", ["driving training provider", "commercial driving school"]),
  "photographe-videaste": published("Corporate photography and video", ["corporate photographer", "business videographer"]),
  evenementiel: published("Corporate events business", ["event management company", "business events agency"]),
  "salle-de-sport": published("Gym and fitness centre", ["fitness club", "independent gym"]),
  dentiste: published("Dental practice", ["dentist's office", "dental clinic"]),
  pharmacie: published("Pharmacy", ["community pharmacy", "independent pharmacy"]),
  notaire: published("Notarial practice", ["notary office", "civil-law notary practice"]),
  veterinaire: published("Veterinary practice", ["veterinary clinic", "vet practice"]),
  "agence-de-voyage": published("Travel agency", ["independent travel agent", "travel business"]),
  opticien: published("Optician", ["optical shop", "eyewear retailer"]),
  pisciniste: published("Swimming pool company", ["pool installer", "pool maintenance business"]),
  "diagnostiqueur-immobilier": published("Property inspection business", ["real estate diagnostics", "building survey inspection"]),
  fleuriste: published("Corporate and event florist", ["event florist", "business florist"]),
  pressing: published("Dry-cleaning business", ["dry cleaner", "garment care shop"]),
  "food-truck": published("Food truck", ["mobile food business", "street food truck"]),
  "consultant-independant": published("Independent consultant", ["solo consultant", "independent advisor"]),
  "cabinet-assurance": published("Insurance agency", ["insurance brokerage firm", "insurance office"]),
  vtc: published("Private-hire driver business", ["chauffeur service", "ride-hailing driver business"]),
  "coach-professionnel": published("Business and professional coach", ["executive coach", "business coach"]),
  "coach-sportif": published("Personal trainer", ["fitness coach", "sports coach"]),
  "laverie-automatique": published("Self-service laundrette", ["coin laundry", "self-service laundry"]),
  "entreprise-de-securite": published("B2B security company", ["commercial security service", "security guarding company"]),
  association: published("Non-profit organisation", ["association", "membership organisation"]),
  couvreur: published("Roofing company", ["roofer", "roofing contractor"]),
  "peintre-en-batiment": published("Painting contractor", ["building painter", "decorating company"]),
  carreleur: published("Tiling contractor", ["tiler", "tile installation company"]),
  climatisation: published("Air-conditioning company", ["HVAC contractor", "air-conditioning installer"]),
  serrurier: published("Locksmith business", ["locksmith", "security locksmith"]),
  librairie: published("Bookshop", ["independent bookstore", "book retailer"]),
  osteopathe: published("Osteopathy practice", ["osteopath", "osteopathic clinic"]),
  psychologue: published("Psychology practice", ["psychologist", "psychology clinic"]),
  creche: published("Childcare centre", ["day nursery", "early-years centre"]),
  "gestionnaire-de-patrimoine": published("Wealth management practice", ["wealth adviser", "private client adviser"]),
  "chasseur-immobilier": published("Property search agency", ["buyer's agent", "property finder"]),
  geometre: published("Land surveying practice", ["land surveyor", "geomatics practice"]),
  "daf-externalise": published("Outsourced finance director", ["fractional CFO", "outsourced CFO"]),
  "office-manager-externalise": published("Outsourced office management", ["fractional office manager", "remote office management"]),
  "assistant-administratif-externalise": published("Outsourced administrative support", ["virtual assistant", "administrative support service"]),
  "secretariat-externalise": published("Outsourced secretarial service", ["virtual secretary", "remote secretarial support"]),
  "gestionnaire-paie-independant": published("Independent payroll service", ["payroll consultant", "outsourced payroll manager"]),
  "cabinet-rh-externalise": published("Outsourced HR consultancy", ["fractional HR", "external HR firm"]),
  "centre-appels-support-client": published("Contact centre and customer support", ["call centre", "outsourced customer service"]),
  "societe-recouvrement": published("Debt collection agency", ["credit collection company", "receivables collection service"]),
  "centre-affaires-coworking": published("Business centre and coworking space", ["coworking operator", "serviced office centre"]),
  "cabinet-qhse-conformite": published("QHSE and compliance consultancy", ["quality health safety consultancy", "compliance advisory firm"]),
  "bureau-etudes": published("Engineering consultancy", ["technical design office", "engineering design firm"]),
  "cabinet-etudes": published("Research and insights consultancy", ["research firm", "studies consultancy"]),
  "infogerance-informatique": published("Managed IT services company", ["IT outsourcing company", "managed service provider"]),
  "cybersecurite-pme": published("Small-business cybersecurity company", ["SMB cybersecurity consultancy", "cybersecurity provider"]),
  "integrateur-crm-erp": published("CRM and ERP integrator", ["business software integrator", "systems implementation partner"]),
  "consultant-data-bi": published("Data and BI consultant", ["data consultant", "business intelligence consultant"]),
  "agence-seo": published("SEO agency", ["search marketing agency", "organic search consultancy"]),
  "agence-acquisition-paid-ads": published("Paid acquisition agency", ["paid media agency", "PPC agency"]),
  "studio-branding-design": published("Branding and design studio", ["brand studio", "creative design studio"]),
};

const canonicalSystemIds = actionPlanSystemOptions.map(({ id }) => id);
const canonicalSystemIdSet = new Set(canonicalSystemIds);
const projectionSystemIds = Object.keys(englishProjectionContentBySystemId);

const missingProjectionIds = canonicalSystemIds.filter(
  (systemId) => !englishProjectionContentBySystemId[systemId],
);
const unknownProjectionIds = projectionSystemIds.filter(
  (systemId) => !canonicalSystemIdSet.has(systemId),
);

if (
  canonicalSystemIds.length !== 115
  || projectionSystemIds.length !== canonicalSystemIds.length
  || missingProjectionIds.length > 0
  || unknownProjectionIds.length > 0
) {
  throw new Error(
    `Les projections anglaises doivent couvrir exactement les 115 métiers canoniques (manquants: ${missingProjectionIds.join(", ") || "aucun"}; inconnus: ${unknownProjectionIds.join(", ") || "aucun"}).`,
  );
}

export const englishActionPlanSystemProjections: readonly ActionPlanSystemProjection[] =
  canonicalSystemIds.map((systemId) => ({
    ...englishProjectionContentBySystemId[systemId],
    systemId,
  }));

export const englishActionPlanSystemOptions: readonly ActionPlanSystemOption[] =
  englishActionPlanSystemProjections
    .filter(({ publicationStatus }) => publicationStatus === "published")
    .map(({ content, systemId }) => ({
      aliases: content.aliases,
      id: systemId,
      label: content.label,
    }));

export const englishActionPlanSystemIds = englishActionPlanSystemOptions.map(
  ({ id }) => id,
);
