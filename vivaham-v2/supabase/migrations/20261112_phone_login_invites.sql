-- =====================================================================
-- VIVAHAM V2 · Mobile-number login + invite by mobile number
-- Run this whole file once in: Supabase dashboard -> SQL Editor -> New query -> Run.
-- Run it AFTER 20261110_vivaham_v2.sql. It is safe to run again (idempotent).
--
-- What it adds:
--   An admin types a name + mobile number. That person logs in with the
--   same number (code by SMS / WhatsApp) and is inside the wedding straight
--   away. No invite code, no email, no password.
-- =====================================================================

set search_path = vivaham, public;

-- One format everywhere: digits only, with country code, no "+"  (919876543210)
create or replace function vivaham.norm_phone(p text) returns text
language sql immutable set search_path = vivaham, public as $$
  select nullif(regexp_replace(coalesce(p, ''), '[^0-9]', '', 'g'), '')
$$;

-- The mobile number I logged in with (only if it was confirmed with a code)
create or replace function vivaham.my_phone() returns text
language sql stable security definer set search_path = vivaham, public as $$
  select vivaham.norm_phone(u.phone) from auth.users u
  where u.id = auth.uid() and u.phone_confirmed_at is not null
$$;

create table if not exists vivaham.phone_invites (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references vivaham.weddings(id) on delete cascade,
  phone       text not null check (phone ~ '^[1-9][0-9]{7,14}$'),
  name        text not null check (length(trim(name)) > 0),
  role        vivaham.member_role not null default 'family',
  member_id   uuid references vivaham.members(id) on delete cascade,   -- the name that waits for this person
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now(),
  accepted_at timestamptz,                                             -- empty = still waiting
  accepted_by uuid
);
create unique index if not exists phone_invites_one_per_wedding on vivaham.phone_invites (wedding_id, phone);
create index if not exists phone_invites_waiting_idx on vivaham.phone_invites (phone) where accepted_at is null;
create index if not exists phone_invites_wedding_idx on vivaham.phone_invites (wedding_id);

-- Only admins see the numbers and can cancel an invite. Adding goes through invite_phone().
alter table vivaham.phone_invites enable row level security;
drop policy if exists phone_invites_select on vivaham.phone_invites;
create policy phone_invites_select on vivaham.phone_invites for select to authenticated using (vivaham.is_admin(wedding_id));
drop policy if exists phone_invites_delete on vivaham.phone_invites;
create policy phone_invites_delete on vivaham.phone_invites for delete to authenticated using (vivaham.is_admin(wedding_id));

-- Admin: invite a person by mobile number. Their name shows in the family list at once
-- (so they can already get tasks and shopping); the login is linked when they first log in.
create or replace function vivaham.invite_phone(p_wedding uuid, p_name text, p_phone text, p_role vivaham.member_role default 'family')
returns uuid language plpgsql security definer set search_path = vivaham, public as $$
declare
  v_phone  text := vivaham.norm_phone(p_phone);
  v_name   text := trim(coalesce(p_name, ''));
  v_member vivaham.members%rowtype;
  v_other  text;
  v_id     uuid;
