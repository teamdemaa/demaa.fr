"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  consumeGoogleRedirectAndGetIdToken,
  finishGoogleRedirect,
  readPendingGoogleRedirect,
} from "@/lib/firebase-client-auth";

export default function GoogleRedirectSessionConsumer() {
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const pending = readPendingGoogleRedirect();
    if (!pending) return;
    setIsCompleting(true);

    void (async () => {
      try {
        const result = await consumeGoogleRedirectAndGetIdToken();
        if (!result) throw new Error("La connexion Google n’a pas pu être reprise.");
        const response = await fetch("/api/customer-space/firebase-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idToken: result.idToken,
            returnTo: result.returnTo,
          }),
        });
        const payload = await response.json().catch(() => null) as {
          error?: string;
          redirectTo?: string;
        } | null;
        if (!response.ok || !payload?.redirectTo) {
          throw new Error(payload?.error || "La connexion Google n’a pas pu aboutir.");
        }
        await finishGoogleRedirect();
        window.location.replace(payload.redirectTo);
      } catch (error) {
        await finishGoogleRedirect().catch(() => undefined);
        const params = new URLSearchParams({
          returnTo: pending.returnTo,
          message: error instanceof Error
            ? error.message.slice(0, 180)
            : "La connexion Google n’a pas pu aboutir.",
        });
        window.location.replace(`/connexion?${params.toString()}`);
      }
    })();
  }, []);

  if (!isCompleting) return null;
  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-dema-cream/90 px-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-full bg-dema-paper px-5 py-3 text-sm font-medium text-dema-forest shadow-lg">
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        Finalisation de la connexion…
      </div>
    </div>
  );
}
