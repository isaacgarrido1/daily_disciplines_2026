import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";

/**
 * Email confirmation, magic links, and OAuth (Google / Apple): exchanges `code` for a session and sets cookies.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin } = url;
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (searchParams.get("error")) {
    const u = new URL("/login", origin);
    u.searchParams.set("error", "oauth");
    return NextResponse.redirect(u);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin).toString());
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth", origin).toString());
}
