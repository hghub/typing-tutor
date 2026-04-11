-- Thumbs up/down reactions shown after typing test completion
create table if not exists session_feedback (
  id           uuid default gen_random_uuid() primary key,
  user_id      text,
  wpm          integer,
  accuracy     integer,
  difficulty   text,
  language     text,
  reaction     text check (reaction in ('up', 'down')),
  message      text,
  created_at   timestamptz default now()
);

alter table session_feedback enable row level security;

-- Anyone (including anonymous visitors) can insert their own reaction
create policy "Anyone can insert session feedback"
  on session_feedback for insert
  to anon, authenticated
  with check (true);

-- No client-side reads — only accessible via the Supabase dashboard / service role
-- (no SELECT policy = reads are denied for anon/authenticated)


-- Feedback submitted via the feedback modal (feature requests, bugs, etc.)
create table if not exists app_feedback (
  id           uuid default gen_random_uuid() primary key,
  user_id      text,
  name         text,
  type         text,
  message      text not null,
  created_at   timestamptz default now()
);

alter table app_feedback enable row level security;

-- Anyone can submit feedback
create policy "Anyone can insert app feedback"
  on app_feedback for insert
  to anon, authenticated
  with check (true);

-- No client-side reads
