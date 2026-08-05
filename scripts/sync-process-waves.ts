import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// Moteur commun de synchronisation des vagues Process par famille.

import {
  btpTradeProfiles,
  generateBtpTradeProcessDraft,
  type BtpTradeProfile,
} from "@/lib/btp-process-industrialization";
import {
  agencyTradeProfiles,
  generateAgencyTradeProcessDraft,
  type AgencyTradeProfile,
} from "@/lib/agency-process-industrialization";
import {
  commerceTradeProfiles,
  generateCommerceTradeProcessDraft,
  type CommerceTradeProfile,
} from "@/lib/commerce-process-industrialization";
import {
  fastFoodTradeProfiles,
  generateFastFoodTradeProcessDraft,
  type FastFoodTradeProfile,
} from "@/lib/fast-food-process-industrialization";
import {
  consultingTradeProfiles,
  generateConsultingTradeProcessDraft,
  type ConsultingTradeProfile,
} from "@/lib/consulting-process-industrialization";
import {
  generateTechServicesTradeProcessDraft,
  techServicesTradeProfiles,
  type TechServicesTradeProfile,
} from "@/lib/tech-services-process-industrialization";
import {
  generateLogisticsTradeProcessDraft,
  logisticsTradeProfiles,
  type LogisticsTradeProfile,
} from "@/lib/logistics-process-industrialization";
import {
  generatePropertyOperationsDraft,
  propertyOperationsProfiles,
  type PropertyOperationsProfile,
} from "@/lib/property-operations-process-industrialization";
import {
  digitalCommerceProfiles,
  generateDigitalCommerceDraft,
  type DigitalCommerceProfile,
} from "@/lib/digital-commerce-process-industrialization";
import {
  generateTrainingDraft,
  trainingProfiles,
  type TrainingProfile,
} from "@/lib/training-process-industrialization";
import {
  autoSchoolProfile,
  generateAutoSchoolDraft,
} from "@/lib/auto-school-process-industrialization";
import {
  generateHealthPracticeDraft,
  healthPracticeProfiles,
  type HealthPracticeProfile,
} from "@/lib/health-practice-process-industrialization";
import {
  generateRegulatedPracticeDraft,
  regulatedPracticeProfiles,
  type RegulatedPracticeProfile,
} from "@/lib/regulated-practice-process-industrialization";
import {
  financeServicesProfiles,
  generateFinanceServicesDraft,
  type FinanceServicesProfile,
} from "@/lib/finance-services-process-industrialization";
import {
  generateHrSupportDraft,
  hrSupportProfiles,
  type HrSupportProfile,
} from "@/lib/hr-support-process-industrialization";
import {
  fieldServicesProfiles,
  generateFieldServicesDraft,
  type FieldServicesProfile,
} from "@/lib/field-services-process-industrialization";
import {
  generateRealEstateTransactionDraft,
  realEstateTransactionProfiles,
  type RealEstateTransactionProfile,
} from "@/lib/real-estate-transaction-process-industrialization";
import {
  generateRealEstateInvestmentDraft,
  realEstateInvestmentProfiles,
  type RealEstateInvestmentProfile,
} from "@/lib/real-estate-investment-process-industrialization";
import {
  generateRealEstateExpertiseDraft,
  realEstateExpertiseProfiles,
  type RealEstateExpertiseProfile,
} from "@/lib/real-estate-expertise-process-industrialization";
import {
  generateProductionWorkshopDraft,
  productionWorkshopProfiles,
  type ProductionWorkshopProfile,
} from "@/lib/production-workshop-process-industrialization";
import {
  generateHealthBeautyDraft,
  healthBeautyProfiles,
  type HealthBeautyProfile,
} from "@/lib/health-beauty-process-industrialization";
import {
  generateHomeSupportDraft,
  homeSupportProfiles,
  type HomeSupportProfile,
} from "@/lib/home-support-process-industrialization";
import {
  generateSportFitnessDraft,
  sportFitnessProfiles,
  type SportFitnessProfile,
} from "@/lib/sport-fitness-process-industrialization";
import {
  generateInvestmentDraft,
  investmentProfiles,
  type InvestmentProfile,
} from "@/lib/investment-process-industrialization";
import {
  generateWelcomeServicesDraft,
  welcomeServicesProfiles,
  type WelcomeServicesProfile,
} from "@/lib/welcome-services-process-industrialization";
import {
  generateTextileCareDraft,
  textileCareProfiles,
  type TextileCareProfile,
} from "@/lib/textile-care-process-industrialization";
import {
  generateHospitalityEventsDraft,
  hospitalityEventsProfiles,
  type HospitalityEventsProfile,
} from "@/lib/hospitality-events-process-industrialization";
import {
  associationProfile,
  generateAssociationDraft,
  type AssociationProfile,
} from "@/lib/association-process-industrialization";
import {
  crecheProfile,
  generateCrecheDraft,
  type CrecheProfile,
} from "@/lib/creche-process-industrialization";
import {
  generatePharmacyDraft,
  pharmacyProfile,
  type PharmacyProfile,
} from "@/lib/pharmacy-process-industrialization";
import type {
  IndustrializedContentItem,
  IndustrializedProcessDefinition,
  OperationalContentType,
} from "@/lib/process-industrialization";

const rootDir = path.resolve(import.meta.dirname, "..");
const stepsPath = path.join(
  rootDir,
  "src/lib/process-steps.generated.json",
);
const args = new Set(process.argv.slice(2));

const MASTER_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1Y_FqDpG9AshpS-gS46MpDZaPG-2lktfOsVYp3miB75c/edit";
const TARGET_CONTENT_COUNT = 74;

const SHEET_IDS = {
  readme: 1867492054,
  steps: 1458659633,
  audit: 690717538,
  quality: 162025384,
};

type WaveConfig = {
  slug:
    | "climatisation"
    | "electricite-generale"
    | "serrurier"
    | "batiment"
    | "carreleur"
    | "couvreur"
    | "maconnerie-gros-oeuvre"
    | "menuiserie-agencement"
    | "paysagiste"
    | "peintre-en-batiment"
    | "pisciniste"
    | "renovation-interieur"
    | "agence-acquisition-paid-ads"
    | "agence-marketing"
    | "agence-seo"
    | "agence-web"
    | "creation-de-contenu"
    | "media"
    | "photographe-videaste"
    | "studio-branding-design"
    | "boutique-specialisee"
    | "commerce-alimentaire"
    | "commerce-de-detail"
    | "fleuriste"
    | "librairie"
    | "opticien"
    | "tabac-presse-point-relais"
    | "bar-cafe"
    | "boulangerie"
    | "dark-kitchen"
    | "fast-food"
    | "food-truck"
    | "restaurant"
    | "traiteur"
    | "cabinet-de-conseil"
    | "freelance"
    | "consultant-independant"
    | "coach-professionnel"
    | "consultant-data-bi"
    | "daf-externalise"
    | "office-manager-externalise"
    | "assistant-administratif-externalise"
    | "secretariat-externalise"
    | "cabinet-qhse-conformite"
    | "bureau-etudes"
    | "cabinet-etudes"
    | "cybersecurite-pme"
    | "infogerance-informatique"
    | "integrateur-crm-erp"
    | "reparation-informatique-mobile"
    | "saas"
    | "demenagement"
    | "livraison-dernier-kilometre"
    | "transport-de-marchandise"
    | "transport-de-personnes"
    | "vtc"
    | "conciergerie-airbnb"
    | "gestion-locative"
    | "syndic"
    | "e-commerce"
    | "marketplace"
      | "cfa"
      | "formation-en-ligne"
      | "organisme-de-formation"
      | "auto-ecole"
      | "cabinet-medical"
      | "cabinet-paramedical"
      | "dentiste"
      | "osteopathe"
      | "psychologue"
      | "veterinaire"
      | "cabinet-comptable"
      | "cabinet-davocat"
      | "gestionnaire-paie-independant"
      | "notaire"
      | "cabinet-assurance"
      | "courtier-credit-assurance"
      | "gestionnaire-de-patrimoine"
      | "societe-recouvrement"
      | "agence-de-recrutement"
      | "cabinet-rh-externalise"
      | "centre-appels-support-client"
      | "entreprise-de-securite"
      | "nettoyage-professionnel"
      | "agence-immobiliere"
      | "chasseur-immobilier"
      | "investissement-immobilier"
      | "investissement-locatif"
      | "marchand-de-biens"
      | "architecte-maitre-oeuvre"
      | "diagnostiqueur-immobilier"
      | "geometre"
      | "carrosserie"
      | "garage-automobile"
      | "production-industrie"
      | "esthetique"
      | "institut-de-beaute"
      | "salon-de-coiffure"
      | "aide-a-domicile-menage"
      | "infirmier-liberal"
      | "services-a-la-personne"
      | "coach-sportif"
      | "salle-de-sport"
      | "investissement-entreprise"
      | "investissement-financier"
      | "agence-de-voyage"
      | "centre-affaires-coworking"
      | "laverie-automatique"
      | "pressing"
      | "evenementiel"
      | "hotel-hebergement-independant"
      | "association"
      | "creche"
      | "pharmacie";
  oldStartRow: number;
  oldCount: number;
  auditRow: number;
  processCount?: number;
};

