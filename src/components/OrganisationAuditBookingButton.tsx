"use client";

import { FilloutPopupEmbed } from "@fillout/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type OrganisationAuditBookingButtonProps = {
  className?: string;
  label?: string;
  source?: string;
};

export default function OrganisationAuditBookingButton({
  className = "demaa-primary-button mt-5 w-fit",
  label = "Prendre RDV",
  source = "Page diagnostic organisation",
}: OrganisationAuditBookingButtonProps) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(searchParams.get("booking") === "1");
  const inheritedSource = searchParams.get("source") || source;
  const parameters = useMemo(() => ({ source: inheritedSource }), [inheritedSource]);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {label}
      </button>
      <FilloutPopupEmbed
        filloutId="sWP6PSPRVLus"
        inheritParameters
        parameters={parameters}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        width={720}
        height={720}
      />
    </>
  );
}
