# Partner dashboard connection timeout

## Diagnosis (2026-10-14)

The login screen calls `public.get_partner_dashboard(text)` through the REST
API using the `anon` role. It is a custom access-code check, not Supabase Auth.
The function first rejects an invalid code (SQLSTATE `42501`), then aggregates
many dashboard views before returning. Login therefore includes dashboard loading.

Read-only inspection of the configured project found:

- `anon` and `authenticated`: `statement_timeout=30s`.
- `authenticator`: `statement_timeout=8s`, `lock_timeout=8s`.
- RPC configuration: `search_path=public, extensions`, no timeout override.
- No browser request timeout in the original app.
- Three PostgreSQL timeout events on October 14 (11:25:07, 11:25:41,
  12:03:45 UTC), SQLSTATE `57014`, with the RPC in both query and context.

This confirms database execution timeouts in the login RPC. It does not identify
the individual slow view or exclude locks/load as contributing factors. Increasing
the budget may help queries between 30 and 60 seconds; it does not optimize them.

## Proposed change

`partner-dashboard-timeout.sql` sets a bounded 60-second timeout on this RPC only,
following [Supabase's function-level timeout guidance](https://supabase.com/docs/guides/database/postgres/timeouts).
It leaves role/global limits, lock timeout, code validation, permissions,
`SECURITY DEFINER`, and `search_path` unchanged. It does not copy the function
body or its access codes into Git. The browser waits up to 65 seconds (including
response parsing), allowing a small transport margin, and aborts stalled requests.
Failures never unlock the dashboard; there are no automatic retries. Error messages
distinguish denied access, SQL/gateway timeout, network failure, malformed response,
and other server errors without displaying internal SQL details.

## Validation and deployment

Client tests: `cd dashboard-tri && npm test` (Node.js 22+); build: `npm run build`.
Tests cover a successful 45-second response, the 65-second boundary, stalled body,
timer cleanup, manual retry, unchanged request credentials, and error categories.

The SQL script has **not** been applied to production. No Supabase development
branch was available, so live integration of the new server timeout is unverified.
The repository contains no automatic SQL deployment pipeline; merging the UI
alone will not increase the current server budget.

Before production deployment, run the script on a staging database with the RPC
already present and check its configuration:

```sql
SELECT proconfig FROM pg_proc
WHERE oid = 'public.get_partner_dashboard(text)'::regprocedure;
-- Expect both existing search_path and statement_timeout=60s.
```

Through the staging REST API (not an administrator SQL session), verify an invalid
code remains rejected immediately and valid read-only/operational/admin codes
retain their respective access. Check a representative call longer than 30 seconds
can succeed, and a call exceeding the server budget still fails. Compare function
body, ACL, security mode and search_path before/after. Do not expose codes in logs.

After PR approval and staging validation, apply the script to the intended database
and deploy the UI. Rollback SQL is included in the script; it resets only the RPC's
timeout override to restore the previous inherited limit. If timeouts continue,
profile the underlying views on staging before raising any broader limits.
