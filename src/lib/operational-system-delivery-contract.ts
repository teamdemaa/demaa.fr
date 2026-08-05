export type OperationalSystemDeliveryRequest = {
  attribution?: unknown;
  email: string;
  firstName?: string;
  idempotencyKey: string;
  marketingConsent?: boolean;
  systemSlug: string;
  website?: string;
};

export type OperationalSystemDeliverySuccess = {
  ok: true;
};
