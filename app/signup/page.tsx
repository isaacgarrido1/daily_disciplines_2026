"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { OAuthSocialButtons } from "@/components/auth/OAuthSocialButtons";
import { createClient } from "@/lib/supabase/client";

function mapSignUpError(message: string): string {
  if (/user already registered|already been registered/i.test(message)) {
    return "An account with this email already exists. Try logging in.";
  }
  if (/password/i.test(message) && /weak|short|least/i.test(message)) {
    return "Password is too weak. Use at least 6 characters.";
  }
  if (/invalid email/i.test(message)) {
    return "Enter a valid email address.";
  }
  return message;
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          displayName: displayName.trim()
        })
      });

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        session?: { access_token: string; refresh_token: string } | null;
        user?: { id: string; email?: string | null } | null;
      };

      if (!res.ok) {
        setError(mapSignUpError(payload.error ?? "Sign up failed."));
        return;
      }

      if (payload.session) {
        const supabase = createClient();
        const { error: sessionErr } = await supabase.auth.setSession({
          access_token: payload.session.access_token,
          refresh_token: payload.session.refresh_token
        });
        if (sessionErr) {
          setError(mapSignUpError(sessionErr.message));
          return;
        }

        if (payload.user?.id) {
          const { error: profileErr } = await supabase.from("profiles").upsert(
            {
              id: payload.user.id,
              display_name: displayName.trim() || null
            },
            { onConflict: "id" }
          );
          if (profileErr) {
            console.error("profile upsert", profileErr);
          }
        }

        setSuccess("Account created. Redirecting…");
        router.replace("/");
        router.refresh();
        return;
      }

      setSuccess(
        "Check your email for a confirmation link to finish signing up."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Sign up">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Create an account with Google, Apple, or email and password. You can join or create a
          small group after signing in.
        </p>

        <OAuthSocialButtons redirectPath="/" />

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
          {success ? (
            <div className="rounded-md border border-green-800/50 bg-green-900/20 px-3 py-2 text-sm text-green-100">
              {success}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Display name
            </label>
            <input
              type="text"
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="form-input mt-2"
              placeholder="Your name"
              required
            />
          </div>

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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input mt-2"
              required
              minLength={6}
            />
            <p className="mt-1 text-xs text-slate-500">At least 6 characters.</p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
