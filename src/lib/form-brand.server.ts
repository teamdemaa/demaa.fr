import "server-only";

export type FormBrand = "demaa" | "sini";

const SINI_SITE_ORIGIN = "https://gosini.fr";

/**
 * SINI forwards its public forms through DEMAA's established delivery backend.
 * The extra origin header makes that provenance explicit without accepting an
 * arbitrary URL in outbound email links.
 */
export function getFormBrand(request: Request): FormBrand {
  return request.headers.get("x-sini-form") === "1"
    && request.headers.get("x-sini-site-origin") === SINI_SITE_ORIGIN
    ? "sini"
    : "demaa";
}

export function getFormBaseUrl(brand: FormBrand) {
  return brand === "sini" ? SINI_SITE_ORIGIN : null;
}

export function withFormSubjectBrand(brand: FormBrand, subject: string) {
  return brand === "sini" ? `sini · ${subject}` : subject;
}
