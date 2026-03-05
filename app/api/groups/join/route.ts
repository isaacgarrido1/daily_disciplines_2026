type Group = { id: string; name: string; code: string };
const STORE_KEY = "__daily_disciplines_groups_store__";

function getStore(): Map<string, Group> {
  // Tell TypeScript that globalThis *may* have our store key
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, Group>;
  };

  // Initialize store if missing
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, Group>();
  }

  return g[STORE_KEY]!; // definitely exists now
}