import type { DemaaFinanceItem } from "@/lib/finance-catalog";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";
import type { DemaaSupplier } from "@/lib/supplier-catalog";

const GENERIC_SUPPLIER_HINTS = new Set([
  "À vérifier",
  "Comparaison partenaire",
  "Comparaison à venir",
  "Offre partenaire à venir",
  "Annuaire partenaire",
  "Conditions pro à vérifier",
  "Sélection à venir",
  "Bon plan à venir",
]);

const GENERIC_FINANCE_HINTS = new Set([
  "À vérifier",
  "Comparaison à venir",
  "Conditions pro à vérifier",
]);

export function getSupplierCardBadge(supplier: DemaaSupplier): string | null {
  if (supplier.offerHint && !GENERIC_SUPPLIER_HINTS.has(supplier.offerHint)) {
    return supplier.offerHint;
  }

  return supplier.usefulFor[0] ?? supplier.tags[0] ?? null;
}

export function getProNetworkCardBadge(network: DemaaProNetwork): string | null {
  return network.usefulFor[0] ?? network.tags[0] ?? null;
}

export function getFinanceCardBadge(item: DemaaFinanceItem): string | null {
  if (item.offerHint && !GENERIC_FINANCE_HINTS.has(item.offerHint)) {
    return item.offerHint;
  }

  return item.usefulFor[0] ?? item.tags[0] ?? null;
}
