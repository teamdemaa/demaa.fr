export const PARTNER_SOLUTION_TYPES = [
  "software",
  "service-provider",
  "supplier",
  "network",
  "training",
  "funding",
] as const;

export const PARTNER_SUBMISSION_CONSENT_TEXT =
  "J’accepte que Demaa utilise ces informations pour étudier ma proposition et me recontacter.";
export const PARTNER_SUBMISSION_CONSENT_VERSION = "partner-submission-v1";
export const MAX_PARTNER_SELECTED_SYSTEMS = 12;

export type PartnerSolutionType = (typeof PARTNER_SOLUTION_TYPES)[number];

export const PARTNER_SOLUTION_TYPE_LABELS: Readonly<
  Record<PartnerSolutionType, string>
> = {
  funding: "Financement",
  network: "Réseau professionnel",
  software: "Logiciel",
  "service-provider": "Prestataire de services",
  supplier: "Fournisseur",
  training: "Formation",
};

export type PartnerSubmissionRequest = Readonly<{
  attribution?: unknown;
  company: string;
  consent: boolean;
  description: string;
  email: string;
  fax?: string;
  fullName: string;
  idempotencyKey: string;
  selectedSystemSlugs: string[];
  solutionName: string;
  solutionType: PartnerSolutionType;
  website: string;
}>;

export function isPartnerSolutionType(
  value: string,
): value is PartnerSolutionType {
  return PARTNER_SOLUTION_TYPES.some((type) => type === value);
}
