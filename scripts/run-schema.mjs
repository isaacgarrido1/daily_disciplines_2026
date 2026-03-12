#!/usr/bin/env node
/**
 * Creates database tables using DATABASE_URL or POSTGRES_URL from .env.local.
 * Run from project root: node scripts/run-schema.mjs
 */
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { neon } from "@neondatabase/serverless";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env.local");

if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("No DATABASE_URL or POSTGRES_URL in .env.local. Add your Neon connection string there.");
  process.exit(1);
}

const sql = neon(url);

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      leader_user_id TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log("Created table: groups");

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
  console.log("Created table: weekly_missions");

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
  console.log("Created table: comments");

  await sql`CREATE INDEX IF NOT EXISTS idx_weekly_missions_group_week ON weekly_missions(group_id, week_key)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_comments_group ON comments(group_id)`;
  console.log("Created indexes.");

  console.log("Schema applied. Tables: groups, weekly_missions, comments.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
