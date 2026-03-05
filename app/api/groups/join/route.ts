import { NextRequest, NextResponse } from "next/server";

const STORE_KEY = "__daily_disciplines_groups_store__";
function getStore(): Map<string, { id: string; name: string; code: string }> {
  if (typeof globalThis !== "undefined" && (globalThis as Record<string, unknown>)[STORE_KEY]) {
    return (globalThis as unknown as Record<string, Map<string, { id: string; name: string; code: string }>>)[STORE_KEY];
  }
  const m = new Map<string, { id: string; name: string; code: string }>();
  if (typeof globalThis !== "undefined") (globalThis as Record<string, unknown>)[STORE_KEY] = m;
  return m;
}

/** GET ?code=XXX - Look up group by code for joining. */
export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").trim();
  if (!code) {
    return NextResponse.json(
      { error: "Code is required." },
      { status: 400 }
    );
  }
  const store = getStore();
  const group = store.get(code.toLowerCase());
  if (!group) {
    return NextResponse.json(
      { error: "Group code not found." },
      { status: 404 }
    );
  }
  return NextResponse.json(group);
}
