"use client";

import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { createPortal } from "react-dom";

const AutomationCallbackDialog = dynamic(
  () => import("@/components/AutomationCallbackDialog"),
  { ssr: false },
);

export default function AutomationCallbackControl({
  variant = "nav",
  label,
}: {
  variant?: "nav" | "hero" | "offer";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const isOffer = variant === "offer";

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={isOffer
          ? "inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-dema-paper px-7 text-sm font-semibold text-dema-forest transition hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-paper/70"
          : variant === "hero"
            ? "inline-flex min-h-11 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-dema-forest px-6 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30 focus-visible:ring-offset-2"
            : "inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full bg-dema-forest px-3 text-xs font-medium text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30 sm:min-h-11 sm:px-5 sm:text-sm"}
      >
        {label ?? "Discuter de mon besoin"}
        {isOffer ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <AutomationCallbackDialog onClose={() => setOpen(false)} />,
            document.body,
          )
        : null}
    </>
  );
}
