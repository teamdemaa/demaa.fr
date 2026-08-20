"use client";

import dynamic from "next/dynamic";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import AcademyIndexClient from "@/components/AcademyIndexClient";
import type { InterfaceLocaleCode, MarketCode } from "@/lib/international-context";
import {
  getActionPlanAcademyPayloadCacheKey,
  invalidateActionPlanAcademyPayload,
  loadActionPlanAcademyPayload,
  readCachedActionPlanAcademyPayload,
} from "@/lib/action-plan-academy-payload.client";

const AcademyCoursePlayer = dynamic(
  () => import("@/components/AcademyCoursePlayer"),
);

export default function ActionPlanAcademyPanel({
  initialContentSlug,
  localeCode = "fr",
  marketCode = "fr-fr",
  onContentChange,
  showStructureNewsletter = false,
}: {
  initialContentSlug?: string;
  localeCode?: InterfaceLocaleCode;
  marketCode?: MarketCode;
  onContentChange?: (contentSlug?: string) => void;
  showStructureNewsletter?: boolean;
}) {
  const cacheKey = getActionPlanAcademyPayloadCacheKey(localeCode, marketCode);
  const [payload, setPayload] = useState(() =>
    readCachedActionPlanAcademyPayload(cacheKey)
  );
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    void loadActionPlanAcademyPayload({ localeCode, marketCode })
      .then((body) => {
        if (!active) return;
        setPayload(body);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        if (!active) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : localeCode === "en"
              ? "Unable to load the Academy."
              : "Impossible de charger l’Académie.",
        );
      });

    return () => {
      active = false;
    };
  }, [localeCode, marketCode, reloadKey]);

  if (error) {
    return (
      <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-8 text-center">
        <p className="text-sm text-dema-muted">{error}</p>
        <button
          type="button"
          onClick={() => {
            invalidateActionPlanAcademyPayload(cacheKey);
            setPayload(null);
            setError(null);
            setReloadKey((value) => value + 1);
          }}
          className="demaa-secondary-button mt-4 min-h-11 gap-2"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {localeCode === "en" ? "Try again" : "Réessayer"}
        </button>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-dema-muted">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        {localeCode === "en" ? "Loading the Academy…" : "Chargement de l’Académie…"}
      </div>
    );
  }

  const selectedContent = initialContentSlug
    ? payload.contents.find(
      (content) => content.identity.slug === initialContentSlug,
    ) ?? null
    : null;

  if (selectedContent) {
    return (
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <AcademyCoursePlayer
          key={selectedContent.identity.slug}
          content={selectedContent}
          embedded
          localeCode={localeCode}
          onBack={() => {
            onContentChange?.(undefined);
          }}
        />
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <AcademyIndexClient
        contents={payload.contents}
        embedded
        localeCode={localeCode}
        showStructureNewsletter={showStructureNewsletter}
        onOpenContent={(content) => {
          onContentChange?.(content.identity.slug);
        }}
      />
    </div>
  );
}
