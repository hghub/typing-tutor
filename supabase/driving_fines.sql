-- Driving fine (chalan) records for DrivingFineTracker tool
-- user_id is an anonymous UUID stored in the visitor's localStorage (no auth required)

create table if not exists driving_fines (
  id             uuid primary key,
  user_id        text not null,
  date           date not null,
  violation_type text not null,
  location       text,
  fine_amount    numeric default 0,
  paid           boolean default false,
  notes          text,
  risk_points    integer default 0,
  created_at     timestamptz default now()
);

create index if not exists driving_fines_user_id_idx on driving_fines (user_id);

alter table driving_fines enable row level security;

-- Anonymous visitors can read their own rows (matched by user_id in the app)
create policy "Users can read own fines"
  on driving_fines for select
  to anon, authenticated
  using (true);

create policy "Users can insert own fines"
  on driving_fines for insert
  to anon, authenticated
  with check (true);

create policy "Users can update own fines"
  on driving_fines for update
  to anon, authenticated
  using (true);

create policy "Users can delete own fines"
  on driving_fines for delete
  to anon, authenticated
  using (true);
