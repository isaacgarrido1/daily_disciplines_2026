"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/auth/safe-next-path";

type Props = {
  /** Path after successful sign-in (must start with `/`). */
  redirectPath?: string;
};

/** Same-origin base as server signup: prefer NEXT_PUBLIC_SITE_URL, else current origin. */
function getOAuthRedirectOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return "";
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </svg>
  );
}

export function OAuthSocialButtons({ redirectPath = "/" }: Props) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startOAuth(provider: "google" | "apple") {
    setError(null);
    setLoading(provider);
    try {
      const origin = getOAuthRedirectOrigin();
      if (!origin) {
        setError("Could not determine site URL. Set NEXT_PUBLIC_SITE_URL.");
        return;
      }

      const next = safeNextPath(redirectPath);
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const supabase = createClient();
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo }
      });

      if (oauthErr) {
        setError(oauthErr.message);
        setLoading(null);
        return;
      }
      // Success: browser redirects to the provider; keep loading until navigation.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start sign-in.");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-md border border-rose-900/50 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          className="btn-secondary inline-flex min-h-touch w-full flex-1 items-center justify-center gap-2 sm:min-w-[10rem]"
          disabled={loading !== null}
          onClick={() => void startOAuth("google")}
          aria-busy={loading === "google"}
        >
          <GoogleIcon />
          {loading === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
        <button
          type="button"
          className="btn-secondary inline-flex min-h-touch w-full flex-1 items-center justify-center gap-2 sm:min-w-[10rem]"
          disabled={loading !== null}
          onClick={() => void startOAuth("apple")}
          aria-busy={loading === "apple"}
        >
          <AppleIcon />
          {loading === "apple" ? "Redirecting…" : "Continue with Apple"}
        </button>
      </div>
    </div>
  );
}
