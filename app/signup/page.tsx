"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
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
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error: signErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
          data: {
            display_name: displayName.trim()
          }
        }
      });

      if (signErr) {
        setError(mapSignUpError(signErr.message));
        return;
      }

      if (data.session && data.user) {
        const { error: profileErr } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            display_name: displayName.trim() || null
          },
          { onConflict: "id" }
        );
        if (profileErr) {
          console.error("profile upsert", profileErr);
        }
      }

      if (data.session) {
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
          Create an account with email and password. You can join or create a small group
          after signing in.
        </p>

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
