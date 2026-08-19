-- Allow service role and SQL editor to set profiles.is_admin
-- (needed to bootstrap the first admin; auth.uid() is null in those contexts).
create or replace function private.protect_profile_admin_flag()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(
    auth.role(),
    current_setting('request.jwt.claim.role', true)
  );

  if jwt_role = 'service_role'
     or current_user in ('postgres', 'supabase_admin') then
    return new;
  end if;

  if new.is_admin is distinct from old.is_admin
     and not (select private.is_admin()) then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;
