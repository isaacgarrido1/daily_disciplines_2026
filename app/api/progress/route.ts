import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql, hasDatabase, isMissingTableError } from "@/lib/db";
import { getDateKey } from "@/lib/appState";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/** POST - mark a member's day complete and bump streak in the shared DB. */
export async function POST(request: NextRequest) {
  if (!hasDatabase()) {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json().catch(() => null)) as
    | { groupId?: string; name?: string; dateKey?: string }
    | null;

  if (!body?.groupId || !body.name) {
    return NextResponse.json(
      { error: "groupId and name are required." },
      { status: 400 }
    );
  }

  const groupId = body.groupId.trim();
  const name = body.name.trim();
  const dateKey = (body.dateKey ?? getDateKey(new Date())).trim();

  try {
    await ensureSchema();
    const sql = getSql();

    // Ensure member exists (idempotent per group + name).
    const memberRows = (await sql`
      INSERT INTO group_members (id, group_id, name, role)
      VALUES (${makeId("member")}, ${groupId}, ${name}, 'member')
      ON CONFLICT (group_id, name)
      DO UPDATE SET name = EXCLUDED.name
      RETURNING id, streak
    `) as { id: string; streak: number }[];

    const member = memberRows[0];

    // Check existing progress for the date.
    const existing = (await sql`
      SELECT id, day_complete
      FROM daily_progress
      WHERE member_id = ${member.id} AND date_key = ${dateKey}
      LIMIT 1
    `) as { id: string; day_complete: boolean }[];

    if (existing[0]?.day_complete) {
      // Already complete; don't double-count streak.
      return NextResponse.json({ ok: true, streak: member.streak });
    }

    // Upsert today's progress as complete.
    await sql`
      INSERT INTO daily_progress (id, member_id, group_id, date_key, day_complete)
      VALUES (${makeId("progress")}, ${member.id}, ${groupId}, ${dateKey}, true)
      ON CONFLICT (member_id, date_key)
      DO UPDATE SET day_complete = EXCLUDED.day_complete
    `;

    // Increment streak.
    const updated = (await sql`
      UPDATE group_members
      SET streak = streak + 1
      WHERE id = ${member.id}
      RETURNING streak
    `) as { streak: number }[];

    return NextResponse.json({ ok: true, streak: updated[0].streak });
  } catch (err) {
    console.error("POST /api/progress", err);
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "Database schema is not ready." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to mark day complete." }, { status: 500 });
  }
}

