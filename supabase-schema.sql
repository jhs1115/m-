create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_salt text not null,
  password_hash text not null,
  coins integer not null default 0 check (coins >= 0),
  lp integer not null default 1000 check (lp >= 0),
  pve_damage_total numeric not null default 0 check (pve_damage_total >= 0),
  notice_reward_claimed boolean not null default false,
  pvp_play_count integer not null default 0 check (pvp_play_count >= 0),
  pve_hard_cleared boolean not null default false,
  owned_titles text[] not null default array[]::text[],
  equipped_title text,
  redeemed_codes text[] not null default array[]::text[],
  character_mastery jsonb not null default '{}'::jsonb,
  owned_characters text[] not null default array['thrower']::text[],
  created_at timestamptz not null default now()
);

alter table public.app_users
add column if not exists lp integer not null default 1000 check (lp >= 0);

alter table public.app_users
add column if not exists pve_damage_total numeric not null default 0 check (pve_damage_total >= 0);

alter table public.app_users
add column if not exists notice_reward_claimed boolean not null default false;

alter table public.app_users
add column if not exists pvp_play_count integer not null default 0 check (pvp_play_count >= 0);

alter table public.app_users
add column if not exists pve_hard_cleared boolean not null default false;

alter table public.app_users
add column if not exists owned_titles text[] not null default array[]::text[];

alter table public.app_users
add column if not exists equipped_title text;

alter table public.app_users
add column if not exists redeemed_codes text[] not null default array[]::text[];

alter table public.app_users
add column if not exists character_mastery jsonb not null default '{}'::jsonb;

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
  last_seen_at timestamptz not null default now(),
  matched_room_code text references public.app_rooms(code) on delete set null
);

alter table public.match_queue
add column if not exists last_seen_at timestamptz not null default now();

alter table public.match_queue
add column if not exists casual boolean not null default false;

create table if not exists public.pve_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  stage text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.lobby_chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 160),
  created_at timestamptz not null default now()
);

create index if not exists lobby_chat_messages_created_at_idx
on public.lobby_chat_messages(created_at desc);

alter table public.app_rooms
add column if not exists prep_state jsonb not null default '{}'::jsonb;

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.app_rooms enable row level security;
alter table public.match_queue enable row level security;
alter table public.pve_runs enable row level security;
alter table public.lobby_chat_messages enable row level security;

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

drop policy if exists "lobby chat visible for realtime" on public.lobby_chat_messages;
create policy "lobby chat visible for realtime"
on public.lobby_chat_messages for select
to anon, authenticated
using (created_at > now() - interval '5 minutes');

alter table public.app_rooms replica identity full;
alter table public.match_queue replica identity full;
alter table public.lobby_chat_messages replica identity full;

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
      and tablename = 'lobby_chat_messages'
  ) then
    alter publication supabase_realtime add table public.lobby_chat_messages;
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

