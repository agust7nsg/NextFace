/*
# Revoke default table privileges on rate_limit_log

1. Security Changes
- Revoke all default privileges (SELECT, INSERT, UPDATE, DELETE) from anon and authenticated roles on rate_limit_log.
- The table already has RLS enabled with no policies, so no rows are accessible to these roles.
- This additional revoke removes the table-level grants as well, following the same pattern as creator_codes.
- Only the service role key (used in edge functions) can read and write to this table.
*/

REVOKE ALL ON rate_limit_log FROM anon, authenticated;