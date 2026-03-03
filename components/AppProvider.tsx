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
  Mission,
  PersonalTask,
  Role,
  User,
  WeeklyEntry,
  getCurrentUser,
  getDateKey,
  getMissionForGroupAndDate,
  getOrCreateProgress,
  getGroupForUser,
  helpers,
  loadState,
  saveState,
  seedState
} from "@/lib/appState";

type AppActions = {
  setCurrentUserId: (userId: string) => void;
  signUp: (args: {
    name: string;
    role: Role;
    groupCode?: string;
    groupName?: string;
  }) => void;
  setTodayMission: (mission: Omit<Mission, "dateKey" | "setByUserId">) => void;
  toggleChallenge: (key: DisciplineKey) => void;
  markDayComplete: () => void;
  addPersonalTask: (text: string) => void;
  togglePersonalTask: (taskId: string) => void;
  addComment: (body: string) => void;
  addWeeklyEntry: (entry: { wins: string; struggles: string; commitments: string }) => void;
};

type AppContextValue = {
  state: AppState;
  currentUser: User | null;
  group: Group | null;
  dateKey: string;
  mission: Mission | null;
  progress: DailyProgress | null;
} & AppActions;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState());

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const dateKey = useMemo(() => getDateKey(new Date()), []);

  const currentUser = useMemo(() => getCurrentUser(state), [state]);
  const group = useMemo(
    () => (currentUser ? getGroupForUser(state, currentUser) : null),
    [state, currentUser]
  );
  const mission = useMemo(() => {
    if (!group) return null;
    return getMissionForGroupAndDate(state, group.id, dateKey);
  }, [state, group, dateKey]);

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

    function signUp(args: { name: string; role: Role; groupCode?: string; groupName?: string }) {
      const name = args.name.trim();
      if (!name) {
        throw new Error("Name is required.");
      }

      const groupCode = (args.groupCode ?? "").trim();
      const groupName = (args.groupName ?? "").trim();

      setState((prev) => {
        let nextGroups = [...prev.groups];
        let nextUsers = [...prev.users];

        let group: Group | undefined;
        if (groupCode) {
          group = nextGroups.find((g) => g.code.toLowerCase() === groupCode.toLowerCase());
          if (!group) {
            throw new Error("Group code not found.");
          }
        } else {
          const newGroup: Group = {
            id: helpers.id("group"),
            name: groupName || "New Brotherhood",
            code: Math.random().toString(36).slice(2, 8).toUpperCase(),
            leaderUserId: "pending"
          };
          nextGroups = [newGroup, ...nextGroups];
          group = newGroup;
        }

        const user: User = {
          id: helpers.id("user"),
          name,
          role: args.role,
          groupId: group.id,
          streak: 0
        };
        nextUsers = [user, ...nextUsers];

        if (!groupCode && args.role === "leader") {
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

    function setTodayMission(m: Omit<Mission, "dateKey" | "setByUserId">) {
      setState((prev) => {
        const user = getCurrentUser(prev);
        if (!user) return prev;
        const g = getGroupForUser(prev, user);
        if (!g) return prev;
        if (user.role !== "leader" && g.leaderUserId !== user.id) return prev;

        const existing = getMissionForGroupAndDate(prev, g.id, dateKey);
        const nextMission: Mission = {
          dateKey,
          spiritual: m.spiritual,
          physical: m.physical,
          leadership: m.leadership,
          setByUserId: user.id
        };

        const list = prev.missionsByGroup[g.id] ?? [];
        const nextList = existing
          ? list.map((x) => (x.dateKey === dateKey ? nextMission : x))
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

    return {
      setCurrentUserId,
      signUp,
      setTodayMission,
      toggleChallenge,
      markDayComplete,
      addPersonalTask,
      togglePersonalTask,
      addComment,
      addWeeklyEntry
    };
  }, [dateKey]);

  const value: AppContextValue = useMemo(
    () => ({
      state,
      currentUser,
      group,
      dateKey,
      mission,
      progress,
      ...actions
    }),
    [state, currentUser, group, dateKey, mission, progress, actions]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

