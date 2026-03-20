"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  AppState,
  Comment,
  DailyProgress,
  DisciplineKey,
  Group,
  PersonalTask,
  Role,
  User,
  WeeklyEntry,
  WeeklyMission,
  getCurrentUser,
  getDateKey,
  getWeekKey,
  getYesterdayDateKey,
  getMissionForGroupAndWeek,
  getOrCreateProgress,
  getGroupForUser,
  helpers,
  loadState,
  saveState,
  seedState
} from "@/lib/appState";
import { useAuth } from "@/components/AuthProvider";

type AppActions = {
  setCurrentUserId: (userId: string) => void;
  signUp: (args: {
    /** Must match the signed-in Supabase user id */
    authUserId: string;
    name: string;
    role: Role;
    groupCode?: string;
    groupName?: string;
    serverGroup?: { groupId: string; name: string; code: string };
  }) => void;
  setWeekMission: (mission: Omit<WeeklyMission, "weekKey" | "setByUserId">) => void;
  toggleChallenge: (key: DisciplineKey) => void;
  markDayComplete: () => void;
  addPersonalTask: (text: string) => void;
  togglePersonalTask: (taskId: string) => void;
  addComment: (body: string) => void;
  addWeeklyEntry: (entry: { wins: string; struggles: string; commitments: string }) => void;
  markBibleRead: () => void;
  markPrayer: () => void;
  setBrotherhoodNote: (userId: string, note: string) => void;
  setGroupName: (groupId: string, name: string) => void;
};

export type Theme = "light" | "dark";

const BIBLE_STREAK_KEY = "daily_disciplines_bible_streak_v1";
const PRAYER_STREAK_KEY = "daily_disciplines_prayer_streak_v1";

type StreakState = { streak: number; lastDateKey: string };

function loadStreak(key: string): StreakState {
  if (typeof window === "undefined") return { streak: 0, lastDateKey: "" };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { streak: 0, lastDateKey: "" };
    const parsed = JSON.parse(raw) as StreakState;
    if (typeof parsed?.streak !== "number" || typeof parsed?.lastDateKey !== "string") {
      return { streak: 0, lastDateKey: "" };
    }
    return { streak: parsed.streak, lastDateKey: parsed.lastDateKey };
  } catch {
    return { streak: 0, lastDateKey: "" };
  }
}

function saveStreak(key: string, data: StreakState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(data));
}

type AppContextValue = {
  state: AppState;
  currentUser: User | null;
  group: Group | null;
  dateKey: string;
  weekKey: string;
  mission: WeeklyMission | null;
  progress: DailyProgress | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  bibleStreak: number;
  bibleReadToday: boolean;
  prayerStreak: number;
  prayerToday: boolean;
} & AppActions;

const AppContext = createContext<AppContextValue | null>(null);

