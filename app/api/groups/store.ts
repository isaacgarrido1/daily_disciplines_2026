// Shared in-memory store for groups
export interface GroupEntry {
  id: string;
  name: string;
  code: string;
}

const STORE_KEY = "__daily_disciplines_groups_store__";

export function getStore(): Map<string, GroupEntry> {
  const g = globalThis as any;

  if (g[STORE_KEY]) {
    return g[STORE_KEY];
  }

  const m = new Map<string, GroupEntry>();
  g[STORE_KEY] = m;
  return m;
}