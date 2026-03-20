"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";

export default function WeeklyCirclePage() {
  const { state, currentUser, group, addWeeklyEntry } = useApp();
  const [wins, setWins] = useState("");
  const [struggles, setStruggles] = useState("");
  const [commitments, setCommitments] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addWeeklyEntry({ wins, struggles, commitments });
    setWins("");
    setStruggles("");
    setCommitments("");
  }

  const entries = group
    ? state.weeklyEntries.filter((e) => e.groupId === group.id)
    : [];

  return (
    <div className="space-y-6">
      <Card title="Weekly Circle Reflection">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          Use this space for your weekly check-in: honest wins, real struggles,
          and clear commitments for the next seven days.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Wins
            </label>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Where did you see the Lord move? Where did you show up with integrity?"
              disabled={!currentUser}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Struggles
            </label>
            <textarea
              value={struggles}
              onChange={(e) => setStruggles(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Where did you fall short? Where do you need prayer and small group?"
              disabled={!currentUser}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Commitments for Next Week
            </label>
            <textarea
              value={commitments}
              onChange={(e) => setCommitments(e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Be specific. What will you commit to in spiritual, physical, and leadership disciplines?"
              disabled={!currentUser}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" className="btn-primary" disabled={!currentUser}>
              Save Weekly Entry
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Entries are stored only in this session for the 30-day pilot.
            </p>
          </div>
        </form>
      </Card>

      <Card title="Weekly Entries">
        {entries.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-500">
            No weekly entries yet. Use this with your circle each week.
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2 text-xs text-slate-500">
                  <span className="break-words font-semibold text-slate-600 dark:text-slate-300">
                    {entry.userName}
                  </span>
                  <span className="shrink-0">
                    {new Date(entry.createdAtIso).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                {entry.wins && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-green-300">
                      Wins
                    </p>
                    <p className="text-slate-800 dark:text-slate-100">{entry.wins}</p>
                  </div>
                )}
                {entry.struggles && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-300">
                      Struggles
                    </p>
                    <p className="text-slate-800 dark:text-slate-100">{entry.struggles}</p>
                  </div>
                )}
                {entry.commitments && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-300">
                      Commitments
                    </p>
                    <p className="text-slate-800 dark:text-slate-100">{entry.commitments}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

