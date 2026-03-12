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
