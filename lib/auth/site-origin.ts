import type { NextRequest } from "next/server";

/**
 * Public origin used in Supabase `emailRedirectTo` (must be absolute and allowed in Supabase Auth URL config).
 *
 * Prefer `NEXT_PUBLIC_SITE_URL` in production when your canonical domain differs from the request host
 * (e.g. custom domain vs default Vercel URL).
 */
export function getPublicSiteOrigin(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const rawProto = request.headers.get("x-forwarded-proto");
  const proto = rawProto?.split(",")[0]?.trim() || "https";

  if (host) {
    const h = host.split(",")[0]?.trim();
    return `${proto}://${h}`.replace(/\/$/, "");
  }

  try {
    return new URL(request.url).origin.replace(/\/$/, "");
  } catch {
    return "";
  }
}
