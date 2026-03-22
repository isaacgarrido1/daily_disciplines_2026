import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PREFIXES = ["/login", "/signup", "/auth"];

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function readSupabaseEnv(): { url: string; key: string } | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? process.env.SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

/**
 * Refresh session + auth redirects. Must not throw — uncaught errors become
 * Vercel `MIDDLEWARE_INVOCATION_FAILED` (500).
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const env = readSupabaseEnv();
  if (!env) {
    if (pathname.startsWith("/api") || isPublicPath(pathname)) {
      return NextResponse.next();
    }
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("error", "config");
    return NextResponse.redirect(u);
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          // Do not call request.cookies.set — Next.js Edge can throw (immutable request cookies).
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(
              name,
              value,
              options as Parameters<typeof supabaseResponse.cookies.set>[2]
            )
          );
        }
      }
    });

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (pathname.startsWith("/api")) {
      return supabaseResponse;
    }

    if (!user && !isPublicPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    if (user && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return supabaseResponse;
  } catch (err) {
    console.error("updateSession", err);
    if (pathname.startsWith("/api") || isPublicPath(pathname)) {
      return NextResponse.next();
    }
    const u = request.nextUrl.clone();
    u.pathname = "/login";
    u.searchParams.set("error", "middleware");
    return NextResponse.redirect(u);
  }
}
