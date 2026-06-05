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

alter table public.app_rooms
add column if not exists prep_state jsonb not null default '{}'::jsonb;

alter table public.app_users enable row level security;
alter table public.app_sessions enable row level security;
alter table public.app_rooms enable row level security;
alter table public.match_queue enable row level security;

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

create or replace function public.set_character_ready(session_token text, room_code text, character_kind text, is_ready boolean)
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

  select jsonb_set(
    jsonb_set(
      jsonb_set(
        current_state,
        array['characterSelections', active_user.id::text],
        to_jsonb(character_kind),
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
  from unnest(array['charger', 'grabber', 'poker', 'stealth']::text[]) as kind
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

  select * into loser_user from public.app_users where id = loser_id for update;
  select * into winner_user from public.app_users where id = winner_id for update;

  if coalesce((room_state->>'settled')::boolean, false) then
    return jsonb_build_object(
      'winner', public.app_user_json(winner_user),
      'loser', public.app_user_json(loser_user),
      'lpGain', 0
    );
  end if;

  update public.app_users
  set lp = lp + 14
  where id = winner_id
  returning * into winner_user;

  select * into loser_user from public.app_users where id = loser_id;

  update public.app_rooms
  set prep_state = jsonb_set(
    jsonb_set(room_state, array['settled'], 'true'::jsonb, true),
    array['winnerId'],
    to_jsonb(winner_id),
    true
  )
  where code = normalized_code;

  delete from public.match_queue
  where matched_room_code = normalized_code;

  return jsonb_build_object(
    'winner', public.app_user_json(winner_user),
    'loser', public.app_user_json(loser_user),
    'lpGain', 14
  );
end;
$$;

grant execute on function public.signup_user(text, text) to anon, authenticated;
grant execute on function public.login_user(text, text) to anon, authenticated;
grant execute on function public.logout_user(text) to anon, authenticated;
grant execute on function public.get_me(text) to anon, authenticated;
revoke execute on function public.create_room(text) from anon, authenticated;
revoke execute on function public.join_room(text, text) from anon, authenticated;
grant execute on function public.leave_room(text, text) to anon, authenticated;
grant execute on function public.get_room(text, text) to anon, authenticated;
grant execute on function public.draw_gacha(text) to anon, authenticated;
revoke execute on function public.set_match_ready(text, text, uuid, uuid, integer, boolean) from anon, authenticated;
grant execute on function public.find_pvp_match(text) to anon, authenticated;
grant execute on function public.get_match_status(text) to anon, authenticated;
grant execute on function public.cancel_pvp_match(text) to anon, authenticated;
grant execute on function public.set_character_ready(text, text, text, boolean) to anon, authenticated;
grant execute on function public.settle_match(text, text, uuid, uuid, integer) to anon, authenticated;

notify pgrst, 'reload schema';
