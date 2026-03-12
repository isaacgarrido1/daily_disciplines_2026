-- Run this in Vercel Dashboard → Storage → your Postgres → Query, or via psql.
-- Tables for Daily Disciplines: groups, weekly goals, encouragements.

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  leader_user_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_missions_group_week ON weekly_missions(group_id, week_key);
CREATE INDEX IF NOT EXISTS idx_comments_group ON comments(group_id);
