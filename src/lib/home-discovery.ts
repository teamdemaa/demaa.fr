export type HomeDiscoveryAnswer = "yes" | "no";

type StoredHomeDiscoveryState = {
  seen: true;
  answer: HomeDiscoveryAnswer;
};

export const HOME_DISCOVERY_STORAGE_KEY = "demaa-home-discovery";
export const HOME_DISCOVERY_UNLOCKED_EVENT = "demaa:home-discovery-unlocked";

export function readHomeDiscoveryState(): StoredHomeDiscoveryState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(HOME_DISCOVERY_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredHomeDiscoveryState>;

    if (
      parsedValue?.seen === true &&
      (parsedValue.answer === "yes" || parsedValue.answer === "no")
    ) {
      return {
        seen: true,
        answer: parsedValue.answer,
      };
    }
  } catch {
    window.localStorage.removeItem(HOME_DISCOVERY_STORAGE_KEY);
  }

  return null;
}

export function writeHomeDiscoveryState(answer: HomeDiscoveryAnswer) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    HOME_DISCOVERY_STORAGE_KEY,
    JSON.stringify({
      seen: true,
      answer,
    } satisfies StoredHomeDiscoveryState)
  );
}
