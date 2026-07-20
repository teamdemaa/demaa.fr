import "server-only";

type LogMetadata = Record<string, boolean | number | string | null | undefined>;

function sanitizeLogValue(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/([?&](?:token|key|code)=)[^&\s]+/gi, "$1[redacted]")
    .slice(0, 300);
}

function buildLog(event: string, metadata: LogMetadata) {
  return JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    ...Object.fromEntries(
      Object.entries(metadata)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [
          key,
          typeof value === "string" ? sanitizeLogValue(value) : value,
        ]),
    ),
  });
}

export function logOperationalEvent(event: string, metadata: LogMetadata = {}) {
  console.info(buildLog(event, metadata));
}

export function logOperationalError(
  event: string,
  error: unknown,
  metadata: LogMetadata = {},
) {
  console.error(buildLog(event, {
    ...metadata,
    error: error instanceof Error ? error.message : "unknown error",
  }));
}
