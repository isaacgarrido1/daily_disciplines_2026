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

export type Mission = {
  dateKey: string; // YYYY-MM-DD
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
  missionsByGroup: Record<string, Mission[]>; // groupId -> missions
  progress: DailyProgress[]; // per user per day
  comments: Comment[];
  weeklyEntries: WeeklyEntry[];
};

const STORAGE_KEY = "daily_disciplines_state_v1";

export function getDateKey(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function seedState(): AppState {
  const groupId = "group_default";
  const leaderUserId = "user_isaac";

  const users: User[] = [
    { id: leaderUserId, name: "Isaac", role: "leader", groupId, streak: 5 },
    { id: "user_ryan", name: "Ryan", role: "member", groupId, streak: 2 },
    { id: "user_john", name: "John", role: "member", groupId, streak: 7 },
    { id: "user_jake_b", name: "Jake B.", role: "member", groupId, streak: 1 },
    { id: "user_jake_n", name: "Jake N.", role: "member", groupId, streak: 4 },
    { id: "user_brandon", name: "Brandon", role: "member", groupId, streak: 0 },
    { id: "user_ben", name: "Ben", role: "member", groupId, streak: 3 }
  ];

  const groups: Group[] = [
    {
      id: groupId,
      name: "Brotherhood",
      code: "DD2026",
      leaderUserId
    }
  ];

  const today = getDateKey(new Date());
  const defaultMission: Mission = {
    dateKey: today,
    spiritual: "Read Romans 8 and pray for 10 focused minutes.",
    physical: "Complete a 30-minute workout. No junk food.",
    leadership: "Initiate prayer with your wife or encourage a brother.",
    setByUserId: leaderUserId
  };

  return {
    currentUserId: leaderUserId,
    users,
    groups,
    missionsByGroup: {
      [groupId]: [defaultMission]
    },
    progress: [],
    comments: [],
    weeklyEntries: []
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || typeof parsed !== "object") return seedState();
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

export function getMissionForGroupAndDate(
  state: AppState,
  groupId: string,
  dateKey: string
) {
  const list = state.missionsByGroup[groupId] ?? [];
  return list.find((m) => m.dateKey === dateKey) ?? null;
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

