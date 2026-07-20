const ALLOWED_CUSTOMER_RETURN_PATHS = ["/mon-espace"] as const;

export function getSafeCustomerReturnTo(value?: string | null) {
  const candidate = value?.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/mon-espace";
  }

  const isAllowed = ALLOWED_CUSTOMER_RETURN_PATHS.some(
    (path) => candidate === path || candidate.startsWith(`${path}?`),
  );

  return isAllowed ? candidate : "/mon-espace";
}
