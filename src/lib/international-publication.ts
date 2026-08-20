import type {
  InterfaceLocaleCode,
  InternationalContext,
  MarketCode,
} from "@/lib/international-context";

export type PublicationStatus = "draft" | "published";

export type LocalizedProjection<TContent> = Readonly<{
  canonicalId: string;
  content: Readonly<TContent>;
  contentVersion: string;
  localeCode: InterfaceLocaleCode;
  publicationStatus: PublicationStatus;
}>;

export type MarketAvailability = Readonly<{
  canonicalId: string;
  countryCodes?: readonly string[];
  marketCodes: readonly MarketCode[];
}>;

export type LocaleDictionary<TValue> = Readonly<
  Record<InterfaceLocaleCode, Readonly<TValue>>
>;

export function defineLocaleDictionary<TValue>(
  dictionary: LocaleDictionary<TValue>,
) {
  return dictionary;
}

export function isProjectionPublishedForLocale<TContent>(
  projection: LocalizedProjection<TContent>,
  localeCode: InternationalContext["localeCode"],
) {
  return projection.publicationStatus === "published"
    && projection.localeCode === localeCode;
}

export function isAvailableForContext(
  availability: MarketAvailability,
  context: Pick<InternationalContext, "countryCode" | "marketCode">,
) {
  if (!availability.marketCodes.includes(context.marketCode)) return false;
  if (availability.countryCodes === undefined) return true;
  return context.countryCode !== null
    && availability.countryCodes.includes(context.countryCode);
}

export function buildInternationalCacheKey(input: {
  contentVersion: string;
  localeCode: InterfaceLocaleCode;
  marketCode: MarketCode;
  namespace: string;
}) {
  return [
    input.namespace,
    input.localeCode,
    input.marketCode,
    input.contentVersion,
  ].map((part) => encodeURIComponent(part.trim())).join(":");
}
