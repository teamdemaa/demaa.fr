"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { getPwaInstallUiCopy } from "@/lib/pwa-install-ui-copy";

type BeforeInstallPromptEvent = Event & {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallPrompt({
  localeCode = "fr",
}: {
  localeCode?: InterfaceLocaleCode;
}) {
  const ui = getPwaInstallUiCopy(localeCode);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const frame = window.requestAnimationFrame(() => {
      setIsIOS(ios);
      setDismissed(standalone || sessionStorage.getItem("demaa-pwa-install-dismissed") === "1");
    });

    function captureInstallEvent(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", captureInstallEvent);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("beforeinstallprompt", captureInstallEvent);
    };
  }, []);

  if (dismissed || (!installEvent && !isIOS)) return null;

  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") setDismissed(true);
      setInstallEvent(null);
      return;
    }
    setShowIOSHelp(true);
  }

  function dismiss() {
    sessionStorage.setItem("demaa-pwa-install-dismissed", "1");
    setDismissed(true);
  }

  return (
    <aside className="mt-8 rounded-[1.1rem] border border-dema-line bg-dema-soft/35 px-4 py-3 text-sm text-brand-blue">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void install()}
          className="inline-flex min-h-10 items-center gap-2 text-dema-forest"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {ui.install}
        </button>
        <button type="button" onClick={dismiss} className="text-xs text-dema-muted underline">
          {ui.later}
        </button>
      </div>
      {showIOSHelp ? (
        <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-dema-muted">
          <Share className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {ui.iosHelp}
        </p>
      ) : null}
    </aside>
  );
}
