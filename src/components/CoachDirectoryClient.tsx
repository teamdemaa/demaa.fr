"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Compass, Map as MapIcon, MapPin, PanelRightClose, PanelRightOpen, Search, SlidersHorizontal, X } from "lucide-react";
import CoachContactForm from "@/components/CoachContactForm";
import CoachDirectoryMap from "@/components/CoachDirectoryMap";
import DirectoryDetailDialogShell from "@/components/DirectoryDetailDialogShell";
import type { CoachProfile } from "@/lib/coach-directory";
import { matchesSearchQuery } from "@/lib/search";

const ALL = "Tous";

export default function CoachDirectoryClient({ coaches }: { coaches: readonly CoachProfile[] }) {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState(ALL);
  const [selectedCoach, setSelectedCoach] = useState<CoachProfile | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const specialties = [...new Set(coaches.flatMap((coach) => coach.specialties))];
  const matchingCoaches = useMemo(() => coaches.filter((coach) =>
    (specialty === ALL || coach.specialties.includes(specialty)) &&
    matchesSearchQuery(query, [coach.name, coach.location, coach.summary, ...coach.specialties]),
  ), [coaches, query, specialty]);
  const results = useMemo(() => matchingCoaches.filter((coach) =>
    !selectedLocation || coach.location.includes(selectedLocation),
  ), [matchingCoaches, selectedLocation]);

  function openCoach(coach: CoachProfile) {
    setSelectedCoach(coach);
    setShowContactForm(false);
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="demaa-search-shell mx-auto max-w-4xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-dema-forest/45" aria-hidden="true" />
            <input
              aria-label="Rechercher un coach"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un coach, un besoin, une ville…"
              className="demaa-search-control"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="absolute right-12 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-dema-muted hover:text-dema-forest" aria-label="Effacer la recherche">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
            <button type="button" onClick={() => setShowFilters((current) => !current)} aria-expanded={showFilters} aria-controls="coach-specialty-filters" className={`absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition ${specialty !== ALL ? "bg-dema-forest text-white" : "bg-dema-sage text-dema-forest"}`} aria-label="Afficher les filtres par spécialité">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div id="coach-specialty-filters" className={showFilters ? "mt-5 flex flex-wrap justify-center gap-2" : "hidden"} role="group" aria-label="Filtrer les coachs par spécialité">
            {[ALL, ...specialties].map((item) => (
              <button key={item} type="button" aria-pressed={specialty === item} onClick={() => setSpecialty(item)} className={`demaa-chip ${specialty === item ? "demaa-chip-active" : ""}`}>{item}</button>
            ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-dema-muted" aria-live="polite">
            {results.length} profil{results.length > 1 ? "s" : ""} public{results.length > 1 ? "s" : ""}{selectedLocation ? ` · ${selectedLocation}` : ""}
          </p>
          <div className="flex items-center gap-2">
            {selectedLocation ? <button type="button" onClick={() => setSelectedLocation(null)} className="text-xs text-dema-forest underline underline-offset-4">Effacer la ville</button> : null}
            <button type="button" onClick={() => setShowMap((current) => !current)} className="hidden min-h-10 items-center gap-2 rounded-full border border-dema-line bg-white px-4 text-sm text-brand-blue hover:border-dema-forest/30 lg:inline-flex">
              {showMap ? <PanelRightClose className="h-4 w-4" aria-hidden="true" /> : <PanelRightOpen className="h-4 w-4" aria-hidden="true" />}
              {showMap ? "Masquer la carte" : "Afficher la carte"}
            </button>
            <button type="button" onClick={() => setShowMobileMap((current) => !current)} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dema-line bg-white px-4 text-sm text-brand-blue hover:border-dema-forest/30 lg:hidden" aria-expanded={showMobileMap}>
              <MapIcon className="h-4 w-4" aria-hidden="true" />Carte
            </button>
          </div>
        </div>
        {showMobileMap ? (
          <div className="mt-5 lg:hidden"><CoachDirectoryMap coaches={matchingCoaches} selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} /></div>
        ) : null}
        <div className={`mt-5 ${showMap ? "lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-5" : ""}`}>
        {results.length ? (
          <div className={`grid gap-4 md:grid-cols-2 ${showMap ? "" : "lg:grid-cols-3"}`}>
            {results.map((coach) => (
              <article key={coach.slug} className="min-w-0">
                <button
                  type="button"
                  onClick={() => openCoach(coach)}
                  className="group flex h-full min-h-72 w-full flex-col rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 text-left shadow-[0_8px_24px_rgba(23,35,29,0.025)] transition hover:-translate-y-0.5 hover:border-dema-forest/30 hover:shadow-[0_12px_30px_rgba(23,35,29,0.065)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
                  aria-label={`Voir le profil de ${coach.name}`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dema-sage text-dema-forest">
                    <Compass className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <h2 className="mt-5 text-xl font-medium tracking-tight text-brand-blue">{coach.name}</h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-dema-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{coach.location}</p>
                  <p className="mt-4 text-sm leading-6 text-dema-muted">{coach.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-medium text-dema-forest">
                    Voir le profil <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-[1.25rem] border border-dema-line bg-dema-paper p-8 text-center text-dema-muted">Aucun profil trouvé. Essayez un autre besoin ou une autre ville.</p>
        )}
        {showMap ? <div className="hidden lg:block"><CoachDirectoryMap coaches={matchingCoaches} selectedLocation={selectedLocation} onLocationSelect={setSelectedLocation} /></div> : null}
        </div>

        <p className="mt-8 max-w-4xl text-xs leading-6 text-dema-muted">
          Profils repérés à partir de sites professionnels publics. Demaa n’a pas encore vérifié leurs disponibilités, leurs tarifs ni conclu de partenariat avec eux. Les avis en ligne ne constituent pas une validation de leur prestation.
        </p>
      </div>

      {selectedCoach ? (
        <DirectoryDetailDialogShell
          ariaLabel={`Profil de ${selectedCoach.name}`}
          onClose={() => setSelectedCoach(null)}
          maxWidthClassName="max-w-2xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Profil public · Coach de dirigeant</p>
          <h2 className="mt-3 font-serif text-3xl text-brand-blue sm:text-4xl">{selectedCoach.name}</h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-dema-muted"><MapPin className="h-4 w-4" aria-hidden="true" />{selectedCoach.location} · {selectedCoach.format}</p>
          <p className="mt-6 text-base leading-7 text-dema-muted">{selectedCoach.summary}</p>
          <h3 className="mt-7 text-sm font-semibold text-brand-blue">Pour quel besoin ?</h3>
          <p className="mt-2 text-sm leading-7 text-dema-muted">{selectedCoach.fit}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {selectedCoach.specialties.map((item) => <span key={item} className="rounded-full border border-dema-line bg-dema-sage/40 px-3 py-1.5 text-xs text-dema-forest">{item}</span>)}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-dema-line pt-6">
            <a href={selectedCoach.website} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-brand-blue">
              Voir le site du coach <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <button type="button" onClick={() => setShowContactForm((current) => !current)} aria-expanded={showContactForm} className="inline-flex min-h-11 items-center rounded-full border border-dema-forest px-5 text-sm font-medium text-dema-forest transition hover:bg-dema-sage/50">
              {showContactForm ? "Masquer le formulaire" : "Demander un contact"}
            </button>
            <button type="button" onClick={() => setSelectedCoach(null)} className="inline-flex min-h-11 items-center gap-2 text-sm text-dema-muted hover:text-dema-forest"><X className="h-4 w-4" aria-hidden="true" />Fermer</button>
          </div>
          {showContactForm ? <CoachContactForm coach={selectedCoach} /> : null}
        </DirectoryDetailDialogShell>
      ) : null}
    </>
  );
}
