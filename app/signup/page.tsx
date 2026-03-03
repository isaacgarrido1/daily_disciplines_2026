"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";

type Mode = "join" | "create";

export default function SignupPage() {
  const { state, currentUser, group, setCurrentUserId, signUp } = useApp();

  const [name, setName] = useState("");
  const [role, setRole] = useState<"leader" | "member">("member");
  const [mode, setMode] = useState<Mode>("join");
  const [groupCode, setGroupCode] = useState("");
  const [groupName, setGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const groupCodeHint = useMemo(() => {
    if (!group) return null;
    return group.code;
  }, [group]);

  function handleCreateOrJoin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      signUp({
        name,
        role,
        groupCode: mode === "join" ? groupCode : undefined,
        groupName: mode === "create" ? groupName : undefined
      });
      setName("");
      setGroupCode("");
      setGroupName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Sign Up / Switch User">
        <p className="mb-4 text-sm text-slate-300">
          No real authentication yet. This is a pilot: you can create a user,
          join a group via code, or switch between users to simulate the
          brotherhood.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Current User
            </p>
            <p className="mt-1 text-sm text-slate-100">
              {currentUser ? currentUser.name : "None"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {group ? (
                <>
                  Group: <span className="text-slate-300">{group.name}</span> ·
                  Code: <span className="text-slate-300">{group.code}</span>
                </>
              ) : (
                <>No group</>
              )}
            </p>
          </div>

          <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
              Switch to Existing User
            </label>
            <select
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent/70"
              value={currentUser?.id ?? ""}
              onChange={(e) => setCurrentUserId(e.target.value)}
            >
              {state.users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.role === "leader" ? "(Leader)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="Create or Join a Group">
        <form onSubmit={handleCreateOrJoin} className="space-y-4">
          {error ? (
            <div className="rounded-md border border-rose-900/50 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent/70"
                placeholder="e.g., Ben"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "leader" | "member")}
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent/70"
              >
                <option value="member">Member</option>
                <option value="leader">Group Leader</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Leaders can set today’s group mission/tasks.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                mode === "join"
                  ? "border-slate-700 bg-slate-900/60 text-slate-100"
                  : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => setMode("join")}
            >
              Join with code
            </button>
            <button
              type="button"
              className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                mode === "create"
                  ? "border-slate-700 bg-slate-900/60 text-slate-100"
                  : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-100"
              }`}
              onClick={() => setMode("create")}
            >
              Create new group
            </button>
          </div>

          {mode === "join" ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Group Code
              </label>
              <input
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent/70"
                placeholder={groupCodeHint ? `Try ${groupCodeHint}` : "Enter code"}
              />
              <p className="mt-1 text-xs text-slate-500">
                Default seeded group code: <span className="text-slate-300">DD2026</span>
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Group Name
              </label>
              <input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent/70"
                placeholder="e.g., Iron Sharpening Iron"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-md border border-accent/40 bg-accent/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-accent sm:w-auto"
          >
            {mode === "join" ? "Join Group" : "Create Group"}
          </button>
        </form>
      </Card>
    </div>
  );
}

