import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getSql, hasDatabase, isMissingTableError } from "@/lib/db";
import { getDateKey } from "@/lib/appState";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/** GET ?groupId=...&dateKey=... - list members and today completion status for a group. */
export async function GET(request: NextRequest) {
  if (!hasDatabase()) {
    return NextResponse.json({ members: [] });
  }

  const groupId = (request.nextUrl.searchParams.get("groupId") ?? "").trim();
  const dateKeyParam = (request.nextUrl.searchParams.get("dateKey") ?? "").trim();
  const dateKey = dateKeyParam || getDateKey(new Date());

  if (!groupId) {
    return NextResponse.json({ error: "groupId is required." }, { status: 400 });
  }

  try {
    await ensureSchema();
    const sql = getSql();

    const members = await sql<{
      id: string;
      name: string;
      role: string;
      streak: number;
    }[]>`
      SELECT id, name, role, streak
      FROM group_members
      WHERE group_id = ${groupId}
      ORDER BY created_at ASC
    `;

    if (members.length === 0) {
      return NextResponse.json({ members: [] });
    }

    const memberIds = members.map((m) => m.id);

    const progressRows = await sql<{
      member_id: string;
      day_complete: boolean;
    }[]>`
      SELECT member_id, day_complete
      FROM daily_progress
      WHERE group_id = ${groupId} AND date_key = ${dateKey} AND member_id IN ${sql(memberIds)}
    `;

    const completeByMember = new Map<string, boolean>();
    for (const row of progressRows) {
      completeByMember.set(row.member_id, row.day_complete);
    }

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        streak: m.streak,
        todayComplete: completeByMember.get(m.id) ?? false
      }))
    });
  } catch (err) {
    console.error("GET /api/group-members", err);
    if (isMissingTableError(err)) {
      return NextResponse.json({ members: [] });
    }
    return NextResponse.json({ error: "Failed to load group members." }, { status: 500 });
  }
}

/** POST - ensure a group member exists (idempotent per group+name). */
export async function POST(request: NextRequest) {
  if (!hasDatabase()) {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json().catch(() => null)) as
    | { groupId?: string; name?: string; role?: string }
    | null;

  if (!body?.groupId || !body.name || !body.role) {
    return NextResponse.json(
      { error: "groupId, name, and role are required." },
      { status: 400 }
    );
  }

  try {
    await ensureSchema();
    const sql = getSql();

    const rows = await sql<{
      id: string;
      name: string;
      role: string;
      streak: number;
    }[]>`
      INSERT INTO group_members (id, group_id, name, role)
      VALUES (${makeId("member")}, ${body.groupId}, ${body.name}, ${body.role})
      ON CONFLICT (group_id, name)
      DO UPDATE SET role = EXCLUDED.role
      RETURNING id, name, role, streak
    `;

    const member = rows[0];

    return NextResponse.json({
      member: {
        id: member.id,
        name: member.name,
        role: member.role,
        streak: member.streak
      }
    });
  } catch (err) {
    console.error("POST /api/group-members", err);
    if (isMissingTableError(err)) {
      return NextResponse.json({ error: "Database schema is not ready." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to save group member." }, { status: 500 });
  }
}

