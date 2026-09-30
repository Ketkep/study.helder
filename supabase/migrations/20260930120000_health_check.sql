-- A tiny function the daily keep-alive cron calls so the free Supabase
-- project is not paused for inactivity. Touches no user data.
create or replace function public.health_check()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select true;
$$;

revoke all on function public.health_check() from public;
grant execute on function public.health_check() to anon, authenticated;