const THEME_KEY = "daily-disciplines-theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const t = window.localStorage.getItem(THEME_KEY);
  return t === "light" || t === "dark" ? t : "dark";
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user: authUser, profile, loading: authLoading } = useAuth();
  const [state, setState] = useState<AppState>(() => seedState());
  const [theme, setThemeState] = useState<Theme>("dark");
  const [bibleStreakState, setBibleStreakState] = useState<StreakState>({ streak: 0, lastDateKey: "" });
  const [prayerStreakState, setPrayerStreakState] = useState<StreakState>({ streak: 0, lastDateKey: "" });

  useEffect(() => {
    setState(loadState());
    setThemeState(getStoredTheme());
    const yesterday = getYesterdayDateKey();
    let bible = loadStreak(BIBLE_STREAK_KEY);
    if (bible.lastDateKey && bible.lastDateKey < yesterday) {
      bible = { streak: 0, lastDateKey: "" };
      saveStreak(BIBLE_STREAK_KEY, bible);
    }
    setBibleStreakState(bible);
    let prayer = loadStreak(PRAYER_STREAK_KEY);
    if (prayer.lastDateKey && prayer.lastDateKey < yesterday) {
      prayer = { streak: 0, lastDateKey: "" };
      saveStreak(PRAYER_STREAK_KEY, prayer);
    }
    setPrayerStreakState(prayer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      setState((prev) => ({ ...prev, currentUserId: null }));
      return;
    }
    const uid = authUser.id;
    const displayName =
      profile?.display_name?.trim() ||
      (authUser.user_metadata as { display_name?: string })?.display_name?.trim() ||
      authUser.email?.split("@")[0] ||
      "User";
    setState((prev) => {
      const idx = prev.users.findIndex((u) => u.id === uid);
      let nextUsers = prev.users;
      if (idx === -1) {
        nextUsers = [
          {
            id: uid,
            name: displayName,
            role: "member",
            groupId: "",
            streak: 0
          },
          ...prev.users
        ];
      } else {
        nextUsers = prev.users.map((u, i) =>
          i === idx ? { ...u, name: displayName } : u
        );
      }
      return { ...prev, currentUserId: uid, users: nextUsers };
    });
  }, [authLoading, authUser, profile]);

  const dateKey = useMemo(() => getDateKey(new Date()), []);
  const weekKey = useMemo(() => getWeekKey(dateKey), [dateKey]);

  const currentUser = useMemo(() => getCurrentUser(state), [state]);
  const group = useMemo(
    () => (currentUser ? getGroupForUser(state, currentUser) : null),
    [state, currentUser]
  );
  const mission = useMemo(() => {
    if (!group) return null;
    return getMissionForGroupAndWeek(state, group.id, weekKey);
  }, [state, group, weekKey]);

  const progress = useMemo(() => {
    if (!currentUser) return null;
    return (
      state.progress.find(
        (p) => p.userId === currentUser.id && p.dateKey === dateKey
      ) ?? null
    );
  }, [state.progress, currentUser, dateKey]);

  useEffect(() => {
    if (!currentUser) return;
    setState((prev) => {
      const exists = prev.progress.some(
        (p) => p.userId === currentUser.id && p.dateKey === dateKey
      );
      if (exists) return prev;
      const draft = structuredClone(prev);
      getOrCreateProgress(draft, currentUser.id, dateKey);
      return draft;
    });
  }, [currentUser, dateKey]);

  const actions: AppActions = useMemo(() => {
    function setCurrentUserId(userId: string) {
      setState((prev) => ({ ...prev, currentUserId: userId }));
    }

    function signUp(args: {
      authUserId: string;
      name: string;
      role: Role;
      groupCode?: string;
      groupName?: string;
      serverGroup?: { groupId: string; name: string; code: string };
    }) {
      const name = args.name.trim();
      if (!name) {
        throw new Error("Name is required.");
      }
      if (!args.authUserId) {
        throw new Error("Not authenticated.");
      }

      const groupCode = (args.groupCode ?? "").trim();
      const groupName = (args.groupName ?? "").trim();
      const serverGroup = args.serverGroup;

      setState((prev) => {
        let nextGroups = [...prev.groups];
        let nextUsers = [...prev.users];

        let group: Group | undefined;
        if (serverGroup) {
          group = nextGroups.find((g) => g.id === serverGroup.groupId);
          if (!group) {
            const newGroup: Group = {
              id: serverGroup.groupId,
              name: serverGroup.name,
              code: serverGroup.code,
              leaderUserId: args.role === "leader" ? "pending" : ""
            };
            nextGroups = [newGroup, ...nextGroups];
            group = newGroup;
          }
        } else if (groupCode) {
          group = nextGroups.find((g) => g.code.toLowerCase() === groupCode.toLowerCase());
          if (!group) {
            throw new Error("Group code not found.");
          }
        } else {
          const newGroup: Group = {
            id: helpers.id("group"),
            name: groupName || "New Small Group",
            code: Math.random().toString(36).slice(2, 8).toUpperCase(),
            leaderUserId: "pending"
          };
          nextGroups = [newGroup, ...nextGroups];
          group = newGroup;
        }

        const user: User = {
          id: args.authUserId,
          name,
          role: args.role,
          groupId: group.id,
          streak: 0
        };
        const withoutDup = nextUsers.filter((u) => u.id !== args.authUserId);
        nextUsers = [user, ...withoutDup];

        if (args.role === "leader") {
          nextGroups = nextGroups.map((g) =>
            g.id === group!.id ? { ...g, leaderUserId: user.id } : g
          );
        }

        return {
          ...prev,
          currentUserId: user.id,
          users: nextUsers,
          groups: nextGroups
        };
      });
    }

    function setWeekMission(m: Omit<WeeklyMission, "weekKey" | "setByUserId">) {
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const g = getGroupForUser(prev, user);
        if (!g) return prev;
        if (user.role !== "leader" && g.leaderUserId !== user.id) return prev;

        const wKey = getWeekKey(dateKey);
        const existing = getMissionForGroupAndWeek(prev, g.id, wKey);
        const nextMission: WeeklyMission = {
          weekKey: wKey,
          spiritual: m.spiritual,
          physical: m.physical,
          leadership: m.leadership,
          setByUserId: user.id
        };

        const list = prev.missionsByGroup[g.id] ?? [];
        const nextList = existing
          ? list.map((x) => (x.weekKey === wKey ? nextMission : x))
          : [nextMission, ...list];

        return {
          ...prev,
          missionsByGroup: { ...prev.missionsByGroup, [g.id]: nextList }
        };
      });
    }

    function toggleChallenge(key: DisciplineKey) {
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const draft = structuredClone(prev);
        const p = getOrCreateProgress(draft, user.id, dateKey);
        p.challenges[key] = !p.challenges[key];
        return draft;
      });
    }

    function markDayComplete() {
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const draft = structuredClone(prev);
        const p = getOrCreateProgress(draft, user.id, dateKey);
        const allDone = Object.values(p.challenges).every(Boolean);
        if (!allDone || p.dayComplete) return prev;
        p.dayComplete = true;
        draft.users = draft.users.map((u) => (u.id === user.id ? { ...u, streak: u.streak + 1 } : u));

        // Fire-and-forget server sync so Small Group tab stays in sync across devices.
        const g = getGroupForUser(draft, user);
        if (g) {
          void fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupId: g.id, name: user.name, dateKey })
          }).catch(() => {
            // ignore; local state still reflects completion
          });
        }

        return draft;
      });
    }

    function addPersonalTask(text: string) {
      const t = text.trim();
      if (!t) return;
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const draft = structuredClone(prev);
        const p = getOrCreateProgress(draft, user.id, dateKey);
        const task: PersonalTask = { id: helpers.id("task"), text: t, done: false };
        p.personalTasks = [task, ...p.personalTasks];
        return draft;
      });
    }

    function togglePersonalTask(taskId: string) {
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const draft = structuredClone(prev);
        const p = getOrCreateProgress(draft, user.id, dateKey);
        p.personalTasks = p.personalTasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t));
        return draft;
      });
    }

    function addComment(body: string) {
      const text = body.trim();
      if (!text) return;
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const g = getGroupForUser(prev, user);
        if (!g) return prev;
        const comment: Comment = {
          id: helpers.id("comment"),
          groupId: g.id,
          authorUserId: user.id,
          authorName: user.name,
          body: text,
          createdAtIso: new Date().toISOString()
        };
        return { ...prev, comments: [comment, ...prev.comments] };
      });
    }

    function addWeeklyEntry(entry: { wins: string; struggles: string; commitments: string }) {
      const wins = entry.wins.trim();
      const struggles = entry.struggles.trim();
      const commitments = entry.commitments.trim();
      if (!wins && !struggles && !commitments) return;

      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const g = getGroupForUser(prev, user);
        if (!g) return prev;
        const e: WeeklyEntry = {
          id: helpers.id("weekly"),
          userId: user.id,
          userName: user.name,
          groupId: g.id,
          wins,
          struggles,
          commitments,
          createdAtIso: new Date().toISOString()
        };
        return { ...prev, weeklyEntries: [e, ...prev.weeklyEntries] };
      });
    }

    function markBibleRead() {
      const today = getDateKey(new Date());
      const yesterday = getYesterdayDateKey();
      setBibleStreakState((prev) => {
        if (prev.lastDateKey === today) return prev;
        let nextStreak = prev.streak;
        if (prev.lastDateKey === yesterday) nextStreak += 1;
        else nextStreak = 1;
        const next = { streak: nextStreak, lastDateKey: today };
        saveStreak(BIBLE_STREAK_KEY, next);
        return next;
      });
    }

    function markPrayer() {
      const today = getDateKey(new Date());
      const yesterday = getYesterdayDateKey();
      setPrayerStreakState((prev) => {
        if (prev.lastDateKey === today) return prev;
        let nextStreak = prev.streak;
        if (prev.lastDateKey === yesterday) nextStreak += 1;
        else nextStreak = 1;
        const next = { streak: nextStreak, lastDateKey: today };
        saveStreak(PRAYER_STREAK_KEY, next);
        return next;
      });
    }

    function setBrotherhoodNote(userId: string, note: string) {
      const key = `${userId}_${dateKey}`;
      setState((prev) => ({
        ...prev,
        brotherhoodNotes: { ...prev.brotherhoodNotes, [key]: note }
      }));
    }

    function setGroupName(groupId: string, name: string) {
      const trimmed = name.trim();
      if (!trimmed) return;
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user || user.groupId !== groupId) return prev;
        const g = prev.groups.find((gr) => gr.id === groupId);
        if (!g || g.leaderUserId !== user.id) return prev;
        return {
          ...prev,
          groups: prev.groups.map((gr) =>
            gr.id === groupId ? { ...gr, name: trimmed } : gr
          )
        };
      });
    }

    return {
      setCurrentUserId,
      signUp,
      setWeekMission,
      toggleChallenge,
      markDayComplete,
      addPersonalTask,
      togglePersonalTask,
      addComment,
      addWeeklyEntry,
      markBibleRead,
      markPrayer,
      setBrotherhoodNote,
      setGroupName
    };
  }, [dateKey]);

  const setTheme = useMemo(
    () => (t: Theme) => setThemeState(t),
    []
  );

  const bibleReadToday = bibleStreakState.lastDateKey === dateKey;
  const prayerToday = prayerStreakState.lastDateKey === dateKey;

  const value: AppContextValue = useMemo(
    () => ({
      state,
      currentUser,
      group,
      dateKey,
      weekKey,
      mission,
      progress,
      theme,
      setTheme,
      bibleStreak: bibleStreakState.streak,
      bibleReadToday,
      prayerStreak: prayerStreakState.streak,
      prayerToday,
      ...actions
    }),
    [state, currentUser, group, dateKey, weekKey, mission, progress, theme, bibleStreakState, bibleReadToday, prayerStreakState, prayerToday, actions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

