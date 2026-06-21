"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, LocateFixed, MapPin, X } from "lucide-react";
import franceDepartments from "../../public/maps/france-departments.json";
import type { AccountingFirm } from "@/lib/accounting-directory";

type AccountingDirectoryMapProps = {
  firms: AccountingFirm[];
  activeCity?: string;
  highlightedFirmSlug?: string;
  onCitySelect: (city?: string) => void;
  onFirmPreview: (firmSlug?: string) => void;
  onOpenProfile: (firm: AccountingFirm) => void;
  onAfterCitySelect?: () => void;
};

type CityPosition = { x: number; y: number };
type CityCoordinates = { lat: number; lng: number };
type CityCluster = {
  city: string;
  firms: AccountingFirm[];
  position: CityPosition;
};

type GeoJsonPosition = [number, number];
type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: GeoJsonPosition[][] | GeoJsonPosition[][][];
};
type GeoJsonFeature = {
  type: "Feature";
  properties: { code?: string; nom?: string };
  geometry: GeoJsonGeometry | null;
};
type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const MAX_VISIBLE_CLUSTERS = 28;
const MAP_VIEWBOX = { width: 360, height: 460 };
const MAP_PADDING = 18;

const knownCityCoordinates: Record<string, CityCoordinates> = {
  Angers: { lat: 47.4784, lng: -0.5632 },
  Annecy: { lat: 45.8992, lng: 6.1294 },
  Bordeaux: { lat: 44.8378, lng: -0.5792 },
  Brest: { lat: 48.3904, lng: -4.4861 },
  Caen: { lat: 49.1829, lng: -0.3707 },
  Dijon: { lat: 47.322, lng: 5.0415 },
  Grenoble: { lat: 45.1885, lng: 5.7245 },
  Lille: { lat: 50.6292, lng: 3.0573 },
  Limoges: { lat: 45.8336, lng: 1.2611 },
  Lyon: { lat: 45.764, lng: 4.8357 },
  Marseille: { lat: 43.2965, lng: 5.3698 },
  Montpellier: { lat: 43.6119, lng: 3.8772 },
  Nantes: { lat: 47.2184, lng: -1.5536 },
  Nice: { lat: 43.7102, lng: 7.262 },
  Orléans: { lat: 47.9029, lng: 1.9093 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Pau: { lat: 43.2951, lng: -0.3708 },
  Poitiers: { lat: 46.5802, lng: 0.3404 },
  Reims: { lat: 49.2583, lng: 4.0317 },
  Rennes: { lat: 48.1173, lng: -1.6778 },
  Rouen: { lat: 49.4431, lng: 1.0993 },
  Strasbourg: { lat: 48.5734, lng: 7.7521 },
  Toulon: { lat: 43.1242, lng: 5.928 },
  Toulouse: { lat: 43.6047, lng: 1.4442 },
  Tours: { lat: 47.3941, lng: 0.6848 },
};

const metropolitanFeatures = (
  (franceDepartments as unknown as GeoJsonFeatureCollection).features ?? []
).filter(isMetropolitanFeature);
const mapProjection = createMapProjection(metropolitanFeatures);
const departmentPaths = metropolitanFeatures
  .map((feature) => ({
    code: feature.properties.code ?? "",
    name: feature.properties.nom ?? "",
    path: geometryToPath(feature.geometry, mapProjection),
  }))
  .filter((department) => department.path);

export default function AccountingDirectoryMap({
  firms,
  activeCity,
  highlightedFirmSlug,
  onCitySelect,
  onFirmPreview,
  onOpenProfile,
  onAfterCitySelect,
}: AccountingDirectoryMapProps) {
  const [previewCity, setPreviewCity] = useState<string | undefined>(activeCity);
  const clusters = useMemo(() => buildCityClusters(firms), [firms]);
  const highlightedCity = useMemo(() => {
    if (!highlightedFirmSlug) return undefined;
    return firms.find((firm) => firm.slug === highlightedFirmSlug)?.city;
  }, [firms, highlightedFirmSlug]);

  const previewCluster =
    clusters.find((cluster) => cluster.city === previewCity) ??
    clusters.find((cluster) => cluster.city === highlightedCity) ??
    clusters.find((cluster) => cluster.city === activeCity);

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper shadow-[0_18px_45px_-36px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between gap-3 border-b border-dema-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-blue">Carte des cabinets</p>
            <p className="mt-0.5 text-xs text-dema-muted">
              {clusters.length} ville{clusters.length > 1 ? "s" : ""} dans les résultats
            </p>
          </div>
          {activeCity ? (
            <button
              type="button"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dema-line bg-dema-paper px-3 text-xs font-medium text-brand-blue transition hover:border-dema-forest/30 hover:text-dema-forest"
              onClick={() => onCitySelect(undefined)}
            >
              <X className="h-3.5 w-3.5" />
              Ville
            </button>
          ) : (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dema-line bg-dema-cream px-3 text-xs font-medium text-dema-muted">
              <LocateFixed className="h-3.5 w-3.5" />
              France
            </span>
          )}
        </div>

        <div
          className="relative min-h-[430px] overflow-hidden bg-dema-cream/75 lg:min-h-[520px]"
          onMouseLeave={() => {
            setPreviewCity(activeCity);
            onFirmPreview(undefined);
          }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
            role="img"
            aria-label="Carte de France métropolitaine"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="transparent" />
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
            <path
              d={departmentPaths.map((department) => department.path).join(" ")}
              fill="none"
              stroke="rgba(35,58,48,0.24)"
              strokeWidth="1.3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {clusters.map((cluster, index) => {
            const isActive = cluster.city === activeCity || cluster.city === highlightedCity;
            const firstFirm = cluster.firms[0];

            return (
              <button
                key={cluster.city}
                type="button"
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-[0_12px_26px_-18px_rgba(0,0,0,0.5)] transition hover:z-20 hover:-translate-y-[55%] hover:scale-105 ${index >= 18 ? "hidden sm:flex" : "flex"} ${
                  isActive
                    ? "border-dema-forest bg-dema-forest text-dema-paper"
                    : "border-dema-line bg-dema-paper/95 text-brand-blue hover:border-dema-forest/30"
                }`}
                style={{ left: `${cluster.position.x}%`, top: `${cluster.position.y}%` }}
                aria-label={`Filtrer sur ${cluster.city}, ${cluster.firms.length} cabinets`}
                onClick={() => {
                  onCitySelect(cluster.city);
                  onAfterCitySelect?.();
                }}
                onMouseEnter={() => {
                  setPreviewCity(cluster.city);
                  onFirmPreview(firstFirm?.slug);
                }}
                onFocus={() => {
                  setPreviewCity(cluster.city);
                  onFirmPreview(firstFirm?.slug);
                }}
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>{cluster.firms.length}</span>
              </button>
            );
          })}

          {previewCluster ? (
            <button
              type="button"
              className="absolute z-30 w-[min(260px,calc(100%-2rem))] rounded-[1rem] border border-dema-line bg-dema-paper p-3 text-left shadow-[0_22px_55px_-34px_rgba(0,0,0,0.45)] transition hover:border-dema-forest/20"
              style={getPreviewStyle(previewCluster.position)}
              onClick={() => onOpenProfile(previewCluster.firms[0])}
              onMouseEnter={() => onFirmPreview(previewCluster.firms[0]?.slug)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] border border-dema-line bg-dema-cream text-sm font-semibold text-dema-forest">
                  {previewCluster.firms[0].name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-blue">
                    {previewCluster.firms[0].name}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-dema-muted">
                    <MapPin className="h-3 w-3" />
                    {previewCluster.city} · {previewCluster.firms.length} cabinet
                    {previewCluster.firms.length > 1 ? "s" : ""}
                  </p>
                  {previewCluster.firms[0].isOecVerified ? (
                    <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-dema-sage/85 px-2 py-0.5 text-[11px] font-medium text-dema-forest">
                      <CheckCircle2 className="h-3 w-3" />
                      Vérifié OEC
                    </p>
                  ) : null}
                </div>
              </div>
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function buildCityClusters(firms: AccountingFirm[]): CityCluster[] {
  const byCity = new Map<string, AccountingFirm[]>();

  firms.forEach((firm) => {
    if (!firm.city) return;
    byCity.set(firm.city, [...(byCity.get(firm.city) ?? []), firm]);
  });

  return [...byCity.entries()]
    .map(([city, cityFirms]) => ({
      city,
      firms: cityFirms,
      position: getCityPosition(city),
    }))
    .filter((cluster): cluster is CityCluster => Boolean(cluster.position))
    .sort((a, b) => b.firms.length - a.firms.length || a.city.localeCompare(b.city, "fr"))
    .slice(0, MAX_VISIBLE_CLUSTERS);
}

function getCityPosition(city: string): CityPosition | null {
  const coordinates = knownCityCoordinates[city];
  if (!coordinates || !isMetropolitanCoordinates(coordinates)) return null;
  const projected = mapProjection.project(coordinates);

  return {
    x: clamp((projected.x / MAP_VIEWBOX.width) * 100, 5, 95),
    y: clamp((projected.y / MAP_VIEWBOX.height) * 100, 5, 95),
  };
}

function isMetropolitanFeature(feature: GeoJsonFeature) {
  const code = feature.properties.code ?? "";
  if (code === "2A" || code === "2B") return true;
  const numericCode = Number(code);
  return Number.isInteger(numericCode) && numericCode >= 1 && numericCode <= 95;
}

function isMetropolitanCoordinates(coordinates: CityCoordinates) {
  return coordinates.lng >= -6 && coordinates.lng <= 10 && coordinates.lat >= 41 && coordinates.lat <= 52;
}

function createMapProjection(features: GeoJsonFeature[]) {
  const bounds = getFeatureBounds(features);
  const availableWidth = MAP_VIEWBOX.width - MAP_PADDING * 2;
  const availableHeight = MAP_VIEWBOX.height - MAP_PADDING * 2;
  const scale = Math.min(
    availableWidth / (bounds.maxMercatorX - bounds.minMercatorX),
    availableHeight / (bounds.maxMercatorY - bounds.minMercatorY)
  );
  const mapWidth = (bounds.maxMercatorX - bounds.minMercatorX) * scale;
  const mapHeight = (bounds.maxMercatorY - bounds.minMercatorY) * scale;
  const offsetX = (MAP_VIEWBOX.width - mapWidth) / 2;
  const offsetY = (MAP_VIEWBOX.height - mapHeight) / 2;

  return {
    project(coordinates: CityCoordinates) {
      const mercatorX = lngToMercatorX(coordinates.lng);
      const mercatorY = latToMercatorY(coordinates.lat);
      return {
        x: offsetX + (mercatorX - bounds.minMercatorX) * scale,
        y: offsetY + (bounds.maxMercatorY - mercatorY) * scale,
      };
    },
  };
}

function getFeatureBounds(features: GeoJsonFeature[]) {
  const bounds = {
    minMercatorX: Infinity,
    maxMercatorX: -Infinity,
    minMercatorY: Infinity,
    maxMercatorY: -Infinity,
  };

  features.forEach((feature) => {
    eachGeometryPosition(feature.geometry, ([lng, lat]) => {
      const mercatorX = lngToMercatorX(lng);
      const mercatorY = latToMercatorY(lat);
      bounds.minMercatorX = Math.min(bounds.minMercatorX, mercatorX);
      bounds.maxMercatorX = Math.max(bounds.maxMercatorX, mercatorX);
      bounds.minMercatorY = Math.min(bounds.minMercatorY, mercatorY);
      bounds.maxMercatorY = Math.max(bounds.maxMercatorY, mercatorY);
    });
  });

  return bounds;
}

function geometryToPath(
  geometry: GeoJsonGeometry | null,
  projection: ReturnType<typeof createMapProjection>
) {
  if (!geometry) return "";

  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates as GeoJsonPosition[][]]
      : (geometry.coordinates as GeoJsonPosition[][][]);

  return polygons
    .map((polygon) =>
      polygon
        .map((ring) =>
          ring
            .map(([lng, lat], index) => {
              const point = projection.project({ lat, lng });
              return `${index === 0 ? "M" : "L"}${formatPathNumber(point.x)} ${formatPathNumber(point.y)}`;
            })
            .join(" ")
        )
        .join(" Z ")
    )
    .join(" Z ");
}

function eachGeometryPosition(
  geometry: GeoJsonGeometry | null,
  callback: (position: GeoJsonPosition) => void
) {
  if (!geometry) return;
  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates as GeoJsonPosition[][]]
      : (geometry.coordinates as GeoJsonPosition[][][]);

  polygons.forEach((polygon) => {
    polygon.forEach((ring) => {
      ring.forEach(callback);
    });
  });
}

function latToMercatorY(lat: number) {
  const radians = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
}

function lngToMercatorX(lng: number) {
  return (lng * Math.PI) / 180;
}

function formatPathNumber(value: number) {
  return Number(value.toFixed(2));
}

function getPreviewStyle(position: CityPosition) {
  const left = clamp(position.x + 5, 6, 54);
  const top = clamp(position.y - 8, 6, 72);
  return { left: `${left}%`, top: `${top}%` };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
