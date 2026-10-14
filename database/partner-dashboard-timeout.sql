-- Reviewed deployment script: run on staging first, then after PR approval.
-- Changes only this RPC's execution budget, preserving its body, ACL,
-- SECURITY DEFINER setting and search_path. No role/global timeout changes.
BEGIN;
ALTER FUNCTION public.get_partner_dashboard(text)
  SET statement_timeout = '60s';
NOTIFY pgrst, 'reload schema';
COMMIT;

-- Rollback (the function previously had no statement_timeout override):
-- BEGIN;
-- ALTER FUNCTION public.get_partner_dashboard(text) RESET statement_timeout;
-- NOTIFY pgrst, 'reload schema';
-- COMMIT;
