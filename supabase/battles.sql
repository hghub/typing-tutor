-- 1v1 Live Battle rooms table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS battles (
  id TEXT PRIMARY KEY,               -- 6-char room code
  passage_text TEXT NOT NULL,        -- exact passage both players type
  language TEXT NOT NULL DEFAULT 'english',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
);

-- RLS
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read battles"   ON battles FOR SELECT USING (true);
CREATE POLICY "Public insert battles" ON battles FOR INSERT WITH CHECK (true);

-- Also enable Realtime for the battles table (run in Supabase dashboard:
-- Database → Replication → supabase_realtime → Add table: battles)
-- Note: channel-based Broadcast/Presence works without table replication
