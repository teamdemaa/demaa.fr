import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  filloutProps: [] as Array<Record<string, unknown>>,
  searchParams: new URLSearchParams(
    "source=Source+query+contradictoire&systemSlug=slug-query",
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.searchParams,
}));

vi.mock("@fillout/react", () => ({
  FilloutPopupEmbed: (props: Record<string, unknown>) => {
    mocks.filloutProps.push(props);
    return null;
  },
}));

vi.mock("@/lib/lead-attribution-client", () => ({
  getFilloutAttributionParameters: () => ({
    dem_first_source: "google",
    dem_last_source: "google",
  }),
}));

vi.mock("@/lib/fillout-lead-client", () => ({
  recordFilloutLeadSubmission: vi.fn(),
}));

import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";

function renderButton(
  props: ComponentProps<typeof OrganisationSessionBookingButton>,
) {
  renderToStaticMarkup(createElement(OrganisationSessionBookingButton, props));
  return mocks.filloutProps.at(-1) as {
    filloutId: string;
    parameters: Record<string, string>;
  };
}

describe("Organisation session booking Fillout parameters", () => {
  beforeEach(() => {
    mocks.filloutProps.length = 0;
  });

  it("keeps query-source inheritance as the generic default", () => {
    const fillout = renderButton({
      source: "Source générique",
      systemSlug: "plomberie",
    });

    expect(fillout.parameters).toMatchObject({
      source: "Source query contradictoire",
      systemSlug: "plomberie",
    });
  });

  it("uses the authoritative D064 source for Process then Solutions", () => {
    const processFillout = renderButton({
      source: "Système opérationnel - Process",
      sourceIsAuthoritative: true,
      systemSlug: "plomberie",
    });
    const solutionsFillout = renderButton({
      source: "Système opérationnel - Solutions",
      sourceIsAuthoritative: true,
      systemSlug: "plomberie",
    });

    expect(processFillout).toMatchObject({
      filloutId: "sWP6PSPRVLus",
      parameters: {
        dem_first_source: "google",
        dem_last_source: "google",
        source: "Système opérationnel - Process",
        systemSlug: "plomberie",
      },
    });
    expect(solutionsFillout).toMatchObject({
      filloutId: "sWP6PSPRVLus",
      parameters: {
        dem_first_source: "google",
        dem_last_source: "google",
        source: "Système opérationnel - Solutions",
        systemSlug: "plomberie",
      },
    });
  });

  it("passes the selected model to the adaptation form", () => {
    const fillout = renderButton({
      source: "Modèles à copier",
      sourceIsAuthoritative: true,
      modelSlug: "suivi-previsionnel-financier",
    });

    expect(fillout.parameters).toMatchObject({
      source: "Modèles à copier",
      modelSlug: "suivi-previsionnel-financier",
    });
  });
});
