import Link from "next/link";
import { Check, CheckCircle2, MapPin } from "lucide-react";
import AccountingAppointmentDialog from "@/components/AccountingAppointmentDialog";
import type { AccountingFirm } from "@/lib/accounting-directory";

type AccountingFirmCardProps = {
  firm: AccountingFirm;
  isSelected?: boolean;
  isSelectionDisabled?: boolean;
  isHighlighted?: boolean;
  onToggleSelection?: (firm: AccountingFirm) => void;
  onOpenProfile?: (firm: AccountingFirm) => void;
};

export default function AccountingFirmCard({
  firm,
  isSelected = false,
  isSelectionDisabled = false,
  isHighlighted = false,
  onToggleSelection,
  onOpenProfile,
}: AccountingFirmCardProps) {
  const tags = [...firm.services.slice(0, 3), ...firm.industries.slice(0, 1)].slice(
    0,
    4
  );
  const profileUrl = `/annuaire-experts-comptables/cabinets/${firm.slug}`;

  return (
    <article
      className={`group relative flex h-full flex-col rounded-[1.2rem] border p-5 transition ${
        isHighlighted
          ? "border-dema-forest/40 bg-dema-paper shadow-[0_20px_48px_-34px_rgba(23,35,29,0.35)]"
          : "border-dema-line bg-dema-paper shadow-[0_18px_38px_-32px_rgba(23,35,29,0.28)] hover:border-dema-forest/22"
      }`}
    >
      {onOpenProfile ? (
        <button
          type="button"
          className="absolute inset-0 z-0 rounded-[1.2rem]"
          aria-label={`Voir la fiche de ${firm.name}`}
          onClick={() => onOpenProfile(firm)}
        />
      ) : (
        <Link
          href={profileUrl}
          className="absolute inset-0 z-0 rounded-[1.2rem]"
          aria-label={`Voir la fiche de ${firm.name}`}
        />
      )}

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-dema-line bg-dema-cream text-lg font-semibold text-dema-forest">
          {firm.name.slice(0, 1).toUpperCase()}
        </div>

        <div className="relative z-10 min-w-0 flex-1">
          {onOpenProfile ? (
            <button
              type="button"
              className="text-left text-lg font-semibold tracking-tight text-brand-blue transition group-hover:text-dema-forest"
              onClick={() => onOpenProfile(firm)}
            >
              {firm.name}
            </button>
          ) : (
            <Link
              href={profileUrl}
              className="text-lg font-semibold tracking-tight text-brand-blue transition group-hover:text-dema-forest"
            >
              {firm.name}
            </Link>
          )}
          <p className="mt-1 flex items-center gap-1.5 text-sm text-dema-muted">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">
              {firm.city}
              {firm.regions[0] ? `, ${firm.regions[0]}` : ""}
            </span>
          </p>
        </div>

        {firm.isOecVerified ? (
          <span className="relative z-10 inline-flex shrink-0 items-center gap-1 rounded-full bg-dema-sage/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-dema-forest">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Vérifié
          </span>
        ) : null}
      </div>

      <p className="relative z-10 mt-4 line-clamp-3 text-sm leading-relaxed text-dema-muted">
        {firm.description}
      </p>

      {tags.length ? (
        <div className="relative z-10 mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-dema-line bg-dema-cream/75 px-2.5 py-1 text-xs font-medium text-brand-blue/72"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="relative z-10 mt-auto flex justify-start pt-5">
        {onToggleSelection ? (
          <button
            type="button"
            disabled={isSelectionDisabled && !isSelected}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSelection(firm);
            }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isSelected
                ? "bg-dema-forest text-dema-paper"
                : "border border-dema-line bg-dema-paper text-brand-blue hover:border-dema-forest/30 hover:text-dema-forest disabled:opacity-50"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-4 w-4 items-center justify-center rounded border ${
                isSelected
                  ? "border-dema-paper bg-dema-paper text-dema-forest"
                  : "border-current"
              }`}
            >
              {isSelected ? <Check className="h-3 w-3" /> : null}
            </span>
            {isSelected ? "Sélectionné" : "Sélectionner"}
          </button>
        ) : (
          <AccountingAppointmentDialog
            firm={firm}
            buttonLabel="Prendre RDV"
            buttonClassName="inline-flex items-center justify-center rounded-full bg-dema-forest px-4 py-2.5 text-sm font-semibold text-dema-paper transition hover:bg-brand-blue"
          />
        )}
      </div>
    </article>
  );
}
