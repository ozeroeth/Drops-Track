-- DropTrack initial schema
--
-- Design notes:
--   * Primary keys are UUIDs auto-generated via gen_random_uuid(). The client
--     generates non-UUID string ids (e.g. seed-wallet-1, id-<ts>-<rand>) for
--     local bookkeeping; the mapper strips those before insert so Postgres
--     assigns a real UUID and the server value is echoed back to the UI.
--   * `wallet_id` on airdrops / whitelists is a plain text column, NOT a
--     real foreign key. This keeps CSV imports with seed-wallet-* ids working
--     unchanged, and matches the existing camelCase `walletId` client shape.
--     Referential integrity is enforced on the client, not the DB.
--   * Dates are stored as `date` so they round-trip cleanly with the UI's
--     YYYY-MM-DD strings produced by utils/date.js.
--   * `custom_network` is reserved for a future flow that stores the raw
--     user-typed label separately from the network id. Today the client
--     stores custom network labels directly in `network`, so this column
--     stays null until the UI is updated.
--   * RLS is enabled on every table and each operation (select/insert/
--     update/delete) is gated on auth.uid() = user_id. user_settings uses
--     its user_id primary key as the tenant key.

create extension if not exists pgcrypto;

-- airdrops -------------------------------------------------------------------

create table if not exists airdrops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  network text,
  custom_network text,
  status text,
  deadline date,
  estimated_value numeric,
  wallet_id text,
  tasks jsonb not null default '[]'::jsonb,
  notes text,
  link text,
  logo_url text,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table airdrops enable row level security;

create policy "airdrops_select_own" on airdrops
  for select using (auth.uid() = user_id);
create policy "airdrops_insert_own" on airdrops
  for insert with check (auth.uid() = user_id);
create policy "airdrops_update_own" on airdrops
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "airdrops_delete_own" on airdrops
  for delete using (auth.uid() = user_id);

create index if not exists airdrops_user_deadline_idx on airdrops (user_id, deadline);

-- whitelists -----------------------------------------------------------------

create table if not exists whitelists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  type text,
  status text,
  application_deadline date,
  mint_date date,
  wallet_id text,
  mint_price text,
  notes text,
  link text,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table whitelists enable row level security;

create policy "whitelists_select_own" on whitelists
  for select using (auth.uid() = user_id);
create policy "whitelists_insert_own" on whitelists
  for insert with check (auth.uid() = user_id);
create policy "whitelists_update_own" on whitelists
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "whitelists_delete_own" on whitelists
  for delete using (auth.uid() = user_id);

create index if not exists whitelists_user_apply_idx on whitelists (user_id, application_deadline);
create index if not exists whitelists_user_mint_idx on whitelists (user_id, mint_date);

-- wallets --------------------------------------------------------------------

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  address text not null default '',
  network_type text,
  created_at timestamptz not null default now()
);

alter table wallets enable row level security;

create policy "wallets_select_own" on wallets
  for select using (auth.uid() = user_id);
create policy "wallets_insert_own" on wallets
  for insert with check (auth.uid() = user_id);
create policy "wallets_update_own" on wallets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wallets_delete_own" on wallets
  for delete using (auth.uid() = user_id);

create index if not exists wallets_user_idx on wallets (user_id);

-- user_settings --------------------------------------------------------------

create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  telegram_chat_id text,
  telegram_notify_days_before int not null default 3
    check (telegram_notify_days_before in (1,2,3,5,7)),
  notify_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table user_settings enable row level security;

create policy "user_settings_select_own" on user_settings
  for select using (auth.uid() = user_id);
create policy "user_settings_insert_own" on user_settings
  for insert with check (auth.uid() = user_id);
create policy "user_settings_update_own" on user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_settings_delete_own" on user_settings
  for delete using (auth.uid() = user_id);