type WaveSettings = {
  family:
    | "btp"
    | "agency"
    | "commerce"
    | "fast-food"
    | "consulting"
    | "tech-services"
    | "logistics"
      | "property-operations"
      | "digital-commerce"
      | "training"
      | "auto-school"
      | "health-practice"
      | "regulated-practice"
      | "finance-services"
      | "hr-support"
      | "field-services"
      | "real-estate-transaction"
      | "real-estate-investment"
      | "real-estate-expertise"
      | "production-workshop"
      | "health-beauty"
      | "home-support"
      | "sport-fitness"
      | "investment"
      | "welcome-services"
      | "textile-care"
      | "hospitality-events"
      | "association"
      | "creche"
      | "pharmacy";
  version: string;
  totalBefore: number;
  totalAfter: number;
  processCount: number;
  readmeLot: string;
  configs: readonly WaveConfig[];
};

const waveSettings = {
  one: {
    family: "btp",
    version: "1.2.0-btp-wave-one",
    totalBefore: 4548,
    totalAfter: 4660,
    processCount: 18,
    readmeLot:
      "BTP vague 1 : Plomberie, Électricité générale, Climatisation et Serrurerie.",
    configs: [
      {
        slug: "climatisation",
        oldStartRow: 1297,
        oldCount: 36,
        auditRow: 34,
      },
      {
        slug: "electricite-generale",
        oldStartRow: 2053,
        oldCount: 38,
        auditRow: 53,
      },
      {
        slug: "serrurier",
        oldStartRow: 4139,
        oldCount: 36,
        auditRow: 106,
      },
    ],
  },
  two: {
    family: "btp",
    version: "1.3.0-btp-wave-two",
    totalBefore: 4660,
    totalAfter: 4769,
    processCount: 18,
    readmeLot:
      "BTP vagues 1–2 : Plomberie, Électricité, Climatisation, Serrurerie, Maçonnerie, Menuiserie et Rénovation intérieure.",
    configs: [
      {
        slug: "maconnerie-gros-oeuvre",
        oldStartRow: 3134,
        oldCount: 40,
        auditRow: 79,
      },
      {
        slug: "menuiserie-agencement",
        oldStartRow: 3295,
        oldCount: 37,
        auditRow: 83,
      },
      {
        slug: "renovation-interieur",
        oldStartRow: 3934,
        oldCount: 36,
        auditRow: 99,
      },
    ],
  },
  three: {
    family: "btp",
    version: "1.4.0-btp-wave-three",
    totalBefore: 4769,
    totalAfter: 4879,
    processCount: 18,
    readmeLot:
      "BTP vagues 1–3 : Plomberie, Électricité, Climatisation, Serrurerie, Maçonnerie, Menuiserie, Rénovation intérieure, Entreprise générale du bâtiment, Couverture et Peinture.",
    configs: [
      {
        slug: "batiment",
        oldStartRow: 525,
        oldCount: 39,
        auditRow: 15,
      },
      {
        slug: "couvreur",
        oldStartRow: 1694,
        oldCount: 36,
        auditRow: 43,
      },
      {
        slug: "peintre-en-batiment",
        oldStartRow: 3672,
        oldCount: 37,
        auditRow: 91,
      },
    ],
  },
  four: {
    family: "btp",
    version: "1.5.0-btp-complete",
    totalBefore: 4879,
    totalAfter: 4992,
    processCount: 18,
    readmeLot:
      "BTP complet : 13 métiers avec 18 processus et 74 contenus typés chacun.",
    configs: [
      {
        slug: "carreleur",
        oldStartRow: 1102,
        oldCount: 37,
        auditRow: 28,
      },
      {
        slug: "paysagiste",
        oldStartRow: 3709,
        oldCount: 36,
        auditRow: 90,
      },
      {
        slug: "pisciniste",
        oldStartRow: 3899,
        oldCount: 36,
        auditRow: 94,
      },
    ],
  },
  agencyOne: {
    family: "agency",
    version: "1.6.0-agency-wave-one",
    totalBefore: 4992,
    totalAfter: 5117,
    processCount: 19,
    readmeLot:
      "BTP complet ; Agences vague 1 : Marketing, Web, SEO et Acquisition paid ads.",
    configs: [
      {
        slug: "agence-acquisition-paid-ads",
        oldStartRow: 2,
        oldCount: 43,
        auditRow: 2,
      },
      {
        slug: "agence-marketing",
        oldStartRow: 161,
        oldCount: 42,
        auditRow: 6,
      },
      {
        slug: "agence-seo",
        oldStartRow: 203,
        oldCount: 43,
        auditRow: 7,
      },
      {
        slug: "agence-web",
        oldStartRow: 246,
        oldCount: 43,
        auditRow: 8,
      },
    ],
  },
  agencyTwo: {
    family: "agency",
    version: "1.7.0-agency-complete",
    totalBefore: 5117,
    totalAfter: 5247,
    processCount: 19,
    readmeLot:
      "Familles BTP et Agences digitales complètes : 21 systèmes à 74 contenus typés.",
    configs: [
      {
        slug: "creation-de-contenu",
        oldStartRow: 1965,
        oldCount: 41,
        auditRow: 44,
      },
      {
        slug: "media",
        oldStartRow: 3521,
        oldCount: 43,
        auditRow: 82,
      },
      {
        slug: "photographe-videaste",
        oldStartRow: 4059,
        oldCount: 40,
        auditRow: 93,
      },
      {
        slug: "studio-branding-design",
        oldStartRow: 4815,
        oldCount: 42,
        auditRow: 109,
      },
    ],
  },
  commerce: {
    family: "commerce",
    version: "1.8.0-commerce-complete",
    totalBefore: 5247,
    totalAfter: 5490,
    processCount: 17,
    readmeLot:
      "Familles BTP, Agences digitales et Commerce complètes : 28 systèmes à 74 contenus typés.",
    configs: [
      { slug: "boutique-specialisee", oldStartRow: 766, oldCount: 39, auditRow: 17 },
      { slug: "commerce-alimentaire", oldStartRow: 1647, oldCount: 40, auditRow: 37 },
      { slug: "commerce-de-detail", oldStartRow: 1687, oldCount: 40, auditRow: 38 },
      { slug: "fleuriste", oldStartRow: 2587, oldCount: 40, auditRow: 58 },
      { slug: "librairie", oldStartRow: 3330, oldCount: 39, auditRow: 77 },
      { slug: "opticien", oldStartRow: 3823, oldCount: 37, auditRow: 87 },
      { slug: "tabac-presse-point-relais", oldStartRow: 5025, oldCount: 40, auditRow: 111 },
    ],
  },
  fastFood: {
    family: "fast-food",
    version: "1.9.0-fast-food-complete",
    totalBefore: 5490,
    totalAfter: 5713,
    processCount: 20,
    readmeLot:
      "Familles BTP, Agences digitales, Commerce et Fast Food complètes : 35 systèmes à 74 contenus typés.",
    configs: [
      { slug: "bar-cafe", oldStartRow: 607, oldCount: 43, auditRow: 14 },
      { slug: "boulangerie", oldStartRow: 724, oldCount: 42, auditRow: 16 },
      { slug: "dark-kitchen", oldStartRow: 2270, oldCount: 41, auditRow: 48 },
      { slug: "fast-food", oldStartRow: 2648, oldCount: 42, auditRow: 57 },
      { slug: "food-truck", oldStartRow: 2764, oldCount: 43, auditRow: 59 },
      { slug: "restaurant", oldStartRow: 4773, oldCount: 42, auditRow: 101 },
      { slug: "traiteur", oldStartRow: 5308, oldCount: 42, auditRow: 112 },
    ],
  },
  consultingOne: {
    family: "consulting",
    version: "2.0.0-consulting-wave-one",
    totalBefore: 5713,
    totalAfter: 5871,
    processCount: 19,
    readmeLot:
      "BTP, Agences, Commerce et Fast Food complets ; Conseil expert vague 1 : conseil, freelance, coaching et data / BI.",
    configs: [
      { slug: "cabinet-de-conseil", oldStartRow: 1071, oldCount: 40, auditRow: 22 },
      { slug: "coach-professionnel", oldStartRow: 1666, oldCount: 44, auditRow: 35 },
      { slug: "consultant-data-bi", oldStartRow: 1931, oldCount: 43, auditRow: 40 },
      { slug: "consultant-independant", oldStartRow: 1974, oldCount: 42, auditRow: 41 },
      { slug: "freelance", oldStartRow: 3005, oldCount: 43, auditRow: 61 },
    ],
  },
  consultingTwo: {
    family: "consulting",
    version: "2.1.0-consulting-wave-two",
    totalBefore: 5871,
    totalAfter: 5980,
    processCount: 19,
    readmeLot:
      "Conseil expert vagues 1–2 : conseil et fonctions DAF, office management, administratif et secrétariat externalisés.",
    configs: [
      { slug: "assistant-administratif-externalise", oldStartRow: 484, oldCount: 49, auditRow: 11 },
      { slug: "daf-externalise", oldStartRow: 2414, oldCount: 46, auditRow: 47 },
      { slug: "office-manager-externalise", oldStartRow: 4266, oldCount: 46, auditRow: 86 },
      { slug: "secretariat-externalise", oldStartRow: 5280, oldCount: 46, auditRow: 105 },
    ],
  },
  consultingThree: {
    family: "consulting",
    version: "2.2.0-consulting-complete",
    totalBefore: 5980,
    totalAfter: 6073,
    processCount: 19,
    readmeLot:
      "Familles BTP, Agences digitales, Commerce, Fast Food et Conseil expert complètes : 47 systèmes à 74 contenus typés.",
    configs: [
      { slug: "bureau-etudes", oldStartRow: 928, oldCount: 41, auditRow: 18 },
      { slug: "cabinet-etudes", oldStartRow: 1170, oldCount: 41, auditRow: 23 },
      { slug: "cabinet-qhse-conformite", oldStartRow: 1290, oldCount: 47, auditRow: 26 },
    ],
  },
  techServicesOne: {
    family: "tech-services",
    version: "2.3.0-tech-services-wave-one",
    totalBefore: 6073,
    totalAfter: 6130,
    processCount: 19,
    readmeLot:
      "Familles BTP, Agences digitales, Commerce, Fast Food et Conseil expert complètes ; Services tech B2B vague 1 : Cybersécurité PME et Infogérance informatique.",
    configs: [
      { slug: "cybersecurite-pme", oldStartRow: 2484, oldCount: 48, auditRow: 46 },
      { slug: "infogerance-informatique", oldStartRow: 3620, oldCount: 43, auditRow: 69 },
    ],
  },
  techServicesTwo: {
    family: "tech-services",
    version: "2.4.0-tech-services-complete",
    totalBefore: 6130,
    totalAfter: 6230,
    processCount: 19,
    readmeLot:
      "Familles BTP, Agences digitales, Commerce, Fast Food, Conseil expert et Services tech B2B complètes : 52 systèmes à 74 contenus typés.",
    configs: [
      { slug: "integrateur-crm-erp", oldStartRow: 3755, oldCount: 42, auditRow: 71 },
      { slug: "reparation-informatique-mobile", oldStartRow: 5282, oldCount: 39, auditRow: 100 },
      { slug: "saas", oldStartRow: 5395, oldCount: 41, auditRow: 102 },
    ],
  },
  logisticsOne: {
    family: "logistics",
    version: "2.5.0-logistics-wave-one",
    totalBefore: 6230,
    totalAfter: 6352,
    processCount: 11,
    readmeLot:
      "BTP, Agences, Commerce, Fast Food, Conseil expert et Services tech B2B complets ; Logistique transport vague 1 : Déménagement, Livraison dernier kilomètre et Transport de marchandises.",
    configs: [
      { slug: "demenagement", oldStartRow: 2706, oldCount: 34, auditRow: 49 },
      { slug: "livraison-dernier-kilometre", oldStartRow: 4093, oldCount: 33, auditRow: 78 },
      { slug: "transport-de-marchandise", oldStartRow: 6090, oldCount: 33, auditRow: 113 },
    ],
  },
  logisticsTwo: {
    family: "logistics",
    version: "2.6.0-logistics-complete",
    totalBefore: 6352,
    totalAfter: 6430,
    processCount: 11,
    readmeLot:
      "Familles BTP, Agences digitales, Commerce, Fast Food, Conseil expert, Services tech B2B et Logistique transport complètes : 57 systèmes à 74 contenus typés.",
    configs: [
      { slug: "transport-de-personnes", oldStartRow: 6245, oldCount: 33, auditRow: 114 },
      { slug: "vtc", oldStartRow: 6317, oldCount: 37, auditRow: 116 },
    ],
  },
  propertyOperations: {
    family: "property-operations",
    version: "2.7.0-property-operations-complete",
    totalBefore: 6430,
    totalAfter: 6538,
    processCount: 12,
    readmeLot:
      "Familles BTP, Agences digitales, Commerce, Fast Food, Conseil expert, Services tech B2B et Logistique transport complètes ; groupe Immobilier : Syndic, Gestion locative et Conciergerie.",
    configs: [
      { slug: "conciergerie-airbnb", oldStartRow: 2075, oldCount: 38, auditRow: 39 },
      { slug: "gestion-locative", oldStartRow: 3490, oldCount: 38, auditRow: 64 },
      { slug: "syndic", oldStartRow: 5985, oldCount: 38, auditRow: 110 },
    ],
  },
  digitalCommerce: {
    family: "digital-commerce",
    version: "2.8.0-digital-commerce-complete",
    totalBefore: 6538,
    totalAfter: 6608,
    processCount: 13,
    readmeLot:
      "Familles déjà industrialisées complètes ; groupe Commerce numérique : E-commerce et Marketplace, soit 62 systèmes à 74 contenus typés.",
    configs: [
      { slug: "e-commerce", oldStartRow: 2894, oldCount: 39, auditRow: 52, processCount: 13 },
      { slug: "marketplace", oldStartRow: 4392, oldCount: 39, auditRow: 81, processCount: 12 },
    ],
  },
  training: {
    family: "training",
    version: "2.9.0-training-complete",
    totalBefore: 6608,
    totalAfter: 6709,
    processCount: 20,
    readmeLot:
      "Groupes déjà industrialisés complets ; Formation : CFA, Formation en ligne et Organisme de formation, soit 65 systèmes à 74 contenus typés.",
    configs: [
      { slug: "cfa", oldStartRow: 1661, oldCount: 42, auditRow: 32, processCount: 20 },
      { slug: "formation-en-ligne", oldStartRow: 3376, oldCount: 39, auditRow: 60, processCount: 17 },
      { slug: "organisme-de-formation", oldStartRow: 4872, oldCount: 40, auditRow: 88, processCount: 18 },
    ],
  },
  autoSchool: {
    family: "auto-school",
    version: "2.10.0-auto-school-complete",
    totalBefore: 6709,
    totalAfter: 6743,
    processCount: 17,
    readmeLot:
      "Groupes déjà industrialisés complets ; Auto-école : 17 processus et 74 contenus typés, soit 66 systèmes à 74 contenus.",
    configs: [
      {
        slug: "auto-ecole",
        oldStartRow: 592,
        oldCount: 40,
        auditRow: 13,
        processCount: 17,
      },
    ],
  },
  healthPractice: {
    family: "health-practice",
    version: "2.11.0-health-practice-complete",
    totalBefore: 6743,
    totalAfter: 6957,
    processCount: 12,
    readmeLot:
      "Groupes déjà industrialisés complets ; Cabinets de santé : Cabinet médical, Cabinet paramédical, Dentiste, Ostéopathe, Psychologue et Vétérinaire, soit 72 systèmes à 74 contenus.",
    configs: [
      {
        slug: "cabinet-medical",
        oldStartRow: 1311,
        oldCount: 40,
        auditRow: 24,
      },
      {
        slug: "cabinet-paramedical",
        oldStartRow: 1351,
        oldCount: 39,
        auditRow: 25,
      },
      {
        slug: "dentiste",
        oldStartRow: 2882,
        oldCount: 40,
        auditRow: 50,
      },
      {
        slug: "osteopathe",
        oldStartRow: 5047,
        oldCount: 35,
        auditRow: 89,
      },
      {
        slug: "psychologue",
        oldStartRow: 5561,
        oldCount: 37,
        auditRow: 98,
      },
      {
        slug: "veterinaire",
        oldStartRow: 6632,
        oldCount: 39,
        auditRow: 115,
      },
    ],
  },
  regulatedPractice: {
    family: "regulated-practice",
    version: "2.12.0-regulated-practice-complete",
    totalBefore: 6957,
    totalAfter: 7085,
    processCount: 19,
    readmeLot:
      "Groupes déjà industrialisés complets ; Cabinets réglementés : Cabinet comptable, Cabinet d’avocat, Gestionnaire de paie indépendant et Notaire, soit 76 systèmes à 74 contenus.",
    configs: [
      {
        slug: "cabinet-comptable",
        oldStartRow: 1079,
        oldCount: 42,
        auditRow: 20,
      },
      {
        slug: "cabinet-davocat",
        oldStartRow: 1121,
        oldCount: 42,
        auditRow: 21,
      },
      {
        slug: "gestionnaire-paie-independant",
        oldStartRow: 3882,
        oldCount: 42,
        auditRow: 66,
      },
      {
        slug: "notaire",
        oldStartRow: 4886,
        oldCount: 42,
        auditRow: 85,
      },
    ],
  },
  financeServices: {
    family: "finance-services",
    version: "2.13.0-finance-services-complete",
    totalBefore: 7085,
    totalAfter: 7217,
    processCount: 19,
    readmeLot:
      "Groupes déjà industrialisés complets ; Services finance et assurance : Cabinet d’assurance, Courtier crédit / assurance, Gestionnaire de patrimoine et Société de recouvrement, soit 80 systèmes à 74 contenus.",
    configs: [
      {
        slug: "cabinet-assurance",
        oldStartRow: 1036,
        oldCount: 43,
        auditRow: 19,
      },
      {
        slug: "courtier-credit-assurance",
        oldStartRow: 2496,
        oldCount: 41,
        auditRow: 42,
      },
      {
        slug: "gestionnaire-de-patrimoine",
        oldStartRow: 3903,
        oldCount: 43,
        auditRow: 65,
      },
      {
        slug: "societe-recouvrement",
        oldStartRow: 6458,
        oldCount: 37,
        auditRow: 108,
      },
    ],
  },
  hrSupport: {
    family: "hr-support",
    version: "2.14.0-hr-support-complete",
    totalBefore: 7217,
    totalAfter: 7312,
    processCount: 18,
    readmeLot:
      "Groupes déjà industrialisés complets ; Services RH et support : Agence de recrutement, Cabinet RH externalisé et Centre d’appels / support client, soit 83 systèmes à 74 contenus.",
    configs: [
      {
        slug: "agence-de-recrutement",
        oldStartRow: 76,
        oldCount: 43,
        auditRow: 3,
      },
      {
        slug: "cabinet-rh-externalise",
        oldStartRow: 1628,
        oldCount: 47,
        auditRow: 27,
      },
      {
        slug: "centre-appels-support-client",
        oldStartRow: 1822,
        oldCount: 37,
        auditRow: 31,
      },
    ],
  },
  fieldServices: {
    family: "field-services",
    version: "2.15.0-field-services-complete",
    totalBefore: 7312,
    totalAfter: 7394,
    processCount: 9,
    readmeLot:
      "Groupes déjà industrialisés complets ; Sécurité et services terrain : Entreprise de sécurité B2B et Nettoyage professionnel, soit 85 systèmes à 74 contenus.",
    configs: [
      {
        slug: "entreprise-de-securite",
        oldStartRow: 3434,
        oldCount: 33,
        auditRow: 54,
      },
      {
        slug: "nettoyage-professionnel",
        oldStartRow: 5139,
        oldCount: 33,
        auditRow: 84,
      },
    ],
  },
  realEstateTransaction: {
    family: "real-estate-transaction",
    version: "2.16.0-real-estate-transaction-complete",
    totalBefore: 7394,
    totalAfter: 7463,
    processCount: 13,
    readmeLot:
      "Groupes déjà industrialisés complets ; Immobilier transaction : Agence immobilière et Chasseur immobilier, soit 87 systèmes à 74 contenus.",
    configs: [
      {
        slug: "agence-immobiliere",
        oldStartRow: 185,
        oldCount: 38,
        auditRow: 5,
      },
      {
        slug: "chasseur-immobilier",
        oldStartRow: 2028,
        oldCount: 41,
        auditRow: 33,
      },
    ],
  },
  realEstateInvestment: {
    family: "real-estate-investment",
    version: "2.17.0-real-estate-investment-complete",
    totalBefore: 7463,
    totalAfter: 7567,
    processCount: 12,
    readmeLot:
      "Groupes déjà industrialisés complets ; Investissement immobilier : Investissement immobilier, Investissement locatif et Marchand de biens, soit 90 systèmes à 74 contenus.",
    configs: [
      {
        slug: "investissement-immobilier",
        oldStartRow: 4652,
        oldCount: 39,
        auditRow: 74,
      },
      {
        slug: "investissement-locatif",
        oldStartRow: 4691,
        oldCount: 40,
        auditRow: 75,
      },
      {
        slug: "marchand-de-biens",
        oldStartRow: 4988,
        oldCount: 39,
        auditRow: 80,
      },
    ],
  },
  realEstateExpertise: {
    family: "real-estate-expertise",
    version: "2.18.0-real-estate-expertise-complete",
    totalBefore: 7567,
    totalAfter: 7677,
    processCount: 14,
    readmeLot:
      "Groupes déjà industrialisés complets ; Immobilier expertise : Architecte / maître d’œuvre, Diagnostiqueur immobilier et Géomètre, soit 93 systèmes à 74 contenus.",
    configs: [
      { slug: "architecte-maitre-oeuvre", oldStartRow: 515, oldCount: 36, auditRow: 10 },
      { slug: "diagnostiqueur-immobilier", oldStartRow: 3317, oldCount: 38, auditRow: 51 },
      { slug: "geometre", oldStartRow: 4060, oldCount: 38, auditRow: 63 },
    ],
  },
  productionWorkshop: {
    family: "production-workshop",
    version: "2.19.0-production-workshop-complete",
    totalBefore: 7677,
    totalAfter: 7797,
    processCount: 11,
    readmeLot:
      "Groupes déjà industrialisés complets ; Production & atelier : Production & Industrie, Garage automobile et Carrosserie, soit 96 systèmes à 74 contenus.",
    configs: [
      { slug: "carrosserie", oldStartRow: 1881, oldCount: 34, auditRow: 29 },
      { slug: "garage-automobile", oldStartRow: 4100, oldCount: 34, auditRow: 62 },
      { slug: "production-industrie", oldStartRow: 6352, oldCount: 34, auditRow: 97 },
    ],
  },
  healthBeauty: {
    family: "health-beauty",
    version: "2.20.0-health-beauty-complete",
    totalBefore: 7797,
    totalAfter: 7909,
    processCount: 16,
    readmeLot:
      "Groupes déjà industrialisés complets ; Santé & bien-être : Esthétique, Institut de beauté et Salon de coiffure, soit 99 systèmes à 74 contenus.",
    configs: [
      { slug: "esthetique", oldStartRow: 3691, oldCount: 40, auditRow: 55 },
      { slug: "institut-de-beaute", oldStartRow: 4657, oldCount: 35, auditRow: 70 },
      { slug: "salon-de-coiffure", oldStartRow: 6916, oldCount: 35, auditRow: 104 },
    ],
  },
  homeSupport: {
    family: "home-support",
    version: "2.21.0-home-support-complete",
    totalBefore: 7909,
    totalAfter: 8023,
    processCount: 12,
    readmeLot:
      "Groupes déjà industrialisés complets ; Domicile & accompagnement : Aide à domicile & ménage, Infirmier libéral et Services à la personne, soit 102 systèmes à 74 contenus.",
    configs: [
      { slug: "aide-a-domicile-menage", oldStartRow: 481, oldCount: 34, auditRow: 9 },
      { slug: "infirmier-liberal", oldStartRow: 4577, oldCount: 40, auditRow: 68 },
      { slug: "services-a-la-personne", oldStartRow: 7211, oldCount: 34, auditRow: 107 },
    ],
  },
  sportFitness: {
    family: "sport-fitness",
    version: "2.22.0-sport-fitness-complete",
    totalBefore: 8023,
    totalAfter: 8096,
    processCount: 13,
    readmeLot:
      "Groupes déjà industrialisés complets ; Sport & fitness : Coach sportif et Salle de sport, soit 104 systèmes à 74 contenus.",
    configs: [
      { slug: "coach-sportif", oldStartRow: 2404, oldCount: 35, auditRow: 36 },
      { slug: "salle-de-sport", oldStartRow: 7023, oldCount: 40, auditRow: 103 },
    ],
  },
  investment: {
    family: "investment",
    version: "2.23.0-investment-complete",
    totalBefore: 8096,
    totalAfter: 8168,
    processCount: 12,
    readmeLot:
      "Groupes déjà industrialisés complets ; Investissement : Investissement entreprise et Investissement financier, soit 106 systèmes à 74 contenus.",
    configs: [
      {
        slug: "investissement-entreprise",
        oldStartRow: 4952,
        oldCount: 38,
        auditRow: 72,
      },
      {
        slug: "investissement-financier",
        oldStartRow: 4990,
        oldCount: 38,
        auditRow: 73,
      },
    ],
  },
  welcomeServices: {
    family: "welcome-services",
    version: "2.24.0-welcome-services-complete",
    totalBefore: 8168,
    totalAfter: 8242,
    processCount: 13,
    readmeLot:
      "Groupes déjà industrialisés complets ; Accueil & services : Agence de voyage et Centre d’affaires / coworking, soit 108 systèmes à 74 contenus.",
    configs: [
      {
        slug: "agence-de-voyage",
        oldStartRow: 150,
        oldCount: 35,
        auditRow: 4,
      },
      {
        slug: "centre-affaires-coworking",
        oldStartRow: 1995,
        oldCount: 39,
        auditRow: 30,
      },
    ],
  },
  textileCare: {
    family: "textile-care",
    version: "2.25.0-textile-care-complete",
    totalBefore: 8242,
    totalAfter: 8320,
    processCount: 11,
    readmeLot:
      "Groupes déjà industrialisés complets ; Entretien textile : Laverie automatique et Pressing, soit 110 systèmes à 74 contenus.",
    configs: [
      {
        slug: "laverie-automatique",
        oldStartRow: 5322,
        oldCount: 35,
        auditRow: 76,
        processCount: 11,
      },
      {
        slug: "pressing",
        oldStartRow: 6729,
        oldCount: 35,
        auditRow: 96,
        processCount: 12,
      },
    ],
  },
  hospitalityEvents: {
    family: "hospitality-events",
    version: "2.26.0-hospitality-events-complete",
    totalBefore: 8320,
    totalAfter: 8396,
    processCount: 13,
    readmeLot:
      "Groupes déjà industrialisés complets ; Hospitalité & événements : Événementiel professionnel et Hôtel & hébergement indépendant, soit 112 systèmes à 74 contenus.",
    configs: [
      {
        slug: "evenementiel",
        oldStartRow: 3918,
        oldCount: 39,
        auditRow: 56,
        processCount: 13,
      },
      {
        slug: "hotel-hebergement-independant",
        oldStartRow: 4697,
        oldCount: 33,
        auditRow: 67,
        processCount: 9,
      },
    ],
  },
  association: {
    family: "association",
    version: "2.27.0-association-complete",
    totalBefore: 8396,
    totalAfter: 8436,
    processCount: 8,
    readmeLot:
      "Groupes déjà industrialisés complets ; Vie associative : Association, soit 113 systèmes à 74 contenus.",
    configs: [
      {
        slug: "association",
        oldStartRow: 742,
        oldCount: 34,
        auditRow: 12,
        processCount: 8,
      },
    ],
  },
  creche: {
    family: "creche",
    version: "2.28.0-creche-complete",
    totalBefore: 8436,
    totalAfter: 8476,
    processCount: 12,
    readmeLot:
      "Groupes déjà industrialisés complets ; Petite enfance : Crèche, soit 114 systèmes à 74 contenus.",
    configs: [
      {
        slug: "creche",
        oldStartRow: 3184,
        oldCount: 34,
        auditRow: 45,
        processCount: 12,
      },
    ],
  },
  pharmacy: {
    family: "pharmacy",
    version: "2.29.0-pharmacy-complete",
    totalBefore: 8476,
    totalAfter: 8510,
    processCount: 12,
    readmeLot:
      "Industrialisation Process terminée ; Santé : Pharmacie, soit 115 systèmes à 74 contenus.",
    configs: [
      {
        slug: "pharmacie",
        oldStartRow: 6662,
        oldCount: 40,
        auditRow: 92,
        processCount: 12,
      },
    ],
  },
} satisfies Record<
  | "one"
  | "two"
  | "three"
  | "four"
  | "agencyOne"
  | "agencyTwo"
  | "commerce"
  | "fastFood"
  | "consultingOne"
  | "consultingTwo"
  | "consultingThree"
  | "techServicesOne"
  | "techServicesTwo"
  | "logisticsOne"
  | "logisticsTwo"
  | "propertyOperations"
  | "digitalCommerce"
  | "training"
  | "autoSchool"
  | "healthPractice"
  | "regulatedPractice"
  | "financeServices"
  | "hrSupport"
  | "fieldServices"
  | "realEstateTransaction"
  | "realEstateInvestment"
  | "realEstateExpertise"
  | "productionWorkshop"
  | "healthBeauty"
  | "homeSupport"
  | "sportFitness"
  | "investment"
  | "welcomeServices"
  | "textileCare"
  | "hospitalityEvents"
  | "association"
  | "creche"
  | "pharmacy",
  WaveSettings
