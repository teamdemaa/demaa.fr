export const OPERATIONAL_SYSTEM_OFFER = {
  priceCents: 4_900,
  currency: "eur",
  displayPrice: "49 €",
  paymentMode: "one_time",
  demoAccess: "free_read_only",
  deliveredFormat: "editable_google_sheet",
  emailCapturedAt: "checkout",
  humanSupportIncluded: false,
  subscriptionIncluded: false,
} as const;

export function getOperationalSystemProductName(systemName: string) {
  return `Système opérationnel — ${systemName.trim()}`;
}

export function getOperationalSystemPurchaseLabel() {
  return `Obtenir le système — ${OPERATIONAL_SYSTEM_OFFER.displayPrice}`;
}

export function getOperationalSystemAccessNote() {
  return "Démonstration en lecture seule · Tableau prêt à utiliser après paiement";
}
