import { NextRequest, NextResponse } from "next/server";

// In-memory store shared via globalThis. For production (e.g. Vercel multi-instance), use a persistent store (Vercel KV, Upstash Redis, or a database).
const STORE_KEY = "__daily_disciplines_groups_store__";
function getStore(): Map<string, { id: string; name: string; code: string }> {
  if (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>)[STORE_KEY]) {
    return (globalThis as Record<string, Map<string, { id: string; name: string; code: string }>>)[STORE_KEY];
  }
  const m = new Map<string, { id: string; name: string; code: string }>();
  if (typeof globalThis !== "undefined") (globalThis as Record<string, unknown>)[STORE_KEY] = m;
  return m;
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateId(): string {
  return `group_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/** POST: Create a new group (leader). Registers it so others can join by code. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body?.name ?? "").trim() || "New Small Group";
    const id = generateId();
    const store = getStore();
    let code = generateCode();
    while (store.has(code.toLowerCase())) {
      code = generateCode();
    }
    const entry = { id, name, code };
    store.set(code.toLowerCase(), entry);
    return NextResponse.json(entry);
  } catch (err) {
    console.error("POST /api/groups", err);
    return NextResponse.json(
      { error: "Failed to create group." },
      { status: 500 }
    );
  }
}
