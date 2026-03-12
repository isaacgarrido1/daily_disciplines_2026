import { NextRequest, NextResponse } from "next/server";
import { getStore } from "./store";

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateId(): string {
  return `group_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * POST: Create a new group (leader).
 * Local-only: stores groups in memory on this server instance.
 */
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
      { status: 500 },
    );
  }
}
