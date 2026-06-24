import {
  enterpriseCatalog,
  enterpriseCatalogBySlug,
  enterpriseToSystem,
} from "@/lib/enterprise-annuaire";
import type { System } from "@/lib/types";

export type NewsletterDirectoryEntry = {
  slug: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  kind: "specific";
  sectorLabel: string;
  sectorSlug: string;
  frequency: string;
  tags: string[];
  systemSlugs: string[];
  publisher: string;
  externalUrl: string;
  externalLabel: string;
  sourceType: "external" | "partner";
  confidence: "high" | "medium";
};

function getSystemSlugsForSectorLabel(sectorLabel: string) {
  return enterpriseCatalog
    .filter((enterprise) => enterprise.sectorLabel === sectorLabel)
    .map((enterprise) => enterprise.slug);
}

const specificNewsletters: NewsletterDirectoryEntry[] = [
  {
    slug: "daf-mag",
    title: "DAF Mag",
    description:
      "Une newsletter utile pour le pilotage, la finance, la conformité et l'organisation des activités de conseil et services aux entreprises.",
    seoTitle: "DAF Mag | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de DAF Mag pour la veille des activités de conseil et services aux entreprises.",
    kind: "specific",
    sectorLabel: "Conseil & services aux entreprises",
    sectorSlug: "conseil-services-entreprises",
    frequency: "Variable selon l'editeur",
    tags: ["services b2b", "pilotage", "finance", "organisation"],
    systemSlugs: getSystemSlugsForSectorLabel("Conseil & services aux entreprises"),
    publisher: "DAF Mag",
    externalUrl: "https://www.daf-mag.fr/",
    externalLabel: "Voir sur DAF Mag",
    sourceType: "external",
    confidence: "medium",
  },
  {
    slug: "le-monde-du-chiffre",
    title: "Le Monde du Chiffre",
    description:
      "Une newsletter et une veille metier utiles aux cabinets comptables et aux activites de conseil patrimonial.",
    seoTitle: "Le Monde du Chiffre | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de la newsletter Le Monde du Chiffre pour les experts-comptables et le conseil patrimonial.",
    kind: "specific",
    sectorLabel: "Conseil & services aux entreprises",
    sectorSlug: "conseil-services-entreprises",
    frequency: "Variable selon l'editeur",
    tags: ["cabinet comptable", "patrimoine", "audit", "veille"],
    systemSlugs: ["cabinet-comptable", "gestionnaire-de-patrimoine"],
    publisher: "Le Monde du Chiffre",
    externalUrl: "https://www.lemondeduchiffre.fr/",
    externalLabel: "Voir sur Le Monde du Chiffre",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "revue-fiduciaire",
    title: "Revue Fiduciaire",
    description:
      "Une source de veille experte pour les cabinets comptables sur les sujets fiscaux, sociaux et reglementaires.",
    seoTitle: "Revue Fiduciaire | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de Revue Fiduciaire pour la veille des experts-comptables.",
    kind: "specific",
    sectorLabel: "Conseil & services aux entreprises",
    sectorSlug: "conseil-services-entreprises",
    frequency: "Variable selon l'editeur",
    tags: ["cabinet comptable", "fiscal", "social", "reglementaire"],
    systemSlugs: ["cabinet-comptable"],
    publisher: "Revue Fiduciaire",
    externalUrl: "https://www.revue-fiduciaire.com/",
    externalLabel: "Voir sur Revue Fiduciaire",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "legifiscal-experts-comptables",
    title: "LégiFiscal",
    description:
      "Une newsletter utile aux experts-comptables pour suivre l'actualite fiscale et ses impacts operationnels.",
    seoTitle: "LégiFiscal | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de LégiFiscal pour les experts-comptables et la veille fiscale.",
    kind: "specific",
    sectorLabel: "Conseil & services aux entreprises",
    sectorSlug: "conseil-services-entreprises",
    frequency: "Variable selon l'editeur",
    tags: ["cabinet comptable", "fiscal", "veille", "conformite"],
    systemSlugs: ["cabinet-comptable", "gestionnaire-de-patrimoine"],
    publisher: "LégiFiscal",
    externalUrl: "https://www.legifiscal.fr/",
    externalLabel: "Voir sur LégiFiscal",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "legisocial-experts-comptables",
    title: "LégiSocial",
    description:
      "Une newsletter utile aux cabinets comptables pour la paie, le social, les RH et les obligations associees.",
    seoTitle: "LégiSocial | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de LégiSocial pour la veille sociale et paie des experts-comptables.",
    kind: "specific",
    sectorLabel: "Conseil & services aux entreprises",
    sectorSlug: "conseil-services-entreprises",
    frequency: "Variable selon l'editeur",
    tags: ["cabinet comptable", "social", "paie", "rh"],
    systemSlugs: ["cabinet-comptable"],
    publisher: "LégiSocial",
    externalUrl: "https://www.legisocial.fr/",
    externalLabel: "Voir sur LégiSocial",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "lhotellerie-restauration",
    title: "L'Hôtellerie Restauration",
    description:
      "Une newsletter utile pour suivre exploitation, marge, equipe et actualite terrain dans la restauration et l'hebergement.",
    seoTitle: "L'Hôtellerie Restauration | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de L'Hôtellerie Restauration pour la veille restaurant et hebergement.",
    kind: "specific",
    sectorLabel: "Restauration",
    sectorSlug: "restauration",
    frequency: "Variable selon l'editeur",
    tags: ["restaurant", "marge", "service", "equipe"],
    systemSlugs: ["restaurant", ...getSystemSlugsForSectorLabel("Hébergement & tourisme")],
    publisher: "L'Hôtellerie Restauration",
    externalUrl: "https://www.lhotellerie-restauration.fr/",
    externalLabel: "Voir sur L'Hôtellerie Restauration",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "umih-restauration",
    title: "UMIH",
    description:
      "Une source utile pour suivre l'actualite professionnelle, reglementaire et syndicale de la restauration.",
    seoTitle: "UMIH | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de l'UMIH pour la veille des restaurants et des CHR.",
    kind: "specific",
    sectorLabel: "Restauration",
    sectorSlug: "restauration",
    frequency: "Variable selon l'editeur",
    tags: ["restaurant", "chr", "reglementation", "profession"],
    systemSlugs: ["restaurant"],
    publisher: "UMIH",
    externalUrl: "https://www.umih.fr/",
    externalLabel: "Voir sur UMIH",
    sourceType: "external",
    confidence: "medium",
  },
  {
    slug: "le-journal-de-lagence",
    title: "Le Journal de l'Agence",
    description:
      "Une newsletter utile pour la veille immobiliere sur les mandats, visites, transaction et gestion locative.",
    seoTitle: "Le Journal de l'Agence | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa du Journal de l'Agence pour la veille immobilière.",
    kind: "specific",
    sectorLabel: "Immobilier",
    sectorSlug: "immobilier",
    frequency: "Variable selon l'editeur",
    tags: ["immobilier", "mandats", "visites", "gestion locative"],
    systemSlugs: ["agence-immobiliere", "gestion-locative"],
    publisher: "Le Journal de l'Agence",
    externalUrl: "https://www.journaldelagence.com/",
    externalLabel: "Voir sur Le Journal de l'Agence",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "centre-inffo",
    title: "Centre Inffo",
    description:
      "Une newsletter utile pour suivre la reforme, le financement, la qualite et la reglementation de la formation professionnelle.",
    seoTitle: "Centre Inffo | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de Centre Inffo pour la veille formation.",
    kind: "specific",
    sectorLabel: "Éducation & formation",
    sectorSlug: "education-formation",
    frequency: "Variable selon l'editeur",
    tags: ["formation", "reforme", "financement", "reglementation"],
    systemSlugs: ["organisme-de-formation"],
    publisher: "Centre Inffo",
    externalUrl: "https://www.centre-inffo.fr/",
    externalLabel: "Voir sur Centre Inffo",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "apmnews",
    title: "APMnews",
    description:
      "Une newsletter utile pour suivre les reformes, etablissements, politique de sante et actualite structurante du secteur.",
    seoTitle: "APMnews | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa d'APMnews pour la veille santé.",
    kind: "specific",
    sectorLabel: "Santé, bien-être & esthétique",
    sectorSlug: "sante-bien-etre-esthetique",
    frequency: "Variable selon l'editeur",
    tags: ["sante", "reglementation", "etablissements", "veille"],
    systemSlugs: ["cabinet-medical", ...getSystemSlugsForSectorLabel("Santé, bien-être & esthétique")],
    publisher: "APMnews",
    externalUrl: "https://www.apmnews.com/",
    externalLabel: "Voir sur APMnews",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "fevad",
    title: "Fevad",
    description:
      "Une newsletter utile pour suivre le marche, la reglementation, l'innovation et l'actualite du commerce en ligne.",
    seoTitle: "Fevad | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de la Fevad pour la veille e-commerce.",
    kind: "specific",
    sectorLabel: "Commerce & retail",
    sectorSlug: "commerce-retail",
    frequency: "Variable selon l'editeur",
    tags: ["e-commerce", "marketplace", "reglementation", "croissance"],
    systemSlugs: ["e-commerce"],
    publisher: "Fevad",
    externalUrl: "https://www.fevad.com/",
    externalLabel: "Voir sur Fevad",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "ecommercemag",
    title: "EcommerceMag",
    description:
      "Une newsletter utile pour suivre l'actualite retail, e-commerce, marketing et exploitation commerciale.",
    seoTitle: "EcommerceMag | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa d'EcommerceMag pour la veille commerce et retail.",
    kind: "specific",
    sectorLabel: "Commerce & retail",
    sectorSlug: "commerce-retail",
    frequency: "Variable selon l'editeur",
    tags: ["retail", "commerce", "e-commerce", "marketing"],
    systemSlugs: getSystemSlugsForSectorLabel("Commerce & retail"),
    publisher: "EcommerceMag",
    externalUrl: "https://www.ecommercemag.fr/",
    externalLabel: "Voir sur EcommerceMag",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "batiactu",
    title: "Batiactu",
    description:
      "Une newsletter utile pour suivre chantiers, normes, reglementation, maintenance et execution terrain.",
    seoTitle: "Batiactu | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de Batiactu pour la veille BTP et production.",
    kind: "specific",
    sectorLabel: "BTP & services techniques",
    sectorSlug: "btp-services-techniques",
    frequency: "Variable selon l'editeur",
    tags: ["btp", "chantier", "reglementation", "execution"],
    systemSlugs: [
      ...getSystemSlugsForSectorLabel("BTP & services techniques"),
      ...getSystemSlugsForSectorLabel("Industrie & production"),
    ],
    publisher: "Batiactu",
    externalUrl: "https://www.batiactu.com/",
    externalLabel: "Voir sur Batiactu",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "silicon",
    title: "Silicon",
    description:
      "Une newsletter utile pour la veille IT, cybersécurité, data, IA et transformation digitale.",
    seoTitle: "Silicon | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de Silicon pour la veille tech et digitale.",
    kind: "specific",
    sectorLabel: "Tech & Digital",
    sectorSlug: "tech-digital",
    frequency: "Variable selon l'editeur",
    tags: ["tech", "digital", "ia", "cybersecurite"],
    systemSlugs: getSystemSlugsForSectorLabel("Tech & Digital"),
    publisher: "Silicon",
    externalUrl: "https://www.silicon.fr/",
    externalLabel: "Voir sur Silicon",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "tourmag",
    title: "TourMaG",
    description:
      "Une newsletter utile pour suivre l'actualite tourisme, distribution, exploitation et mouvements du secteur.",
    seoTitle: "TourMaG | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de TourMaG pour la veille hébergement et tourisme.",
    kind: "specific",
    sectorLabel: "Hébergement & tourisme",
    sectorSlug: "hebergement-tourisme",
    frequency: "Variable selon l'editeur",
    tags: ["hebergement", "tourisme", "reservations", "distribution"],
    systemSlugs: getSystemSlugsForSectorLabel("Hébergement & tourisme"),
    publisher: "TourMaG",
    externalUrl: "https://www.tourmag.com/",
    externalLabel: "Voir sur TourMaG",
    sourceType: "external",
    confidence: "high",
  },
  {
    slug: "supply-chain-magazine",
    title: "Supply Chain Magazine",
    description:
      "Une newsletter utile pour suivre la supply chain, le transport, l'entreposage et la performance logistique.",
    seoTitle: "Supply Chain Magazine | Newsletter recommandee | Demaa",
    seoDescription:
      "Découvrez la fiche Demaa de Supply Chain Magazine pour la veille logistique.",
    kind: "specific",
    sectorLabel: "Mobilité & logistique",
    sectorSlug: "mobilite-logistique",
    frequency: "Variable selon l'editeur",
    tags: ["logistique", "transport", "supply chain", "achats"],
    systemSlugs: getSystemSlugsForSectorLabel("Mobilité & logistique"),
    publisher: "Supply Chain Magazine",
    externalUrl: "https://supplychainmagazine.fr/",
    externalLabel: "Voir sur Supply Chain Magazine",
    sourceType: "external",
    confidence: "high",
  },
];

const newsletters: NewsletterDirectoryEntry[] = specificNewsletters;

export function getAllNewsletters() {
  return newsletters;
}

export function getNewsletterBySlug(slug: string) {
  return newsletters.find((entry) => entry.slug === slug) ?? null;
}

export function getNewsletterSystems(newsletterSlug: string, limit = 6): System[] {
  const newsletter = getNewsletterBySlug(newsletterSlug);

  if (!newsletter) {
    return [];
  }

  return Array.from(new Set(newsletter.systemSlugs))
    .map((slug) => enterpriseCatalogBySlug[slug])
    .filter((enterprise): enterprise is NonNullable<typeof enterprise> => Boolean(enterprise))
    .slice(0, limit)
    .map(enterpriseToSystem);
}
