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

create or replace function public.complete_survival_run(
  session_token text,
  run_id uuid,
  client_seconds integer default 0,
  bonus_coins integer default 0
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
  safe_bonus := least(25, greatest(0, bonus_coins));
  survival_reward := least(
    1000,
    floor(elapsed_seconds / 30.0)::integer * 10
      + floor(elapsed_seconds / 300.0)::integer * 50
      + safe_bonus
  );

  update public.pve_runs
  set completed_at = now()
  where id = active_run.id;

  update public.app_users
  set coins = coins + survival_reward
  where id = active_user.id
  returning * into updated_user;

  return jsonb_build_object(
    'reward', survival_reward,
    'elapsedSeconds', elapsed_seconds,
    'user', public.app_user_json(updated_user)
  );
end;
$$;

grant execute on function public.begin_pve_run(text, text) to anon, authenticated;
grant execute on function public.complete_survival_run(text, uuid, integer, integer) to anon, authenticated;
notify pgrst, 'reload schema';
