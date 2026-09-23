"use client";

import { MapPin } from "lucide-react";
import { departmentPaths, getCityPosition, MAP_VIEWBOX } from "@/components/AccountingDirectoryMap";
import type { CoachProfile } from "@/lib/coach-directory";

const locations = ["Paris", "Lyon", "La Réunion"] as const;

export default function CoachDirectoryMap({
  coaches,
  selectedLocation,
  onLocationSelect,
}: {
  coaches: readonly CoachProfile[];
  selectedLocation: string | null;
  onLocationSelect: (location: string | null) => void;
}) {
  const availableLocations = locations.map((location) => ({
    location,
    count: coaches.filter((coach) => coach.location.includes(location)).length,
    position: location === "La Réunion" ? null : getCityPosition(location),
  })).filter(({ count }) => count > 0);

  return (
    <aside className="overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper shadow-[0_18px_45px_-36px_rgba(0,0,0,0.35)] lg:sticky lg:top-28">
      <div className="border-b border-dema-line px-4 py-3">
        <p className="text-sm font-semibold text-brand-blue">Carte des coachs</p>
        <p className="mt-0.5 text-xs text-dema-muted">Localisations déclarées sur les sites publics</p>
      </div>
      <div className="relative h-[360px] bg-dema-cream/75 sm:h-[430px] lg:h-[480px]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          role="img"
          aria-label="Carte de France métropolitaine avec les villes des coachs"
          preserveAspectRatio="xMidYMid meet"
        >
          <g>
            {departmentPaths.map((department) => (
              <path
                key={department.code}
                d={department.path}
                fill="rgba(255,255,255,0.85)"
                stroke="rgba(35,58,48,0.16)"
                strokeWidth="0.7"
                vectorEffect="non-scaling-stroke"
              >
                <title>{department.name}</title>
              </path>
            ))}
          </g>
        </svg>
        {availableLocations.filter(({ position }) => position).map(({ location, count, position }) => (
          <button
            key={location}
            type="button"
            onClick={() => onLocationSelect(selectedLocation === location ? null : location)}
            aria-pressed={selectedLocation === location}
            aria-label={`Filtrer sur ${location}, ${count} coach${count > 1 ? "s" : ""}`}
            className={`absolute z-10 inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition hover:scale-105 ${selectedLocation === location ? "border-dema-forest bg-dema-forest text-white" : "border-dema-line bg-white text-brand-blue hover:border-dema-forest/30"}`}
            style={{ left: `${position?.x}%`, top: `${position?.y}%` }}
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />{count}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-dema-line px-4 py-3">
        {availableLocations.map(({ location, count }) => (
          <button
            key={location}
            type="button"
            onClick={() => onLocationSelect(selectedLocation === location ? null : location)}
            aria-pressed={selectedLocation === location}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${selectedLocation === location ? "border-dema-forest bg-dema-forest text-white" : "border-dema-line bg-white text-dema-muted hover:text-dema-forest"}`}
          >
            {location} · {count}
          </button>
        ))}
      </div>
      {availableLocations.some(({ location }) => location === "La Réunion") ? (
        <p className="px-4 pb-4 text-xs leading-5 text-dema-muted">La Réunion figure dans la liste, hors de cette carte de métropole.</p>
      ) : null}
    </aside>
  );
}
