-- Dilmondo Arena Supabase schema
-- Run this once in Supabase Dashboard > SQL Editor.

create table if not exists public.league_settings (
  id text primary key,
  league_id integer not null,
  league_name text not null,
  season_name text not null,
  season_status text not null check (season_status in ('active', 'finished', 'pre-season')),
  last_sync_at timestamptz,
  sync_status text not null check (sync_status in ('idle', 'syncing', 'success', 'failed')),
  sync_error text,
  updated_at timestamptz not null default now()
);

create table if not exists public.members (
  id text primary key,
  fpl_manager_id integer,
  fpl_team_name text,
  fpl_manager_name text,
  standing_reference integer,
  display_name_ar text not null,
  short_name text not null,
  nickname text not null,
  profile_image_url text,
  avatar_url text,
  custom_color text not null,
  banter_level text not null check (banter_level in ('light', 'normal', 'strong')),
  active boolean not null default true,
  status text not null check (status in ('active', 'withdrawn', 'archived')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.standings_snapshots (
  id text primary key,
  league_id integer not null,
  event_id integer,
  synced_at timestamptz not null,
  raw_payload jsonb not null,
  normalized_payload jsonb not null
);

create index if not exists standings_snapshots_synced_at_idx
  on public.standings_snapshots (synced_at desc);

create table if not exists public.manager_gameweek_snapshots (
  id text primary key,
  manager_id integer not null,
  event_id integer not null,
  gw_points integer,
  total_points integer,
  rank integer,
  picks_payload jsonb,
  captain_player_id integer,
  captain_player_name text,
  captain_points integer,
  synced_at timestamptz not null
);

create index if not exists manager_gameweek_snapshots_synced_at_idx
  on public.manager_gameweek_snapshots (synced_at desc);

create table if not exists public.banter_templates (
  id text primary key,
  name text not null,
  trigger_key text not null,
  condition_config jsonb not null default '{}'::jsonb,
  text_ar text not null,
  banter_level text not null check (banter_level in ('light', 'normal', 'strong')),
  active boolean not null default true
);

create table if not exists public.hall_of_fame (
  id text primary key,
  season text not null,
  winner_member_id text,
  runner_up_member_id text,
  last_place_member_id text,
  title text not null,
  description text not null default '',
  awards_payload jsonb not null default '[]'::jsonb,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.homepage_announcements (
  id text primary key,
  title text not null,
  body text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.league_settings enable row level security;
alter table public.members enable row level security;
alter table public.standings_snapshots enable row level security;
alter table public.manager_gameweek_snapshots enable row level security;
alter table public.banter_templates enable row level security;
alter table public.hall_of_fame enable row level security;
alter table public.homepage_announcements enable row level security;

-- The app reads/writes these tables only through server-side routes with SUPABASE_SERVICE_ROLE_KEY.
-- No anon policies are created for database tables.

insert into storage.buckets (id, name, public)
values ('member-avatars', 'member-avatars', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read member avatars'
  ) then
    create policy "Public read member avatars"
    on storage.objects
    for select
    to public
    using (bucket_id = 'member-avatars');
  end if;
end $$;

-- Upload/update/delete are intentionally not granted to anon users.
-- Admin server routes use the service role key, which bypasses RLS.