begin
  if not vivaham.is_admin(p_wedding) then raise exception 'Only an admin can invite people.' using errcode = '42501'; end if;
  if v_name = '' then raise exception 'Name cannot be empty.' using errcode = '22023'; end if;
  if v_phone is null or v_phone !~ '^[1-9][0-9]{7,14}$' then
    raise exception 'That mobile number does not look right. Include the country code.' using errcode = '22023';
  end if;
  if exists (select 1 from vivaham.members m join auth.users u on u.id = m.user_id
             where m.wedding_id = p_wedding and u.phone_confirmed_at is not null and vivaham.norm_phone(u.phone) = v_phone) then
    raise exception 'This number is already in the wedding.' using errcode = '23505';
  end if;
  select i.name into v_other from vivaham.phone_invites i where i.wedding_id = p_wedding and i.phone = v_phone;
  if found then raise exception 'This number is already invited (%).', v_other using errcode = '23505'; end if;

  select * into v_member from vivaham.members m where m.wedding_id = p_wedding and lower(m.name) = lower(v_name);
  if found then
    if v_member.user_id is not null then
      raise exception '% already uses the app. Choose a different name.', v_name using errcode = '23505';
    end if;
    if exists (select 1 from vivaham.phone_invites i where i.member_id = v_member.id and i.accepted_at is null) then
      raise exception '% is already invited. Cancel that invite first.', v_name using errcode = '23505';
    end if;
    update vivaham.members set role = p_role where id = v_member.id;
  else
    insert into vivaham.members (wedding_id, name, role) values (p_wedding, v_name, p_role) returning * into v_member;
  end if;

  insert into vivaham.phone_invites (wedding_id, phone, name, role, member_id, created_by)
  values (p_wedding, v_phone, v_name, p_role, v_member.id, auth.uid()) returning id into v_id;
  return v_id;
end $$;

-- Logged in with a mobile number: join every wedding that is waiting for this number.
-- Returns the weddings joined just now:  [{"wedding_id": "...", "name": "..."}]
create or replace function vivaham.claim_phone_invites() returns jsonb
language plpgsql security definer set search_path = vivaham, public as $$
declare
  v_uid    uuid := auth.uid();
  v_phone  text;
  v_inv    vivaham.phone_invites%rowtype;
  v_pname  text;
  v_name   text;
  v_member uuid;
  v_out    jsonb := '[]'::jsonb;
begin
  if v_uid is null then return v_out; end if;
  v_phone := vivaham.my_phone();
  if v_phone is null then return v_out; end if;

  for v_inv in select * from vivaham.phone_invites i where i.phone = v_phone and i.accepted_at is null order by i.created_at loop
    insert into vivaham.profiles (user_id) values (v_uid) on conflict (user_id) do nothing;
    select nullif(trim(p.name), '') into v_pname from vivaham.profiles p where p.user_id = v_uid;
    if v_pname is null then                       -- new person: take the name the admin typed
      update vivaham.profiles set name = v_inv.name where user_id = v_uid;
      v_pname := v_inv.name;
    end if;

    if not exists (select 1 from vivaham.members m where m.wedding_id = v_inv.wedding_id and m.user_id = v_uid) then
      v_member := null;
      update vivaham.members m set user_id = v_uid, role = v_inv.role
        where m.id = v_inv.member_id and m.user_id is null returning m.id into v_member;
      if v_member is null then                    -- the waiting name is gone or taken: add a fresh one
        v_name := v_pname;
        if exists (select 1 from vivaham.members m where m.wedding_id = v_inv.wedding_id and lower(m.name) = lower(v_name)) then
          v_name := v_pname || ' (' || right(v_phone, 4) || ')';
        end if;
        insert into vivaham.members (wedding_id, user_id, name, role) values (v_inv.wedding_id, v_uid, v_name, v_inv.role)
          returning id into v_member;
      end if;
      v_out := v_out || jsonb_build_object('wedding_id', v_inv.wedding_id,
                 'name', (select w.name from vivaham.weddings w where w.id = v_inv.wedding_id));
    end if;

    update vivaham.phone_invites set accepted_at = now(), accepted_by = v_uid, member_id = coalesce(v_member, member_id)
      where id = v_inv.id;
  end loop;
  return v_out;
end $$;

-- Permissions
revoke all on vivaham.phone_invites from anon, authenticated;
grant select, delete on vivaham.phone_invites to authenticated;
revoke all on function vivaham.norm_phone(text) from public;
revoke all on function vivaham.my_phone() from public;
revoke all on function vivaham.invite_phone(uuid, text, text, vivaham.member_role) from public;
revoke all on function vivaham.claim_phone_invites() from public;
grant execute on function vivaham.norm_phone(text) to authenticated;
grant execute on function vivaham.invite_phone(uuid, text, text, vivaham.member_role) to authenticated;
grant execute on function vivaham.claim_phone_invites() to authenticated;

reset search_path;
