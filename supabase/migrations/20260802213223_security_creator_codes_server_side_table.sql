/*
  # Move creator codes into a server-only table (F1/F2)

  ## Problem
  `redeem_creator_code` compared `p_code` against the hardcoded literal '78901'.
  That same literal was declared in client source and therefore shipped inside the
  public JavaScript bundle, so anyone could read it and redeem premium for free.
  Even without the bundle, a five character numeric code is exhaustible by an
  automated caller against /rest/v1/rpc/redeem_creator_code in minutes, and nothing
  counted attempts or capped how many accounts a single code could unlock.

  ## Changes
  1. New table `public.creator_codes`
     - `code` (text, primary key) - the secret value
     - `active` (boolean) - lets a code be retired without deleting its history
     - `max_redemptions` (integer, null = unlimited) - caps reuse per code
     - `redemption_count` (integer) - incremented atomically on each successful claim
     - `note` (text) - free-form label, e.g. which influencer the code belongs to
     - `created_at` (timestamptz)
     - RLS enabled with NO policies and NO grants to anon/authenticated, so the
       table is unreachable through the Data API. Only the SECURITY DEFINER
       function below can read or write it.

  2. `redeem_creator_code` rewritten to
     - claim the code with a single conditional UPDATE ... RETURNING, which is
       atomic, so two concurrent callers cannot both consume the last redemption
     - raise (and therefore roll the claim back) if the profile grant does not
       apply, so a consumed redemption can never be lost
     - return the same generic 'Invalid code' for unknown, inactive and exhausted
       codes, so the response cannot be used to probe which codes exist

  3. Data
     - '78901' is inserted as INACTIVE. It is publicly known and must never grant
       premium again; it is kept as a row so its history is visible.
     - One fresh randomly generated code is seeded and active.

  ## Notes
  - Existing premium users are untouched; this only changes how NEW grants happen.
  - `is_premium` / `premium_granted_at` remain non-writable by clients (column
    privileges were removed in an earlier migration), so this function stays the
    only path to premium.
*/

CREATE TABLE IF NOT EXISTS public.creator_codes (
  code text PRIMARY KEY,
  active boolean NOT NULL DEFAULT true,
  max_redemptions integer,
  redemption_count integer NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT creator_codes_count_non_negative CHECK (redemption_count >= 0),
  CONSTRAINT creator_codes_max_positive CHECK (max_redemptions IS NULL OR max_redemptions > 0)
);

ALTER TABLE public.creator_codes ENABLE ROW LEVEL SECURITY;

-- Deliberately no policies: no role reaches this table through the Data API.
REVOKE ALL ON public.creator_codes FROM anon, authenticated;

-- The publicly leaked code, retired permanently.
INSERT INTO public.creator_codes (code, active, note)
VALUES ('78901', false, 'Retired: was hardcoded in the client bundle and is publicly known')
ON CONFLICT (code) DO UPDATE SET active = false;

-- A fresh, long, randomly generated replacement.
INSERT INTO public.creator_codes (code, active, note)
VALUES ('NFX-4QW7ZM2K8T', true, 'Replacement owner code issued during security audit')
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.redeem_creator_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_already boolean;
  v_claimed text;
  v_granted integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_code IS NULL OR btrim(p_code) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid code');
  END IF;

  SELECT is_premium INTO v_already
  FROM facial_profiles
  WHERE user_id = v_user;

  IF v_already THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already premium');
  END IF;

  -- Atomic claim: one statement decides existence, active state and remaining
  -- redemptions, so concurrent callers cannot both take the last one.
  UPDATE creator_codes
     SET redemption_count = redemption_count + 1
   WHERE code = btrim(p_code)
     AND active
     AND (max_redemptions IS NULL OR redemption_count < max_redemptions)
  RETURNING code INTO v_claimed;

  IF v_claimed IS NULL THEN
    -- Unknown, inactive and exhausted all answer identically.
    RETURN jsonb_build_object('success', false, 'error', 'Invalid code');
  END IF;

  INSERT INTO facial_profiles (user_id, is_premium, premium_granted_at)
  VALUES (v_user, true, now())
  ON CONFLICT (user_id) DO UPDATE
     SET is_premium = true,
         premium_granted_at = now()
   WHERE facial_profiles.is_premium = false;

  GET DIAGNOSTICS v_granted = ROW_COUNT;

  IF v_granted = 0 THEN
    -- Grant did not apply; abort so the redemption is not silently consumed.
    RAISE EXCEPTION 'premium grant did not apply for user %', v_user
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$function$;

REVOKE ALL ON FUNCTION public.redeem_creator_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_creator_code(text) TO authenticated;
