"use client";

import { useState } from "react";
import PreferentialRatesModal from "@/components/PreferentialRatesModal";

type PreferentialRatesTriggerProps = {
  className?: string;
  label: string;
  systemSlug: string;
};

export default function PreferentialRatesTrigger({
  className,
  label,
  systemSlug,
}: PreferentialRatesTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {label}
      </button>
      {isOpen ? (
        <PreferentialRatesModal systemSlug={systemSlug} onClose={() => setIsOpen(false)} />
      ) : null}
    </>
  );
}
