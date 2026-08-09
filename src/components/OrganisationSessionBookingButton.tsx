"use client";

import { FilloutPopupEmbed } from "@fillout/react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getFilloutAttributionParameters } from "@/lib/lead-attribution-client";
import { recordFilloutLeadSubmission } from "@/lib/fillout-lead-client";

type OrganisationSessionBookingButtonProps = {
  className?: string;
  label?: string;
  requestType?: string;
  source?: string;
  sourceIsAuthoritative?: boolean;
  systemSlug?: string;
};

export default function OrganisationSessionBookingButton({
  className = "demaa-primary-button mt-5 w-fit",
  label = "Réserver ma session offerte",
  requestType = "organisation_session_booking",
  source = "Page session stratégique",
  sourceIsAuthoritative = false,
  systemSlug,
}: OrganisationSessionBookingButtonProps) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(searchParams.get("booking") === "1");
  const [filloutAttribution, setFilloutAttribution] = useState(
    () => getFilloutAttributionParameters(),
  );
  const inheritedSource = sourceIsAuthoritative
    ? source
    : searchParams.get("source") || source;
  const inheritedSystemSlug = systemSlug ?? searchParams.get("systemSlug");
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
      <button
        type="button"
        onClick={openBooking}
        className={className}
        data-resource-cta
      >
        {label}
      </button>
      <FilloutPopupEmbed
        filloutId="sWP6PSPRVLus"
        inheritParameters
        parameters={parameters}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={() => {
          recordFilloutLeadSubmission({
            requestType,
            systemSlug: inheritedSystemSlug,
          });
        }}
        width={720}
        height={720}
      />
    </>
  );
}
