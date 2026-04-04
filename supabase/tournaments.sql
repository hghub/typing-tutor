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
  created_at  timestamptz DEFAULT now(),

  -- One entry per user per week (upsert-safe)
  UNIQUE (week_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read tournament entries
CREATE POLICY "Public read" ON tournaments FOR SELECT USING (true);

-- Allow anyone to insert / upsert their own entry
CREATE POLICY "Public insert" ON tournaments FOR INSERT WITH CHECK (true);

-- Allow upsert (update own entry in same week)
CREATE POLICY "Public update" ON tournaments FOR UPDATE USING (true);

-- Index for fast weekly leaderboard queries
CREATE INDEX IF NOT EXISTS idx_tournaments_week ON tournaments (week_id, wpm DESC);
