"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { useApp } from "@/components/AppProvider";
import type { DisciplineKey } from "@/lib/appState";

export default function DashboardPage() {
  const {
    currentUser,
    group,
    mission,
    progress,
    toggleChallenge,
    markDayComplete,
    setTodayMission,
    addPersonalTask,
    togglePersonalTask
  } = useApp();

  const [draftMission, setDraftMission] = useState({
    spiritual: "",
    physical: "",
    leadership: ""
  });

  const [personalText, setPersonalText] = useState("");

  const todayLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, []);

  const challenges = progress?.challenges ?? {
    spiritual: false,
    physical: false,
    leadership: false
  };
  const allChecked = Object.values(challenges).every(Boolean);
  const dayComplete = progress?.dayComplete ?? false;

  function handleSaveMission(e: React.FormEvent) {
    e.preventDefault();
    const spiritual = (draftMission.spiritual || mission?.spiritual || "").trim();
    const physical = (draftMission.physical || mission?.physical || "").trim();
    const leadership = (draftMission.leadership || mission?.leadership || "").trim();
    if (!spiritual || !physical || !leadership) return;
    setTodayMission({ spiritual, physical, leadership });
    setDraftMission({ spiritual: "", physical: "", leadership: "" });
  }

  function onToggle(key: DisciplineKey) {
    toggleChallenge(key);
  }

  function onAddPersonal(e: React.FormEvent) {
    e.preventDefault();
    addPersonalTask(personalText);
    setPersonalText("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Today&apos;s Date
          </p>
          <p className="text-lg font-semibold text-slate-50">{todayLabel}</p>
          <p className="mt-1 text-xs text-slate-500">
            {group ? (
              <>
                Group: <span className="text-slate-300">{group.name}</span>
              </>
            ) : (
              <>No group selected</>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-500">
              Personal Streak
            </p>
            <p className="text-2xl font-semibold text-accent">
              {currentUser?.streak ?? 0} days
            </p>
          </div>
          <div className="rounded-md border border-green-900/40 bg-green-900/20 px-3 py-2 text-xs text-green-200">
            Consistency over perfection. One day at a time.
          </div>
        </div>
      </div>

      <Card title="Today’s Mission">
        {!currentUser ? (
          <div className="rounded-md border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
            Create or select a user in <span className="text-slate-100">Sign Up</span> to begin.
          </div>
        ) : null}

        <p className="mb-4 text-sm text-slate-300">
          Three disciplines for today. Check them off as you complete them, then
          mark the day complete.
        </p>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-800 bg-slate-900/40 p-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-accent"
              checked={challenges.spiritual}
              onChange={() => onToggle("spiritual")}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Spiritual
              </p>
              <p className="text-sm text-slate-100">
                {mission?.spiritual ?? "No mission set for today yet."}
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-800 bg-slate-900/40 p-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-accent"
              checked={challenges.physical}
              onChange={() => onToggle("physical")}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Physical
              </p>
              <p className="text-sm text-slate-100">
                {mission?.physical ?? "No mission set for today yet."}
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-800 bg-slate-900/40 p-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-accent"
              checked={challenges.leadership}
              onChange={() => onToggle("leadership")}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Leadership
              </p>
              <p className="text-sm text-slate-100">
                {mission?.leadership ?? "No mission set for today yet."}
              </p>
            </div>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={markDayComplete}
            disabled={!currentUser || !allChecked || dayComplete}
            className={`w-full rounded-md px-4 py-2 text-sm font-semibold sm:w-auto ${
              !currentUser || !allChecked || dayComplete
                ? "cursor-not-allowed border border-slate-700 bg-slate-900/40 text-slate-500"
                : "border border-accent/40 bg-accent/90 text-slate-950 hover:bg-accent"
            }`}
          >
            {dayComplete ? "Day Marked Complete" : "Mark Day Complete"}
          </button>

          <p className="text-xs text-slate-500">
            This pilot uses local-only storage. No real accounts yet.
          </p>
        </div>
      </Card>

      <Card title="Personal Tasks (Optional)">
        <p className="mb-3 text-sm text-slate-300">
          Add small personal tasks for today (in addition to the group mission).
        </p>

        <form onSubmit={onAddPersonal} className="flex flex-col gap-2 sm:flex-row">
          <input
            value={personalText}
            onChange={(e) => setPersonalText(e.target.value)}
            className="w-full flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent/70"
            placeholder="e.g., 10-minute walk after dinner"
            disabled={!currentUser}
          />
          <button
            type="submit"
            className="w-full rounded-md border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-900 sm:w-auto"
            disabled={!currentUser}
          >
            Add
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {(progress?.personalTasks ?? []).length === 0 ? (
            <p className="text-xs text-slate-500">No personal tasks yet.</p>
          ) : (
            (progress?.personalTasks ?? []).map((t) => (
              <label
                key={t.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-accent"
                  checked={t.done}
                  onChange={() => togglePersonalTask(t.id)}
                />
                <span className={`text-sm ${t.done ? "text-slate-500 line-through" : "text-slate-100"}`}>
                  {t.text}
                </span>
              </label>
            ))
          )}
        </div>
      </Card>

      {currentUser && currentUser.role === "leader" ? (
        <Card title="Leader: Set Today’s Group Mission">
          <p className="mb-4 text-sm text-slate-300">
            As leader, you can set the group mission for today. Members will see
            and complete these tasks.
          </p>

          <form onSubmit={handleSaveMission} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Spiritual
              </label>
              <input
                value={draftMission.spiritual}
                onChange={(e) =>
                  setDraftMission((p) => ({ ...p, spiritual: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent/70"
                placeholder={mission?.spiritual ?? "Enter today’s spiritual challenge"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Physical
              </label>
              <input
                value={draftMission.physical}
                onChange={(e) =>
                  setDraftMission((p) => ({ ...p, physical: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent/70"
                placeholder={mission?.physical ?? "Enter today’s physical challenge"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Leadership
              </label>
              <input
                value={draftMission.leadership}
                onChange={(e) =>
                  setDraftMission((p) => ({ ...p, leadership: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-accent/70"
                placeholder={mission?.leadership ?? "Enter today’s leadership challenge"}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md border border-accent/40 bg-accent/90 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-accent sm:w-auto"
              disabled={!group}
            >
              Save Mission for Today
            </button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}

