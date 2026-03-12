"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";

export default function SmallGroupPage() {
  const { state, currentUser, group, dateKey, addComment } = useApp();
  const [body, setBody] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    addComment(body);
    setBody("");
  }

  const usersInGroup = group
    ? state.users.filter((u) => u.groupId === group.id)
    : [];

  const progressByUser = new Map(
    state.progress
      .filter((p) => p.dateKey === dateKey)
      .map((p) => [p.userId, p])
  );

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

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="grid grid-cols-3 bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            <div>Name</div>
            <div className="text-center">Today</div>
            <div className="text-center">Streak</div>
          </div>

          <ul className="divide-y divide-slate-800 text-sm">
            {usersInGroup.map((user) => {
              const p = progressByUser.get(user.id);
              const complete = p?.dayComplete ?? false;
              return (
              <li
                key={user.id}
                className="grid grid-cols-3 items-center px-3 py-2"
              >
                <div className="font-medium text-slate-800 dark:text-slate-100">{user.name}</div>
                <div className="text-center text-xs">
                  {complete ? (
                    <span className="rounded-full border border-green-700/60 bg-green-900/30 px-2 py-0.5 text-[11px] font-semibold text-green-300">
                      Complete
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      Incomplete
                    </span>
                  )}
                </div>
                <div className="text-center text-sm font-semibold text-accent">
                  {user.streak}
                </div>
              </li>
              );
            })}
          </ul>
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
          <div className="flex-1 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-accent/70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
              placeholder="Speak courage, not condemnation..."
              disabled={!currentUser}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md border border-accent/40 bg-accent/90 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-accent sm:w-48"
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
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {c.authorName}
                  </span>
                  <span>
                    {new Date(c.createdAtIso).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-slate-800 dark:text-slate-100">{c.body}</p>
              </article>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

