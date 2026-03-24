"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { OAuthSocialButtons } from "@/components/auth/OAuthSocialButtons";
import { createClient } from "@/lib/supabase/client";
import { safeNextPath } from "@/lib/auth/safe-next-path";

function mapAuthError(message: string): string {
  if (/invalid login credentials|invalid email or password/i.test(message)) {
    return "Invalid email or password.";
  }
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email before signing in.";
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const safeRedirect = safeNextPath(redirect);
  const errParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => {
    if (errParam === "auth") return "Could not complete sign-in. Try again.";
    if (errParam === "oauth")
      return "Google or Apple sign-in was cancelled or could not be completed. Try again.";
    if (errParam === "config")
      return "Supabase env is missing on the server. In Vercel → Project → Settings → Environment Variables, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for Production and Preview, then redeploy.";
    if (errParam === "middleware") return "Authentication service error. Try again in a moment.";
    return null;
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (signErr) {
        setError(mapAuthError(signErr.message));
        return;
      }
      router.replace(safeRedirect);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Log in">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Sign in with Google, Apple, or your email and password.
        </p>

        <OAuthSocialButtons redirectPath={safeRedirect} />

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-slate-50/80 px-2 text-slate-500 dark:bg-surface/80 dark:text-slate-400">
              Or with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="rounded-md border border-rose-900/50 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input mt-2"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input mt-2"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          No account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-surface/80">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