>;

const selectedWaves = [
  args.has("--wave-one") ? "one" : null,
  args.has("--wave-two") ? "two" : null,
  args.has("--wave-three") ? "three" : null,
  args.has("--wave-four") ? "four" : null,
  args.has("--agency-wave-one") ? "agencyOne" : null,
  args.has("--agency-wave-two") ? "agencyTwo" : null,
  args.has("--commerce") ? "commerce" : null,
  args.has("--fast-food") ? "fastFood" : null,
  args.has("--consulting-wave-one") ? "consultingOne" : null,
  args.has("--consulting-wave-two") ? "consultingTwo" : null,
  args.has("--consulting-wave-three") ? "consultingThree" : null,
  args.has("--tech-services-wave-one") ? "techServicesOne" : null,
  args.has("--tech-services-wave-two") ? "techServicesTwo" : null,
  args.has("--logistics-wave-one") ? "logisticsOne" : null,
  args.has("--logistics-wave-two") ? "logisticsTwo" : null,
  args.has("--property-operations") ? "propertyOperations" : null,
  args.has("--digital-commerce") ? "digitalCommerce" : null,
  args.has("--training") ? "training" : null,
  args.has("--auto-school") ? "autoSchool" : null,
  args.has("--health-practice") ? "healthPractice" : null,
  args.has("--regulated-practice") ? "regulatedPractice" : null,
  args.has("--finance-services") ? "financeServices" : null,
  args.has("--hr-support") ? "hrSupport" : null,
  args.has("--field-services") ? "fieldServices" : null,
  args.has("--real-estate-transaction") ? "realEstateTransaction" : null,
  args.has("--real-estate-investment") ? "realEstateInvestment" : null,
  args.has("--real-estate-expertise") ? "realEstateExpertise" : null,
  args.has("--production-workshop") ? "productionWorkshop" : null,
  args.has("--health-beauty") ? "healthBeauty" : null,
  args.has("--home-support") ? "homeSupport" : null,
  args.has("--sport-fitness") ? "sportFitness" : null,
  args.has("--investment") ? "investment" : null,
  args.has("--welcome-services") ? "welcomeServices" : null,
  args.has("--textile-care") ? "textileCare" : null,
  args.has("--hospitality-events") ? "hospitalityEvents" : null,
  args.has("--association") ? "association" : null,
  args.has("--creche") ? "creche" : null,
  args.has("--pharmacy") ? "pharmacy" : null,
].filter((value): value is keyof typeof waveSettings => value !== null);

