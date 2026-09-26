CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT app.has_role_internal(_user_id, _role)
$function$;

CREATE OR REPLACE FUNCTION public.current_group_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT app.current_group_id_internal()
$function$;

GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app.has_role_internal(uuid, app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION app.current_group_id_internal() TO anon, authenticated, service_role;