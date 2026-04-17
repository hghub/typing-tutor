-- Cloud sync tables for: Loan Manager, Voice Diary, Daily Planner, Kameti, Habit Tracker
-- user_id is an anonymous UUID stored in the visitor's localStorage (no auth required)
-- Run in: Supabase Dashboard → SQL Editor → New query

-- ── 1. LOANS (Loan Manager) ──────────────────────────────────────────────────

create table if not exists loans (
  id           text primary key,
  user_id      text not null,
  label        text,
  person       text,
  amount       numeric,
  currency     text default 'PKR',
  direction    text,           -- 'lent' | 'borrowed'
  due_date     text,
  note         text,
  payments     jsonb default '[]',
  settled      boolean default false,
  created_at   timestamptz default now()
);

create index if not exists loans_user_id_idx on loans (user_id);

alter table loans enable row level security;

create policy "Users can read own loans"   on loans for select to anon, authenticated using (true);
create policy "Users can insert own loans" on loans for insert to anon, authenticated with check (true);
create policy "Users can update own loans" on loans for update to anon, authenticated using (true);
create policy "Users can delete own loans" on loans for delete to anon, authenticated using (true);


-- ── 2. VOICE DIARY ───────────────────────────────────────────────────────────

create table if not exists voice_diary (
  id           text primary key,
  user_id      text not null,
  title        text,
  content      text,
  mood         text,
  recorded_at  timestamptz,
  created_at   timestamptz default now()
);

create index if not exists voice_diary_user_id_idx on voice_diary (user_id);

alter table voice_diary enable row level security;

create policy "Users can read own diary"   on voice_diary for select to anon, authenticated using (true);
create policy "Users can insert own diary" on voice_diary for insert to anon, authenticated with check (true);
create policy "Users can update own diary" on voice_diary for update to anon, authenticated using (true);
create policy "Users can delete own diary" on voice_diary for delete to anon, authenticated using (true);


-- ── 3. DAILY PLANNER ─────────────────────────────────────────────────────────
-- One row per user per day. tasks is a JSONB array of task objects.

create table if not exists daily_planner (
  user_id      text not null,
  date_key     text not null,   -- 'YYYY-MM-DD'
  tasks        jsonb default '[]',
  primary key (user_id, date_key)
);

alter table daily_planner enable row level security;

create policy "Users can read own planner"   on daily_planner for select to anon, authenticated using (true);
create policy "Users can insert own planner" on daily_planner for insert to anon, authenticated with check (true);
create policy "Users can update own planner" on daily_planner for update to anon, authenticated using (true);
create policy "Users can delete own planner" on daily_planner for delete to anon, authenticated using (true);


-- ── 4. KAMETI ────────────────────────────────────────────────────────────────
-- One row per user — entire kameti state stored as JSONB.

create table if not exists kameti (
  user_id      text primary key,
  state        jsonb,
  updated_at   timestamptz default now()
);

alter table kameti enable row level security;

create policy "Users can read own kameti"   on kameti for select to anon, authenticated using (true);
create policy "Users can insert own kameti" on kameti for insert to anon, authenticated with check (true);
create policy "Users can update own kameti" on kameti for update to anon, authenticated using (true);
create policy "Users can delete own kameti" on kameti for delete to anon, authenticated using (true);


-- ── 5. HABITS (Habit Tracker) ────────────────────────────────────────────────

create table if not exists habits (
  id           text not null,
  user_id      text not null,
  name         text,
  icon         text,
  color        text,
  target_days  jsonb default '[]',
  completions  jsonb default '[]',
  archived     boolean default false,
  created_at   timestamptz default now(),
  primary key (id, user_id)
);

create index if not exists habits_user_id_idx on habits (user_id);

alter table habits enable row level security;

create policy "Users can read own habits"   on habits for select to anon, authenticated using (true);
create policy "Users can insert own habits" on habits for insert to anon, authenticated with check (true);
create policy "Users can update own habits" on habits for update to anon, authenticated using (true);
create policy "Users can delete own habits" on habits for delete to anon, authenticated using (true);
