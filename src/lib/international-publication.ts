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
  marketCodes: readonly MarketCode[];
  publicationStatus: PublicationStatus;
}>;

export type LocaleDictionary<TValue> = Readonly<
  Record<InterfaceLocaleCode, Readonly<TValue>>
>;

export function defineLocaleDictionary<TValue>(
  dictionary: LocaleDictionary<TValue>,
) {
  return dictionary;
}

export function isProjectionPublishedForContext<TContent>(
  projection: LocalizedProjection<TContent>,
  context: Pick<InternationalContext, "localeCode" | "marketCode">,
) {
  return projection.publicationStatus === "published"
    && projection.localeCode === context.localeCode
    && projection.marketCodes.includes(context.marketCode);
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
