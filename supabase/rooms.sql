-- Group Challenge: rooms + room_scores tables
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,               -- 6-char code e.g. 'ABC123'
  passage_index INTEGER NOT NULL,
  language TEXT NOT NULL DEFAULT 'english',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_closed BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS room_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  wpm INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read rooms"   ON rooms FOR SELECT USING (true);
CREATE POLICY "Public insert rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update rooms" ON rooms FOR UPDATE USING (true);

CREATE POLICY "Public read room_scores"   ON room_scores FOR SELECT USING (true);
CREATE POLICY "Public insert room_scores" ON room_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update room_scores" ON room_scores FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_room_scores_room_id ON room_scores(room_id);
