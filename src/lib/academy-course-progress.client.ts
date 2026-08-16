"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export type AcademyCourseProgress = Readonly<{
  answers: Record<string, string>;
  screenIndex: number;
}>;

export function getAcademyCourseProgressKey(input: {
  contentVersion: string;
  courseId: string;
  localeCode: "fr" | "en";
}) {
  return `demaa-academy-progress:${input.localeCode}:${input.contentVersion}:${input.courseId}`;
}

function parseAcademyCourseProgress(value: string | null): AcademyCourseProgress | null {
  try {
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<AcademyCourseProgress>;
    if (
      !Number.isInteger(parsed.screenIndex)
      || typeof parsed.screenIndex !== "number"
      || parsed.screenIndex < 0
      || !parsed.answers
      || typeof parsed.answers !== "object"
      || Array.isArray(parsed.answers)
    ) {
      return null;
    }
    return {
      answers: Object.fromEntries(
        Object.entries(parsed.answers).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      ),
      screenIndex: parsed.screenIndex,
    };
  } catch {
    return null;
  }
}

function readAcademyCourseProgressSnapshot(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readAcademyCourseProgress(key: string): AcademyCourseProgress | null {
  return parseAcademyCourseProgress(readAcademyCourseProgressSnapshot(key));
}

export function useAcademyCourseProgress(key: string) {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) onStoreChange();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("demaa-academy-progress", onStoreChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("demaa-academy-progress", onStoreChange);
    };
  }, [key]);
  const getSnapshot = useCallback(
    () => readAcademyCourseProgressSnapshot(key),
    [key],
  );
  const storedValue = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return useMemo(() => parseAcademyCourseProgress(storedValue), [storedValue]);
}

export function writeAcademyCourseProgress(
  key: string,
  progress: AcademyCourseProgress,
) {
  try {
    window.localStorage.setItem(key, JSON.stringify(progress));
    window.dispatchEvent(new Event("demaa-academy-progress"));
  } catch {
    // The course remains usable in memory when browser storage is unavailable.
  }
}