if (selectedWaves.length !== 1) {
  throw new Error(
    "Sélectionner exactement une vague Process.",
  );
}

const selectedWave = selectedWaves[0];
const settings = waveSettings[selectedWave];
const VERSION = settings.version;
const TOTAL_BEFORE = settings.totalBefore;
const TOTAL_AFTER = settings.totalAfter;
const TARGET_PROCESS_COUNT = settings.processCount;
const waveConfigs: readonly WaveConfig[] = settings.configs;

const contentTypeLabels: Record<OperationalContentType, string> = {
  implementation_action: "Action de mise en place",
  operational_step: "Étape opérationnelle",
  operating_rule: "Règle",
  recurring_control: "Contrôle récurrent",
};

type GeneratedStep = {
  stepId: string;
  métierId: string;
  processId: string;
  order: number;
  step: string;
  defaultOwner: string;
  recurrence: string;
  sourceUrl: string;
  sourceRow: number;
  status: "Actif";
  contentType: OperationalContentType;
};

type WaveData = WaveConfig & {
  profile:
    | BtpTradeProfile
    | AgencyTradeProfile
    | CommerceTradeProfile
    | FastFoodTradeProfile
    | ConsultingTradeProfile
    | TechServicesTradeProfile
    | LogisticsTradeProfile
    | PropertyOperationsProfile
    | DigitalCommerceProfile
    | TrainingProfile
    | typeof autoSchoolProfile
    | HealthPracticeProfile
    | RegulatedPracticeProfile
    | FinanceServicesProfile
    | HrSupportProfile
    | FieldServicesProfile
    | RealEstateTransactionProfile
    | RealEstateInvestmentProfile
    | RealEstateExpertiseProfile
    | ProductionWorkshopProfile
    | HealthBeautyProfile
    | HomeSupportProfile
    | SportFitnessProfile
    | InvestmentProfile
    | WelcomeServicesProfile
    | TextileCareProfile
    | HospitalityEventsProfile
    | AssociationProfile
    | CrecheProfile
    | PharmacyProfile;
  steps: GeneratedStep[];
  finalStartRow: number;
};

