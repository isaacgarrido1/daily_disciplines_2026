"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";

type RemoteMember = {
  id: string;
  name: string;
  role: string;
  streak: number;
  todayComplete: boolean;
};

export default function SmallGroupPage() {
  const { state, currentUser, group, dateKey, addComment } = useApp();
  const [body, setBody] = useState("");
  const [members, setMembers] = useState<RemoteMember[]>([]);

  useEffect(() => {
    async function loadMembers() {
      if (!group) {
        setMembers([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/group-members?groupId=${encodeURIComponent(
            group.id
          )}&dateKey=${encodeURIComponent(dateKey)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as { members?: RemoteMember[] };
        setMembers(data.members ?? []);
      } catch {
        // ignore; fall back to no remote members
      }
    }
    loadMembers();
  }, [group, dateKey]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    addComment(body);
    setBody("");
  }

  const comments = group
    ? state.comments.filter((c) => c.groupId === group.id)
    : [];

  return (
    <div className="space-y-6">
      <Card title="Small Group Check-In">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          A quick snapshot of where the group is today. This is not for
          shame, but for encouragement and courage.
        </p>

        <ul className="space-y-2 md:hidden">
          {members.map((member) => {
            const complete = member.todayComplete;
            return (
              <li
                key={member.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <p className="break-words font-medium text-slate-800 dark:text-slate-100">
                  {member.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Today</span>
                  {complete ? (
                    <span className="rounded-full border border-green-700/60 bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-300">
                      Complete
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      Incomplete
                    </span>
                  )}
                  <span className="text-slate-500 dark:text-slate-400">Streak</span>
                  <span className="font-semibold text-accent">{member.streak}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="grid min-w-[280px] grid-cols-[minmax(0,1fr)_auto_auto] gap-x-2 bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
              <div className="min-w-0">Name</div>
              <div className="shrink-0 text-center">Today</div>
              <div className="shrink-0 text-center">Streak</div>
            </div>

            <ul className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
              {members.map((member) => {
                const complete = member.todayComplete;
                return (
                  <li
                    key={member.id}
                    className="grid min-w-[280px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 px-3 py-2"
                  >
                    <div className="min-w-0 break-words font-medium text-slate-800 dark:text-slate-100">
                      {member.name}
                    </div>
                    <div className="shrink-0 text-center text-xs">
                      {complete ? (
                        <span className="inline-block rounded-full border border-green-700/60 bg-green-900/30 px-2 py-0.5 text-[11px] font-semibold text-green-300">
                          Complete
                        </span>
                      ) : (
                        <span className="inline-block rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                          Incomplete
                        </span>
                      )}
                    </div>
                    <div className="shrink-0 text-center text-sm font-semibold text-accent">
                      {member.streak}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Card>

      <Card title="Encouragement Wall">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
          Leave a short encouragement, Scripture, or word of challenge to the
          group. This is stored only in this browser for now.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mb-4 flex flex-col gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-start dark:border-slate-800 dark:bg-slate-950/40"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Speak courage, not condemnation..."
              disabled={!currentUser}
            />
          </div>

          <button
            type="submit"
            className="btn-primary sm:mt-7 sm:w-48 sm:shrink-0"
            disabled={!currentUser}
          >
            Post Encouragement
          </button>
        </form>

        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-xs text-slate-500">
              No encouragements yet. Lead by going first.
            </p>
          ) : (
            comments.map((c) => (
              <article
                key={c.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="mb-1 flex flex-col gap-1 xs:flex-row xs:items-center xs:justify-between xs:gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {c.authorName}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {new Date(c.createdAtIso).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="break-words text-slate-800 dark:text-slate-100">{c.body}</p>
              </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
