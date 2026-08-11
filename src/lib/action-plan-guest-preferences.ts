import { isActionPlanSystemId } from "@/lib/action-plan-system-catalog";

export const GUEST_SELECTED_SYSTEM_STORAGE_KEY =
  "demaa:guest-selected-system:v1";

export function readGuestSelectedSystemId() {
  if (typeof window === "undefined") return null;

  try {
    const storedSystemId = window.localStorage.getItem(
      GUEST_SELECTED_SYSTEM_STORAGE_KEY,
    );
    if (storedSystemId && isActionPlanSystemId(storedSystemId)) {
      return storedSystemId;
    }
    if (storedSystemId !== null) {
      window.localStorage.removeItem(GUEST_SELECTED_SYSTEM_STORAGE_KEY);
    }
  } catch {
    // Browser storage can be unavailable in private or restricted contexts.
  }

  return null;
}

export function writeGuestSelectedSystemId(systemId: string) {
  if (typeof window === "undefined") return;

  if (!isActionPlanSystemId(systemId)) return;

  try {
    window.localStorage.setItem(
      GUEST_SELECTED_SYSTEM_STORAGE_KEY,
      systemId,
    );
  } catch {
    // Keep the app usable even when browser storage is unavailable.
  }
}