create or replace function public.is_forbidden_username(user_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  normalized text := lower(translate(coalesce(user_name, ''), ' ._-~!@#$%^&*()[]{}|\:;"''<>,.?/+=`', ''));
  banned text[] := array[
    U&'\C560\BBF8', U&'\BCF4\C9C0', U&'\C790\C9C0', U&'\C139\C2A4',
    U&'\C528\BC1C', U&'\C2DC\BC1C', U&'\BCD1\C2E0', U&'\C886', U&'\C874\B098',
    U&'\AC1C\C0C8', U&'\C0C8\B07C', 'sex', 'porn', 'fuck', 'shit', 'bitch'
  ];
  item text;
begin
  foreach item in array banned loop
    if normalized like '%' || lower(item) || '%' then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

create or replace function public.safe_display_username(user_name text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case when public.is_forbidden_username(user_name) then '***' else user_name end;
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
    'usernameNeedsChange', public.is_forbidden_username(target_user.username),
    'coins', target_user.coins,
    'lp', target_user.lp,
    'pveDamageTotal', target_user.pve_damage_total,
    'noticeRewardClaimed', target_user.notice_reward_claimed,
    'pvpPlayCount', target_user.pvp_play_count,
    'pveHardCleared', target_user.pve_hard_cleared,
    'characterMastery', target_user.character_mastery,
    'ownedTitles', target_user.owned_titles,
    'equippedTitle', target_user.equipped_title,
    'rankPosition', (
      select ranked.rank_position
      from (
        select id, row_number() over (order by lp desc, username asc) as rank_position
        from public.app_users
      ) ranked
      where ranked.id = target_user.id
    ),
    'pveRankPosition', (
      select ranked.rank_position
      from (
        select id, row_number() over (order by pve_damage_total desc, username asc) as rank_position
        from public.app_users
      ) ranked
      where ranked.id = target_user.id
    ),
    'ownedCharacters', target_user.owned_characters
  );
$$;

create or replace function public.add_character_mastery(user_id uuid, character_kind text, amount integer)
returns void
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_points integer;
begin
  if character_kind is null or character_kind = '' or amount <= 0 then
    return;
  end if;

  select coalesce((character_mastery->>character_kind)::integer, 0)
  into current_points
  from public.app_users
  where id = user_id
  for update;

  update public.app_users
  set character_mastery = jsonb_set(
    coalesce(character_mastery, '{}'::jsonb),
    array[character_kind],
    to_jsonb(least(135, current_points + amount)),
    true
  )
  where id = user_id;
end;
$$;

create or replace function public.lp_tier(score integer)
returns text
language sql
immutable
security definer
set search_path = public
as $$
  select case
    when score >= 2200 then U&'\B2E4\C774\C544'
    when score >= 1800 then U&'\D50C\B808'
    when score >= 1500 then U&'\ACE8\B4DC'
    when score >= 1200 then U&'\C2E4\BC84'
    when score >= 1000 then U&'\BE0C\B860\C988'
    when score >= 500 then U&'\C544\C774\C5B8'
    else U&'\AD6C\B9AC'
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

  if public.is_forbidden_username(clean_name) then
    raise exception 'forbidden username';
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

create or replace function public.update_account(
  session_token text,
  current_user_name text,
  current_password text,
  new_user_name text,
  new_password text,
  new_password_confirm text
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, extensions
as $$
declare
  active_user public.app_users;
  clean_current_name text := trim(current_user_name);
  clean_new_name text := trim(coalesce(new_user_name, ''));
  next_password text := coalesce(new_password, '');
  confirm_password text := coalesce(new_password_confirm, '');
  next_salt text;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if clean_current_name = '' or coalesce(current_password, '') = '' then
    raise exception 'current username and password required';
  end if;

  if clean_current_name <> active_user.username
    or active_user.password_hash <> public.app_hash_password(current_password, active_user.password_salt) then
    raise exception 'invalid current username or password';
  end if;

  if clean_new_name = '' then
    clean_new_name := active_user.username;
  end if;

  if public.is_forbidden_username(clean_new_name) then
    raise exception 'forbidden username';
  end if;

  if next_password <> confirm_password then
    raise exception 'new password confirmation does not match';
  end if;

  if next_password <> '' and length(next_password) < 6 then
    raise exception 'password must be at least 6 characters';
  end if;

  if next_password = '' then
    update public.app_users
    set username = clean_new_name
    where id = active_user.id
    returning * into active_user;
  else
    next_salt := encode(extensions.gen_random_bytes(16), 'hex');
    update public.app_users
    set username = clean_new_name,
        password_salt = next_salt,
        password_hash = public.app_hash_password(next_password, next_salt)
    where id = active_user.id
    returning * into active_user;
  end if;

  return jsonb_build_object('user', public.app_user_json(active_user));
exception
  when unique_violation then
    raise exception 'username already exists';
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

drop function if exists public.find_pvp_match(text);
drop function if exists public.find_pvp_match(text, boolean);
drop function if exists public.find_pvp_match(text, boolean, text);

create or replace function public.find_pvp_match(session_token text, casual boolean default false, match_kind text default 'duel')
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  opponent public.app_users;
  opponent_two public.app_users;
  active_tier text;
  is_casual boolean := coalesce(casual, false);
  is_triple boolean := lower(coalesce(match_kind, 'duel')) = 'triple';
  elapsed_seconds integer;
  existing_room_code text;
  tier_index integer;
  min_index integer;
  max_index integer;
  new_code text;
  tiers text[] := array[U&'\AD6C\B9AC', U&'\C544\C774\C5B8', U&'\BE0C\B860\C988', U&'\C2E4\BC84', U&'\ACE8\B4DC', U&'\D50C\B808', U&'\B2E4\C774\C544'];
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if is_triple then
    is_casual := true;
  end if;

  if not is_casual and coalesce(array_length(active_user.owned_characters, 1), 0) < 5 then
    raise exception 'ranked match requires 5 characters';
  end if;

  update public.match_queue
  set last_seen_at = now()
  where user_id = active_user.id;

  delete from public.app_rooms room
  where coalesce((room.prep_state->>'matchmaking')::boolean, false)
    and not coalesce((room.prep_state->>'started')::boolean, false)
    and exists (
      select 1
      from unnest(room.player_ids) as participant_id
      left join public.match_queue queue on queue.user_id = participant_id
      where queue.user_id is null
        or queue.last_seen_at < now() - interval '8 seconds'
    );

  delete from public.match_queue queue
  where queue.matched_room_code is not null
    and not exists (
      select 1
      from public.app_rooms room
      where room.code = queue.matched_room_code
    );

  delete from public.match_queue
  where matched_room_code is null
    and last_seen_at < now() - interval '8 seconds';

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

  active_tier := case when is_triple then 'triple' when is_casual then 'casual' else public.lp_tier(active_user.lp) end;

  insert into public.match_queue (user_id, tier, casual, last_seen_at)
  values (active_user.id, active_tier, is_casual, now())
  on conflict (user_id) do update
  set tier = excluded.tier,
      casual = excluded.casual,
      last_seen_at = now();

  select greatest(0, extract(epoch from now() - joined_at)::int)
  into elapsed_seconds
  from public.match_queue
  where user_id = active_user.id;

  if is_casual then
    min_index := 1;
    max_index := array_length(tiers, 1);
  else
    min_index := 1;
    max_index := array_length(tiers, 1);
  end if;

  select u.* into opponent
  from public.match_queue q
  join public.app_users u on u.id = q.user_id
  where q.user_id <> active_user.id
    and q.matched_room_code is null
    and q.casual = is_casual
    and (not is_triple or q.tier = active_tier)
    and (is_triple or q.tier <> 'triple')
    and q.last_seen_at >= now() - interval '5 seconds'
    and (is_casual or array_position(tiers, q.tier) between min_index and max_index)
  order by q.joined_at
  limit 1
  for update skip locked;

  if opponent.id is null then
    return jsonb_build_object(
      'matched', false,
      'tier', active_tier,
      'casual', is_casual,
      'range', jsonb_build_object('min', tiers[min_index], 'max', tiers[max_index]),
      'elapsed', elapsed_seconds
    );
  end if;

  if is_triple then
    select u.* into opponent_two
    from public.match_queue q
    join public.app_users u on u.id = q.user_id
    where q.user_id <> active_user.id
      and q.user_id <> opponent.id
      and q.matched_room_code is null
      and q.casual = true
      and q.tier = active_tier
      and q.last_seen_at >= now() - interval '5 seconds'
    order by q.joined_at
    limit 1
    for update skip locked;

    if opponent_two.id is null then
      return jsonb_build_object(
        'matched', false,
        'tier', active_tier,
        'casual', true,
        'triple', true,
        'elapsed', elapsed_seconds
      );
    end if;
  end if;

  loop
    new_code := public.make_room_code();
    exit when not exists (select 1 from public.app_rooms where code = new_code);
  end loop;

  insert into public.app_rooms (code, host_user_id, player_ids, prep_state)
  values (
    new_code,
    active_user.id,
    case when is_triple
      then array[active_user.id, opponent.id, opponent_two.id]::uuid[]
      else array[active_user.id, opponent.id]::uuid[]
    end,
    jsonb_build_object(
      'matchmaking', true,
      'casual', is_casual,
      'triple', is_triple,
      'matchKind', case when is_triple then 'triple' else 'duel' end,
      'lpGain', case when is_casual then 0 else 14 end,
      'matchPlayers', case when is_triple
        then jsonb_build_object('p1', active_user.id, 'p2', opponent.id, 'p3', opponent_two.id)
        else jsonb_build_object('p1', active_user.id, 'p2', opponent.id)
      end,
      'characterSelections', '{}'::jsonb,
      'bans', jsonb_build_object('p1', '[]'::jsonb, 'p2', '[]'::jsonb),
      'banTurnStartedAt', extract(epoch from now()),
      'ready', '{}'::jsonb,
      'started', false,
      'createdAt', extract(epoch from now())
    )
  );

  update public.match_queue
  set matched_room_code = new_code,
      last_seen_at = now()
  where user_id in (active_user.id, opponent.id, opponent_two.id);

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

drop function if exists public.set_character_ban(text, text, text);
create or replace function public.set_character_ban(
  session_token text,
  room_code text,
  character_kind text
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
  active_slot text;
  active_list jsonb;
  other_list jsonb;
  total_bans integer;
  expected_slot text;
  other_slot text;
  valid_character_kinds text[] := array[
    'thrower', 'charger', 'grabber', 'poker', 'stealth', 'enhancer',
    'tank', 'beamer', 'wild', 'vampire', 'brawler', 'timekeeper',
    'riftmaker', 'summoner', 'swordsman', 'demon', 'artist',
    'believer', 'archmage', 'gunner', 'freezer', 'bomberman', 'roper', 'gambler', 'cosmic'
  ];
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select player_ids, coalesce(prep_state, '{}'::jsonb)
  into room_players, current_state
  from public.app_rooms
  where code = normalized_code
  for update;

  if room_players is null or active_user.id <> all(room_players) then
    raise exception 'not a match participant';
  end if;

  if coalesce((current_state->>'casual')::boolean, false) then
    raise exception 'casual match has no bans';
  end if;

  active_slot := case when active_user.id = room_players[1] then 'p1' else 'p2' end;
  other_slot := case when active_slot = 'p1' then 'p2' else 'p1' end;
  active_list := coalesce(current_state->'bans'->active_slot, '[]'::jsonb);
  other_list := coalesce(current_state->'bans'->other_slot, '[]'::jsonb);
  total_bans := jsonb_array_length(active_list) + jsonb_array_length(other_list);
  expected_slot := case when total_bans % 2 = 0 then 'p1' else 'p2' end;

  if total_bans >= 4 then
    raise exception 'ban phase already finished';
  end if;

  if active_slot <> expected_slot then
    raise exception 'not your ban turn';
  end if;

  if jsonb_array_length(active_list) >= 2 then
    raise exception 'ban limit reached';
  end if;

  if character_kind <> 'none' then
    if character_kind <> all(valid_character_kinds) then
      raise exception 'invalid character';
    end if;
    if (coalesce(current_state->'bans'->'p1', '[]'::jsonb) || coalesce(current_state->'bans'->'p2', '[]'::jsonb)) ? character_kind then
      raise exception 'character already banned';
    end if;
  end if;

  next_state := jsonb_set(
    current_state,
    array['bans', active_slot],
    active_list || to_jsonb(character_kind),
    true
  );

  if total_bans + 1 >= 4 then
    next_state := jsonb_set(next_state, array['bansComplete'], 'true'::jsonb, true);
    next_state := jsonb_set(next_state, array['bansCompleteAt'], to_jsonb(extract(epoch from now())), true);
  else
    next_state := jsonb_set(next_state, array['banTurnStartedAt'], to_jsonb(extract(epoch from now())), true);
  end if;

  update public.app_rooms
  set prep_state = next_state
  where code = normalized_code;

  return public.app_room_json(normalized_code);
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
  ready_count integer;
  participant_count integer;
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

  if not coalesce((current_state->>'casual')::boolean, false) then
    if jsonb_array_length(coalesce(current_state->'bans'->'p1', '[]'::jsonb))
      + jsonb_array_length(coalesce(current_state->'bans'->'p2', '[]'::jsonb)) < 4 then
      raise exception 'ban phase is not finished';
    end if;

    if (coalesce(current_state->'bans'->'p1', '[]'::jsonb) || coalesce(current_state->'bans'->'p2', '[]'::jsonb)) ? character_kind then
      raise exception 'character is banned';
    end if;
  end if;

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

  participant_count := coalesce(array_length(room_players, 1), 0);
  select count(*) into ready_count
  from unnest(room_players) as participant_id
  where coalesce((next_ready->>(participant_id::text))::boolean, false);

  if ready_count = participant_count
    and exists (
      select 1
      from unnest(room_players) as participant_id
      where (next_versions->>(participant_id::text)) is distinct from (next_versions->>(room_players[1]::text))
    ) then
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
    to_jsonb(ready_count = participant_count),
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

create or replace function public.record_match_mastery(session_token text, room_code text)
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
  room_state jsonb;
  character_kind text;
  recorded jsonb;
  mastery_amount integer := 9;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select player_ids, coalesce(prep_state, '{}'::jsonb)
  into room_players, room_state
  from public.app_rooms
  where code = normalized_code
  for update;

  if room_players is null or active_user.id <> all(room_players) then
    raise exception 'not a match participant';
  end if;

  recorded := coalesce(room_state->'masteryRecorded', '{}'::jsonb);
  if coalesce((recorded->>(active_user.id::text))::boolean, false) then
    delete from public.match_queue
    where user_id = active_user.id
      and matched_room_code = normalized_code;
    select * into active_user from public.app_users where id = active_user.id;
    return jsonb_build_object('user', public.app_user_json(active_user), 'recorded', false);
  end if;

  if coalesce(room_state->>'matchKind', 'duel') <> 'triple'
    and not coalesce((room_state->>'casual')::boolean, false) then
    mastery_amount := 18;
  end if;

  character_kind := room_state->'characterSelections'->>active_user.id::text;
  perform public.add_character_mastery(active_user.id, character_kind, mastery_amount);

  update public.app_users
  set pvp_play_count = pvp_play_count + 1
  where id = active_user.id
  returning * into active_user;

  update public.app_rooms
  set prep_state = jsonb_set(
    room_state,
    array['masteryRecorded', active_user.id::text],
    'true'::jsonb,
    true
  )
  where code = normalized_code;

  delete from public.match_queue
  where user_id = active_user.id
    and matched_room_code = normalized_code;

  return jsonb_build_object('user', public.app_user_json(active_user), 'recorded', true);
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

  if skill_type not in ('attack', 'normal', 'ultimate') then
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
    'tank', 'beamer', 'wild', 'vampire', 'brawler',
    'timekeeper', 'riftmaker', 'summoner', 'swordsman', 'demon', 'artist', 'believer', 'archmage', 'gunner', 'freezer', 'bomberman', 'roper', 'gambler', 'cosmic'
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

create or replace function public.claim_notice_mail_reward(session_token text)
returns jsonb
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

  select * into active_user
  from public.app_users
  where id = active_user.id
  for update;

  if active_user.notice_reward_claimed then
    raise exception 'mail reward already claimed';
  end if;

  update public.app_users
  set coins = coins + 100,
      notice_reward_claimed = true
  where id = active_user.id
  returning * into active_user;

  return jsonb_build_object(
    'reward', 100,
    'user', public.app_user_json(active_user)
  );
end;
$$;

grant execute on function public.claim_notice_mail_reward(text) to anon, authenticated;

create or replace function public.claim_title_reward(session_token text, title_key text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_key text := trim(title_key);
  eligible boolean := false;
  rank_position integer;
  pve_rank_position integer;
  all_characters text[] := array[
    'thrower', 'charger', 'grabber', 'poker', 'stealth', 'enhancer', 'tank', 'beamer',
    'wild', 'vampire', 'brawler', 'timekeeper', 'riftmaker', 'summoner', 'swordsman',
    'demon', 'artist', 'believer', 'archmage', 'gunner', 'freezer', 'gambler', 'cosmic',
    'bomberman', 'roper'
  ];
  mastery_kind text;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select * into active_user
  from public.app_users
  where id = active_user.id
  for update;

  if normalized_key = any(active_user.owned_titles) then
    raise exception 'title already claimed';
  end if;

  select ranked.rank_position into rank_position
  from (
    select id, row_number() over (order by lp desc, username asc) as rank_position
    from public.app_users
  ) ranked
  where ranked.id = active_user.id;

  select ranked.rank_position into pve_rank_position
  from (
    select id, row_number() over (order by pve_damage_total desc, username asc) as rank_position
    from public.app_users
  ) ranked
  where ranked.id = active_user.id;

  if normalized_key like 'mastery_%' then
    mastery_kind := substring(normalized_key from 9);
    eligible := mastery_kind = any(all_characters)
      and coalesce((active_user.character_mastery->>mastery_kind)::integer, 0) >= 135;
  else
    eligible := case normalized_key
      when 'm_beginner' then active_user.pvp_play_count >= 5
      when 'm_skilled' then active_user.pvp_play_count >= 20
      when 'm_expert' then active_user.pvp_play_count >= 50
      when 'm_progamer' then active_user.pvp_play_count >= 100
      when 'pve_progamer' then active_user.pve_hard_cleared
      when 'challenger' then active_user.lp >= 2700 and rank_position = 1
      when 'all_collect' then all_characters <@ active_user.owned_characters
      when 'million_left' then active_user.coins >= 1000
      when 'million_right' then active_user.coins >= 10000
      when 'god_pve' then active_user.pve_damage_total > 0 and pve_rank_position = 1
      else false
    end;
  end if;

  if not eligible then
    raise exception 'title condition not met';
  end if;

  update public.app_users
  set owned_titles = array_append(owned_titles, normalized_key),
      equipped_title = coalesce(equipped_title, normalized_key)
  where id = active_user.id
  returning * into active_user;

  return jsonb_build_object(
    'title', normalized_key,
    'user', public.app_user_json(active_user)
  );
end;
$$;

create or replace function public.equip_title(session_token text, title_key text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_key text := nullif(trim(coalesce(title_key, '')), '');
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select * into active_user
  from public.app_users
  where id = active_user.id
  for update;

  if normalized_key is not null and not normalized_key = any(active_user.owned_titles) then
    raise exception 'title not owned';
  end if;

  update public.app_users
  set equipped_title = normalized_key
  where id = active_user.id
  returning * into active_user;

  return jsonb_build_object('user', public.app_user_json(active_user));
end;
$$;

grant execute on function public.claim_title_reward(text, text) to anon, authenticated;
grant execute on function public.equip_title(text, text) to anon, authenticated;

create or replace function public.redeem_mailbox_code(session_token text, reward_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_code text := lower(trim(coalesce(reward_code, '')));
  title_key text;
  coin_reward integer := 0;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if normalized_code not in ('wjdgmltjr1115', 'beta_sex', 'noob_coin', 'all_wjdgmltjr', 'ajd40k', 'hologram') then
    raise exception 'invalid code';
  end if;

  select * into active_user
  from public.app_users
  where id = active_user.id
  for update;

  if normalized_code <> 'all_wjdgmltjr' and normalized_code = any(active_user.redeemed_codes) then
    raise exception 'already used code';
  end if;

  if normalized_code in ('wjdgmltjr1115', 'beta_sex', 'hologram') then
    title_key := case
      when normalized_code = 'wjdgmltjr1115' then 'developer'
      when normalized_code = 'hologram' then 'hologram'
      else 'beta_tester'
    end;
    update public.app_users
    set owned_titles = case when title_key = any(owned_titles) then owned_titles else array_append(owned_titles, title_key) end,
        equipped_title = coalesce(equipped_title, title_key),
        redeemed_codes = array_append(redeemed_codes, normalized_code)
    where id = active_user.id
    returning * into active_user;
  elsif normalized_code = 'all_wjdgmltjr' then
    title_key := 'all_titles';
    update public.app_users
    set owned_titles = (
          select array_agg(distinct reward_title.key)
          from unnest(owned_titles || array[
            'm_beginner', 'm_skilled', 'm_expert', 'm_progamer', 'pve_progamer',
            'challenger', 'all_collect', 'million_left', 'million_right', 'god_pve',
            'beta_tester', 'developer', 'hologram',
            'mastery_thrower', 'mastery_charger', 'mastery_grabber', 'mastery_poker',
            'mastery_stealth', 'mastery_enhancer', 'mastery_tank', 'mastery_beamer',
            'mastery_wild', 'mastery_vampire', 'mastery_brawler', 'mastery_timekeeper',
            'mastery_riftmaker', 'mastery_summoner', 'mastery_swordsman', 'mastery_demon',
            'mastery_artist', 'mastery_believer', 'mastery_archmage', 'mastery_gunner',
              'mastery_freezer', 'mastery_gambler', 'mastery_cosmic', 'mastery_bomberman',
              'mastery_roper', 'mastery_hacker', 'mastery_geomancer'
          ]::text[]) as reward_title(key)
        ),
        equipped_title = coalesce(equipped_title, 'developer')
    where id = active_user.id
    returning * into active_user;
  else
      coin_reward := case when normalized_code = 'ajd40k' then 50 else 100 end;
    update public.app_users
    set coins = coins + coin_reward,
        redeemed_codes = array_append(redeemed_codes, normalized_code)
    where id = active_user.id
    returning * into active_user;
  end if;

  return jsonb_build_object(
    'title', title_key,
    'coins', coin_reward,
    'user', public.app_user_json(active_user)
  );
end;
$$;

grant execute on function public.redeem_mailbox_code(text, text) to anon, authenticated;

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

  if normalized_stage <> 'survival' and normalized_stage !~ '^1-([1-9]|10)$' then
    raise exception 'invalid pve stage';
  end if;

  if normalized_stage = 'survival' then
    required_stage := null;
  else
    stage_number := split_part(normalized_stage, '-', 2)::integer;
    required_stage := case when stage_number > 1 then '1-' || (stage_number - 1)::text else null end;
  end if;

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

drop function if exists public.complete_survival_run(text, uuid, integer, integer);
drop function if exists public.complete_survival_run(text, uuid, integer, integer, numeric);

create or replace function public.complete_survival_run(
  session_token text,
  run_id uuid,
  client_seconds integer default 0,
  bonus_coins integer default 0,
  damage_dealt numeric default 0,
  difficulty text default 'normal'
)
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
  elapsed_seconds integer;
  survival_reward integer;
  safe_bonus integer;
  safe_damage numeric;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  select * into active_run
  from public.pve_runs
  where id = run_id
  for update;

  if active_run.id is null
    or active_run.user_id <> active_user.id
    or active_run.stage <> 'survival' then
    raise exception 'survival run not found';
  end if;

  if active_run.completed_at is not null then
    raise exception 'survival reward already claimed';
  end if;

  elapsed_seconds := greatest(0, extract(epoch from now() - active_run.started_at)::integer);
  elapsed_seconds := least(elapsed_seconds, greatest(0, client_seconds) + 5);
  safe_bonus := least(12, greatest(0, bonus_coins));
  safe_damage := least(1000000000, greatest(0, coalesce(damage_dealt, 0)));
  survival_reward := least(
    500,
    floor(
      floor(least(elapsed_seconds, 300) / 30.0)::numeric * 2.5
        + floor(least(greatest(elapsed_seconds - 300, 0), 300) / 30.0)::numeric * 6
        + floor(greatest(elapsed_seconds - 600, 0) / 30.0)::numeric * 9
        + floor(elapsed_seconds / 300.0)::numeric * 25
        + case when elapsed_seconds >= 900 then 25 else 0 end
        + safe_bonus
    )::integer
  );

  update public.pve_runs
  set completed_at = now()
  where id = active_run.id;

  update public.app_users
  set coins = coins + survival_reward,
      pve_damage_total = pve_damage_total + safe_damage,
      pve_hard_cleared = pve_hard_cleared
        or (coalesce(difficulty, '') = 'hard' and elapsed_seconds >= 900)
  where id = active_user.id
  returning * into updated_user;

  return jsonb_build_object(
    'reward', survival_reward,
    'elapsedSeconds', elapsed_seconds,
    'user', public.app_user_json(updated_user)
  );
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
    when active_run.stage = '1-10' and first_clear then 50
    else 5
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
        'name', public.safe_display_username(ranked.username),
        'lp', ranked.lp,
        'coins', ranked.coins,
        'equippedTitle', ranked.equipped_title,
        'tier', case
          when ranked.lp < 2700 then public.lp_tier(ranked.lp)
          when ranked.rank_position = 1 then U&'\CC4C\B9B0\C800'
          when ranked.rank_position in (2, 3) then U&'\ADF8\B9C8'
          when ranked.lp >= 2700 and ranked.rank_position between 4 and 7 then U&'\B9C8\C2A4\D130'
          else public.lp_tier(ranked.lp)
        end
      )
      order by ranked.rank_position
    )
    from (
      select ranked_users.*
      from (
        select id, username, lp, coins, equipped_title,
          row_number() over (order by lp desc, username asc) as rank_position
        from public.app_users
      ) ranked_users
      where ranked_users.rank_position <= 50
    ) ranked
  ), '[]'::jsonb);
end;
$$;
create or replace function public.get_pve_rankings(session_token text)
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
        'name', public.safe_display_username(ranked.username),
        'lp', ranked.lp,
        'coins', ranked.coins,
        'equippedTitle', ranked.equipped_title,
        'pveDamageTotal', ranked.pve_damage_total
      )
      order by ranked.rank_position
    )
    from (
      select ranked_users.*
      from (
        select id, username, lp, coins, equipped_title, pve_damage_total,
          row_number() over (order by pve_damage_total desc, username asc) as rank_position
        from public.app_users
      ) ranked_users
      where ranked_users.rank_position <= 50
    ) ranked
  ), '[]'::jsonb);
