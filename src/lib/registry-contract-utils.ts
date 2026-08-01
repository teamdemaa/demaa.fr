export type UnknownRecord = Record<string, unknown>;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const VERSION_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function assertSafeOwnProperties(value: object, path: string): void {
  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new TypeError(`${path} must not contain symbol properties`);
  }
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (Array.isArray(value) && key === "length") continue;
    if (!descriptor.enumerable || "get" in descriptor || "set" in descriptor) {
      throw new TypeError(`${path}.${key} must be an enumerable data property`);
    }
  }
}

export function isPlainRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

export function parseRecord(
  value: unknown,
  path: string,
  allowedKeys: readonly string[],
): UnknownRecord {
  if (!isPlainRecord(value)) throw new TypeError(`${path} must be a plain object`);
  assertSafeOwnProperties(value, path);
  const unknownKeys = Object.keys(value).filter((key) => !allowedKeys.includes(key));
  if (unknownKeys.length > 0) {
    throw new TypeError(`${path} contains unknown fields: ${unknownKeys.join(", ")}`);
  }
  return value;
}

export function parseString(value: unknown, path: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`${path} must be a non-empty string`);
  }
  if (value !== value.trim()) throw new TypeError(`${path} must be trimmed`);
  return value;
}

export function parseArray(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value)) throw new TypeError(`${path} must be an array`);
  assertSafeOwnProperties(value, path);
  for (let index = 0; index < value.length; index += 1) {
    if (!(index in value)) throw new TypeError(`${path} must not be sparse`);
  }
  const extraKeys = Object.getOwnPropertyNames(value).filter(
    (key) => key !== "length" && !/^(?:0|[1-9][0-9]*)$/.test(key),
  );
  if (extraKeys.length > 0) throw new TypeError(`${path} contains extra properties`);
  return value;
}

export function parseNullableString(value: unknown, path: string): string | null {
  if (value === null) return null;
  return parseString(value, path);
}

export function parseStringArray(value: unknown, path: string): readonly string[] {
  const entries = parseArray(value, path).map((entry, index) => parseString(entry, `${path}[${index}]`));
  if (new Set(entries).size !== entries.length) {
    throw new TypeError(`${path} must not contain duplicates`);
  }
  return deepFreeze(entries);
}

export function parsePositiveInteger(value: unknown, path: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1) {
    throw new TypeError(`${path} must be a positive safe integer`);
  }
  return value as number;
}

export function parseEnum<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  path: string,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new TypeError(`${path} must be one of: ${allowed.join(", ")}`);
  }
  return value as T[number];
}

export function parseSlug(value: unknown, path: string): string {
  const slug = parseString(value, path);
  if (!SLUG_PATTERN.test(slug)) throw new TypeError(`${path} must be a lowercase slug`);
  return slug;
}

export function parseVersion(value: unknown, path: string): string {
  const version = parseString(value, path);
  if (!VERSION_PATTERN.test(version)) throw new TypeError(`${path} is invalid`);
  return version;
}

export function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested);
  return Object.freeze(value);
}

export function validationError(error: unknown): string {
  return error instanceof Error ? error.message : "invalid registry value";
}
