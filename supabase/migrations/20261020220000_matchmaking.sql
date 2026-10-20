create table public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('talent', 'recruiter')),
  full_name text not null default '',
  headline text not null default '',
  location text not null default '',
  profile jsonb not null default '{}'::jsonb,
  company_name text not null default '',
  company jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.platform_jobs (
  id text primary key,
  recruiter_id uuid not null references auth.users (id) on delete cascade,
  job jsonb not null,
  posted_at timestamptz not null default now()
);
create index platform_jobs_recruiter_posted on public.platform_jobs (recruiter_id, posted_at desc);

create table public.match_interests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  job_id text references public.platform_jobs (id) on delete set null,
  interest_type text not null check (interest_type in ('role', 'company', 'talent')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (sender_id <> receiver_id)
);

create unique index match_interests_unique_role
  on public.match_interests (sender_id, receiver_id, job_id)
  where interest_type = 'role' and job_id is not null;
create unique index match_interests_unique_non_role
  on public.match_interests (sender_id, receiver_id, interest_type)
  where interest_type <> 'role';
create index match_interests_receiver_status on public.match_interests (receiver_id, status);

create table public.match_messages (
  id uuid primary key default gen_random_uuid(),
  interest_id uuid not null references public.match_interests (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index match_messages_interest_created on public.match_messages (interest_id, created_at);

create or replace function public.is_recruiter(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles p
    where p.user_id = target_id and p.account_type = 'recruiter'
  );
$$;

create or replace function public.is_talent(target_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles p
    where p.user_id = target_id and p.account_type = 'talent'
  );
$$;
revoke all on function public.is_recruiter(uuid) from public;
revoke all on function public.is_talent(uuid) from public;
grant execute on function public.is_recruiter(uuid) to authenticated;
grant execute on function public.is_talent(uuid) to authenticated;

alter table public.user_profiles enable row level security;
alter table public.platform_jobs enable row level security;
alter table public.match_interests enable row level security;
alter table public.match_messages enable row level security;

create policy "Users can read public company and permitted talent profiles"
  on public.user_profiles for select to authenticated using (
    auth.uid() = user_id
    or account_type = 'recruiter'
    or (public.is_recruiter(auth.uid()) and account_type = 'talent')
    or exists (
      select 1 from public.match_interests i
      where (i.sender_id = auth.uid() and i.receiver_id = user_profiles.user_id)
         or (i.receiver_id = auth.uid() and i.sender_id = user_profiles.user_id)
    )
  );
create policy "Users can update their own profile"
  on public.user_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
revoke insert, update on public.user_profiles from authenticated;
grant update (full_name, headline, location, profile, company_name, company) on public.user_profiles to authenticated;

create policy "Authenticated users can read platform roles"
  on public.platform_jobs for select to authenticated using (true);
create policy "Recruiters can publish their own roles"
  on public.platform_jobs for insert to authenticated with check (auth.uid() = recruiter_id and public.is_recruiter(auth.uid()));
create policy "Recruiters can update their own roles"
  on public.platform_jobs for update to authenticated using (auth.uid() = recruiter_id and public.is_recruiter(auth.uid())) with check (auth.uid() = recruiter_id and public.is_recruiter(auth.uid()));
create policy "Recruiters can remove their own roles"
  on public.platform_jobs for delete to authenticated using (auth.uid() = recruiter_id and public.is_recruiter(auth.uid()));

create policy "Participants can read their interests"
  on public.match_interests for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send interest"
  on public.match_interests for insert to authenticated
  with check (
    auth.uid() = sender_id
    and (
      (
        interest_type in ('role', 'company')
        and auth.uid() = sender_id
        and public.is_talent(sender_id)
        and public.is_recruiter(receiver_id)
        and (
          (interest_type = 'role' and job_id is not null and exists (
            select 1 from public.platform_jobs j
            where j.id = job_id and j.recruiter_id = receiver_id
          ))
          or (interest_type = 'company' and job_id is null)
        )
      )
      or (
        interest_type = 'talent'
        and job_id is null
        and auth.uid() = sender_id
        and public.is_recruiter(sender_id)
        and public.is_talent(receiver_id)
      )
    )
  );
create policy "Recipients can decide on pending interest"
  on public.match_interests for update to authenticated
  using (auth.uid() = receiver_id and status = 'pending')
  with check (auth.uid() = receiver_id and status in ('accepted', 'declined'));
revoke update on public.match_interests from authenticated;
grant update (status) on public.match_interests to authenticated;

create policy "Matched users can read messages"
  on public.match_messages for select to authenticated
  using (
    exists (
      select 1 from public.match_interests i
      where i.id = interest_id
        and i.status = 'accepted'
        and (i.sender_id = auth.uid() or i.receiver_id = auth.uid())
    )
  );
create policy "Matched users can send messages"
  on public.match_messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.match_interests i
      where i.id = interest_id
        and i.status = 'accepted'
        and (i.sender_id = auth.uid() or i.receiver_id = auth.uid())
    )
  );

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_touch_updated_at
  before update on public.user_profiles
  for each row execute function public.touch_updated_at();
create trigger match_interests_touch_updated_at
  before update on public.match_interests
  for each row execute function public.touch_updated_at();

create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_type text := coalesce(new.raw_user_meta_data ->> 'account_type', 'talent');
begin
  if account_type not in ('talent', 'recruiter') then
    account_type := 'talent';
  end if;
  insert into public.user_profiles (user_id, account_type, full_name)
  values (new.id, account_type, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;
revoke all on function public.create_user_profile() from public, anon, authenticated;

create trigger auth_user_profile_created
  after insert on auth.users
  for each row execute function public.create_user_profile();

insert into public.user_profiles (user_id, account_type, full_name)
select
  u.id,
  case when u.raw_user_meta_data ->> 'account_type' = 'recruiter' then 'recruiter' else 'talent' end,
  coalesce(u.raw_user_meta_data ->> 'full_name', '')
from auth.users u
on conflict (user_id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_profiles'
  ) then
    alter publication supabase_realtime add table public.user_profiles;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'platform_jobs'
  ) then
    alter publication supabase_realtime add table public.platform_jobs;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_interests'
  ) then
    alter publication supabase_realtime add table public.match_interests;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_messages'
  ) then
    alter publication supabase_realtime add table public.match_messages;
  end if;
end;
$$;
