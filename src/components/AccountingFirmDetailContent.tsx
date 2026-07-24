import type React from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, Globe2, Languages, MapPin } from "lucide-react";
import AccountingAppointmentDialog from "@/components/AccountingAppointmentDialog";
import AccountingFirmCard from "@/components/AccountingFirmCard";
import type { AccountingFirm } from "@/lib/accounting-directory";

type AccountingFirmDetailContentProps = {
  firm: AccountingFirm;
  similarFirms: AccountingFirm[];
  showBackLink?: boolean;
};

export default function AccountingFirmDetailContent({
  firm,
  similarFirms,
  showBackLink = true,
}: AccountingFirmDetailContentProps) {
  const externalUrl = firm.website ?? firm.contactPage;

  return (
    <div className="mx-auto max-w-6xl">
      {showBackLink ? (
        <Link
          href="/annuaire-experts-comptables"
          className="inline-flex items-center gap-2 rounded-full border border-dema-line bg-dema-paper px-3.5 py-2 text-xs font-medium text-brand-blue/70 transition hover:border-dema-forest/25 hover:text-dema-forest"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Retour à l&apos;annuaire
        </Link>
      ) : null}

      <section className={`${showBackLink ? "mt-5" : ""} rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 sm:p-8`}>
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-dema-sage text-xl font-semibold text-dema-forest">
                {firm.name.slice(0, 1).toUpperCase()}
              </span>
              {firm.isOecVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-dema-sage/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-dema-forest">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Vérifié OEC
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-brand-blue md:text-5xl">
              {firm.name}
            </h1>
            <p className="mt-3 flex items-center gap-2 text-sm text-dema-muted">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {firm.city}
              {firm.regions.length ? ` · ${firm.regions.join(", ")}` : ""}
            </p>
            <p className="mt-5 text-base leading-relaxed text-dema-muted md:text-lg">
              {firm.description}
            </p>
          </div>

          <aside className="rounded-[1.15rem] border border-dema-line bg-dema-cream/70 p-5">
            <p className="text-sm font-semibold text-brand-blue">
              Mise en relation
            </p>
            <p className="mt-3 text-sm leading-relaxed text-dema-muted">
              Présentez votre activité, votre contexte et vos disponibilités pour
              être rappelé par le bon cabinet.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <AccountingAppointmentDialog firm={firm} />
              {externalUrl ? (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-5 py-3 text-sm font-semibold text-brand-blue transition hover:border-dema-forest/30 hover:text-dema-forest"
                >
                  Voir le site
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Services</h2>
          <TagList tags={firm.services} />

          <h2 className="mt-8 text-xl font-semibold text-brand-blue">
            Secteurs accompagnés
          </h2>
          <TagList tags={firm.industries} />

          <h2 className="mt-8 text-xl font-semibold text-brand-blue">
            Types de clients
          </h2>
          <TagList tags={firm.clientTypes} />
        </div>

        <div className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">Repères utiles</h2>
          <div className="mt-4 space-y-4">
            <InfoRow
              icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
              label="Taille d'équipe"
              value={firm.teamSize}
            />
            <InfoRow
              icon={<MapPin className="h-4 w-4" aria-hidden="true" />}
              label="Bureaux"
              value={`${firm.officeCount} bureau${firm.officeCount > 1 ? "x" : ""}`}
            />
            <InfoRow
              icon={<Globe2 className="h-4 w-4" aria-hidden="true" />}
              label="Outils"
              value={firm.tools.join(", ")}
            />
            <InfoRow
              icon={<Languages className="h-4 w-4" aria-hidden="true" />}
              label="Langues"
              value={firm.languages.join(", ")}
            />
          </div>
        </div>
      </section>

      {similarFirms.length ? (
        <section className="mt-5 rounded-[1.25rem] border border-dema-line bg-dema-paper p-6">
          <h2 className="text-xl font-semibold text-brand-blue">
            Cabinets similaires
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {similarFirms.map((similarFirm) => (
              <AccountingFirmCard key={similarFirm.id} firm={similarFirm} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return (
      <p className="mt-3 text-sm leading-relaxed text-dema-muted">
        Informations à compléter.
      </p>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-dema-sage/75 px-3 py-1.5 text-xs font-medium text-brand-blue/75"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="rounded-[1rem] border border-dema-line bg-dema-cream/60 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-brand-blue">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-dema-muted">{value}</p>
    </div>
  );
}
