export function buildContentSecurityPolicy(options?: {
  allowUnsafeEval?: boolean;
  allowSameOriginFraming?: boolean;
}) {
  const scriptSrcUnsafeEval = options?.allowUnsafeEval
    ? " 'unsafe-eval'"
    : "";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    options?.allowSameOriginFraming
      ? "frame-ancestors 'self'"
      : "frame-ancestors 'none'",
    `script-src 'self' 'unsafe-inline'${scriptSrcUnsafeEval} https://www.googletagmanager.com https://connect.facebook.net https://apis.google.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://drive.google.com https://lh3.googleusercontent.com https://*.googleusercontent.com",
    "font-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://api-adresse.data.gouv.fr https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com",
    "frame-src 'self' https://embed.fillout.com https://*.firebaseapp.com https://accounts.google.com",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}
