import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

export function hasDatabase(): boolean {
  return Boolean(connectionString);
}

export function getSql() {
  if (!connectionString) {
    throw new Error("DATABASE_URL (or POSTGRES_URL) is not set");
  }
  return neon(connectionString);
}

/** Detect Postgres "table does not exist" so we can return an actionable error. */
export function isMissingTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /relation "groups" does not exist|relation .groups. does not exist/i.test(msg);
}

let schemaPromise: Promise<void> | null = null;

/** Create tables if they don't exist. Safe to call on every request; runs once per process. */
export async function ensureSchema(): Promise<void> {
  if (!connectionString) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = neon(connectionString!);
      await sql`
        CREATE TABLE IF NOT EXISTS groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          code TEXT NOT NULL UNIQUE,
          leader_user_id TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS weekly_missions (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          week_key TEXT NOT NULL,
          spiritual TEXT NOT NULL DEFAULT '',
          physical TEXT NOT NULL DEFAULT '',
          leadership TEXT NOT NULL DEFAULT '',
          set_by_user_id TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(group_id, week_key)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          author_user_id TEXT NOT NULL,
          author_name TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_weekly_missions_group_week ON weekly_missions(group_id, week_key)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_comments_group ON comments(group_id)`;
      await sql`
        CREATE TABLE IF NOT EXISTS group_members (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          streak INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE (group_id, name)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS daily_progress (
          id TEXT PRIMARY KEY,
          member_id TEXT NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
          group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
          date_key TEXT NOT NULL,
          day_complete BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE (member_id, date_key)
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_daily_progress_group_date ON daily_progress(group_id, date_key)`;
    })();
  }
  await schemaPromise;
}
