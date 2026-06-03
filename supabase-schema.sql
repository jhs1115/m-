create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  coins integer not null default 100 check (coins >= 0),
  owned_characters text[] not null default array['thrower']::text[],
  created_at timestamptz not null default now()
);

create table if not exists public.rooms (
  code text primary key,
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  player_ids uuid[] not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;

drop policy if exists "profiles are visible to logged in users" on public.profiles;
create policy "profiles are visible to logged in users"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "rooms are visible to logged in users" on public.rooms;
create policy "rooms are visible to logged in users"
on public.rooms for select
to authenticated
using (true);

create or replace function public.profile_json(target_profile public.profiles)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', target_profile.id,
    'username', target_profile.username,
    'coins', target_profile.coins,
    'ownedCharacters', target_profile.owned_characters
  );
$$;

create or replace function public.room_json(room_code text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'code', r.code,
    'hostUserId', r.host_user_id,
    'players', coalesce(
      (
        select jsonb_agg(public.profile_json(p) order by array_position(r.player_ids, p.id))
        from public.profiles p
        where p.id = any(r.player_ids)
      ),
      '[]'::jsonb
    )
  )
  from public.rooms r
  where r.code = room_code;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_name text;
begin
  requested_name := nullif(trim(new.raw_user_meta_data->>'username'), '');
  if requested_name is null then
    requested_name := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (id, username, coins, owned_characters)
  values (new.id, requested_name, 100, array['thrower']::text[])
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.get_me()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select public.profile_json(p)
  from public.profiles p
  where p.id = auth.uid();
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

create or replace function public.create_room()
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  new_code text;
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  loop
    new_code := public.make_room_code();
    exit when not exists (select 1 from public.rooms where code = new_code);
  end loop;

  insert into public.rooms (code, host_user_id, player_ids)
  values (new_code, auth.uid(), array[auth.uid()]::uuid[]);

  return public.room_json(new_code);
end;
$$;

create or replace function public.join_room(room_code text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  normalized_code text := upper(trim(room_code));
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  if not exists (select 1 from public.rooms where code = normalized_code) then
    raise exception 'room not found';
  end if;

  update public.rooms
  set player_ids = case
    when auth.uid() = any(player_ids) then player_ids
    else array_append(player_ids, auth.uid())
  end
  where code = normalized_code;

  return public.room_json(normalized_code);
end;
$$;

create or replace function public.get_room(room_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  normalized_code text := upper(trim(room_code));
begin
  if not exists (select 1 from public.rooms where code = normalized_code) then
    raise exception 'room not found';
  end if;

  return public.room_json(normalized_code);
end;
$$;

create or replace function public.draw_gacha()
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  current_profile public.profiles;
  available text[];
  picked text;
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  select * into current_profile
  from public.profiles
  where id = auth.uid()
  for update;

  if current_profile.coins < 50 then
    raise exception 'not enough coins';
  end if;

  select array_agg(kind) into available
  from unnest(array['charger', 'grabber']::text[]) as kind
  where kind <> all(current_profile.owned_characters);

  if available is null or array_length(available, 1) = 0 then
    raise exception 'all characters owned';
  end if;

  picked := available[(floor(random() * array_length(available, 1))::int + 1)];

  update public.profiles
  set coins = coins - 50,
      owned_characters = array_append(owned_characters, picked)
  where id = auth.uid()
  returning * into current_profile;

  return jsonb_build_object(
    'picked', picked,
    'user', public.profile_json(current_profile)
  );
end;
$$;

create or replace function public.settle_match(winner_id uuid, loser_id uuid, loser_bet integer)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  winner_profile public.profiles;
  loser_profile public.profiles;
  safe_bet integer := greatest(1, loser_bet);
begin
  if auth.uid() is null then
    raise exception 'login required';
  end if;

  if winner_id = loser_id then
    raise exception 'winner and loser must be different';
  end if;

  if auth.uid() not in (winner_id, loser_id) then
    raise exception 'not a match participant';
  end if;

  select * into loser_profile from public.profiles where id = loser_id for update;
  select * into winner_profile from public.profiles where id = winner_id for update;

  safe_bet := least(safe_bet, loser_profile.coins);

  update public.profiles
  set coins = coins - safe_bet
  where id = loser_id
  returning * into loser_profile;

  update public.profiles
  set coins = coins + safe_bet
  where id = winner_id
  returning * into winner_profile;

  return jsonb_build_object(
    'winner', public.profile_json(winner_profile),
    'loser', public.profile_json(loser_profile),
    'amount', safe_bet
  );
end;
$$;

grant execute on function public.get_me() to authenticated;
grant execute on function public.create_room() to authenticated;
grant execute on function public.join_room(text) to authenticated;
grant execute on function public.get_room(text) to authenticated;
grant execute on function public.draw_gacha() to authenticated;
grant execute on function public.settle_match(uuid, uuid, integer) to authenticated;
