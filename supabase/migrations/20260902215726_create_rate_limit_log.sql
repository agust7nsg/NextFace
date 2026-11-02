/*
# Create rate_limit_log table for per-IP and per-user rate limiting

1. New Tables
- `rate_limit_log`
  - `id` (uuid, primary key, auto-generated)
  - `ip_address` (text, the validated public IP address of the caller)
  - `user_id` (uuid, the authenticated user's ID, nullable, references auth.users with CASCADE delete)
  - `function_name` (text, which edge function was called — constrained to 'gpt5-analysis', 'glowup-map', 'gptmini-chat')
  - `called_at` (timestamptz, defaults to now())

2. Indexes
- `idx_rate_limit_ip` on (ip_address, function_name, called_at) — for per-IP monthly count queries
- `idx_rate_limit_user` on (user_id, function_name, called_at) — for per-user monthly count queries (secondary layer)

3. Security
- Row Level Security ENABLED on `rate_limit_log`.
- NO policies are created for `authenticated` or `anon` roles. This means users cannot read,
  insert, update, or delete rows from this table through the anon-key client. All access is
  through the service role key used inside edge functions only.
- This table is purely internal infrastructure for rate limiting — users never need to see it.

4. Purpose
- This table tracks every call to the three OpenAI-consuming edge functions (gpt5-analysis,
  glowup-map, gptmini-chat) so that per-IP and per-user monthly rate limits can be enforced.
- Each edge function checks the count for the current calendar month before calling OpenAI.
- If the limit is reached, a 429 response is returned without any OpenAI call being made.
- Rows older than 35 days are cleaned up inline by each edge function call to prevent unbounded growth.
*/

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  function_name text NOT NULL CHECK (function_name IN ('gpt5-analysis', 'glowup-map', 'gptmini-chat')),
  called_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON rate_limit_log (ip_address, function_name, called_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_user ON rate_limit_log (user_id, function_name, called_at);

ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;