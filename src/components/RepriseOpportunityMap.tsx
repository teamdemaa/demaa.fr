"use client";

import { useMemo, useState } from "react";
import { Building2, LocateFixed, MapPin, X } from "lucide-react";
import franceDepartments from "../../public/maps/france-departments.json";
import type { RepriseOpportunity } from "@/lib/reprise-opportunities";

type MapProps = {
  opportunities: readonly RepriseOpportunity[];
  activeLocation?: string;
  highlightedOpportunityId?: string;
  onLocationSelect: (location?: string) => void;
  onOpportunityPreview: (id?: string) => void;
  onOpenOpportunity: (opportunity: RepriseOpportunity) => void;
  onAfterLocationSelect?: () => void;
};

type Position = { x: number; y: number };
type Coordinates = { lat: number; lng: number };
type Cluster = {
  label: string;
  opportunities: RepriseOpportunity[];
  position: Position;
};
type GeoJsonPosition = [number, number];
type GeoJsonGeometry = { type: "Polygon" | "MultiPolygon"; coordinates: GeoJsonPosition[][] | GeoJsonPosition[][][] };
type GeoJsonFeature = { type: "Feature"; properties: { code?: string; nom?: string }; geometry: GeoJsonGeometry | null };
type GeoJsonFeatureCollection = { type: "FeatureCollection"; features: GeoJsonFeature[] };

const MAP_VIEWBOX = { width: 360, height: 460 };
const MAP_PADDING = 18;
const metropolitanFeatures = ((franceDepartments as unknown as GeoJsonFeatureCollection).features ?? []).filter(isMetropolitanFeature);
const mapProjection = createMapProjection(metropolitanFeatures);
const departmentPaths = metropolitanFeatures
  .map((feature) => ({
    code: feature.properties.code ?? "",
    name: feature.properties.nom ?? "",
    path: geometryToPath(feature.geometry, mapProjection),
  }))
  .filter((department) => department.path);

