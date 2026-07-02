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
  buttonLabel = "Sélectionner ce forfait",
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
    openServiceCartModal();
  }

  function renderCompactSelector() {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`inline-flex items-center justify-between gap-3 rounded-full border border-dema-line bg-dema-paper px-4 py-3 text-[0.92rem] font-normal text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest ${
            fullWidth ? "w-full" : ""
          }`}
          aria-expanded={isOpen}
          aria-controls="assistant-pack-selector-panel"
        >
          <span className="truncate">
            {selectedPack.label} · {formatPurchasableServicePrice(selectedPack.unitAmount)} / mois HT
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>

        {isOpen ? (
          <div
            id="assistant-pack-selector-panel"
            className="mt-2 rounded-[1rem] border border-dema-line bg-white p-2.5"
          >
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
                        <p className="text-[0.92rem] font-normal text-brand-blue">{pack.label}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-dema-muted">
                          {formatPurchasableServicePrice(pack.unitAmount)} / mois HT
                        </p>
                      </div>
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
      </>
    );
  }

  return (
    <div className={className}>
      {compact ? (
        renderCompactSelector()
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {assistantServicePacks.map((pack) => {
              const isActive = selectedPackSlug === pack.slug;
              const isCurrentSelection = selectedCartSlug === pack.slug;

              return (
                <article
                  key={pack.slug}
                  className={`flex h-full flex-col rounded-[1.15rem] border p-5 transition ${
                    isActive
                      ? "border-dema-forest/35 bg-dema-sage/35"
                      : "border-dema-line bg-dema-paper"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                        Forfait
                      </p>
                      <h3 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-brand-blue">
                        {pack.label}
                      </h3>
                    </div>
                    {isCurrentSelection ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-dema-forest px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Sélectionné
                      </span>
                    ) : null}
                  </div>

                  <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-dema-muted marker:text-dema-forest">
                    <li>Collecte WhatsApp des factures fournisseurs</li>
                    <li>Émission des factures clients</li>
                    <li>Transmission comptable / outil</li>
                    {pack.includesClientRelances ? <li>Relances clients</li> : null}
                    {pack.includesMonthlyReporting ? <li>Reporting mensuel</li> : null}
                    <li>Jusqu&apos;à {pack.supplierInvoicesPerMonth} factures fournisseurs / mois</li>
                    <li>Jusqu&apos;à {pack.customerInvoicesPerMonth} factures clients / mois</li>
                  </ul>

                  <div className="mt-auto pt-6">
                    <p className="mt-2 text-[2rem] font-semibold tracking-tight text-brand-blue">
                      {formatPurchasableServicePrice(pack.unitAmount)}
                    </p>
                    <p className="mt-1 text-base font-medium text-dema-muted">HT / mois</p>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackSlug(pack.slug);
                        const current = readServiceCartSlugs().filter((slug) => !isAssistantPackSlug(slug));
                        writeServiceCartSlugs([...current, pack.slug]);
                        openServiceCartModal();
                      }}
                      className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                        fullWidth ? "w-full" : ""
                      } ${
                        isCurrentSelection
                          ? "bg-dema-sage text-dema-forest hover:bg-dema-sage/85"
                          : "bg-dema-forest text-dema-paper hover:bg-brand-blue"
                      }`}
                    >
                      {isCurrentSelection ? (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isCurrentSelection ? `${pack.label} sélectionné` : buttonLabel}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {showHelperText && isSelected ? (
        <p className="mt-2 text-xs leading-relaxed text-dema-muted">
          {selectedPack.label} est prêt dans votre panier.
        </p>
      ) : null}
    </div>
  );
}
