export type DisciplineKey = "spiritual" | "physical" | "leadership";

export type Role = "leader" | "member";

export type User = {
  id: string;
  name: string;
  role: Role;
  groupId: string;
  streak: number;
};

export type Group = {
  id: string;
  name: string;
  code: string;
  leaderUserId: string;
};

/** One set of goals per week; the group completes these as daily challenges each day. */
export type WeeklyMission = {
  weekKey: string; // YYYY-MM-DD of Monday that starts the week
  spiritual: string;
  physical: string;
  leadership: string;
  setByUserId: string;
};

export type Comment = {
  id: string;
  groupId: string;
  authorUserId: string;
  authorName: string;
  body: string;
  createdAtIso: string;
};

export type WeeklyEntry = {
  id: string;
  userId: string;
  userName: string;
  groupId: string;
  wins: string;
  struggles: string;
  commitments: string;
  createdAtIso: string;
};

export type PersonalTask = {
  id: string;
  text: string;
  done: boolean;
};

export type DailyProgress = {
  userId: string;
  dateKey: string;
  challenges: Record<DisciplineKey, boolean>;
  personalTasks: PersonalTask[];
  dayComplete: boolean;
};

export type AppState = {
  currentUserId: string | null;
  users: User[];
  groups: Group[];
  missionsByGroup: Record<string, WeeklyMission[]>; // groupId -> weekly missions
  progress: DailyProgress[]; // per user per day
  comments: Comment[];
  weeklyEntries: WeeklyEntry[];
  /** Notes per user per day: key = `${userId}_${dateKey}` */
  brotherhoodNotes: Record<string, string>;
};

const STORAGE_KEY = "daily_disciplines_state_v1";

export function getDateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Monday of the week for the given dateKey (ISO week). */
export function getWeekKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 = Sun, 1 = Mon, ...
  const daysToMonday = day === 0 ? 6 : day - 1;
  date.setDate(date.getDate() - daysToMonday);
  return getDateKey(date);
}

export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getDateKey(d);
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function seedState(): AppState {
  return {
    currentUserId: null,
    users: [],
    groups: [],
    missionsByGroup: {},
    progress: [],
    comments: [],
    weeklyEntries: [],
    brotherhoodNotes: {}
  };
}

/** Migrate old daily missions (dateKey) to weekly missions (weekKey). */
function migrateMissionsByGroup(
  missionsByGroup: Record<string, unknown[]>
): Record<string, WeeklyMission[]> {
  const out: Record<string, WeeklyMission[]> = {};
  for (const [groupId, list] of Object.entries(missionsByGroup)) {
    if (!Array.isArray(list)) continue;
    const byWeek = new Map<string, WeeklyMission>();
    for (const m of list) {
      if (!m || typeof m !== "object") continue;
      const any = m as Record<string, unknown>;
      const weekKey = "weekKey" in any && typeof any.weekKey === "string"
        ? (any.weekKey as string)
        : "dateKey" in any && typeof any.dateKey === "string"
          ? getWeekKey(any.dateKey as string)
          : null;
      if (!weekKey) continue;
      const mission: WeeklyMission = {
        weekKey,
        spiritual: typeof any.spiritual === "string" ? any.spiritual : "",
        physical: typeof any.physical === "string" ? any.physical : "",
        leadership: typeof any.leadership === "string" ? any.leadership : "",
        setByUserId: typeof any.setByUserId === "string" ? any.setByUserId : ""
      };
      byWeek.set(weekKey, mission);
    }
    out[groupId] = Array.from(byWeek.values());
  }
  return out;
}

export function loadState(): AppState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed !== "object") return seedState();
    if (!parsed.brotherhoodNotes || typeof parsed.brotherhoodNotes !== "object") {
      parsed.brotherhoodNotes = {};
    }
    if (parsed.missionsByGroup && typeof parsed.missionsByGroup === "object") {
      parsed.missionsByGroup = migrateMissionsByGroup(parsed.missionsByGroup);
    }
    return parsed;
  } catch {
    return seedState();
  }
}

export function saveState(state: AppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getCurrentUser(state: AppState) {
  if (!state.currentUserId) return null;
  return state.users.find((u) => u.id === state.currentUserId) ?? null;
}

export function getGroupForUser(state: AppState, user: User) {
  return state.groups.find((g) => g.id === user.groupId) ?? null;
}

export function getMissionForGroupAndWeek(
  state: AppState,
  groupId: string,
  weekKey: string
): WeeklyMission | null {
  const list = state.missionsByGroup[groupId] ?? [];
  return list.find((m) => m.weekKey === weekKey) ?? null;
}

export function getOrCreateProgress(
  state: AppState,
  userId: string,
  dateKey: string
) {
  const existing = state.progress.find(
    (p) => p.userId === userId && p.dateKey === dateKey
  );
  if (existing) return existing;
  const created: DailyProgress = {
    userId,
    dateKey,
    challenges: { spiritual: false, physical: false, leadership: false },
    personalTasks: [],
    dayComplete: false
  };
  state.progress = [...state.progress, created];
  return created;
}

export const helpers = { id };

