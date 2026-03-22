"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { Session, User, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/profile";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, updated_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("profiles fetch", error);
    return null;
  }
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  /** Created only in useEffect so SSR / `next build` prerender never calls getSupabaseUrl(). */
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    try {
      setSupabase(createClient());
    } catch {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const uid = session?.user?.id;
    if (!supabase) {
      setProfile(null);
      return;
    }
    if (!uid) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(supabase, uid);
    setProfile(p);
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    let cancelled = false;

    async function init() {
      const {
        data: { session: s }
      } = await client.auth.getSession();
      if (cancelled) return;
      setSession(s);
      if (s?.user) {
        const p = await fetchProfile(client, s.user.id);
        if (!cancelled) setProfile(p);
      } else {
        setProfile(null);
      }
      if (!cancelled) setLoading(false);
    }

    void init();

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        const p = await fetchProfile(client, newSession.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      signOut,
      refreshProfile
    }),
    [session, profile, loading, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
