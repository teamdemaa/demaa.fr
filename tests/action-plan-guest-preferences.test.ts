import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GUEST_SELECTED_SYSTEM_STORAGE_KEY,
  readGuestSelectedSystemId,
  writeGuestSelectedSystemId,
} from "@/lib/action-plan-guest-preferences";

const storage = new Map<string, string>();

function installBrowserStorage() {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
}

afterEach(() => {
  storage.clear();
  vi.unstubAllGlobals();
});

describe("guest action plan preferences", () => {
  it("keeps a valid selected system in browser storage", () => {
    installBrowserStorage();

    writeGuestSelectedSystemId("restaurant");

    expect(readGuestSelectedSystemId()).toBe("restaurant");
    expect(storage.get(GUEST_SELECTED_SYSTEM_STORAGE_KEY)).toBe("restaurant");
  });

  it("discards an unknown system instead of restoring it", () => {
    installBrowserStorage();
    storage.set(GUEST_SELECTED_SYSTEM_STORAGE_KEY, "metier-inconnu");

    expect(readGuestSelectedSystemId()).toBeNull();
    expect(storage.has(GUEST_SELECTED_SYSTEM_STORAGE_KEY)).toBe(false);
  });

  it("stays safe when browser storage is unavailable", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("storage denied");
        },
        removeItem: vi.fn(),
        setItem: () => {
          throw new Error("storage denied");
        },
      },
    });

    expect(() => writeGuestSelectedSystemId("restaurant")).not.toThrow();
    expect(readGuestSelectedSystemId()).toBeNull();
  });
});
