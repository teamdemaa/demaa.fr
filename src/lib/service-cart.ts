import { getPurchasableServiceConfig } from "@/lib/service-purchase";

export const CART_STORAGE_KEY = "demaa-service-cart";
export const CART_UPDATED_EVENT = "demaa-cart-updated";
export const CART_MODAL_OPEN_EVENT = "demaa-cart-modal-open";
export const CART_MODAL_CLOSE_EVENT = "demaa-cart-modal-close";

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

export function openServiceCartModal() {
  window.dispatchEvent(new CustomEvent(CART_MODAL_OPEN_EVENT));
}

export function closeServiceCartModal() {
  window.dispatchEvent(new CustomEvent(CART_MODAL_CLOSE_EVENT));
}
