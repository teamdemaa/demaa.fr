"use client";

import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import {
  CART_UPDATED_EVENT,
  openServiceCartModal,
  readServiceCartSlugs,
  writeServiceCartSlugs,
} from "@/lib/service-cart";
import { getPurchasableServiceConfig } from "@/lib/service-purchase";

export default function ServicePurchaseCta({
  serviceSlug,
  serviceName,
  defaultLabel = "Ajouter au panier",
  selectedLabel = "Ajouté au panier",
  showHelperText = true,
  fullWidth = true,
  buttonClassName = "",
  containerClassName = "mt-5",
}: {
  serviceSlug: string;
  serviceName: string;
  defaultLabel?: string;
  selectedLabel?: string;
  showHelperText?: boolean;
  fullWidth?: boolean;
  buttonClassName?: string;
  containerClassName?: string;
}) {
  const purchaseConfig = getPurchasableServiceConfig(serviceSlug);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (!purchaseConfig) return;

    const syncSelection = () => {
      setIsSelected(readServiceCartSlugs().includes(serviceSlug));
    };

    syncSelection();
    window.addEventListener("storage", syncSelection);
    window.addEventListener(CART_UPDATED_EVENT, syncSelection);

    return () => {
      window.removeEventListener("storage", syncSelection);
      window.removeEventListener(CART_UPDATED_EVENT, syncSelection);
    };
  }, [purchaseConfig, serviceSlug]);

  if (!purchaseConfig) return null;

  function toggleSelection() {
    const current = readServiceCartSlugs();

    if (current.includes(serviceSlug)) {
      writeServiceCartSlugs(current.filter((slug) => slug !== serviceSlug));
      return;
    }

    writeServiceCartSlugs([...current, serviceSlug]);
    openServiceCartModal();
  }

  return (
    <div className={containerClassName}>
      <button
        type="button"
        onClick={toggleSelection}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
          fullWidth ? "w-full" : ""
        } ${
          isSelected
            ? "bg-dema-sage text-dema-forest hover:bg-dema-sage/85"
            : "bg-dema-forest text-dema-paper hover:bg-brand-blue"
        } ${buttonClassName}`}
        aria-pressed={isSelected}
      >
        {isSelected ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
        )}
        {isSelected ? selectedLabel : defaultLabel}
      </button>
      {isSelected && showHelperText ? (
        <p className="mt-2 text-xs leading-relaxed text-dema-muted">
          {serviceName} est prêt dans votre panier.
        </p>
      ) : null}
    </div>
  );
}