function getProfileAndDraft(config: WaveConfig) {
  if (settings.family === "pharmacy") {
    if (config.slug !== pharmacyProfile.slug) {
      throw new Error(`Profil Pharmacie inconnu : ${config.slug}.`);
    }

    return {
      profile: pharmacyProfile,
      draft: generatePharmacyDraft(),
    };
  }

  if (settings.family === "creche") {
    if (config.slug !== crecheProfile.slug) {
      throw new Error(`Profil Crèche inconnu : ${config.slug}.`);
    }

    return {
      profile: crecheProfile,
      draft: generateCrecheDraft(),
    };
  }

  if (settings.family === "association") {
    if (config.slug !== associationProfile.slug) {
      throw new Error(`Profil Association inconnu : ${config.slug}.`);
    }

    return {
      profile: associationProfile,
      draft: generateAssociationDraft(),
    };
  }

  if (settings.family === "hospitality-events") {
    const profile = (
      hospitalityEventsProfiles as Record<string, HospitalityEventsProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(
        `Profil Hospitalité & événements inconnu : ${config.slug}.`,
      );
    }

    return {
      profile,
      draft: generateHospitalityEventsDraft(profile),
    };
  }

  if (settings.family === "textile-care") {
    const profile = (
      textileCareProfiles as Record<string, TextileCareProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Entretien textile inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateTextileCareDraft(profile),
    };
  }

  if (settings.family === "welcome-services") {
    const profile = (
      welcomeServicesProfiles as Record<string, WelcomeServicesProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Accueil & services inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateWelcomeServicesDraft(profile),
    };
  }

  if (settings.family === "investment") {
    const profile = (
      investmentProfiles as Record<string, InvestmentProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Investissement inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateInvestmentDraft(profile),
    };
  }

  if (settings.family === "sport-fitness") {
    const profile = (
      sportFitnessProfiles as Record<string, SportFitnessProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Sport & fitness inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateSportFitnessDraft(profile),
    };
  }

  if (settings.family === "home-support") {
    const profile = (
      homeSupportProfiles as Record<string, HomeSupportProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Domicile & accompagnement inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateHomeSupportDraft(profile),
    };
  }

  if (settings.family === "health-beauty") {
    const profile = (
      healthBeautyProfiles as Record<string, HealthBeautyProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Santé & bien-être inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateHealthBeautyDraft(profile),
    };
  }

  if (settings.family === "production-workshop") {
    const profile = (
      productionWorkshopProfiles as Record<string, ProductionWorkshopProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Production & atelier inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateProductionWorkshopDraft(profile),
    };
  }

  if (settings.family === "real-estate-expertise") {
    const profile = (
      realEstateExpertiseProfiles as Record<string, RealEstateExpertiseProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Immobilier expertise inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateRealEstateExpertiseDraft(profile),
    };
  }

  if (settings.family === "real-estate-investment") {
    const profile = (
      realEstateInvestmentProfiles as Record<
        string,
        RealEstateInvestmentProfile
      >
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Investissement immobilier inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateRealEstateInvestmentDraft(profile),
    };
  }

  if (settings.family === "real-estate-transaction") {
    const profile = (
      realEstateTransactionProfiles as Record<
        string,
        RealEstateTransactionProfile
      >
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Immobilier transaction inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateRealEstateTransactionDraft(profile),
    };
  }

  if (settings.family === "field-services") {
    const profile = (
      fieldServicesProfiles as Record<string, FieldServicesProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Services terrain inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateFieldServicesDraft(profile),
    };
  }

  if (settings.family === "hr-support") {
    const profile = (
      hrSupportProfiles as Record<string, HrSupportProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Services RH inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateHrSupportDraft(profile),
    };
  }

  if (settings.family === "finance-services") {
    const profile = (
      financeServicesProfiles as Record<string, FinanceServicesProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Services finance inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateFinanceServicesDraft(profile),
    };
  }

  if (settings.family === "regulated-practice") {
    const profile = (
      regulatedPracticeProfiles as Record<string, RegulatedPracticeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Cabinet réglementé inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateRegulatedPracticeDraft(profile),
    };
  }

  if (settings.family === "health-practice") {
    const profile = (
      healthPracticeProfiles as Record<string, HealthPracticeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Cabinet de santé inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateHealthPracticeDraft(profile),
    };
  }

  if (settings.family === "auto-school") {
    if (config.slug !== autoSchoolProfile.slug) {
      throw new Error(`Profil Auto-école inconnu : ${config.slug}.`);
    }

    return {
      profile: autoSchoolProfile,
      draft: generateAutoSchoolDraft(),
    };
  }

  if (settings.family === "training") {
    const profile = (
      trainingProfiles as Record<string, TrainingProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Formation inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateTrainingDraft(profile),
    };
  }

  if (settings.family === "digital-commerce") {
    const profile = (
      digitalCommerceProfiles as Record<string, DigitalCommerceProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Commerce numérique inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateDigitalCommerceDraft(profile),
    };
  }

  if (settings.family === "property-operations") {
    const profile = (
      propertyOperationsProfiles as Record<string, PropertyOperationsProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Immobilier inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generatePropertyOperationsDraft(profile),
    };
  }

  if (settings.family === "logistics") {
    const profile = (
      logisticsTradeProfiles as Record<string, LogisticsTradeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Logistique transport inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateLogisticsTradeProcessDraft(profile),
    };
  }

  if (settings.family === "tech-services") {
    const profile = (
      techServicesTradeProfiles as Record<string, TechServicesTradeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Services tech B2B inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateTechServicesTradeProcessDraft(profile),
    };
  }

  if (settings.family === "consulting") {
    const profile = (
      consultingTradeProfiles as Record<string, ConsultingTradeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Conseil expert inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateConsultingTradeProcessDraft(profile),
    };
  }

  if (settings.family === "fast-food") {
    const profile = (
      fastFoodTradeProfiles as Record<string, FastFoodTradeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Fast Food inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateFastFoodTradeProcessDraft(profile),
    };
  }

  if (settings.family === "commerce") {
    const profile = (
      commerceTradeProfiles as Record<string, CommerceTradeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Commerce inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateCommerceTradeProcessDraft(profile),
    };
  }

  if (settings.family === "agency") {
    const profile = (
      agencyTradeProfiles as Record<string, AgencyTradeProfile>
    )[config.slug];

    if (!profile) {
      throw new Error(`Profil Agences inconnu : ${config.slug}.`);
    }

    return {
      profile,
      draft: generateAgencyTradeProcessDraft(profile),
    };
  }

  const profile = (btpTradeProfiles as Record<string, BtpTradeProfile>)[
    config.slug
  ];

  if (!profile) {
    throw new Error(`Profil BTP inconnu : ${config.slug}.`);
  }

  return {
    profile,
    draft: generateBtpTradeProcessDraft(profile),
  };
}

