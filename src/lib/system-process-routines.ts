import rawCuratedRoutines from "@/lib/system-process-routines.json";

export const CURATED_SYSTEM_PROCESS_ROUTINE_SLUGS = [
  "batiment",
  "restaurant",
  "agence-marketing",
  "pharmacie",
  "assistant-administratif-externalise",
] as const;

export type CuratedSystemProcessRoutineSlug =
  (typeof CURATED_SYSTEM_PROCESS_ROUTINE_SLUGS)[number];

export type CuratedSystemProcessRoutineSource = {
  routineId: string;
  title: string;
  frequency: string;
  sourceProcessIds: [string, ...string[]];
  sourceStepIds: [string, string, ...string[]];
};

const curatedRoutines = rawCuratedRoutines as Record<
  CuratedSystemProcessRoutineSlug,
  CuratedSystemProcessRoutineSource[]
>;

export function isCuratedSystemProcessRoutineSlug(
  systemSlug: string,
): systemSlug is CuratedSystemProcessRoutineSlug {
  return CURATED_SYSTEM_PROCESS_ROUTINE_SLUGS.includes(
    systemSlug as CuratedSystemProcessRoutineSlug,
  );
}

export function getCuratedSystemProcessRoutines(
  systemSlug: CuratedSystemProcessRoutineSlug,
): CuratedSystemProcessRoutineSource[] {
  return curatedRoutines[systemSlug].map((routine) => ({
    ...routine,
    sourceProcessIds: [...routine.sourceProcessIds],
    sourceStepIds: [...routine.sourceStepIds],
  }));
}

export function findCuratedSystemProcessRoutines(
  systemSlug: string,
): CuratedSystemProcessRoutineSource[] | null {
  return isCuratedSystemProcessRoutineSlug(systemSlug)
    ? getCuratedSystemProcessRoutines(systemSlug)
    : null;
}