export default function RepriseOpportunityMap({
  opportunities,
  activeLocation,
  highlightedOpportunityId,
  onLocationSelect,
  onOpportunityPreview,
  onOpenOpportunity,
  onAfterLocationSelect,
}: MapProps) {
  const [previewLocation, setPreviewLocation] = useState<string | undefined>(activeLocation);
  const clusters = useMemo(() => buildClusters(opportunities), [opportunities]);
  const highlightedLocation = useMemo(() => {
    if (!highlightedOpportunityId) return undefined;
    return opportunities.find((opportunity) => opportunity.id === highlightedOpportunityId)?.mapPosition?.label;
  }, [highlightedOpportunityId, opportunities]);
  const previewCluster = clusters.find((cluster) => cluster.label === previewLocation)
    ?? clusters.find((cluster) => cluster.label === highlightedLocation)
    ?? clusters.find((cluster) => cluster.label === activeLocation);

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper">
        <div className="flex items-center justify-between gap-3 border-b border-dema-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-blue">Carte des opportunités</p>
            <p className="mt-0.5 text-xs text-dema-muted">{opportunities.filter((item) => item.mapPosition).length} entreprise{opportunities.length > 1 ? "s" : ""} localisée{opportunities.length > 1 ? "s" : ""}</p>
          </div>
          {activeLocation ? (
            <button type="button" className="inline-flex h-8 items-center gap-1.5 rounded-full border border-dema-line px-3 text-xs font-medium transition hover:border-dema-forest/30" onClick={() => onLocationSelect(undefined)}>
              <X className="h-3.5 w-3.5" aria-hidden="true" />Zone
            </button>
          ) : (
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-dema-cream px-3 text-xs text-dema-muted"><LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />France</span>
          )}
        </div>
        <div className="relative min-h-[430px] overflow-hidden bg-dema-cream/75 lg:min-h-[520px]" onMouseLeave={() => { setPreviewLocation(activeLocation); onOpportunityPreview(undefined); }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`} role="img" aria-label="Carte de France métropolitaine avec les opportunités localisées" preserveAspectRatio="xMidYMid meet">
            <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="transparent" />
            <g>{departmentPaths.map((department) => <path key={department.code} d={department.path} fill="rgba(255,255,255,0.9)" stroke="rgba(35,58,48,0.16)" strokeWidth="0.7" vectorEffect="non-scaling-stroke"><title>{department.name}</title></path>)}</g>
            <path d={departmentPaths.map((department) => department.path).join(" ")} fill="none" stroke="rgba(35,58,48,0.24)" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
          </svg>
          {clusters.map((cluster) => {
            const isActive = cluster.label === activeLocation || cluster.label === highlightedLocation;
            const firstOpportunity = cluster.opportunities[0];
            return (
              <button
                key={cluster.label}
                type="button"
                className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:z-20 hover:scale-105 ${isActive ? "border-dema-forest bg-dema-forest text-dema-paper" : "border-dema-line bg-dema-paper/95 text-brand-blue hover:border-dema-forest/30"}`}
                style={{ left: `${cluster.position.x}%`, top: `${cluster.position.y}%` }}
                aria-label={`Filtrer sur ${cluster.label}, ${cluster.opportunities.length} opportunité${cluster.opportunities.length > 1 ? "s" : ""}`}
                onClick={() => { onLocationSelect(cluster.label); onAfterLocationSelect?.(); }}
                onMouseEnter={() => { setPreviewLocation(cluster.label); onOpportunityPreview(firstOpportunity?.id); }}
                onFocus={() => { setPreviewLocation(cluster.label); onOpportunityPreview(firstOpportunity?.id); }}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /><span>{cluster.opportunities.length}</span>
              </button>
            );
          })}
          {previewCluster ? (
            <button type="button" className="absolute z-30 w-[min(260px,calc(100%-2rem))] rounded-2xl border border-dema-line bg-dema-paper p-3 text-left transition hover:border-dema-forest/25" style={getPreviewStyle(previewCluster.position)} onClick={() => onOpenOpportunity(previewCluster.opportunities[0])}>
              <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dema-sage text-dema-forest"><Building2 className="h-4 w-4" aria-hidden="true" /></span><span className="min-w-0"><span className="block text-sm font-medium leading-5">{previewCluster.opportunities[0].activity}</span><span className="mt-1 block text-xs text-dema-muted">{previewCluster.label} · {previewCluster.opportunities.length} opportunité{previewCluster.opportunities.length > 1 ? "s" : ""}</span></span></div>
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function buildClusters(opportunities: readonly RepriseOpportunity[]): Cluster[] {
  const grouped = new Map<string, RepriseOpportunity[]>();
  for (const opportunity of opportunities) {
    const label = opportunity.mapPosition?.label;
    if (!label) continue;
    grouped.set(label, [...(grouped.get(label) ?? []), opportunity]);
  }
  return [...grouped.entries()].map(([label, clusterOpportunities]) => {
    const mapPosition = clusterOpportunities[0].mapPosition!;
    const projected = mapProjection.project({ lat: mapPosition.latitude, lng: mapPosition.longitude });
    return {
      label,
      opportunities: clusterOpportunities,
      position: {
        x: formatPositionPercent(clamp((projected.x / MAP_VIEWBOX.width) * 100, 5, 95)),
        y: formatPositionPercent(clamp((projected.y / MAP_VIEWBOX.height) * 100, 5, 95)),
      },
    };
  }).toSorted((a, b) => b.opportunities.length - a.opportunities.length || a.label.localeCompare(b.label, "fr"));
}

function isMetropolitanFeature(feature: GeoJsonFeature) {
  const code = feature.properties.code ?? "";
  if (code === "2A" || code === "2B") return true;
  const numericCode = Number(code);
  return Number.isInteger(numericCode) && numericCode >= 1 && numericCode <= 95;
}

function createMapProjection(features: GeoJsonFeature[]) {
  const bounds = getFeatureBounds(features);
  const scale = Math.min((MAP_VIEWBOX.width - MAP_PADDING * 2) / (bounds.maxMercatorX - bounds.minMercatorX), (MAP_VIEWBOX.height - MAP_PADDING * 2) / (bounds.maxMercatorY - bounds.minMercatorY));
  const mapWidth = (bounds.maxMercatorX - bounds.minMercatorX) * scale;
  const mapHeight = (bounds.maxMercatorY - bounds.minMercatorY) * scale;
  const offsetX = (MAP_VIEWBOX.width - mapWidth) / 2;
  const offsetY = (MAP_VIEWBOX.height - mapHeight) / 2;
  return { project(coordinates: Coordinates) { const mercatorX = lngToMercatorX(coordinates.lng); const mercatorY = latToMercatorY(coordinates.lat); return { x: offsetX + (mercatorX - bounds.minMercatorX) * scale, y: offsetY + (bounds.maxMercatorY - mercatorY) * scale }; } };
}

function getFeatureBounds(features: GeoJsonFeature[]) {
  const bounds = { minMercatorX: Infinity, maxMercatorX: -Infinity, minMercatorY: Infinity, maxMercatorY: -Infinity };
  for (const feature of features) eachGeometryPosition(feature.geometry, ([lng, lat]) => { const x = lngToMercatorX(lng); const y = latToMercatorY(lat); bounds.minMercatorX = Math.min(bounds.minMercatorX, x); bounds.maxMercatorX = Math.max(bounds.maxMercatorX, x); bounds.minMercatorY = Math.min(bounds.minMercatorY, y); bounds.maxMercatorY = Math.max(bounds.maxMercatorY, y); });
  return bounds;
}

function geometryToPath(geometry: GeoJsonGeometry | null, projection: ReturnType<typeof createMapProjection>) {
  if (!geometry) return "";
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates as GeoJsonPosition[][]] : geometry.coordinates as GeoJsonPosition[][][];
  return polygons.map((polygon) => polygon.map((ring) => ring.map(([lng, lat], index) => { const point = projection.project({ lat, lng }); return `${index === 0 ? "M" : "L"}${formatPathNumber(point.x)} ${formatPathNumber(point.y)}`; }).join(" ")).join(" Z ")).join(" Z ");
}

function eachGeometryPosition(geometry: GeoJsonGeometry | null, callback: (position: GeoJsonPosition) => void) {
  if (!geometry) return;
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates as GeoJsonPosition[][]] : geometry.coordinates as GeoJsonPosition[][][];
  for (const polygon of polygons) for (const ring of polygon) for (const position of ring) callback(position);
}

function latToMercatorY(lat: number) { const radians = (lat * Math.PI) / 180; return Math.log(Math.tan(Math.PI / 4 + radians / 2)); }
function lngToMercatorX(lng: number) { return (lng * Math.PI) / 180; }
function formatPathNumber(value: number) { return Number(value.toFixed(2)); }
function formatPositionPercent(value: number) { return Number(value.toFixed(4)); }
function getPreviewStyle(position: Position) { return { left: `${clamp(position.x + 5, 6, 54)}%`, top: `${clamp(position.y - 8, 6, 72)}%` }; }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
