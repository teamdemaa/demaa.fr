import rawProcessCadences from "@/lib/system-process-cadences.generated.json";

type ProcessCadenceRegistry = Readonly<{
  cadencesBySystem: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

const processCadenceRegistry = rawProcessCadences as ProcessCadenceRegistry;

const SIMPLE_PUBLIC_CADENCES: Readonly<Record<string, string>> = {
  Annuelle: "Chaque année",
  Hebdomadaire: "Chaque semaine",
  Mensuelle: "Chaque mois",
  Quotidienne: "Chaque jour",
  "Selon échéance": "À chaque échéance",
  Trimestrielle: "Chaque trimestre",
};

export function normalizePublicProcessCadence(cadence: string): string {
  const normalizedCadence = cadence.trim();

  return SIMPLE_PUBLIC_CADENCES[normalizedCadence] ?? normalizedCadence;
}

export function getSystemProcessCadence(
  systemSlug: string,
  processId: string,
): string | null {
  const sourceCadence =
    processCadenceRegistry.cadencesBySystem[systemSlug]?.[processId];

  return sourceCadence ? normalizePublicProcessCadence(sourceCadence) : null;
}
