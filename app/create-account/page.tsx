"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";

type Mode = "join" | "create";

export default function CreateAccountPage() {
  const router = useRouter();
  const { signUp } = useApp();
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("join");
  const [groupCode, setGroupCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "join") {
        const res = await fetch(
          `/api/groups/join?code=${encodeURIComponent(groupCode.trim())}`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Group code not found.");
        }
        const serverGroup = (await res.json()) as {
          id: string;
          name: string;
          code: string;
        };
        signUp({
          name: name.trim(),
          role: "member",
          serverGroup: {
            groupId: serverGroup.id,
            name: serverGroup.name,
            code: serverGroup.code
          }
        });
      } else {
        const res = await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupName.trim() || "New Small Group" })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error ?? "Failed to create group.");
        }
        const serverGroup = (await res.json()) as {
          id: string;
          name: string;
          code: string;
        };
        signUp({
          name: name.trim(),
          role: "leader",
          serverGroup: {
            groupId: serverGroup.id,
            name: serverGroup.name,
            code: serverGroup.code
          }
        });
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Create an account">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Enter your name and either join an existing small group with a code, or
          create a new group (you’ll be the leader). Members cannot set weekly goals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? (
            <div className="rounded-md border border-rose-900/50 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Your name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="e.g., Ben"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                mode === "join"
                  ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
              onClick={() => setMode("join")}
            >
              Join with code
            </button>
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                mode === "create"
                  ? "border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
              onClick={() => setMode("create")}
            >
              Create new group
            </button>
          </div>

          {mode === "join" ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Group code
              </label>
              <input
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="Enter code from your leader"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Group name
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                placeholder="e.g., Iron Sharpening Iron"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md border border-accent/40 bg-accent/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-accent disabled:opacity-70"
            disabled={loading}
          >
            {loading ? "Please wait…" : mode === "join" ? "Join as member" : "Create group (I'm the leader)"}
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
