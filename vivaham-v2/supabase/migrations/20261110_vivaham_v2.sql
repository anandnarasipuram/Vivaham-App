-- =====================================================================
-- VIVAHAM V2 · Supabase backend
-- Run this whole file once in: Supabase dashboard -> SQL Editor -> New query -> Run.
-- It is safe to run again (idempotent).
--
-- Everything lives in its own schema called "vivaham", so it can NOT clash with
-- the tables of the older Streamlit / React Native versions in the same project.
-- AFTER running: Project Settings -> API -> "Exposed schemas" -> add  vivaham  -> Save.
-- =====================================================================

create schema if not exists vivaham;
set search_path = vivaham, public;

-- ---------------------------------------------------------------------
-- 1. Types
-- ---------------------------------------------------------------------
do $$ begin create type vivaham.member_role as enum ('admin','family','helper');
exception when duplicate_object then null; end $$;
do $$ begin create type vivaham.rsvp_status as enum ('pending','coming','not_coming');
exception when duplicate_object then null; end $$;
do $$ begin create type vivaham.pay_status as enum ('paid','advance','not_paid');
exception when duplicate_object then null; end $$;
do $$ begin create type vivaham.pay_method as enum ('cash','upi','card','bank');
exception when duplicate_object then null; end $$;
do $$ begin create type vivaham.guest_side as enum ('bride','groom');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. Tables
--    every wedding table has: id, wedding_id, created_at, updated_at, updated_by
-- ---------------------------------------------------------------------
create table if not exists vivaham.profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  name       text not null default '',
  language   text not null default 'en' check (language in ('en','te')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists vivaham.weddings (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) > 0),
  wedding_date date,
  created_by   uuid default auth.uid(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid
);

-- the editable "total budget" (only admin + family can see it)
create table if not exists vivaham.budget_settings (
  wedding_id   uuid primary key references vivaham.weddings(id) on delete cascade,
  total_budget bigint not null default 0 check (total_budget >= 0),
  updated_at   timestamptz not null default now(),
  updated_by   uuid
);