end;
$$;

create or replace function public.cleanup_lobby_chat()
returns void
language sql
volatile
security definer
set search_path = public
as $$
  delete from public.lobby_chat_messages
  where created_at <= now() - interval '5 minutes';
$$;

create or replace function public.lobby_chat_json(chat_row public.lobby_chat_messages)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', chat_row.id,
    'message', chat_row.message,
    'createdAt', chat_row.created_at,
    'player', public.app_user_json(u)
  )
  from public.app_users u
  where u.id = chat_row.user_id;
$$;

create or replace function public.get_lobby_chat(session_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  result jsonb;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  perform public.cleanup_lobby_chat();

  select coalesce(jsonb_agg(item order by created_at), '[]'::jsonb)
  into result
  from (
    select m.created_at, public.lobby_chat_json(m) as item
    from public.lobby_chat_messages m
    where m.created_at > now() - interval '5 minutes'
    order by m.created_at asc
    limit 80
  ) recent;

  return result;
end;
$$;

create or replace function public.send_lobby_chat(session_token text, chat_message text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  active_user public.app_users;
  normalized_message text := btrim(coalesce(chat_message, ''));
  inserted_message public.lobby_chat_messages;
begin
  active_user := public.app_user_from_token(session_token);
  if active_user.id is null then
    raise exception 'login required';
  end if;

  if char_length(normalized_message) < 1 then
    raise exception 'empty message';
  end if;

  if char_length(normalized_message) > 160 then
    normalized_message := substr(normalized_message, 1, 160);
  end if;

  perform public.cleanup_lobby_chat();

  insert into public.lobby_chat_messages(user_id, message)
  values (active_user.id, normalized_message)
  returning * into inserted_message;

  return public.lobby_chat_json(inserted_message);
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
  casual_match boolean := false;
  settled_winner_id uuid;
  settled_loser_id uuid;
  old_lp integer;
  old_tier text;
  new_tier text;
  winner_tier_index integer;
  loser_tier_index integer;
  tier_difference integer;
  lp_gain integer := 14;
  lp_loss integer := 4;
  winner_character text;
  loser_character text;
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

  casual_match := coalesce((room_state->>'casual')::boolean, false);

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
      'lpGain', case when coalesce((room_state->>'casual')::boolean, false) then 0 else coalesce((room_state->>'lpGain')::integer, 14) end,
      'lpLoss', case when coalesce((room_state->>'casual')::boolean, false) then 0 else coalesce((room_state->>'lpLoss')::integer, 7) end,
      'casual', coalesce((room_state->>'casual')::boolean, false),
      'promoted', coalesce((room_state->>'promoted')::boolean, false),
      'oldTier', room_state->>'oldTier',
      'newTier', room_state->>'newTier',
      'promotionReward', coalesce((room_state->>'promotionReward')::integer, 0),
      'coinReward', coalesce((room_state->>'coinReward')::integer, 0)
    );
  end if;

  select * into loser_user from public.app_users where id = loser_id for update;
  select * into winner_user from public.app_users where id = winner_id for update;
  winner_character := room_state->'characterSelections'->>winner_id::text;
  loser_character := room_state->'characterSelections'->>loser_id::text;

  if casual_match then
    perform public.add_character_mastery(winner_id, winner_character, 9);
    perform public.add_character_mastery(loser_id, loser_character, 9);
    update public.app_users
    set coins = coins + 10,
        pvp_play_count = pvp_play_count + 1
    where id = winner_id
    returning * into winner_user;

    update public.app_users
    set pvp_play_count = pvp_play_count + 1
    where id = loser_id
    returning * into loser_user;

    update public.app_rooms
    set prep_state = room_state || jsonb_build_object(
      'settled', true,
      'winnerId', winner_id,
      'lpGain', 0,
      'lpLoss', 0,
      'casual', true,
      'promoted', false,
      'oldTier', public.lp_tier(winner_user.lp),
      'newTier', public.lp_tier(winner_user.lp),
      'promotionReward', 0,
      'coinReward', 10
    )
    where code = normalized_code;

    delete from public.match_queue
    where matched_room_code = normalized_code;

    return jsonb_build_object(
      'winner', public.app_user_json(winner_user),
      'loser', public.app_user_json(loser_user),
      'lpGain', 0,
      'lpLoss', 0,
      'casual', true,
      'promoted', false,
      'oldTier', public.lp_tier(winner_user.lp),
      'newTier', public.lp_tier(winner_user.lp),
      'promotionReward', 0,
      'coinReward', 10
    );
  end if;

  old_lp := winner_user.lp;
  winner_tier_index := case
    when winner_user.lp >= 2700 then 7
    when winner_user.lp >= 2200 then 6
    when winner_user.lp >= 1800 then 5
    when winner_user.lp >= 1500 then 4
    when winner_user.lp >= 1200 then 3
    when winner_user.lp >= 1000 then 2
    when winner_user.lp >= 500 then 1
    else 0
  end;
  loser_tier_index := case
    when loser_user.lp >= 2700 then 7
    when loser_user.lp >= 2200 then 6
    when loser_user.lp >= 1800 then 5
    when loser_user.lp >= 1500 then 4
    when loser_user.lp >= 1200 then 3
    when loser_user.lp >= 1000 then 2
    when loser_user.lp >= 500 then 1
    else 0
  end;
  tier_difference := loser_tier_index - winner_tier_index;
  lp_gain := greatest(10, least(20, 15 + tier_difference * 2));
  lp_loss := greatest(3, least(7, 4 + tier_difference));
  old_tier := case
    when old_lp >= 2200 then U&'\B2E4\C774\C544'
    when old_lp >= 1800 then U&'\D50C\B808'
    when old_lp >= 1500 then U&'\ACE8\B4DC'
    when old_lp >= 1200 then U&'\C2E4\BC84'
    when old_lp >= 1000 then U&'\BE0C\B860\C988'
    when old_lp >= 500 then U&'\C544\C774\C5B8'
    else U&'\AD6C\B9AC'
  end;
  new_tier := case
    when old_lp + 14 >= 2200 then U&'\B2E4\C774\C544'
    when old_lp + 14 >= 1800 then U&'\D50C\B808'
    when old_lp + 14 >= 1500 then U&'\ACE8\B4DC'
    when old_lp + 14 >= 1200 then U&'\C2E4\BC84'
    when old_lp + 14 >= 1000 then U&'\BE0C\B860\C988'
    when old_lp + 14 >= 500 then U&'\C544\C774\C5B8'
    else U&'\AD6C\B9AC'
  end;
  old_tier := public.lp_tier(old_lp);
  new_tier := public.lp_tier(old_lp + lp_gain);
  promoted := old_tier <> new_tier;
  promotion_reward := case when promoted then 200 else 0 end;

  perform public.add_character_mastery(winner_id, winner_character, 18);
  perform public.add_character_mastery(loser_id, loser_character, 18);

  update public.app_users
  set lp = lp + lp_gain,
      coins = coins + promotion_reward,
      pvp_play_count = pvp_play_count + 1
  where id = winner_id
  returning * into winner_user;

  update public.app_users
  set lp = greatest(0, lp - lp_loss),
      pvp_play_count = pvp_play_count + 1
  where id = loser_id
  returning * into loser_user;

  update public.app_rooms
  set prep_state = room_state || jsonb_build_object(
    'settled', true,
    'winnerId', winner_id,
    'lpGain', lp_gain,
    'lpLoss', lp_loss,
    'casual', false,
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
    'lpGain', lp_gain,
    'lpLoss', lp_loss,
    'casual', false,
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
grant execute on function public.update_account(text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_me(text) to anon, authenticated;
grant execute on function public.get_server_time(text) to anon, authenticated;
revoke execute on function public.create_room(text) from anon, authenticated;
revoke execute on function public.join_room(text, text) from anon, authenticated;
grant execute on function public.leave_room(text, text) to anon, authenticated;
grant execute on function public.get_room(text, text) to anon, authenticated;
grant execute on function public.draw_gacha(text) to anon, authenticated;
grant execute on function public.begin_pve_run(text, text) to anon, authenticated;
grant execute on function public.get_pve_progress(text) to anon, authenticated;
grant execute on function public.complete_survival_run(text, uuid, integer, integer, numeric, text) to anon, authenticated;
grant execute on function public.complete_pve_run(text, uuid) to anon, authenticated;
grant execute on function public.get_rankings(text) to anon, authenticated;
grant execute on function public.get_pve_rankings(text) to anon, authenticated;
grant execute on function public.get_lobby_chat(text) to anon, authenticated;
grant execute on function public.send_lobby_chat(text, text) to anon, authenticated;
revoke execute on function public.set_match_ready(text, text, uuid, uuid, integer, boolean) from anon, authenticated;
grant execute on function public.find_pvp_match(text, boolean, text) to anon, authenticated;
grant execute on function public.get_match_status(text) to anon, authenticated;
grant execute on function public.cancel_pvp_match(text) to anon, authenticated;
grant execute on function public.set_character_ban(text, text, text) to anon, authenticated;
grant execute on function public.set_character_ready(text, text, text, boolean, text) to anon, authenticated;
grant execute on function public.record_match_mastery(text, text) to anon, authenticated;
grant execute on function public.use_skill_event(text, text, text, integer) to anon, authenticated;
grant execute on function public.settle_match(text, text, uuid, uuid, integer) to anon, authenticated;

notify pgrst, 'reload schema';
