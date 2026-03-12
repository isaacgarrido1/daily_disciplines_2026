import { NextRequest, NextResponse } from "next/server";
import { hasDatabase, getSql, isMissingTableError } from "@/lib/db";
import { getStore } from "../store";

const SCHEMA_HINT =
  "Database tables are missing. In Vercel: Storage → your Postgres → Query → run scripts/schema.sql, then redeploy.";

/** GET ?code=XXX - Look up group by code for joining. Uses Neon when DATABASE_URL is set. */
export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") ?? "").trim();
  if (!code) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }

  if (hasDatabase()) {
    try {
      const sql = getSql();
      const rows = await sql`
        SELECT id, name, code FROM groups WHERE LOWER(code) = ${code.toLowerCase()} LIMIT 1
      `;
      if (rows.length === 0) {
        return NextResponse.json(
          {
            error: "Group code not found.",
            hint: "Create the group on this site first (as leader), then use that code here. Groups created only on your computer are not on the live site."
          },
          { status: 404 }
        );
      }
      const row = rows[0] as { id: string; name: string; code: string };
      return NextResponse.json({ id: row.id, name: row.name, code: row.code });
    } catch (err) {
      console.error("GET /api/groups/join", err);
      if (isMissingTableError(err)) {
        return NextResponse.json({ error: SCHEMA_HINT }, { status: 503 });
      }
      return NextResponse.json(
        { error: "Failed to look up group. Check the database is set up." },
        { status: 500 }
      );
    }
  }

  const store = getStore();
  const group = store.get(code.toLowerCase());
  if (!group) {
    return NextResponse.json({ error: "Group code not found." }, { status: 404 });
  }
  return NextResponse.json(group);
}
