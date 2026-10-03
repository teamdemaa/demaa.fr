export function allowsLocalSolutionsSnapshot(host: string, env: Record<string, string | undefined>) {
  if (env.NODE_ENV === "development") return true;
  return env.DEMAA_LOCAL_SOLUTIONS_PREVIEW === "true"
    && !env.VERCEL && !env.VERCEL_ENV
    && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
}
