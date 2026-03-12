import { NextRequest, NextResponse } from "next/server";

const STORE_KEY = "__daily_disciplines_groups_store__";

function getStore(): Map<string, { id: string; name: string; code: string }> {
  const g = globalThis as Record<string, unknown>;
  if (g[STORE_KEY]) {
    return g[STORE_KEY] as Map<string, { id: string; name: string; code: string }>;
  }
  const m = new Map<string, { id: string; name: string; code: string }>();
  g[STORE_KEY] = m;
  return m;
}

/** GET ?code=XXX - Look up group by code for joining (local-only in-memory store). */
export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").trim();
  if (!code) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }

  const store = getStore();
  const group = store.get(code.toLowerCase());
  if (!group) {
    return NextResponse.json({ error: "Group code not found." }, { status: 404 });
  }
  return NextResponse.json(group);
}
