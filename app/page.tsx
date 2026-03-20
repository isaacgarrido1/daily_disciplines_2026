"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { ScriptureOfTheDay } from "@/components/ScriptureOfTheDay";
import { useApp } from "@/components/AppProvider";
import type { DisciplineKey } from "@/lib/appState";

export default function DashboardPage() {
  const {
    currentUser,
    group,
    weekKey,
    mission,
    progress,
    toggleChallenge,
    markDayComplete,
    setWeekMission
  } = useApp();

  const [draftMission, setDraftMission] = useState({
    spiritual: "",
    physical: "",
    leadership: ""
  });

  useEffect(() => {
    async function loadMission() {
      if (!group) return;
      try {
        const res = await fetch(
          `/api/missions?groupId=${encodeURIComponent(group.id)}&weekKey=${encodeURIComponent(
            weekKey
          )}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          mission: { spiritual: string; physical: string; leadership: string } | null;
        };
        if (data.mission) {
          setWeekMission({
            spiritual: data.mission.spiritual,
            physical: data.mission.physical,
            leadership: data.mission.leadership
          });
        }
      } catch {
        // ignore; falls back to local state
      }
    }
    loadMission();
  }, [group, weekKey, setWeekMission]);

  const weekLabel = useMemo(() => {
    const [y, m, d] = weekKey.split("-").map(Number);
    const mon = new Date(y, m - 1, d);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    return `${fmt(mon)} – ${fmt(sun)}`;
  }, [weekKey]);

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

  async function handleSaveWeekMission(e: React.FormEvent) {
    e.preventDefault();
    const spiritual = (draftMission.spiritual || mission?.spiritual || "").trim();
    const physical = (draftMission.physical || mission?.physical || "").trim();
    const leadership = (draftMission.leadership || mission?.leadership || "").trim();
    if (!spiritual || !physical || !leadership) return;
    if (!group || !currentUser) return;
    try {
      await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId: group.id,
          weekKey,
          spiritual,
          physical,
          leadership,
          setByUserId: currentUser.id
        })
      });
      setWeekMission({ spiritual, physical, leadership });
      setDraftMission({ spiritual: "", physical: "", leadership: "" });
    } catch {
      // swallow for now; UI will still reflect local state
    }
  }

  function onToggle(key: DisciplineKey) {
    toggleChallenge(key);
  }

  return (
    <div className="space-y-6">
      <ScriptureOfTheDay />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">
            Today&apos;s Date
          </p>
          <p className="text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-50">
            {todayLabel}
          </p>
          <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-500">
            {group ? (
              <>
                Group: <span className="text-slate-600 dark:text-slate-300">{group.name}</span>
              </>
            ) : (
              <>No group selected</>
            )}
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center sm:gap-4">
          <div className="shrink-0">
            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
              Discipline Streak
            </p>
            <p className="text-2xl font-semibold text-accent">
              {currentUser?.streak ?? 0} days
            </p>
          </div>
          <div className="min-w-0 max-w-full rounded-md border border-green-700/40 bg-green-100 px-3 py-2.5 text-xs leading-snug text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
            Consistency over perfection. One day at a time.
          </div>
        </div>
      </div>

      <Card title="Daily Challenges">
        {!currentUser ? (
          <div className="rounded-md border border-slate-200 bg-slate-100 p-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
            <Link href="/create-account" className="text-slate-800 underline dark:text-slate-100">Create an account</Link> or <Link href="/login" className="text-slate-800 underline dark:text-slate-100">log in</Link> to begin.
          </div>
        ) : null}

        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          This week&apos;s goals (set by your leader). Complete these three disciplines each day, then mark the day complete.
        </p>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-400 bg-white text-accent dark:border-slate-600 dark:bg-slate-900"
              checked={challenges.spiritual}
              onChange={() => onToggle("spiritual")}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Spiritual
              </p>
              <p className="break-words text-sm text-slate-800 dark:text-slate-100">
                {mission?.spiritual ?? "No goals set for this week yet."}
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-400 bg-white text-accent dark:border-slate-600 dark:bg-slate-900"
              checked={challenges.physical}
              onChange={() => onToggle("physical")}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Physical
              </p>
              <p className="break-words text-sm text-slate-800 dark:text-slate-100">
                {mission?.physical ?? "No goals set for this week yet."}
              </p>
            </div>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-400 bg-white text-accent dark:border-slate-600 dark:bg-slate-900"
              checked={challenges.leadership}
              onChange={() => onToggle("leadership")}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Leadership
              </p>
              <p className="break-words text-sm text-slate-800 dark:text-slate-100">
                {mission?.leadership ?? "No goals set for this week yet."}
              </p>
            </div>
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={markDayComplete}
            disabled={!currentUser || !allChecked || dayComplete}
            className={`inline-flex min-h-touch w-full items-center justify-center rounded-md px-4 py-2.5 text-base font-semibold sm:w-auto sm:py-2 sm:text-sm ${
              !currentUser || !allChecked || dayComplete
                ? "cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-900/40"
                : "border border-accent/40 bg-accent/90 text-slate-950 hover:bg-accent dark:text-slate-950"
            }`}
          >
            {dayComplete ? "Day Marked Complete" : "Mark Day Complete"}
          </button>

          <p className="text-xs text-slate-500 dark:text-slate-500">
            This pilot uses local-only storage. No real accounts yet.
          </p>
        </div>
      </Card>

      {currentUser && currentUser.role === "leader" ? (
        <Card title="Leader: Set This Week’s Group Goals">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
            Set three goals for the week. The group will complete these same goals each day as daily challenges. You only need to set them once per week.
          </p>
          <p className="mb-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            Week of {weekLabel}
          </p>

          <form onSubmit={handleSaveWeekMission} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Spiritual
              </label>
              <input
                value={draftMission.spiritual}
                onChange={(e) =>
                  setDraftMission((p) => ({ ...p, spiritual: e.target.value }))
                }
                className="form-input mt-2"
                placeholder={mission?.spiritual ?? "Enter this week’s spiritual goal"}
                autoComplete="off"
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
                className="form-input mt-2"
                placeholder={mission?.physical ?? "Enter this week’s physical goal"}
                autoComplete="off"
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
                className="form-input mt-2"
                placeholder={mission?.leadership ?? "Enter this week’s leadership goal"}
                autoComplete="off"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={!group}>
              Save Goals for This Week
            </button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}

