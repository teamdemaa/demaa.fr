import { getPurchasableServiceConfig } from "@/lib/service-purchase";

export const CART_STORAGE_KEY = "demaa-service-cart";
export const CART_UPDATED_EVENT = "demaa-cart-updated";

export function readServiceCartSlugs() {
  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (value): value is string =>
        typeof value === "string" && Boolean(getPurchasableServiceConfig(value))
    );
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

export function writeServiceCartSlugs(slugs: string[]) {
  window.localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify([...new Set(slugs)])
  );
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}
