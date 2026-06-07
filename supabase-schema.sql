create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_salt text not null,
  password_hash text not null,
  coins integer not null default 0 check (coins >= 0),
  lp integer not null default 1000 check (lp >= 0),
  owned_characters text[] not null default array['thrower']::text[],
  created_at timestamptz not null default now()
);

alter table public.app_users
add column if not exists lp integer not null default 1000 check (lp >= 0);

alter table public.app_users
alter column coins set default 0;

update public.app_users
set lp = 1000
where lp is null;

update public.app_users
set coins = 0
where coins is null or coins = 100;

create table if not exists public.app_sessions (
  token text primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_rooms (
  code text primary key,
  host_user_id uuid not null references public.app_users(id) on delete cascade,
  player_ids uuid[] not null,
  prep_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.match_queue (
  user_id uuid primary key references public.app_users(id) on delete cascade,
  tier text not null,
  joined_at timestamptz not null default now(),
  matched_room_code text references public.app_rooms(code) on delete set null
);

create table if not exists public.pve_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  stage text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.app_rooms
add column if not exists prep_state jsonb not null default '{}'::jsonb;

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.app_rooms enable row level security;
alter table public.match_queue enable row level security;
alter table public.pve_runs enable row level security;

drop policy if exists "app rooms are visible for realtime" on public.app_rooms;
create policy "app rooms are visible for realtime"
on public.app_rooms for select
to anon, authenticated
using (true);

drop policy if exists "match queue visible for realtime" on public.match_queue;
create policy "match queue visible for realtime"
on public.match_queue for select
to anon, authenticated
using (true);

alter table public.app_rooms replica identity full;
alter table public.match_queue replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_rooms'
  ) then
    alter publication supabase_realtime add table public.app_rooms;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'match_queue'
  ) then
    alter publication supabase_realtime add table public.match_queue;
  end if;
end;
$$;

create or replace function public.app_hash_password(raw_password text, salt text)
returns text
language sql
stable
security definer
set search_path = public, extensions
as $$
  select encode(extensions.digest(raw_password || ':' || salt, 'sha256'), 'hex');
$$;

create or replace function public.app_user_json(target_user public.app_users)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', target_user.id,
    'username', target_user.username,
    'coins', target_user.coins,
    'lp', target_user.lp,
    'ownedCharacters', target_user.owned_characters
  );
$$;

create or replace function public.lp_tier(score integer)
returns text
language sql
immutable
security definer
set search_path = public
as $$
  select case
    when score >= 1800 then '다이아'
    when score >= 1600 then '플레'
    when score >= 1400 then '골드'
    when score >= 1200 then '실버'
    else '브론즈'
  end;
$$;

create or replace function public.app_user_from_token(session_token text)
returns public.app_users
language sql
stable
security definer
set search_path = public
as $$
  select u
  from public.app_sessions s
  join public.app_users u on u.id = s.user_id
  where s.token = session_token;
$$;

create or replace function public.make_room_code()
returns text
language sql
volatile
security definer
set search_path = public, extensions
as $$
  select upper(substr(encode(extensions.gen_random_bytes(4), 'hex'), 1, 6));
$$;

create or replace function public.app_room_json(room_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'code', r.code,
    'hostUserId', r.host_user_id,
    'prepState', r.prep_state,
    'players', coalesce(
      (
        select jsonb_agg(public.app_user_json(u) order by array_position(r.player_ids, u.id))
        from public.app_users u
        where u.id = any(r.player_ids)
      ),
      '[]'::jsonb
    )
  )
  from public.app_rooms r
  where r.code = room_code;
$$;

