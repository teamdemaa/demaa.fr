const ALLOWED_CUSTOMER_RETURN_PATHS = ["/", "/plans"] as const;

export function getSafeCustomerReturnTo(value?: string | null) {
  const candidate = value?.trim();

  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/plans";
  }

  if (candidate === "/mon-espace" || candidate.startsWith("/mon-espace?")) {
    return "/plans";
  }

  if (candidate.startsWith("/mon-espace/plans/")) {
    return candidate.replace("/mon-espace/plans/", "/plans/");
  }

  const isAllowed = ALLOWED_CUSTOMER_RETURN_PATHS.some(
    (path) =>
      candidate === path ||
      candidate.startsWith(`${path}?`) ||
      candidate.startsWith(`${path}/`),
  );

  return isAllowed ? candidate : "/plans";
}
