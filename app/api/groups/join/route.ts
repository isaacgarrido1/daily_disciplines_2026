import { NextRequest, NextResponse } from "next/server";

type Group = {
  id: string;
  name: string;
  code: string;
};

const STORE_KEY = "__daily_disciplines_groups_store__";

function getStore(): Map<string, Group> {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, Group>;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, Group>();
  }

  return g[STORE_KEY]!;
}

/** GET ?code=XXX - Look up group by code for joining. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();

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