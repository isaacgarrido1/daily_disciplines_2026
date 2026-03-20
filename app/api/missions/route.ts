import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

const supabase = createPublicClient();
import { getWeekKey } from "@/lib/appState";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/** GET ?groupId=...&weekKey=... - fetch weekly mission for a group/week from Supabase. */
export async function GET(request: NextRequest) {
  const groupId = (request.nextUrl.searchParams.get("groupId") ?? "").trim();
  let weekKey = (request.nextUrl.searchParams.get("weekKey") ?? "").trim();

  if (!groupId) {
    return NextResponse.json({ error: "groupId is required." }, { status: 400 });
  }

  if (!weekKey) {
    const today = new Date();
    weekKey = getWeekKey(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate()
      ).padStart(2, "0")}`
    );
  }

  const { data, error } = await supabase
    .from("weekly_missions")
    .select("id, group_id, week_key, spiritual, physical, leadership, set_by_user_id")
    .eq("group_id", groupId)
    .eq("week_key", weekKey)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("GET /api/missions", error);
    return NextResponse.json({ error: "Failed to load weekly mission." }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ mission: null });
  }

  return NextResponse.json({
    mission: {
      id: data.id as string,
      groupId: data.group_id as string,
      weekKey: data.week_key as string,
      spiritual: data.spiritual as string,
      physical: data.physical as string,
      leadership: data.leadership as string,
      setByUserId: data.set_by_user_id as string
    }
  });
}

/** POST - upsert weekly mission for a group/week into Supabase. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        groupId?: string;
        weekKey?: string;
        spiritual?: string;
        physical?: string;
        leadership?: string;
        setByUserId?: string;
      }
    | null;

  if (!body?.groupId || !body.weekKey) {
    return NextResponse.json(
      { error: "groupId and weekKey are required." },
      { status: 400 }
    );
  }

  const spiritual = (body.spiritual ?? "").trim();
  const physical = (body.physical ?? "").trim();
  const leadership = (body.leadership ?? "").trim();

  if (!spiritual || !physical || !leadership) {
    return NextResponse.json(
      { error: "All three goals (spiritual, physical, leadership) are required." },
      { status: 400 }
    );
  }

  const payload = {
    id: makeId("weekly"),
    group_id: body.groupId,
    week_key: body.weekKey,
    spiritual,
    physical,
    leadership,
    set_by_user_id: body.setByUserId ?? ""
  };

  const { data, error } = await supabase
    .from("weekly_missions")
    .upsert(payload, { onConflict: "group_id,week_key" })
    .select()
    .maybeSingle();

  if (error) {
    console.error("POST /api/missions", error);
    return NextResponse.json({ error: "Failed to save weekly mission." }, { status: 500 });
  }

  return NextResponse.json({
    mission: {
      id: data!.id as string,
      groupId: data!.group_id as string,
      weekKey: data!.week_key as string,
      spiritual: data!.spiritual as string,
      physical: data!.physical as string,
      leadership: data!.leadership as string,
      setByUserId: data!.set_by_user_id as string
    }
  });
}

