export type SystemResource = {
  id: string;
  title: string;
  category: string;
  resourceLabel: string;
  resourceHref: string;
  image: string;
  slides?: string[];
  systemSlugs?: string[];
};

const flexibleSystemSlugs = [
  "cabinet-de-conseil",
  "consultant-independant",
  "freelance",
  "agence-marketing",
  "agence-web",
  "agence-de-recrutement",
  "organisme-de-formation",
  "formation-en-ligne",
  "daf-externalise",
  "office-manager-externalise",
  "assistant-administratif-externalise",
  "secretariat-externalise",
  "gestionnaire-paie-independant",
  "cabinet-rh-externalise",
  "centre-appels-support-client",
  "societe-recouvrement",
  "societe-domiciliation",
  "centre-affaires-coworking",
  "cabinet-qhse-conformite",
  "bureau-etudes",
  "cabinet-etudes",
  "infogerance-informatique",
  "cybersecurite-pme",
  "integrateur-crm-erp",
  "consultant-data-bi",
  "agence-seo",
  "agence-acquisition-paid-ads",
  "studio-branding-design",
];

export const systemResources: SystemResource[] = [
  {
    id: "obligations-tpe",
    title: "Maîtriser les obligations et les finances de son entreprise",
    category: "Obligations",
    resourceLabel: "Accéder au modèle",
    resourceHref:
      "https://www.canva.com/design/DAHDpfMys10/_MTXI4EYctriq9Mn9eEhRA/view?utm_content=DAHDpfMys10&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h1664f1e785",
    image: "/images/academy/obligations-1.png",
    slides: [
      "/images/academy/obligations-1.png",
      "/images/academy/obligations-2.png",
    ],
  },
  {
    id: "previsionnel-financier",
    title: "Construire un budget prévisionnel pour être dans l'anticipation",
    category: "Trésorerie",
    resourceLabel: "Accéder au modèle",
    resourceHref:
      "https://docs.google.com/spreadsheets/d/1-7IDhGAtwNQJtZDYYvhDvM3VHfHVeGwOMTFKdAQuIOE/edit?usp=sharing",
    image: "/images/academy/budget-1.png",
    slides: [
      "/images/academy/budget-1.png",
      "/images/academy/budget-2.png",
      "/images/academy/budget-3.png",
    ],
  },
  {
    id: "systeme-operationnel-airtable",
    title: "Comment organiser son entreprise au quotidien et concrètement",
    category: "Organisation",
    resourceLabel: "Accéder au modèle",
    resourceHref: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
    image: "/images/academy/organisation-1.png",
    slides: [
      "/images/academy/organisation-1.png",
      "/images/academy/organisation-2.png",
      "/images/academy/organisation-3.png",
    ],
    systemSlugs: flexibleSystemSlugs,
  },
];

export function getSystemResources(systemSlug: string): SystemResource[] {
  return systemResources.filter(
    (resource) => !resource.systemSlugs || resource.systemSlugs.includes(systemSlug),
  );
}
