export const LEGAL = {
  brandName: "Demaa",
  domain: "Demaa.fr",
  legalEntityName: "ODEMA",
  legalStatus: "Entrepreneur individuel",
  legalRepresentative: "Oumou Gory",
  tradeName: "Demaa",
  siren: "889 656 906",
  siret: "889 656 906 00027",
  vatNumber: "FR16889656906",
  rcsCity: "Bobigny",
  rcsRegistrationDate: "23/10/2024",
  rcsNumber: "889 656 906 R.C.S. Bobigny",
  address: "6 rue du maréchal juin, 95210 Saint Gratien, France",
  email: "team@demaa.fr",
  phone: "+33 7 82 84 24 35",
  lastUpdatedLabel: "24 juin 2026",
  hostingProviderName: "Vercel Inc.",
  hostingProviderAddress: "340 S Lemon Ave #1135, Walnut, CA 91789, États-Unis",
  hostingProviderUrl: "https://vercel.com",
} as const;

export const LEGAL_COPY = {
  brandOperatorSentence: `${LEGAL.brandName} est une marque exploitée par ${LEGAL.legalEntityName}.`,
  sitePublisherSentence: `Le site ${LEGAL.domain} est édité par ${LEGAL.legalEntityName}, représentée par ${LEGAL.legalRepresentative}.`,
  legalEntityDescription: `${LEGAL.legalEntityName} exerce sous le statut ${LEGAL.legalStatus.toLowerCase()} et exploite la marque ${LEGAL.brandName}.`,
} as const;
