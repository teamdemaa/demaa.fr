"use client";

import { FilloutPopupEmbed } from "@fillout/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getFilloutAttributionParameters } from "@/lib/lead-attribution-client";
import { recordFilloutLeadSubmission } from "@/lib/fillout-lead-client";

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
  const [filloutAttribution, setFilloutAttribution] = useState(
    () => getFilloutAttributionParameters(),
  );
  const inheritedSource = searchParams.get("source") || source;
  const inheritedSystemSlug = searchParams.get("systemSlug");
  const parameters = useMemo(
    () => ({
      ...filloutAttribution,
      source: inheritedSource,
      systemSlug: inheritedSystemSlug ?? undefined,
    }),
    [filloutAttribution, inheritedSource, inheritedSystemSlug],
  );

  function openBooking() {
    setFilloutAttribution(getFilloutAttributionParameters());
    setIsOpen(true);
  }

  return (
    <>
      <button type="button" onClick={openBooking} className={className}>
        {label}
      </button>
      <FilloutPopupEmbed
        filloutId="sWP6PSPRVLus"
        inheritParameters
        parameters={parameters}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={(submissionUuid) => {
          recordFilloutLeadSubmission({
            source: inheritedSource,
            submissionUuid,
            systemSlug: inheritedSystemSlug,
          });
        }}
        width={720}
        height={720}
      />
    </>
  );
}