create table if not exists vivaham.members (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete set null,   -- empty = name-only person
  name       text not null check (length(trim(name)) > 0),
  role       vivaham.member_role not null default 'family',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create unique index if not exists members_one_user_per_wedding on vivaham.members (wedding_id, user_id) where user_id is not null;
create unique index if not exists members_unique_name on vivaham.members (wedding_id, lower(name));

create table if not exists vivaham.invites (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  code       text not null unique,
  role       vivaham.member_role not null,
  created_by uuid default auth.uid(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists invites_one_active_per_role on vivaham.invites (wedding_id, role) where active;

create table if not exists vivaham.events (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  type       text not null check (length(trim(type)) > 0),        -- Mehandi, Haldi, own name ...
  event_date date,
  start_time time,
  venue_name text,
  address    text,                                                -- address or Google Maps link
  guests     integer not null default 0 check (guests >= 0),
  dress_code boolean not null default false,
  dress_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists vivaham.event_photos (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  event_id   uuid not null references vivaham.events(id) on delete cascade,
  path       text not null,                                       -- path in the "vivaham" storage bucket
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- Materials. event_id empty = "buy once, use many" item
create table if not exists vivaham.materials (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  event_id   uuid references vivaham.events(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  done       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists vivaham.vendors (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references vivaham.weddings(id) on delete cascade,
  name         text not null check (length(trim(name)) > 0),
  services     text[] not null default '{}',
  contact_name text,
  phone        text,
  on_whatsapp  boolean not null default true,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid
);

create table if not exists vivaham.vendor_events (
  vendor_id  uuid not null references vivaham.vendors(id) on delete cascade,
  event_id   uuid not null references vivaham.events(id) on delete cascade,
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (vendor_id, event_id)
);

-- custom shopping categories (Clothes, Shoes, Jewellery, Accessories are built in)
create table if not exists vivaham.categories (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create unique index if not exists categories_unique_name on vivaham.categories (wedding_id, lower(name));

create table if not exists vivaham.shopping_items (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  category   text not null default 'Clothes',
  event_id   uuid references vivaham.events(id) on delete set null,   -- empty = General
  bought     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists vivaham.item_people (
  item_id    uuid not null references vivaham.shopping_items(id) on delete cascade,
  member_id  uuid not null references vivaham.members(id) on delete cascade,
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, member_id)
);

create table if not exists vivaham.stays (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  address    text,
  maps_link  text,
  check_in   date,
  check_out  date,
  rooms      integer not null default 1 check (rooms >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  check (check_in is null or check_out is null or check_out >= check_in)
);

create table if not exists vivaham.stay_guests (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  stay_id    uuid not null references vivaham.stays(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);
create unique index if not exists stay_guests_unique on vivaham.stay_guests (stay_id, lower(name));

create table if not exists vivaham.guests (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  name       text not null check (length(trim(name)) > 0),
  phone      text,
  side       vivaham.guest_side not null default 'groom',
  people     integer not null default 1 check (people >= 1),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists vivaham.guest_events (
  guest_id   uuid not null references vivaham.guests(id) on delete cascade,
  event_id   uuid not null references vivaham.events(id) on delete cascade,
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  rsvp       vivaham.rsvp_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid,
  primary key (guest_id, event_id)
);

create table if not exists vivaham.meals (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  event_id   uuid not null references vivaham.events(id) on delete cascade,
  meal       text not null check (length(trim(meal)) > 0),          -- Breakfast, Lunch, own name ...
  meal_time  time,
  dishes     text[] not null default '{}',
  guests     integer not null default 0 check (guests >= 0),
  diet_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists vivaham.tasks (
  id         uuid primary key default gen_random_uuid(),
  wedding_id uuid not null references vivaham.weddings(id) on delete cascade,
  title      text not null check (length(trim(title)) > 0),
  member_id  uuid references vivaham.members(id) on delete set null,
  event_id   uuid references vivaham.events(id) on delete set null,
  deadline   date,
  done       boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table if not exists vivaham.vehicles (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references vivaham.weddings(id) on delete cascade,
  name         text not null check (length(trim(name)) > 0),
  number       text,
  seats        integer not null default 4 check (seats >= 1),
  driver_name  text,
  driver_phone text,
  from_date    date,
  to_date      date,
  from_time    time,
  until_time   time,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid,
  check (from_date is null or to_date is null or to_date >= from_date)
);

-- Price of a booking. One row per priced thing (shopping item, stay, meal, vehicle, vendor).
-- Kept in its own table so the server can hide prices from helpers.
create table if not exists vivaham.prices (
  id             uuid primary key default gen_random_uuid(),
  wedding_id     uuid not null references vivaham.weddings(id) on delete cascade,
  source_type    text not null check (source_type in ('shopping','stay','meal','vehicle','vendor')),
  source_id      uuid not null,
  price          bigint not null check (price >= 0),
  payment_status vivaham.pay_status not null default 'not_paid',   -- kept up to date by the server
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  updated_by     uuid,
  unique (source_type, source_id)
);

-- Money that has actually been paid.
--   origin 'booking' = created from the price block of another list (edit it there)
--   origin 'budget'  = added on the Budget screen (edit / delete it there)
create table if not exists vivaham.payments (
  id           uuid primary key default gen_random_uuid(),
  wedding_id   uuid not null references vivaham.weddings(id) on delete cascade,
  title        text not null check (length(trim(title)) > 0),
  category     text not null default 'Other' check (category in ('Shopping','Stays','Food','Transport','Vendors','Other')),
  amount       bigint not null check (amount >= 0),
  total_price  bigint check (total_price is null or total_price >= 0),   -- for "part / advance" payments added in Budget
  paid_on      date not null default current_date,
  paid_by      uuid references vivaham.members(id) on delete set null,
  method       vivaham.pay_method not null default 'upi',
  event_id     uuid references vivaham.events(id) on delete set null,   -- empty = whole wedding
  note         text,
  receipt_path text,
  source_type  text check (source_type is null or source_type in ('shopping','stay','meal','vehicle','vendor','payment')),
  source_id    uuid,
  origin       text not null default 'budget' check (origin in ('budget','booking')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  updated_by   uuid
);

-- helpful indexes
do $$
declare t text;
begin
  foreach t in array array['members','invites','events','event_photos','materials','vendors','vendor_events','categories',
    'shopping_items','item_people','stays','stay_guests','guests','guest_events','meals','tasks','vehicles','prices','payments']
  loop
    execute format('create index if not exists %I on vivaham.%I (wedding_id)', t || '_wedding_idx', t);
  end loop;
end $$;
create index if not exists payments_source_idx on vivaham.payments (source_type, source_id);
create index if not exists payments_event_idx  on vivaham.payments (event_id);
create index if not exists materials_event_idx on vivaham.materials (event_id);
create index if not exists meals_event_idx     on vivaham.meals (event_id);
create index if not exists guest_events_event_idx on vivaham.guest_events (event_id);
create index if not exists tasks_event_idx     on vivaham.tasks (event_id);
create index if not exists tasks_member_idx    on vivaham.tasks (member_id);
create index if not exists members_user_idx    on vivaham.members (user_id);

-- ---------------------------------------------------------------------
-- 3. Who is who (used by every security rule)
-- ---------------------------------------------------------------------
create or replace function vivaham.my_role(w uuid) returns vivaham.member_role
language sql stable security definer set search_path = vivaham, public as $$
  select role from vivaham.members where wedding_id = w and user_id = auth.uid() limit 1
$$;
create or replace function vivaham.is_member(w uuid) returns boolean
language sql stable security definer set search_path = vivaham, public as $$
  select exists (select 1 from vivaham.members where wedding_id = w and user_id = auth.uid())
$$;
create or replace function vivaham.can_edit(w uuid) returns boolean   -- admin or family
language sql stable security definer set search_path = vivaham, public as $$
  select exists (select 1 from vivaham.members where wedding_id = w and user_id = auth.uid() and role in ('admin','family'))
$$;
create or replace function vivaham.is_admin(w uuid) returns boolean
language sql stable security definer set search_path = vivaham, public as $$
  select exists (select 1 from vivaham.members where wedding_id = w and user_id = auth.uid() and role = 'admin')
$$;

-- ---------------------------------------------------------------------
-- 4. Triggers: timestamps, rules, price status, clean-up
-- ---------------------------------------------------------------------
create or replace function vivaham.touch() returns trigger
language plpgsql set search_path = vivaham, public as $$
begin
  new.updated_at := now();
  begin new.updated_by := auth.uid(); exception when others then null; end;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','weddings','budget_settings','members','events','event_photos','materials','vendors','categories',
    'shopping_items','stays','stay_guests','guests','guest_events','meals','tasks','vehicles','prices','payments']
  loop
    execute format('drop trigger if exists touch_%1$s on vivaham.%1$I', t);
    execute format('create trigger touch_%1$s before update on vivaham.%1$I for each row execute function vivaham.touch()', t);
  end loop;
end $$;

-- A new sign-up gets a profile (name comes from sign-up form)
create or replace function vivaham.handle_new_user() returns trigger
language plpgsql security definer set search_path = vivaham, public as $$
begin
  insert into vivaham.profiles (user_id, name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists vivaham_on_auth_user_created on auth.users;
create trigger vivaham_on_auth_user_created after insert on auth.users
  for each row execute function vivaham.handle_new_user();

-- Backfill profiles for people who signed up before this file was run
insert into vivaham.profiles (user_id, name)
select u.id, coalesce(nullif(trim(u.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(u.email, ''), '@', 1))
from auth.users u on conflict (user_id) do nothing;

-- A wedding must always keep at least one admin
create or replace function vivaham.guard_last_admin() returns trigger
language plpgsql security definer set search_path = vivaham, public as $$
begin
  if old.role = 'admin' and (tg_op = 'DELETE' or new.role <> 'admin') then
    if exists (select 1 from vivaham.weddings w where w.id = old.wedding_id)
       and not exists (select 1 from vivaham.members m where m.wedding_id = old.wedding_id and m.role = 'admin' and m.id <> old.id) then
      raise exception 'A wedding must keep at least one admin.' using errcode = 'P0001';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
drop trigger if exists members_guard_last_admin on vivaham.members;
create trigger members_guard_last_admin before update of role or delete on vivaham.members
  for each row execute function vivaham.guard_last_admin();

-- Helpers may only tick things off (the "done" column), nothing else
create or replace function vivaham.helper_tick_only() returns trigger
language plpgsql security definer set search_path = vivaham, public as $$
begin
  if vivaham.my_role(old.wedding_id) = 'helper' then
    if (to_jsonb(new) - 'done' - 'updated_at' - 'updated_by') is distinct from (to_jsonb(old) - 'done' - 'updated_at' - 'updated_by') then
      raise exception 'Helpers can only tick things off.' using errcode = '42501';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists tasks_helper_tick on vivaham.tasks;
create trigger tasks_helper_tick before update on vivaham.tasks for each row execute function vivaham.helper_tick_only();
drop trigger if exists materials_helper_tick on vivaham.materials;
create trigger materials_helper_tick before update on vivaham.materials for each row execute function vivaham.helper_tick_only();

-- Keep prices.payment_status in step with the payments (paid / advance / not_paid)
create or replace function vivaham.refresh_price(p_type text, p_id uuid) returns void
language plpgsql security definer set search_path = vivaham, public as $$
declare v_price bigint; v_paid bigint;
begin
  if p_type is null or p_id is null then return; end if;
  select price into v_price from vivaham.prices where source_type = p_type and source_id = p_id;
  if not found then return; end if;
  select coalesce(sum(amount), 0) into v_paid from vivaham.payments where source_type = p_type and source_id = p_id;
  update vivaham.prices set payment_status = (case
      when v_paid = 0 then 'not_paid'
      when v_price > 0 and v_paid >= v_price then 'paid'
      else 'advance' end)::vivaham.pay_status
  where source_type = p_type and source_id = p_id;
end $$;

create or replace function vivaham.payments_after() returns trigger
language plpgsql security definer set search_path = vivaham, public as $$
begin
  if tg_op in ('UPDATE','DELETE') then perform vivaham.refresh_price(old.source_type, old.source_id); end if;
  if tg_op in ('INSERT','UPDATE') then perform vivaham.refresh_price(new.source_type, new.source_id); end if;
  if tg_op = 'DELETE' then
    -- later parts of a custom booking lose their link when the first payment goes
    update vivaham.payments set source_type = null, source_id = null where source_type = 'payment' and source_id = old.id;
    return old;
  end if;
  return new;
end $$;
drop trigger if exists payments_status on vivaham.payments;
create trigger payments_status after insert or update or delete on vivaham.payments
  for each row execute function vivaham.payments_after();

create or replace function vivaham.prices_after() returns trigger
language plpgsql security definer set search_path = vivaham, public as $$
begin
  perform vivaham.refresh_price(new.source_type, new.source_id);
  return new;
end $$;
drop trigger if exists prices_status on vivaham.prices;
create trigger prices_status after insert or update of price on vivaham.prices
  for each row execute function vivaham.prices_after();

-- When a priced thing is deleted, its price and its booking payments go too
create or replace function vivaham.cleanup_source() returns trigger
language plpgsql security definer set search_path = vivaham, public as $$
begin
  delete from vivaham.prices   where source_type = tg_argv[0] and source_id = old.id;
  delete from vivaham.payments where source_type = tg_argv[0] and source_id = old.id and origin = 'booking';
  update vivaham.payments set source_type = null, source_id = null where source_type = tg_argv[0] and source_id = old.id;
  return old;
end $$;
drop trigger if exists cleanup_shopping on vivaham.shopping_items;
create trigger cleanup_shopping after delete on vivaham.shopping_items for each row execute function vivaham.cleanup_source('shopping');
drop trigger if exists cleanup_stay on vivaham.stays;
create trigger cleanup_stay after delete on vivaham.stays for each row execute function vivaham.cleanup_source('stay');
drop trigger if exists cleanup_meal on vivaham.meals;
create trigger cleanup_meal after delete on vivaham.meals for each row execute function vivaham.cleanup_source('meal');
drop trigger if exists cleanup_vehicle on vivaham.vehicles;
create trigger cleanup_vehicle after delete on vivaham.vehicles for each row execute function vivaham.cleanup_source('vehicle');
drop trigger if exists cleanup_vendor on vivaham.vendors;
create trigger cleanup_vendor after delete on vivaham.vendors for each row execute function vivaham.cleanup_source('vendor');

-- ---------------------------------------------------------------------
-- 5. Row-level security  (roles: admin / family / helper)
-- ---------------------------------------------------------------------
alter table vivaham.profiles        enable row level security;
alter table vivaham.weddings        enable row level security;
alter table vivaham.budget_settings enable row level security;
alter table vivaham.members         enable row level security;
alter table vivaham.invites         enable row level security;
alter table vivaham.tasks           enable row level security;
alter table vivaham.materials       enable row level security;
alter table vivaham.prices          enable row level security;
alter table vivaham.payments        enable row level security;

-- profiles: your own only
drop policy if exists profiles_select on vivaham.profiles;
create policy profiles_select on vivaham.profiles for select to authenticated using (user_id = auth.uid());
drop policy if exists profiles_insert on vivaham.profiles;
create policy profiles_insert on vivaham.profiles for insert to authenticated with check (user_id = auth.uid());
drop policy if exists profiles_update on vivaham.profiles;
create policy profiles_update on vivaham.profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- weddings: members see it, only admin changes name/date. Creating goes through create_wedding().
drop policy if exists weddings_select on vivaham.weddings;
create policy weddings_select on vivaham.weddings for select to authenticated using (vivaham.is_member(id));
drop policy if exists weddings_update on vivaham.weddings;
create policy weddings_update on vivaham.weddings for update to authenticated using (vivaham.is_admin(id)) with check (vivaham.is_admin(id));
drop policy if exists weddings_delete on vivaham.weddings;
create policy weddings_delete on vivaham.weddings for delete to authenticated using (vivaham.is_admin(id));

-- budget total: admin + family
drop policy if exists budget_settings_all on vivaham.budget_settings;
create policy budget_settings_all on vivaham.budget_settings for all to authenticated
  using (vivaham.can_edit(wedding_id)) with check (vivaham.can_edit(wedding_id));

-- members: everyone in the wedding sees the list; admin + family add NAMES (no login);
-- only admin changes roles / removes people. Real accounts are linked by accept_invite().
drop policy if exists members_select on vivaham.members;
create policy members_select on vivaham.members for select to authenticated using (vivaham.is_member(wedding_id));
drop policy if exists members_insert on vivaham.members;
create policy members_insert on vivaham.members for insert to authenticated
  with check (vivaham.can_edit(wedding_id) and user_id is null and (role <> 'admin' or vivaham.is_admin(wedding_id)));
drop policy if exists members_update on vivaham.members;
create policy members_update on vivaham.members for update to authenticated
  using (vivaham.is_admin(wedding_id)) with check (vivaham.is_admin(wedding_id));
drop policy if exists members_delete on vivaham.members;
create policy members_delete on vivaham.members for delete to authenticated using (vivaham.is_admin(wedding_id));

-- invites: admin only (codes are handed out by get_invite()/rotate)
drop policy if exists invites_all on vivaham.invites;
create policy invites_all on vivaham.invites for all to authenticated
  using (vivaham.is_admin(wedding_id)) with check (vivaham.is_admin(wedding_id));

-- tasks + materials: everybody sees and ticks; admin + family add / edit / delete
-- (a helper's update is limited to the "done" column by helper_tick_only)
do $$
declare t text;
begin
  foreach t in array array['tasks','materials'] loop
    execute format('drop policy if exists %1$s_select on vivaham.%1$I', t);
    execute format('create policy %1$s_select on vivaham.%1$I for select to authenticated using (vivaham.is_member(wedding_id))', t);
    execute format('drop policy if exists %1$s_insert on vivaham.%1$I', t);
    execute format('create policy %1$s_insert on vivaham.%1$I for insert to authenticated with check (vivaham.can_edit(wedding_id))', t);
    execute format('drop policy if exists %1$s_update on vivaham.%1$I', t);
    execute format('create policy %1$s_update on vivaham.%1$I for update to authenticated using (vivaham.is_member(wedding_id)) with check (vivaham.is_member(wedding_id))', t);
    execute format('drop policy if exists %1$s_delete on vivaham.%1$I', t);
    execute format('create policy %1$s_delete on vivaham.%1$I for delete to authenticated using (vivaham.can_edit(wedding_id))', t);
  end loop;
end $$;

-- Budget (prices + payments): admin + family only
do $$
declare t text;
begin
  foreach t in array array['prices','payments'] loop
    execute format('drop policy if exists %1$s_all on vivaham.%1$I', t);
    execute format('create policy %1$s_all on vivaham.%1$I for all to authenticated using (vivaham.can_edit(wedding_id)) with check (vivaham.can_edit(wedding_id))', t);
  end loop;
end $$;

-- all other lists: everybody sees, admin + family add / edit / delete
do $$
declare t text;
begin
  foreach t in array array['events','event_photos','vendors','vendor_events','categories','shopping_items','item_people',
                           'stays','stay_guests','guests','guest_events','meals','vehicles'] loop
    execute format('alter table vivaham.%I enable row level security', t);
    execute format('drop policy if exists %1$s_select on vivaham.%1$I', t);
    execute format('create policy %1$s_select on vivaham.%1$I for select to authenticated using (vivaham.is_member(wedding_id))', t);
    execute format('drop policy if exists %1$s_insert on vivaham.%1$I', t);
    execute format('create policy %1$s_insert on vivaham.%1$I for insert to authenticated with check (vivaham.can_edit(wedding_id))', t);
    execute format('drop policy if exists %1$s_update on vivaham.%1$I', t);
    execute format('create policy %1$s_update on vivaham.%1$I for update to authenticated using (vivaham.can_edit(wedding_id)) with check (vivaham.can_edit(wedding_id))', t);
    execute format('drop policy if exists %1$s_delete on vivaham.%1$I', t);
    execute format('create policy %1$s_delete on vivaham.%1$I for delete to authenticated using (vivaham.can_edit(wedding_id))', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 6. Views for Budget  (they obey the security rules of whoever asks)
-- ---------------------------------------------------------------------
-- One row per booking with money still open or paid: shopping, stays, meals, vehicles, vendors,
-- plus part-payments typed in directly on the Budget screen.
create or replace view vivaham.v_bookings with (security_invoker = true) as
  select p.wedding_id, p.source_type as key_type, p.source_id as key_id,
         s.name as title, 'Shopping'::text as category, s.event_id,
         p.price as total,
         coalesce((select sum(x.amount) from vivaham.payments x where x.source_type = p.source_type and x.source_id = p.source_id), 0)::bigint as paid
  from vivaham.prices p join vivaham.shopping_items s on s.id = p.source_id where p.source_type = 'shopping'
  union all
  select p.wedding_id, p.source_type, p.source_id, s.name, 'Stays', null::uuid, p.price,
         coalesce((select sum(x.amount) from vivaham.payments x where x.source_type = p.source_type and x.source_id = p.source_id), 0)::bigint
  from vivaham.prices p join vivaham.stays s on s.id = p.source_id where p.source_type = 'stay'
  union all
  select p.wedding_id, p.source_type, p.source_id, s.meal || ' · ' || coalesce(e.type, ''), 'Food', s.event_id, p.price,
         coalesce((select sum(x.amount) from vivaham.payments x where x.source_type = p.source_type and x.source_id = p.source_id), 0)::bigint
  from vivaham.prices p join vivaham.meals s on s.id = p.source_id left join vivaham.events e on e.id = s.event_id where p.source_type = 'meal'
  union all
  select p.wedding_id, p.source_type, p.source_id, s.name, 'Transport', null::uuid, p.price,
         coalesce((select sum(x.amount) from vivaham.payments x where x.source_type = p.source_type and x.source_id = p.source_id), 0)::bigint
  from vivaham.prices p join vivaham.vehicles s on s.id = p.source_id where p.source_type = 'vehicle'
  union all
  select p.wedding_id, p.source_type, p.source_id, s.name, 'Vendors', null::uuid, p.price,
         coalesce((select sum(x.amount) from vivaham.payments x where x.source_type = p.source_type and x.source_id = p.source_id), 0)::bigint
  from vivaham.prices p join vivaham.vendors s on s.id = p.source_id where p.source_type = 'vendor'
  union all
  select c.wedding_id, 'payment', c.id, c.title, c.category, c.event_id, c.total_price,
         (c.amount + coalesce((select sum(x.amount) from vivaham.payments x where x.source_type = 'payment' and x.source_id = c.id), 0))::bigint
  from vivaham.payments c where c.source_type is null and c.total_price is not null and c.total_price > 0;

-- Budget numbers + by-category rows in one call
create or replace function vivaham.budget_summary(p_wedding uuid) returns jsonb
language plpgsql stable security invoker set search_path = vivaham, public as $$
declare v_total bigint; v_paid bigint; v_due bigint; v_cats jsonb;
begin
  if not vivaham.can_edit(p_wedding) then raise exception 'Not allowed' using errcode = '42501'; end if;
  select coalesce(total_budget, 0) into v_total from vivaham.budget_settings where wedding_id = p_wedding;
  select coalesce(sum(amount), 0) into v_paid from vivaham.payments where wedding_id = p_wedding;
  select coalesce(sum(greatest(total - paid, 0)), 0) into v_due from vivaham.v_bookings where wedding_id = p_wedding;
  select coalesce(jsonb_agg(jsonb_build_object('category', c.cat,
           'paid',  coalesce((select sum(amount) from vivaham.payments p where p.wedding_id = p_wedding and p.category = c.cat), 0),
           'due',   coalesce((select sum(greatest(b.total - b.paid, 0)) from vivaham.v_bookings b where b.wedding_id = p_wedding and b.category = c.cat), 0),
           'count', (select count(*) from vivaham.payments p where p.wedding_id = p_wedding and p.category = c.cat)
         ) order by c.ord), '[]'::jsonb)
    into v_cats
    from (values ('Shopping',1),('Stays',2),('Food',3),('Transport',4),('Vendors',5),('Other',6)) as c(cat, ord);
  return jsonb_build_object('total_budget', coalesce(v_total, 0), 'paid', v_paid, 'still_to_pay', v_due,
                            'free_to_spend', coalesce(v_total, 0) - v_paid - v_due, 'by_category', v_cats);
end $$;

-- ---------------------------------------------------------------------
-- 7. Functions the app calls
-- ---------------------------------------------------------------------
-- Sign-up flow F1: create a wedding, caller becomes admin
create or replace function vivaham.create_wedding(p_name text, p_date date default null) returns uuid
language plpgsql security definer set search_path = vivaham, public as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_name text;
begin
  if v_uid is null then raise exception 'Please log in first.' using errcode = '28000'; end if;
  if p_name is null or length(trim(p_name)) = 0 then raise exception 'Whose wedding is this?' using errcode = '22023'; end if;
  insert into vivaham.profiles (user_id) values (v_uid) on conflict (user_id) do nothing;
  select coalesce(nullif(trim(name), ''), 'Me') into v_name from vivaham.profiles where user_id = v_uid;
  insert into vivaham.weddings (name, wedding_date, created_by) values (trim(p_name), p_date, v_uid) returning id into v_id;
  insert into vivaham.members (wedding_id, user_id, name, role) values (v_id, v_uid, v_name, 'admin');
  insert into vivaham.budget_settings (wedding_id) values (v_id);
  return v_id;
end $$;

-- Which weddings am I in?  (log in -> 0: onboarding, 1: Home)
create or replace function vivaham.my_weddings()
returns table (wedding_id uuid, name text, wedding_date date, role vivaham.member_role, member_id uuid)
language sql stable security definer set search_path = vivaham, public as $$
  select w.id, w.name, w.wedding_date, m.role, m.id
  from vivaham.members m join vivaham.weddings w on w.id = m.wedding_id
  where m.user_id = auth.uid() order by w.created_at
$$;

-- Change my own name everywhere
create or replace function vivaham.update_my_name(p_name text) returns void
language plpgsql security definer set search_path = vivaham, public as $$
begin
  if auth.uid() is null then raise exception 'Please log in first.' using errcode = '28000'; end if;
  if p_name is null or length(trim(p_name)) = 0 then raise exception 'Name cannot be empty.' using errcode = '22023'; end if;
  insert into vivaham.profiles (user_id, name) values (auth.uid(), trim(p_name))
    on conflict (user_id) do update set name = excluded.name;
  update vivaham.members set name = trim(p_name) where user_id = auth.uid();
end $$;

-- Invite codes: random, e.g. AKHIL-7Q4K2M
create or replace function vivaham.make_invite_code(p_wedding_name text) returns text
language plpgsql volatile set search_path = vivaham, public as $$
declare v_prefix text; v_alpha constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; v_code text; v_bytes bytea; i int;
begin
  v_prefix := upper(left(regexp_replace(coalesce(p_wedding_name, ''), '[^A-Za-z]', '', 'g'), 5));
  if length(v_prefix) < 2 then v_prefix := 'VIVAH'; end if;
  loop
    v_bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    v_code := v_prefix || '-';
    for i in 0..5 loop v_code := v_code || substr(v_alpha, (get_byte(v_bytes, i) % 32) + 1, 1); end loop;
    exit when not exists (select 1 from vivaham.invites where code = v_code);
  end loop;
  return v_code;
end $$;

-- Admin: show the active code for a role (make one if there is none). p_rotate = true -> old code stops working.
create or replace function vivaham.get_invite(p_wedding uuid, p_role vivaham.member_role, p_rotate boolean default false)
returns table (code text, role vivaham.member_role, expires_at timestamptz)
language plpgsql security definer set search_path = vivaham, public as $$
declare v_wname text;
begin
  if not vivaham.is_admin(p_wedding) then raise exception 'Only an admin can invite people.' using errcode = '42501'; end if;
  update vivaham.invites i set active = false
    where i.wedding_id = p_wedding and i.role = p_role and i.active and (p_rotate or i.expires_at <= now());
  if not exists (select 1 from vivaham.invites i where i.wedding_id = p_wedding and i.role = p_role and i.active) then
    select w.name into v_wname from vivaham.weddings w where w.id = p_wedding;
    insert into vivaham.invites (wedding_id, code, role) values (p_wedding, vivaham.make_invite_code(v_wname), p_role);
  end if;
  return query select i.code, i.role, i.expires_at from vivaham.invites i
    where i.wedding_id = p_wedding and i.role = p_role and i.active;
end $$;

-- Public: what wedding does this code open?  (A6 "Join a wedding" shows the name + role)
create or replace function vivaham.get_invite_preview(p_code text)
returns table (wedding_name text, role vivaham.member_role)
language sql stable security definer set search_path = vivaham, public as $$
  select w.name, i.role from vivaham.invites i join vivaham.weddings w on w.id = i.wedding_id
  where i.code = upper(trim(p_code)) and i.active and i.expires_at > now()
$$;

-- Logged in: join with a code
create or replace function vivaham.accept_invite(p_code text) returns uuid
language plpgsql security definer set search_path = vivaham, public as $$
declare v_uid uuid := auth.uid(); v_inv vivaham.invites%rowtype; v_name text; v_member uuid;
begin
  if v_uid is null then raise exception 'Please log in first.' using errcode = '28000'; end if;
  select * into v_inv from vivaham.invites
    where code = upper(trim(p_code)) and active and expires_at > now();
  if not found then raise exception 'This code doesn''t work. Ask for a new one.' using errcode = 'P0002'; end if;
  if exists (select 1 from vivaham.members where wedding_id = v_inv.wedding_id and user_id = v_uid) then
    return v_inv.wedding_id;                                     -- already a member: just open Home
  end if;
  insert into vivaham.profiles (user_id) values (v_uid) on conflict (user_id) do nothing;
  select coalesce(nullif(trim(name), ''), 'Guest') into v_name from vivaham.profiles where user_id = v_uid;
  -- a name-only person with the same name becomes this account (keeps their tasks and shopping)
  select id into v_member from vivaham.members
    where wedding_id = v_inv.wedding_id and user_id is null and lower(name) = lower(v_name) limit 1;
  if v_member is not null then
    update vivaham.members set user_id = v_uid, role = v_inv.role where id = v_member;
  else
    insert into vivaham.members (wedding_id, user_id, name, role) values (v_inv.wedding_id, v_uid, v_name, v_inv.role)
      on conflict (wedding_id, lower(name)) do update set name = excluded.name || ' (' || substr(v_uid::text, 1, 4) || ')';
    update vivaham.members set user_id = v_uid where wedding_id = v_inv.wedding_id and user_id is null
      and name = v_name || ' (' || substr(v_uid::text, 1, 4) || ')';
  end if;
  return v_inv.wedding_id;
end $$;

-- Where does a priced thing live?  (used by save_price)
create or replace function vivaham.source_info(p_type text, p_id uuid)
returns table (wedding_id uuid, title text, category text, event_id uuid)
language plpgsql stable security definer set search_path = vivaham, public as $$
begin
  if p_type = 'shopping' then
    return query select s.wedding_id, s.name, 'Shopping'::text, s.event_id from vivaham.shopping_items s where s.id = p_id;
  elsif p_type = 'stay' then
    return query select s.wedding_id, s.name, 'Stays'::text, null::uuid from vivaham.stays s where s.id = p_id;
  elsif p_type = 'meal' then
    return query select s.wedding_id, s.meal || ' · ' || coalesce(e.type, ''), 'Food'::text, s.event_id
                 from vivaham.meals s left join vivaham.events e on e.id = s.event_id where s.id = p_id;
  elsif p_type = 'vehicle' then
    return query select s.wedding_id, s.name, 'Transport'::text, null::uuid from vivaham.vehicles s where s.id = p_id;
  elsif p_type = 'vendor' then
    return query select s.wedding_id, s.name, 'Vendors'::text, null::uuid from vivaham.vendors s where s.id = p_id;
  end if;
end $$;

-- The "Price" block on every add screen:  p_mode = 'full' | 'adv' | 'no'
--   no price (null/0 with mode 'no') removes the price.  'full' saves a payment of the whole price,
--   'adv' saves a payment of p_advance. The remaining balance shows in Budget -> Still to pay.
create or replace function vivaham.save_price(
  p_type text, p_id uuid, p_price bigint, p_mode text default 'no', p_advance bigint default null,
  p_paid_by uuid default null, p_method vivaham.pay_method default 'upi', p_paid_on date default current_date)
returns void language plpgsql security definer set search_path = vivaham, public as $$
declare i record; v_amount bigint;
begin
  select * into i from vivaham.source_info(p_type, p_id);
  if not found then raise exception 'Item not found.' using errcode = 'P0002'; end if;
  if not vivaham.can_edit(i.wedding_id) then raise exception 'Not allowed' using errcode = '42501'; end if;
  if p_mode not in ('full','adv','no') then raise exception 'Bad payment mode.' using errcode = '22023'; end if;

  delete from vivaham.payments where source_type = p_type and source_id = p_id and origin = 'booking';

  if p_price is null or (p_price = 0 and p_mode = 'no') then
    delete from vivaham.prices where source_type = p_type and source_id = p_id;
    return;
  end if;
  if p_price < 0 then raise exception 'Price cannot be negative.' using errcode = '22023'; end if;

  insert into vivaham.prices (wedding_id, source_type, source_id, price) values (i.wedding_id, p_type, p_id, p_price)
    on conflict (source_type, source_id) do update set price = excluded.price;

  v_amount := case p_mode when 'full' then p_price when 'adv' then coalesce(p_advance, 0) else 0 end;
  if v_amount > 0 then
    insert into vivaham.payments (wedding_id, title, category, amount, paid_on, paid_by, method, event_id, source_type, source_id, origin)
    values (i.wedding_id, i.title || case when p_mode = 'adv' then ' · advance' else '' end, i.category, v_amount,
            coalesce(p_paid_on, current_date), p_paid_by, p_method, i.event_id, p_type, p_id, 'booking');
  end if;
  perform vivaham.refresh_price(p_type, p_id);
end $$;

-- ---------------------------------------------------------------------
-- 8. Permissions
-- ---------------------------------------------------------------------
grant usage on schema vivaham to anon, authenticated;
revoke all on all tables in schema vivaham from anon, authenticated;
grant select, insert, update, delete on all tables in schema vivaham to authenticated;
revoke all on all functions in schema vivaham from public;
grant execute on all functions in schema vivaham to authenticated;
grant execute on function vivaham.get_invite_preview(text) to anon;
-- internal helpers must not be callable by the web
revoke execute on function vivaham.refresh_price(text, uuid) from authenticated;
revoke execute on function vivaham.make_invite_code(text) from authenticated;
alter default privileges in schema vivaham grant select, insert, update, delete on tables to authenticated;

-- ---------------------------------------------------------------------
-- 9. Photos + receipts (Storage bucket "vivaham", folder = wedding id)
-- ---------------------------------------------------------------------
create or replace function vivaham.path_wedding(p_name text) returns uuid
language plpgsql immutable set search_path = vivaham, public as $$
begin return split_part(p_name, '/', 1)::uuid;
exception when others then return null; end $$;
grant execute on function vivaham.path_wedding(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vivaham', 'vivaham', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists vivaham_files_select on storage.objects;
create policy vivaham_files_select on storage.objects for select to authenticated
  using (bucket_id = 'vivaham' and vivaham.is_member(vivaham.path_wedding(name)));
drop policy if exists vivaham_files_insert on storage.objects;
create policy vivaham_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'vivaham' and vivaham.can_edit(vivaham.path_wedding(name)));
drop policy if exists vivaham_files_update on storage.objects;
create policy vivaham_files_update on storage.objects for update to authenticated
  using (bucket_id = 'vivaham' and vivaham.can_edit(vivaham.path_wedding(name)))
  with check (bucket_id = 'vivaham' and vivaham.can_edit(vivaham.path_wedding(name)));
drop policy if exists vivaham_files_delete on storage.objects;
create policy vivaham_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'vivaham' and vivaham.can_edit(vivaham.path_wedding(name)));

-- ---------------------------------------------------------------------
-- 10. Live updates (family sees changes without refreshing)
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['events','materials','shopping_items','stays','guests','guest_events','meals','tasks','vehicles','vendors','payments','members']
    loop
      begin execute format('alter publication supabase_realtime add table vivaham.%I', t);
      exception when duplicate_object then null; end;
    end loop;
  end if;
end $$;

reset search_path;
