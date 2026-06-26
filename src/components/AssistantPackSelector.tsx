"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ShoppingBag } from "lucide-react";
import {
  ASSISTANT_SERVICE_SLUG,
  assistantServicePacks,
  getAssistantPackBySlug,
  isAssistantPackSlug,
} from "@/lib/assistant-service-packs";
import {
  CART_UPDATED_EVENT,
  openServiceCartModal,
  readServiceCartSlugs,
  writeServiceCartSlugs,
} from "@/lib/service-cart";
import { formatPurchasableServicePrice } from "@/lib/service-purchase";

type AssistantPackSelectorProps = {
  buttonLabel?: string;
  className?: string;
  compact?: boolean;
  fullWidth?: boolean;
  showHelperText?: boolean;
};

export default function AssistantPackSelector({
  buttonLabel = "Ajouter le pack",
  className = "",
  compact = false,
  fullWidth = true,
  showHelperText = true,
}: AssistantPackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackSlug, setSelectedPackSlug] = useState<string>(
    assistantServicePacks[0]?.slug || ASSISTANT_SERVICE_SLUG
  );
  const [selectedCartSlug, setSelectedCartSlug] = useState<string | null>(null);

  useEffect(() => {
    const syncSelection = () => {
      const currentCartSlug =
        readServiceCartSlugs().find((slug) => isAssistantPackSlug(slug)) || null;

      setSelectedCartSlug(currentCartSlug);

      if (currentCartSlug) {
        setSelectedPackSlug(currentCartSlug);
      }
    };

    syncSelection();
    window.addEventListener("storage", syncSelection);
    window.addEventListener(CART_UPDATED_EVENT, syncSelection);

    return () => {
      window.removeEventListener("storage", syncSelection);
      window.removeEventListener(CART_UPDATED_EVENT, syncSelection);
    };
  }, []);

  const selectedPack = useMemo(
    () => getAssistantPackBySlug(selectedPackSlug) || assistantServicePacks[0],
    [selectedPackSlug]
  );

  const isSelected = selectedCartSlug === selectedPackSlug;

  function handleAddPack() {
    const current = readServiceCartSlugs().filter((slug) => !isAssistantPackSlug(slug));

    writeServiceCartSlugs([...current, selectedPackSlug]);
    setIsOpen(true);
    openServiceCartModal();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`inline-flex items-center justify-between gap-3 rounded-full border border-dema-line bg-dema-paper px-4 py-3 text-[1.15rem] font-medium text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest ${
          fullWidth ? "w-full" : ""
        }`}
        aria-expanded={isOpen}
        aria-controls="assistant-pack-selector-panel"
      >
        <span className="truncate">
          {selectedPack.label} · {formatPurchasableServicePrice(selectedPack.unitAmount)} HT
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div
          id="assistant-pack-selector-panel"
          className={`mt-2 rounded-[1rem] border border-dema-line bg-white ${
            compact ? "p-2.5" : "p-3"
          }`}
        >
          <p className="mb-2 text-xs text-dema-muted">30 € / heure HT sur chaque pack</p>
          <div className="overflow-hidden rounded-[0.85rem] border border-dema-line/80 bg-dema-paper">
            {assistantServicePacks.map((pack) => {
              const isActive = selectedPackSlug === pack.slug;

              return (
                <button
                  key={pack.slug}
                  type="button"
                  onClick={() => {
                    setSelectedPackSlug(pack.slug);
                    setIsOpen(true);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-dema-sage/45"
                      : "bg-dema-paper hover:bg-dema-sage/20"
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        isActive
                          ? "border-dema-forest bg-dema-forest text-white"
                          : "border-dema-line bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[1.15rem] font-medium text-brand-blue">{pack.label}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[1.15rem] font-medium text-brand-blue">
                      {formatPurchasableServicePrice(pack.unitAmount)} HT
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddPack}
            className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
              fullWidth ? "w-full" : ""
            } ${
              isSelected
                ? "bg-dema-sage text-dema-forest hover:bg-dema-sage/85"
                : "bg-dema-forest text-dema-paper hover:bg-brand-blue"
            }`}
          >
            {isSelected ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            )}
            {isSelected ? `${selectedPack.label} sélectionné` : buttonLabel}
          </button>
        </div>
      ) : null}

      {showHelperText && isSelected ? (
        <p className="mt-2 text-xs leading-relaxed text-dema-muted">
          {selectedPack.label} est prêt dans votre panier.
        </p>
      ) : null}
    </div>
  );
}
