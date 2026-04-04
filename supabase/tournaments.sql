-- Run this in your Supabase SQL editor to enable the Weekly Tournament feature
-- Go to: https://supabase.com/dashboard → your project → SQL editor → paste & run

CREATE TABLE IF NOT EXISTS tournaments (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id     text        NOT NULL,                   -- e.g. "2026-W14"
  user_id     text        NOT NULL,
  display_name text,
  wpm         integer     NOT NULL,
  accuracy    integer     NOT NULL DEFAULT 0,
  language    text        NOT NULL DEFAULT 'english',
  difficulty  text        NOT NULL DEFAULT 'easy',    -- easy/medium/hard/timer/islamic/etc
  created_at  timestamptz DEFAULT now(),

  -- One entry per user per difficulty per week
  UNIQUE (week_id, user_id, difficulty)
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tournament entries
CREATE POLICY "Public read" ON tournaments FOR SELECT USING (true);

-- Allow anyone to insert / upsert their own entry
CREATE POLICY "Public insert" ON tournaments FOR INSERT WITH CHECK (true);

-- Allow upsert (update own entry in same week + difficulty)
CREATE POLICY "Public update" ON tournaments FOR UPDATE USING (true);

-- Index for fast weekly leaderboard queries
CREATE INDEX IF NOT EXISTS idx_tournaments_week ON tournaments (week_id, wpm DESC);

-- ─────────────────────────────────────────────────────────────
-- If you already created the table, run these to migrate:
-- ─────────────────────────────────────────────────────────────
-- ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS difficulty text NOT NULL DEFAULT 'easy';
-- ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_week_id_user_id_key;
-- ALTER TABLE tournaments ADD CONSTRAINT tournaments_week_user_diff_key UNIQUE (week_id, user_id, difficulty);