function stableStepId(
  slug: string,
  processId: string,
  type: OperationalContentType,
  label: string,
) {
  const digest = crypto
    .createHash("sha256")
    .update(`${processId}|${type}|${label}`)
    .digest("hex")
    .slice(0, 10);

  return `etape.${slug}.${digest}`;
}

function recurrenceFor(
  item: IndustrializedContentItem,
  definition: IndustrializedProcessDefinition,
) {
  const label = item.label.toLowerCase();

  if (item.type === "implementation_action") {
    return "Une fois, puis à revoir si besoin";
  }

  if (item.type === "operating_rule") {
    return "Permanente";
  }

  if (item.type === "operational_step") {
    if (
      /après chaque|chaque demande|chaque facture|chaque livraison/.test(
        label,
      )
    ) {
      return "À chaque occurrence";
    }

    return "À chaque dossier concerné";
  }

  if (/chaque matin|quotidien/.test(label)) {
    return "Quotidienne";
  }

  if (/chaque semaine|hebdomadaire/.test(label)) {
    return "Hebdomadaire";
  }

  if (/chaque mois|mensuel/.test(label)) {
    return "Mensuelle";
  }

  if (/trimestr/.test(definition.cadence.toLowerCase())) {
    return "Trimestrielle";
  }

  if (/échéance|entretien|garantie/.test(label)) {
    return "Selon échéance";
  }

  return definition.cadence;
}

