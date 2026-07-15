-- ============================================================
-- Jerry App — Admin / Customer role setup
-- Run this in: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Add role column (customer by default)
alter table public.profiles
add column if not exists role text not null default 'customer';

-- 2) Only allow valid roles
alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (role in ('customer', 'admin'));

-- 3) Backfill existing rows
update public.profiles
set role = 'customer'
where role is null or role = '';

-- 4) Make ONE user an admin (change the email to your admin email)
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'shreyshahworldtech@gmail.com'  -- << change if needed
);

-- Everyone else stays customer
update public.profiles
set role = 'customer'
where id in (
  select id from auth.users
  where email <> 'shreyshahworldtech@gmail.com'
);

-- 5) Keep signup trigger inserting role = customer
--    Recreate handle_new_user so new signups always get customer role
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, mobile, role, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'mobile', ''),
    'customer',
    now()
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    mobile = excluded.mobile,
    updated_at = now();
  -- role is NOT overwritten on conflict (keeps admin if already set)
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6) Allow logged-in users to read their own profile (needed for role redirect)
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

-- 6b) Block app clients from changing role (SQL Editor still allowed)
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
as $$
begin
  -- Only block when a logged-in app user is updating
  if auth.uid() is not null and new.role is distinct from old.role then
    raise exception 'Role can only be changed from Supabase SQL Editor / dashboard';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_role_self_escalation();

-- Users can update own profile (name/mobile etc). Role change blocked by trigger above.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- 7) Verify
select
  p.id,
  u.email,
  p.full_name,
  p.mobile,
  p.role
from public.profiles p
join auth.users u on u.id = p.id
order by p.role desc, u.email;
