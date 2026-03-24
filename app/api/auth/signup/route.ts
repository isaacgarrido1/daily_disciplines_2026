import { NextRequest, NextResponse } from "next/server";
import { getPublicSiteOrigin } from "@/lib/auth/site-origin";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Server-side sign-up so `emailRedirectTo` uses the real deployed origin (Vercel
 * `x-forwarded-*` headers) or `NEXT_PUBLIC_SITE_URL`. Wrong or relative redirect
 * URLs often break email confirmation.
 */
export async function POST(request: NextRequest) {
  let supabase: ReturnType<typeof createPublicClient>;
  try {
    supabase = createPublicClient();
  } catch {
    return NextResponse.json({ error: "Supabase is not configured on the server." }, { status: 503 });
  }

  const origin = getPublicSiteOrigin(request);
  if (!origin) {
    return NextResponse.json(
      {
        error:
          "Could not determine public site URL. Set NEXT_PUBLIC_SITE_URL in Vercel (e.g. https://your-app.vercel.app)."
      },
      { status: 500 }
    );
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    password?: string;
    displayName?: string;
  } | null;

  const email = (body?.email ?? "").trim();
  const password = body?.password ?? "";
  const displayName = (body?.displayName ?? "").trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const emailRedirectTo = `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: displayName ? { display_name: displayName } : undefined
    }
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const session = data.session;
  const user = data.user;

  if (!session && !user) {
    return NextResponse.json({ error: "Sign up did not return a user. Try again." }, { status: 500 });
  }

  return NextResponse.json({
    needsEmailConfirmation: !session && !!user,
    session: session
      ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token
        }
      : null,
    user: user ? { id: user.id, email: user.email } : null
  });
}