function stringCell(value: string) {
  return { userEnteredValue: { stringValue: value } };
}

function numberCell(value: number) {
  return { userEnteredValue: { numberValue: value } };
}

function formulaCell(value: string) {
  return { userEnteredValue: { formulaValue: value } };
}

function row(
  values: Array<
    ReturnType<typeof stringCell> | ReturnType<typeof numberCell> | ReturnType<typeof formulaCell>
  >,
) {
  return { values };
}

function buildWaveData(): WaveData[] {
  let insertedBefore = 0;

  return waveConfigs.map((config) => {
    const { profile, draft } = getProfileAndDraft(config);
    const processEntries = Object.entries(draft.contentByProcessId);
    const targetProcessCount = config.processCount ?? TARGET_PROCESS_COUNT;
    const finalStartRow = config.oldStartRow + insertedBefore;
    const steps = processEntries.flatMap(([processId, items]) => {
      const definition = draft.definitionsById[processId];

      if (!definition) {
        throw new Error(`${config.slug}: définition manquante pour ${processId}.`);
      }

      return items.map((item, itemIndex) => ({
        stepId: stableStepId(config.slug, processId, item.type, item.label),
        métierId: `metier.${config.slug}`,
        processId,
        order: itemIndex + 1,
        step: item.label,
        defaultOwner: definition.defaultOwner,
        recurrence: recurrenceFor(item, definition),
        sourceUrl: MASTER_SHEET_URL,
        sourceRow: finalStartRow,
        status: "Actif" as const,
        contentType: item.type,
      }));
    });

    if (
      processEntries.length !== targetProcessCount ||
      steps.length !== TARGET_CONTENT_COUNT
    ) {
      throw new Error(
        `${config.slug}: ${processEntries.length} processus et ${steps.length} contenus.`,
      );
    }

    steps.forEach((step, index) => {
      step.sourceRow = finalStartRow + index;
    });

    insertedBefore += TARGET_CONTENT_COUNT - config.oldCount;

    return {
      ...config,
      profile,
      steps,
      finalStartRow,
    };
  });
}