create or replace function public.signup_user(user_name text, raw_password text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  clean_name text := trim(user_name);
  salt text;
  new_token text;
  created_user public.app_users;
begin
  if clean_name = '' or raw_password = '' then
    raise exception 'username and password required';
  end if;

  if length(raw_password) < 6 then
    raise exception 'password must be at least 6 characters';
  end if;

  salt := encode(extensions.gen_random_bytes(16), 'hex');

  insert into public.app_users (username, password_salt, password_hash)
  values (clean_name, salt, public.app_hash_password(raw_password, salt))
  returning * into created_user;

  new_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.app_sessions (token, user_id)
  values (new_token, created_user.id);

  return jsonb_build_object('token', new_token, 'user', public.app_user_json(created_user));
exception
  when unique_violation then
    raise exception 'username already exists';
end;
$$;

create or replace function public.login_user(user_name text, raw_password text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  found_user public.app_users;
  new_token text;
begin
  select * into found_user
  from public.app_users
  where username = trim(user_name);

  if found_user.id is null then
    raise exception 'invalid login';
  end if;

  if found_user.password_hash <> public.app_hash_password(raw_password, found_user.password_salt) then
    raise exception 'invalid login';
  end if;

  new_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.app_sessions (token, user_id)
  values (new_token, found_user.id);

  return jsonb_build_object('token', new_token, 'user', public.app_user_json(found_user));
end;
$$;

create or replace function public.logout_user(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  delete from public.app_sessions where token = session_token;
  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.get_me(session_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;
  return public.app_user_json(active_user);
end;
$$;

create or replace function public.get_server_time(session_token text)
returns numeric
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  return extract(epoch from clock_timestamp());
end;
$$;

create or replace function public.create_room(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  new_code text;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  loop
    new_code := public.make_room_code();
    exit when not exists (select 1 from public.app_rooms where code = new_code);
  end loop;

  insert into public.app_rooms (code, host_user_id, player_ids)
  values (new_code, active_user.id, array[active_user.id]::uuid[]);

  return public.app_room_json(new_code);
end;
$$;

create or replace function public.join_room(session_token text, room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_code text := upper(trim(room_code));
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if not exists (select 1 from public.app_rooms where code = normalized_code) then
    raise exception 'room not found';
  end if;

  update public.app_rooms
  set player_ids = case
    when active_user.id = any(player_ids) then player_ids
    else array_append(player_ids, active_user.id)
  end
  where code = normalized_code;

  return public.app_room_json(normalized_code);
end;
$$;

create or replace function public.find_pvp_match(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  opponent public.app_users;
  active_tier text;
  elapsed_seconds integer;
  existing_room_code text;
  tier_index integer;
  min_index integer;
  max_index integer;
  new_code text;
  tiers text[] := array['브론즈', '실버', '골드', '플레', '다이아'];
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select matched_room_code into existing_room_code
  from public.match_queue
  where user_id = active_user.id;

  if existing_room_code is not null then
    if exists (select 1 from public.app_rooms where code = existing_room_code) then
      return jsonb_build_object('matched', true, 'room', public.app_room_json(existing_room_code));
    end if;

    delete from public.match_queue
    where user_id = active_user.id;
  end if;

  active_tier := public.lp_tier(active_user.lp);

  insert into public.match_queue (user_id, tier)
  values (active_user.id, active_tier)
  on conflict (user_id) do update
  set tier = excluded.tier;

  select greatest(0, extract(epoch from now() - joined_at)::int)
  into elapsed_seconds
  from public.match_queue
  where user_id = active_user.id;

  tier_index := array_position(tiers, active_tier);
  min_index := greatest(1, tier_index - floor(elapsed_seconds / 30)::int);
  max_index := least(array_length(tiers, 1), tier_index + floor(elapsed_seconds / 30)::int);

  select u.* into opponent
  from public.match_queue q
  join public.app_users u on u.id = q.user_id
  where q.user_id <> active_user.id
    and q.matched_room_code is null
    and array_position(tiers, q.tier) between min_index and max_index
  order by q.joined_at
  limit 1
  for update skip locked;

  if opponent.id is null then
    return jsonb_build_object(
      'matched', false,
      'tier', active_tier,
      'range', jsonb_build_object('min', tiers[min_index], 'max', tiers[max_index]),
      'elapsed', elapsed_seconds
    );
  end if;

  loop
    new_code := public.make_room_code();
    exit when not exists (select 1 from public.app_rooms where code = new_code);
  end loop;

  insert into public.app_rooms (code, host_user_id, player_ids, prep_state)
  values (
    new_code,
    active_user.id,
    array[active_user.id, opponent.id]::uuid[],
    jsonb_build_object(
      'matchmaking', true,
      'matchPlayers', jsonb_build_object('p1', active_user.id, 'p2', opponent.id),
      'characterSelections', '{}'::jsonb,
      'ready', '{}'::jsonb,
      'started', false,
      'createdAt', extract(epoch from now())
    )
  );

  update public.match_queue
  set matched_room_code = new_code
  where user_id in (active_user.id, opponent.id);

  return jsonb_build_object('matched', true, 'room', public.app_room_json(new_code));
end;
$$;

create or replace function public.get_match_status(session_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  room_code text;
  active_tier text;
  elapsed_seconds integer;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select matched_room_code, greatest(0, extract(epoch from now() - joined_at)::int)
  into room_code, elapsed_seconds
  from public.match_queue
  where user_id = active_user.id;

  if room_code is not null then
    if exists (select 1 from public.app_rooms where code = room_code) then
      return jsonb_build_object('matched', true, 'room', public.app_room_json(room_code));
    end if;
  end if;

  active_tier := public.lp_tier(active_user.lp);
  return jsonb_build_object('matched', false, 'tier', active_tier, 'elapsed', coalesce(elapsed_seconds, 0));
end;
$$;

create or replace function public.cancel_pvp_match(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  room_code text;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select matched_room_code into room_code
  from public.match_queue
  where user_id = active_user.id;

  if room_code is not null then
    delete from public.match_queue where matched_room_code = room_code or user_id = active_user.id;
    delete from public.app_rooms where code = room_code;
  else
    delete from public.match_queue where user_id = active_user.id;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

drop function if exists public.set_character_ready(text, text, text, boolean);

create or replace function public.set_character_ready(
  session_token text,
  room_code text,
  character_kind text,
  is_ready boolean,
  simulation_version text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_code text := upper(trim(room_code));
  room_players uuid[];
  current_state jsonb;
  next_state jsonb;
  next_ready jsonb;
  next_versions jsonb;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if character_kind <> all(active_user.owned_characters) then
    raise exception 'character not owned';
  end if;

  select player_ids into room_players
  from public.app_rooms
  where code = normalized_code
  for update;

  if room_players is null or active_user.id <> all(room_players) then
    raise exception 'not a match participant';
  end if;

  select coalesce(prep_state, '{}'::jsonb) into current_state
  from public.app_rooms
  where code = normalized_code;

  next_ready := jsonb_set(
    coalesce(current_state->'ready', '{}'::jsonb),
    array[active_user.id::text],
    to_jsonb(is_ready),
    true
  );

  next_versions := jsonb_set(
    coalesce(current_state->'simulationVersions', '{}'::jsonb),
    array[active_user.id::text],
    to_jsonb(simulation_version),
    true
  );

  if coalesce((next_ready->>(room_players[1]::text))::boolean, false)
    and coalesce((next_ready->>(room_players[2]::text))::boolean, false)
    and (next_versions->>(room_players[1]::text)) is distinct from (next_versions->>(room_players[2]::text)) then
    raise exception 'game version mismatch; refresh both clients';
  end if;

  select jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          current_state,
          array['characterSelections', active_user.id::text],
          to_jsonb(character_kind),
          true
        ),
        array['simulationVersions'],
        next_versions,
        true
      ),
      array['ready'],
      next_ready,
      true
    ),
    array['started'],
    to_jsonb(
      coalesce((next_ready->>(room_players[1]::text))::boolean, false)
      and coalesce((next_ready->>(room_players[2]::text))::boolean, false)
    ),
    true
  ) into next_state
  ;

  if (next_state->>'started')::boolean
    and not (next_state ? 'matchStartAt') then
    next_state := jsonb_set(
      next_state,
      array['matchVersion'],
      to_jsonb(next_versions->>(room_players[1]::text)),
      true
    );
    next_state := jsonb_set(
      next_state,
      array['matchStartAt'],
      to_jsonb(extract(epoch from now()) + 2),
      true
    );
  end if;

  update public.app_rooms
  set prep_state = next_state
  where code = normalized_code;

  return public.app_room_json(normalized_code);
end;
$$;

create or replace function public.use_skill_event(session_token text, room_code text, skill_type text, client_tick integer default 0)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_code text := upper(trim(room_code));
  room_players uuid[];
  current_state jsonb;
  current_events jsonb;
  event_id text;
  apply_tick integer;
  match_start_at numeric;
  server_tick integer;
  next_state jsonb;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if skill_type not in ('normal', 'ultimate') then
    raise exception 'invalid skill type';
  end if;

  select player_ids, coalesce(prep_state, '{}'::jsonb)
  into room_players, current_state
  from public.app_rooms
  where code = normalized_code
  for update;

  if room_players is null or active_user.id <> all(room_players) then
    raise exception 'not a match participant';
  end if;

  if not coalesce((current_state->>'started')::boolean, false) then
    raise exception 'match not started';
  end if;

  if (current_state->>'matchVersion') is distinct from
    (current_state->'simulationVersions'->>active_user.id::text) then
    raise exception 'game version mismatch; refresh both clients';
  end if;

  current_events := coalesce(current_state->'skillEvents', '[]'::jsonb);
  event_id := active_user.id::text || '-' || (jsonb_array_length(current_events) + 1)::text;
  match_start_at := coalesce((current_state->>'matchStartAt')::numeric, extract(epoch from now()));
  server_tick := greatest(0, floor((extract(epoch from now()) - match_start_at) * 60)::integer);
  apply_tick := server_tick + 2;

  next_state := jsonb_set(
    current_state,
    array['skillEvents'],
    current_events || jsonb_build_array(jsonb_build_object(
      'id', event_id,
      'actorId', active_user.id,
      'type', skill_type,
      'applyTick', apply_tick,
      'createdAt', extract(epoch from now())
    )),
    true
  );

  update public.app_rooms
  set prep_state = next_state
  where code = normalized_code;

  return public.app_room_json(normalized_code);
end;
$$;

create or replace function public.leave_room(session_token text, room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_code text := upper(trim(room_code));
  remaining_players uuid[];
  is_matchmaking boolean;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if not exists (select 1 from public.app_rooms where code = normalized_code) then
    raise exception 'room not found';
  end if;

  select coalesce((prep_state->>'matchmaking')::boolean, false)
  into is_matchmaking
  from public.app_rooms
  where code = normalized_code;

  if is_matchmaking then
    delete from public.match_queue where matched_room_code = normalized_code or user_id = active_user.id;
    delete from public.app_rooms where code = normalized_code;
    return jsonb_build_object('left', true, 'room', null);
  end if;

  update public.app_rooms
  set player_ids = array_remove(player_ids, active_user.id)
  where code = normalized_code
  returning player_ids into remaining_players;

  if remaining_players is null or array_length(remaining_players, 1) is null then
    delete from public.app_rooms where code = normalized_code;
    return jsonb_build_object('left', true, 'room', null);
  end if;

  update public.app_rooms
  set host_user_id = case
    when host_user_id = active_user.id then remaining_players[1]
    else host_user_id
  end
  where code = normalized_code;

  return jsonb_build_object('left', true, 'room', public.app_room_json(normalized_code));
end;
$$;

create or replace function public.get_room(session_token text, room_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_code text := upper(trim(room_code));
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if not exists (select 1 from public.app_rooms where code = normalized_code) then
    raise exception 'room not found';
  end if;

  return public.app_room_json(normalized_code);
end;
$$;

create or replace function public.draw_gacha(session_token text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  available text[];
  picked text;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select * into active_user
  from public.app_users
  where id = active_user.id
  for update;

  if active_user.coins < 50 then
    raise exception 'not enough coins';
  end if;

  select array_agg(kind) into available
  from unnest(array[
    'charger', 'grabber', 'poker', 'stealth', 'enhancer',
    'tank', 'beamer', 'wild', 'vampire', 'brawler'
  ]::text[]) as kind
  where kind <> all(active_user.owned_characters);

  if available is null or array_length(available, 1) = 0 then
    raise exception 'all characters owned';
  end if;

  picked := available[(floor(random() * array_length(available, 1))::int + 1)];

  update public.app_users
  set coins = coins - 50,
      owned_characters = array_append(owned_characters, picked)
  where id = active_user.id
  returning * into active_user;

  return jsonb_build_object(
    'picked', picked,
    'user', public.app_user_json(active_user)
  );
end;
$$;

drop function if exists public.claim_free_coins(text);

create or replace function public.begin_pve_run(session_token text, stage_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  run_id uuid;
  normalized_stage text := trim(stage_code);
  required_stage text;
  stage_number integer;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if normalized_stage !~ '^1-([1-9]|10)$' then
    raise exception 'invalid pve stage';
  end if;

  stage_number := split_part(normalized_stage, '-', 2)::integer;
  required_stage := case when stage_number > 1 then '1-' || (stage_number - 1)::text else null end;

  if required_stage is not null and not exists (
    select 1
    from public.pve_runs
    where user_id = active_user.id
      and stage = required_stage
      and completed_at is not null
  ) then
    raise exception 'previous pve stage not cleared';
  end if;

  insert into public.pve_runs (user_id, stage)
  values (active_user.id, normalized_stage)
  returning id into run_id;

  return jsonb_build_object('runId', run_id, 'stage', normalized_stage);
end;
$$;

create or replace function public.get_pve_progress(session_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  completed_stages jsonb;
  unlocked_stages jsonb := '["1-1"]'::jsonb;
  stage_number integer;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select coalesce(jsonb_agg(stage order by stage), '[]'::jsonb)
  into completed_stages
  from (
    select distinct stage
    from public.pve_runs
    where user_id = active_user.id
      and completed_at is not null
  ) completed;

  for stage_number in 1..9 loop
    exit when not (completed_stages ? ('1-' || stage_number::text));
    unlocked_stages := unlocked_stages || jsonb_build_array('1-' || (stage_number + 1)::text);
  end loop;

  return jsonb_build_object(
    'completedStages', completed_stages,
    'unlockedStages', unlocked_stages
  );
end;
$$;

create or replace function public.complete_pve_run(session_token text, run_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  active_run public.pve_runs;
  updated_user public.app_users;
  first_clear boolean;
  stage_reward integer;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select * into active_user
  from public.app_users
  where id = active_user.id
  for update;

  select * into active_run
  from public.pve_runs
  where id = run_id
  for update;

  if active_run.id is null or active_run.user_id <> active_user.id then
    raise exception 'pve run not found';
  end if;

  if active_run.completed_at is not null then
    raise exception 'pve reward already claimed';
  end if;

  if active_run.started_at > now() - interval '3 seconds' then
    raise exception 'pve stage completed too quickly';
  end if;

  select not exists (
    select 1
    from public.pve_runs
    where user_id = active_user.id
      and stage = active_run.stage
      and completed_at is not null
      and id <> active_run.id
  ) into first_clear;

  stage_reward := case
    when active_run.stage = '1-10' and first_clear then 100
    else 10
  end;

  update public.pve_runs
  set completed_at = now()
  where id = active_run.id;

  update public.app_users
  set coins = coins + stage_reward
  where id = active_user.id
  returning * into updated_user;

  return jsonb_build_object(
    'reward', stage_reward,
    'firstClear', first_clear,
    'stage', active_run.stage,
    'user', public.app_user_json(updated_user)
  );
end;
$$;

create or replace function public.get_rankings(session_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'id', ranked.id,
        'name', ranked.username,
        'lp', ranked.lp,
        'coins', ranked.coins,
        'tier', public.lp_tier(ranked.lp)
      )
      order by ranked.lp desc, ranked.username asc
    )
    from (
      select id, username, lp, coins
      from public.app_users
      order by lp desc, username asc
      limit 50
    ) ranked
  ), '[]'::jsonb);
end;
$$;

create or replace function public.set_match_ready(
  session_token text,
  room_code text,
  player_one_id uuid,
  player_two_id uuid,
  bet_amount integer,
  is_ready boolean
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_code text := upper(trim(room_code));
  room_players uuid[];
  safe_bet integer;
  next_state jsonb;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select player_ids into room_players
  from public.app_rooms
  where code = normalized_code
  for update;

  if room_players is null then
    raise exception 'room not found';
  end if;

  if active_user.id <> all(room_players)
    or player_one_id <> all(room_players)
    or player_two_id <> all(room_players) then
    raise exception 'players must be in the same room';
  end if;

  select least(greatest(1, bet_amount), coins) into safe_bet
  from public.app_users
  where id = active_user.id;

  select jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(
          coalesce(prep_state, '{}'::jsonb),
          '{matchPlayers}',
          jsonb_build_object('p1', player_one_id, 'p2', player_two_id),
          true
        ),
        array['bets', active_user.id::text],
        to_jsonb(safe_bet),
        true
      ),
      array['ready', active_user.id::text],
      to_jsonb(is_ready),
      true
    ),
    array['updatedAt'],
    to_jsonb(extract(epoch from now())),
    true
  ) into next_state
  from public.app_rooms
  where code = normalized_code;

  update public.app_rooms
  set prep_state = next_state
  where code = normalized_code;

  return public.app_room_json(normalized_code);
end;
$$;

create or replace function public.settle_match(session_token text, room_code text, winner_id uuid, loser_id uuid, loser_bet integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  winner_user public.app_users;
  loser_user public.app_users;
  normalized_code text := upper(trim(room_code));
  room_players uuid[];
  room_state jsonb;
  settled_winner_id uuid;
  settled_loser_id uuid;
  old_lp integer;
  old_tier text;
  new_tier text;
  promoted boolean := false;
  promotion_reward integer := 0;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if winner_id = loser_id then
    raise exception 'winner and loser must be different';
  end if;

  select player_ids, coalesce(prep_state, '{}'::jsonb)
  into room_players, room_state
  from public.app_rooms
  where code = normalized_code
  for update;

  if room_players is null then
    raise exception 'room not found';
  end if;

  if active_user.id <> all(room_players)
    or winner_id <> all(room_players)
    or loser_id <> all(room_players) then
    raise exception 'players must be in the same room';
  end if;

  if coalesce((room_state->>'settled')::boolean, false) then
    settled_winner_id := nullif(room_state->>'winnerId', '')::uuid;
    if settled_winner_id is null then
      settled_winner_id := winner_id;
    end if;
    settled_loser_id := (
      select player_id
      from unnest(room_players) as player_id
      where player_id <> settled_winner_id
      limit 1
    );
    select * into winner_user from public.app_users where id = settled_winner_id;
    select * into loser_user from public.app_users where id = settled_loser_id;
    return jsonb_build_object(
      'winner', public.app_user_json(winner_user),
      'loser', public.app_user_json(loser_user),
      'lpGain', coalesce((room_state->>'lpGain')::integer, 14),
      'promoted', coalesce((room_state->>'promoted')::boolean, false),
      'oldTier', room_state->>'oldTier',
      'newTier', room_state->>'newTier',
      'promotionReward', coalesce((room_state->>'promotionReward')::integer, 0)
    );
  end if;

  select * into loser_user from public.app_users where id = loser_id for update;
  select * into winner_user from public.app_users where id = winner_id for update;

  old_lp := winner_user.lp;
  old_tier := case
    when old_lp >= 1800 then '다이아'
    when old_lp >= 1600 then '플레'
    when old_lp >= 1400 then '골드'
    when old_lp >= 1200 then '실버'
    else '브론즈'
  end;
  new_tier := case
    when old_lp + 14 >= 1800 then '다이아'
    when old_lp + 14 >= 1600 then '플레'
    when old_lp + 14 >= 1400 then '골드'
    when old_lp + 14 >= 1200 then '실버'
    else '브론즈'
  end;
  promoted := old_tier <> new_tier;
  promotion_reward := case when promoted then 200 else 0 end;

  update public.app_users
  set lp = lp + 14,
      coins = coins + promotion_reward
  where id = winner_id
  returning * into winner_user;

  select * into loser_user from public.app_users where id = loser_id;

  update public.app_rooms
  set prep_state = room_state || jsonb_build_object(
    'settled', true,
    'winnerId', winner_id,
    'lpGain', 14,
    'promoted', promoted,
    'oldTier', old_tier,
    'newTier', new_tier,
    'promotionReward', promotion_reward
  )
  where code = normalized_code;

  delete from public.match_queue
  where matched_room_code = normalized_code;

  return jsonb_build_object(
    'winner', public.app_user_json(winner_user),
    'loser', public.app_user_json(loser_user),
    'lpGain', 14,
    'promoted', promoted,
    'oldTier', old_tier,
    'newTier', new_tier,
    'promotionReward', promotion_reward
  );
end;
$$;

grant execute on function public.signup_user(text, text) to anon, authenticated;
grant execute on function public.login_user(text, text) to anon, authenticated;
grant execute on function public.logout_user(text) to anon, authenticated;
grant execute on function public.get_me(text) to anon, authenticated;
grant execute on function public.get_server_time(text) to anon, authenticated;
revoke execute on function public.create_room(text) from anon, authenticated;
revoke execute on function public.join_room(text, text) from anon, authenticated;
grant execute on function public.leave_room(text, text) to anon, authenticated;
grant execute on function public.get_room(text, text) to anon, authenticated;
grant execute on function public.draw_gacha(text) to anon, authenticated;
grant execute on function public.begin_pve_run(text, text) to anon, authenticated;
grant execute on function public.get_pve_progress(text) to anon, authenticated;
grant execute on function public.complete_pve_run(text, uuid) to anon, authenticated;
grant execute on function public.get_rankings(text) to anon, authenticated;
revoke execute on function public.set_match_ready(text, text, uuid, uuid, integer, boolean) from anon, authenticated;
grant execute on function public.find_pvp_match(text) to anon, authenticated;
grant execute on function public.get_match_status(text) to anon, authenticated;
grant execute on function public.cancel_pvp_match(text) to anon, authenticated;
grant execute on function public.set_character_ready(text, text, text, boolean, text) to anon, authenticated;
grant execute on function public.use_skill_event(text, text, text, integer) to anon, authenticated;
grant execute on function public.settle_match(text, text, uuid, uuid, integer) to anon, authenticated;

notify pgrst, 'reload schema';
