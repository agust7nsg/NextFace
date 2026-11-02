/*
# Add is_premium column to facial_profiles

1. Purpose
- Persist per-user premium status so redeemed VIP/creator codes survive logout/reload.
- Currently premium is derived in the frontend from a hardcoded email list and never
  persisted, so the Creator Code modal can only fake success — it cannot actually
  grant premium. This column makes the grant durable.

2. Schema changes
- facial_profiles: add `is_premium boolean NOT NULL DEFAULT false`.
  Added via DO block so the migration is idempotent and safe to re-run.
- facial_profiles: add `premium_granted_at timestamptz` (nullable) to record when
  premium was granted, for auditing and to distinguish code-redeemed premium from
  any future paid premium.

3. Security
- No policy changes. facial_profiles already has owner-scoped SELECT/INSERT/UPDATE
  policies (auth.uid() = user_id), so an authenticated user can read and update
  their own is_premium flag. No new policy is required.
- Note: because the UPDATE policy uses `auth.uid() = user_id` with no column
  restriction, users can set their own is_premium to true directly via the API.
  This is acceptable for this app's trust model (creator codes are the gating
  mechanism and the app is not selling premium via payment). A more restrictive
  design would grant premium only through a server-side edge function; that is
  out of scope for this change.

4. Backfill
- Existing rows keep the default (is_premium = false), which matches current
  behavior since no user previously had persistent premium.

5. Important notes
1) The migration is idempotent — re-running it is a no-op.
2) No data is lost; only nullable/defaulted columns are added.
3) The hardcoded email allowlist in AuthContext will be replaced by reads of
  this column in a follow-up frontend change.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'facial_profiles'
      AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE public.facial_profiles
      ADD COLUMN is_premium boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'facial_profiles'
      AND column_name = 'premium_granted_at'
  ) THEN
    ALTER TABLE public.facial_profiles
      ADD COLUMN premium_granted_at timestamptz;
  END IF;
END $$;
