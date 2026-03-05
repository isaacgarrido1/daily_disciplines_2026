"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";

export default function AccountPage() {
  const { currentUser, group, theme, setTheme, setGroupName } = useApp();
  const [copied, setCopied] = useState(false);
  const [groupNameDraft, setGroupNameDraft] = useState(group?.name ?? "");
  const [groupNameSaved, setGroupNameSaved] = useState(false);

  useEffect(() => {
    if (group?.name != null) setGroupNameDraft(group.name);
  }, [group?.name]);

  function copyCode() {
    if (!group?.code) return;
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!currentUser) {
    return (
      <div className="space-y-6">
        <Card title="Account">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            <Link href="/login" className="text-accent hover:underline">
            Log in
            </Link>{" "}
            or{" "}
            <Link href="/create-account" className="text-accent hover:underline">
              create an account
            </Link>{" "}
            to view settings and preferences.
          </p>
        </Card>
      </div>
    );
  }

  const isLeader = group?.leaderUserId === currentUser.id;

  function handleSaveGroupName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = groupNameDraft.trim();
    if (!group || !trimmed) return;
    setGroupName(group.id, trimmed);
    setGroupNameSaved(true);
    setTimeout(() => setGroupNameSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Card title="Your account">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Name
            </dt>
            <dd className="mt-0.5 text-slate-800 dark:text-slate-100">
              {currentUser.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Role
            </dt>
            <dd className="mt-0.5 text-slate-800 dark:text-slate-100">
              {currentUser.role === "leader" ? "Group leader" : "Member"}
            </dd>
          </div>
          {group ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Group
              </dt>
              <dd className="mt-0.5">
                {isLeader ? (
                  <form onSubmit={handleSaveGroupName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={groupNameDraft}
                      onChange={(e) => setGroupNameDraft(e.target.value)}
                      placeholder="Group name"
                      className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!groupNameDraft.trim() || groupNameDraft.trim() === group.name}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-accent/40 bg-accent text-slate-950 hover:bg-accent/90 disabled:opacity-50"
                      aria-label="Save group name"
                    >
                      {groupNameSaved ? (
                        <span className="text-sm">✓</span>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </form>
                ) : (
                  <span className="text-slate-800 dark:text-slate-100">{group.name}</span>
                )}
              </dd>
            </div>
          ) : null}
        </dl>
      </Card>

      {isLeader && group ? (
        <Card title="Group join code">
          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            Share this code with others so they can join your small group when
            they create an account.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-block rounded-md border-2 border-dashed border-slate-300 bg-slate-100 px-4 py-2 font-mono text-xl font-bold tracking-wider text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              aria-label={`Join code: ${group.code}`}
            >
              {group.code}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {copied ? "Copied!" : "Copy code"}
            </button>
          </div>
        </Card>
      ) : null}

      <Card title="Settings & preferences">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Theme
            </label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  theme === "light"
                    ? "border-accent/50 bg-accent/20 text-slate-900 dark:border-accent/50 dark:bg-accent/20 dark:text-slate-100"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  theme === "dark"
                    ? "border-accent/50 bg-accent/20 text-slate-900 dark:border-accent/50 dark:bg-accent/20 dark:text-slate-100"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
