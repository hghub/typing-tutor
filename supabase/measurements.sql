-- Measurement Tracker tables
-- user_id is an anonymous UUID stored in the visitor's localStorage (no auth required)

create table if not exists measurement_trackers (
  id          uuid primary key,
  user_id     text not null,
  name        text not null,
  icon        text default '📏',
  metrics     jsonb not null default '[]',
  created_at  timestamptz default now()
);

create index if not exists measurement_trackers_user_id_idx on measurement_trackers (user_id);

create table if not exists measurement_entries (
  id          uuid primary key,
  tracker_id  uuid not null,
  user_id     text not null,
  logged_at   date not null default current_date,
  values      jsonb not null default '{}',
  note        text,
  created_at  timestamptz default now()
);

create index if not exists measurement_entries_tracker_id_idx on measurement_entries (tracker_id);
create index if not exists measurement_entries_user_id_idx    on measurement_entries (user_id);

alter table measurement_trackers enable row level security;
alter table measurement_entries   enable row level security;

create policy "Users can read measurement_trackers"
  on measurement_trackers for select to anon, authenticated using (true);

create policy "Users can insert measurement_trackers"
  on measurement_trackers for insert to anon, authenticated with check (true);

create policy "Users can update measurement_trackers"
  on measurement_trackers for update to anon, authenticated using (true);

create policy "Users can delete measurement_trackers"
  on measurement_trackers for delete to anon, authenticated using (true);

create policy "Users can read measurement_entries"
  on measurement_entries for select to anon, authenticated using (true);

create policy "Users can insert measurement_entries"
  on measurement_entries for insert to anon, authenticated with check (true);

create policy "Users can update measurement_entries"
  on measurement_entries for update to anon, authenticated using (true);

create policy "Users can delete measurement_entries"
  on measurement_entries for delete to anon, authenticated using (true);
