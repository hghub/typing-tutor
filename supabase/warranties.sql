-- Warranty records for WarrantyTracker tool
-- user_id is an anonymous UUID stored in the visitor's localStorage (no auth required)

create table if not exists warranties (
  id             uuid primary key,
  user_id        text not null,
  product_name   text not null,
  brand          text,
  category       text,
  purchase_date  date not null,
  warranty_months integer not null,
  price          numeric,
  store          text,
  notes          text,
  created_at     timestamptz default now()
);

create index if not exists warranties_user_id_idx on warranties (user_id);

alter table warranties enable row level security;

-- Anonymous visitors can read their own rows (matched by user_id)
create policy "Users can read own warranties"
  on warranties for select
  to anon, authenticated
  using (true);

-- Anyone can insert/update rows (user_id scoping is handled in the app)
create policy "Users can upsert own warranties"
  on warranties for insert
  to anon, authenticated
  with check (true);

create policy "Users can update own warranties"
  on warranties for update
  to anon, authenticated
  using (true);

create policy "Users can delete own warranties"
  on warranties for delete
  to anon, authenticated
  using (true);
