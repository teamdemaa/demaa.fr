export const LEGAL = {
  brandName: "Demaa",
  domain: "demaa.fr",
  legalEntityName: "Gory Oumou",
  legalStatus: "Entrepreneur individuel",
  legalRepresentative: "Gory Oumou",
  tradeName: "Demaa",
  siren: "889 656 906",
  siret: "889 656 906 00035",
  vatNumber: "FR16889656906",
  rneRegistrationDate: "6 juillet 2026",
  address: "17 rue d’Ormesson, 93800 Épinay-sur-Seine, France",
  email: "team@demaa.fr",
  phone: "+33 7 82 84 24 35",
  lastUpdatedLabel: "5 août 2026",
  hostingProviderName: "Vercel Inc.",
  hostingProviderAddress: "340 S Lemon Ave #1135, Walnut, CA 91789, États-Unis",
  hostingProviderUrl: "https://vercel.com",
} as const;

export const LEGAL_COPY = {
  brandOperatorSentence: `${LEGAL.brandName} est une marque exploitée par ${LEGAL.legalEntityName}.`,
  sitePublisherSentence: `Le site ${LEGAL.domain} est édité par ${LEGAL.legalEntityName}, entrepreneur individuel, sous le nom commercial ${LEGAL.tradeName}.`,
  legalEntityDescription: `${LEGAL.legalEntityName} exerce sous le statut ${LEGAL.legalStatus.toLowerCase()} et exploite la marque ${LEGAL.brandName}.`,
} as const;
