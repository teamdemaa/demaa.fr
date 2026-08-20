"use client";

import { loadActionPlanAcademyPayload } from "@/lib/action-plan-academy-payload.client";
import type { InterfaceLocaleCode, MarketCode } from "@/lib/international-context";

type IdleWindow = Window & typeof globalThis & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: IdleRequestCallback,
    options?: IdleRequestOptions,
  ) => number;
};

export function scheduleActionPlanAcademyPayloadPreload(input: {
  localeCode: InterfaceLocaleCode;
  marketCode: MarketCode;
}) {
  const preload = () => {
    void loadActionPlanAcademyPayload(input).catch(() => undefined);
  };
  const browserWindow = window as IdleWindow;

  if (browserWindow.requestIdleCallback) {
    const handle = browserWindow.requestIdleCallback(preload, { timeout: 2_000 });
    return () => browserWindow.cancelIdleCallback?.(handle);
  }

  const handle = browserWindow.setTimeout(preload, 250);
  return () => browserWindow.clearTimeout(handle);
}
