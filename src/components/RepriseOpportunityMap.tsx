"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { Building2, LocateFixed, MapPin } from "lucide-react";
import franceDepartments from "../../public/maps/france-departments.json";
import type { RepriseOpportunity } from "@/lib/reprise-opportunities";

type MapProps = {
  opportunities: readonly RepriseOpportunity[];
  highlightedOpportunityId?: string;
  onOpportunityPreview: (id?: string) => void;
  onOpenOpportunity: (opportunity: RepriseOpportunity) => void;
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
  highlightedOpportunityId,
  onOpportunityPreview,
  onOpenOpportunity,
}: MapProps) {
  const [previewLocation, setPreviewLocation] = useState<string>();
  const clusters = useMemo(() => buildClusters(opportunities), [opportunities]);
  const highlightedLocation = useMemo(() => {
    if (!highlightedOpportunityId) return undefined;
    return opportunities.find((opportunity) => opportunity.id === highlightedOpportunityId)?.mapPosition?.label;
  }, [highlightedOpportunityId, opportunities]);
  const previewCluster = clusters.find((cluster) => cluster.label === previewLocation)
    ?? clusters.find((cluster) => cluster.label === highlightedLocation);

  return (
    <aside className="lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-[1.2rem] border border-dema-line bg-dema-paper">
        <div className="flex items-center justify-between gap-3 border-b border-dema-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-blue">Carte des opportunités</p>
            <p className="mt-0.5 text-xs text-dema-muted">{opportunities.filter((item) => item.mapPosition).length} entreprise{opportunities.length > 1 ? "s" : ""} localisée{opportunities.length > 1 ? "s" : ""}</p>
          </div>
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-dema-cream px-3 text-xs text-dema-muted"><LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />France</span>
        </div>
        <div className="relative min-h-[430px] overflow-hidden bg-dema-cream/75 lg:min-h-[520px]" onMouseLeave={() => { setPreviewLocation(undefined); onOpportunityPreview(undefined); }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`} role="img" aria-label="Carte de France métropolitaine avec les opportunités localisées" preserveAspectRatio="xMidYMid meet">
            <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="transparent" />
            <g>{departmentPaths.map((department) => <path key={department.code} d={department.path} fill="rgba(255,255,255,0.9)" stroke="rgba(35,58,48,0.16)" strokeWidth="0.7" vectorEffect="non-scaling-stroke"><title>{department.name}</title></path>)}</g>
            <path d={departmentPaths.map((department) => department.path).join(" ")} fill="none" stroke="rgba(35,58,48,0.24)" strokeWidth="1.3" vectorEffect="non-scaling-stroke" />
          </svg>
          {clusters.map((cluster) => {
            const isActive = cluster.label === previewLocation || cluster.label === highlightedLocation;
            const firstOpportunity = cluster.opportunities[0];
            return (
              <button
                key={cluster.label}
                type="button"
                className={`absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:z-20 hover:scale-105 ${isActive ? "border-dema-forest bg-dema-forest text-dema-paper" : "border-dema-line bg-dema-paper/95 text-brand-blue hover:border-dema-forest/30"}`}
                style={{ left: `${cluster.position.x}%`, top: `${cluster.position.y}%` }}
                aria-label={`Voir ${cluster.opportunities.length} opportunité${cluster.opportunities.length > 1 ? "s" : ""} à ${cluster.label}`}
                onClick={() => { setPreviewLocation(cluster.label); onOpportunityPreview(firstOpportunity?.id); }}
                onMouseEnter={() => { setPreviewLocation(cluster.label); onOpportunityPreview(firstOpportunity?.id); }}
                onFocus={() => { setPreviewLocation(cluster.label); onOpportunityPreview(firstOpportunity?.id); }}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /><span>{cluster.opportunities.length}</span>
              </button>
            );
          })}
          {previewCluster ? (
            <div className="absolute bottom-4 left-4 right-4 z-30 max-h-52 w-auto overflow-y-auto rounded-2xl border border-dema-line bg-dema-paper p-2 sm:bottom-auto sm:right-auto sm:left-[var(--preview-left)] sm:top-[var(--preview-top)] sm:w-[min(280px,calc(100%-2rem))]" style={getPreviewVariables(previewCluster.position)}>
              <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-[0.12em] text-dema-forest">{previewCluster.label}</p>
              {previewCluster.opportunities.map((opportunity) => (
                <button key={opportunity.id} type="button" className="flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-dema-sage/35 focus-visible:bg-dema-sage/45 focus-visible:outline-none" onClick={() => onOpenOpportunity(opportunity)}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dema-sage text-dema-forest"><Building2 className="h-4 w-4" aria-hidden="true" /></span>
                  <span className="min-w-0"><span className="block text-sm font-medium leading-5">{opportunity.activity}</span><span className="mt-1 block text-xs text-dema-muted">Voir la fiche</span></span>
                </button>
              ))}
            </div>
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
function getPreviewVariables(position: Position) {
  return {
    "--preview-left": `${clamp(position.x + 5, 6, 54)}%`,
    "--preview-top": `${clamp(position.y - 8, 6, 72)}%`,
  } as CSSProperties;
}
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
