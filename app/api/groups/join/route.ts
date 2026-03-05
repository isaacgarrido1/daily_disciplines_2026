import { NextRequest, NextResponse } from "next/server";
import { getStore } from "../store";

/** GET ?code=XXX - Look up group by code for joining. */
export async function GET(request: NextRequest) {
  try {
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
  } catch (err) {
    console.error("GET /api/groups/join", err);
    return NextResponse.json({ error: "Failed to fetch group." }, { status: 500 });
  }
}