function stepRow(step: GeneratedStep) {
  return row([
    stringCell(step.stepId),
    stringCell(step.métierId),
    stringCell(step.processId),
    numberCell(step.order),
    stringCell(step.step),
    stringCell(step.defaultOwner),
    stringCell(step.recurrence),
    stringCell(step.sourceUrl),
    formulaCell("=ROW()"),
    stringCell(step.status),
    stringCell(contentTypeLabels[step.contentType]),
  ]);
}

function buildSheetRequests(waves: WaveData[]) {
  const requests: Array<Record<string, unknown>> = [];

  for (const wave of [...waves].reverse()) {
    const oldEndRow = wave.oldStartRow + wave.oldCount - 1;
    const extraRows = TARGET_CONTENT_COUNT - wave.oldCount;

    requests.push({
      insertDimension: {
        range: {
          sheetId: SHEET_IDS.steps,
          dimension: "ROWS",
          startIndex: oldEndRow,
          endIndex: oldEndRow + extraRows,
        },
        inheritFromBefore: true,
      },
    });
  }

  for (const wave of waves) {
    const startRowIndex = wave.finalStartRow - 1;
    const endRowIndex = startRowIndex + TARGET_CONTENT_COUNT;

    requests.push(
      {
        copyPaste: {
          source: {
            sheetId: SHEET_IDS.steps,
            startRowIndex,
            endRowIndex: startRowIndex + 1,
            startColumnIndex: 0,
            endColumnIndex: 11,
          },
          destination: {
            sheetId: SHEET_IDS.steps,
            startRowIndex,
            endRowIndex,
            startColumnIndex: 0,
            endColumnIndex: 11,
          },
          pasteType: "PASTE_FORMAT",
          pasteOrientation: "NORMAL",
        },
      },
      {
        updateCells: {
          range: {
            sheetId: SHEET_IDS.steps,
            startRowIndex,
            endRowIndex,
            startColumnIndex: 0,
            endColumnIndex: 11,
          },
          rows: wave.steps.map(stepRow),
          fields: "userEnteredValue",
        },
      },
      {
        updateCells: {
          range: {
            sheetId: SHEET_IDS.audit,
            startRowIndex: wave.auditRow - 1,
            endRowIndex: wave.auditRow,
            startColumnIndex: 3,
            endColumnIndex: 7,
          },
          rows: [
            row([
              numberCell(wave.processCount ?? TARGET_PROCESS_COUNT),
              numberCell(TARGET_CONTENT_COUNT),
              numberCell(TARGET_CONTENT_COUNT),
              numberCell(0),
            ]),
          ],
          fields: "userEnteredValue",
        },
      },
    );
  }

  requests.push(
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.quality,
          startRowIndex: 5,
          endRowIndex: 6,
          startColumnIndex: 1,
          endColumnIndex: 3,
        },
        rows: [
          row([
            numberCell(TOTAL_AFTER),
            formulaCell(`=COUNTA('Étapes'!A2:A${TOTAL_AFTER + 1})`),
          ]),
        ],
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.readme,
          startRowIndex: 3,
          endRowIndex: 5,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rows: [
          row([
            stringCell(
              `115 métiers • 37 familles • 526 process • ${TOTAL_AFTER.toLocaleString("fr-FR")} contenus opérationnels.`,
            ),
          ]),
          row([stringCell(settings.readmeLot)]),
        ],
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.readme,
          startRowIndex: 9,
          endRowIndex: 10,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rows: [row([stringCell(VERSION)])],
        fields: "userEnteredValue",
      },
    },
  );

  for (const request of requests) {
    if (Object.keys(request).length !== 1) {
      throw new Error("Chaque requête Sheets doit avoir exactement une clé.");
    }
  }

  return requests;
}

function writeLocalMirror(waves: WaveData[]) {
  const payload = JSON.parse(fs.readFileSync(stepsPath, "utf8"));
  const currentSteps = payload.steps ?? [];

  if (currentSteps.length !== TOTAL_BEFORE) {
    throw new Error(
      `Total local avant synchronisation : ${currentSteps.length}, attendu ${TOTAL_BEFORE}.`,
    );
  }

  const replacements = new Map(
    waves.map((wave) => [wave.steps[0].métierId, wave.steps]),
  );
  const inserted = new Set<string>();
  const nextSteps: GeneratedStep[] = [];

  for (const step of currentSteps) {
    const replacement = replacements.get(step.métierId);

    if (!replacement) {
      nextSteps.push(step);
      continue;
    }

    if (!inserted.has(step.métierId)) {
      nextSteps.push(...replacement);
      inserted.add(step.métierId);
    }
  }

  if (
    inserted.size !== waves.length ||
    nextSteps.length !== TOTAL_AFTER
  ) {
    throw new Error(
      `Miroir local invalide : ${inserted.size} métiers et ${nextSteps.length} contenus.`,
    );
  }

  nextSteps.forEach((step, index) => {
    if (replacements.has(step.métierId)) {
      step.sourceRow = index + 2;
    }
  });

  payload.steps = nextSteps;
  payload.metadata = {
    ...payload.metadata,
    version: VERSION,
    createdAt: new Date().toISOString(),
  };
  payload.sheetAudit = payload.sheetAudit.map((audit: { slug: string }) => {
    const wave = waves.find((entry) => entry.slug === audit.slug);

    return wave
      ? {
          ...audit,
          stepCount: TARGET_CONTENT_COUNT,
          matchedStepCount: TARGET_CONTENT_COUNT,
          unmatchedCount: 0,
          sourceUrl: "",
        }
      : audit;
  });

  fs.writeFileSync(stepsPath, `${JSON.stringify(payload, null, 2)}\n`);
}

const waves = buildWaveData();

if (args.has("--write-local")) {
  writeLocalMirror(waves);
}

if (args.has("--sheet-batch-json")) {
  process.stdout.write(
    JSON.stringify({ requests: buildSheetRequests(waves) }),
  );
} else {
  console.log(
    JSON.stringify(
      {
        version: VERSION,
        totalBefore: TOTAL_BEFORE,
        totalAfter: TOTAL_AFTER,
        waves: waves.map((wave) => ({
          slug: wave.slug,
          oldCount: wave.oldCount,
          newCount: wave.steps.length,
          finalRows: `${wave.finalStartRow}:${wave.finalStartRow + wave.steps.length - 1}`,
        })),
      },
      null,
      2,
    ),
  );
}
