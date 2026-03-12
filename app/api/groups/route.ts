import { NextRequest, NextResponse } from "next/server";
import { hasDatabase, getSql, isMissingTableError, ensureSchema } from "@/lib/db";
import { getStore } from "./store";

const SCHEMA_HINT =
  "Database tables are missing. From your project folder run: node scripts/run-schema.mjs (with DATABASE_URL in .env.local). Or in Neon: console.neon.tech → your project → SQL Editor → paste and run scripts/schema.sql.";

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function generateId(): string {
  return `group_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * POST: Create a new group (leader).
 * Uses Neon when DATABASE_URL is set; otherwise in-memory (single instance).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = (body?.name ?? "").trim() || "New Small Group";
    const id = generateId();

    if (hasDatabase()) {
      await ensureSchema();
      const sql = getSql();
      let code = generateCode();
      for (let attempts = 0; attempts < 20; attempts++) {
        const existing = await sql`SELECT 1 FROM groups WHERE LOWER(code) = ${code.toLowerCase()} LIMIT 1`;
        if (existing.length === 0) {
          await sql`INSERT INTO groups (id, name, code, leader_user_id) VALUES (${id}, ${name}, ${code}, '')`;
          return NextResponse.json({ id, name, code });
        }
        code = generateCode();
      }
      return NextResponse.json(
        { error: "Could not generate unique code. Try again." },
        { status: 500 },
      );
    }

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
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: SCHEMA_HINT }, { status: 503 });
    }
    return NextResponse.json(
      { error: "Failed to create group. Check the database is set up." },
      { status: 500 },
    );
  }
}
