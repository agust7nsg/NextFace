-- =====================================================
-- FIX 1: Premium bypass — remove client update on is_premium
-- =====================================================

-- 1a. Revoke direct UPDATE on is_premium / premium_granted_at from all client roles.
--     Only the redeem RPC (SECURITY DEFINER, owned by postgres) can set these.
REVOKE UPDATE (is_premium, premium_granted_at) ON facial_profiles FROM anon, authenticated;

-- 1b. Grant SELECT-only on the two columns so the client can still READ premium status.
GRANT SELECT (is_premium, premium_granted_at) ON facial_profiles TO authenticated;

-- 1c. Create the secure RPC the client calls instead of a direct UPDATE.
CREATE OR REPLACE FUNCTION public.redeem_creator_code(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_already boolean;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT is_premium INTO v_already
    FROM facial_profiles
    WHERE user_id = v_user;

  IF v_already THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already premium');
  END IF;

  IF p_code = '78901' THEN
    UPDATE facial_profiles
      SET is_premium = true,
          premium_granted_at = now()
      WHERE user_id = v_user
        AND is_premium = false;   -- double-check guard

    IF FOUND THEN
      RETURN jsonb_build_object('success', true);
    END IF;
    RETURN jsonb_build_object('success', false, 'error', 'Could not activate premium');
  END IF;

  RETURN jsonb_build_object('success', false, 'error', 'Invalid code');
END;
$$;

-- 1d. Only authenticated users may call the RPC (not anon).
REVOKE EXECUTE ON FUNCTION public.redeem_creator_code(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.redeem_creator_code(text) TO authenticated;


-- =====================================================
-- FIX 2: Storage — scope to owner, make bucket private
-- =====================================================

-- 2a. Make user-images private (turn off public access).
UPDATE storage.buckets
  SET public = false
  WHERE id = 'user-images';

-- 2b. Replace the overly-broad SELECT and INSERT policies with owner-scoped ones.
DROP POLICY IF EXISTS "allow read user images 144gyii_0" ON storage.objects;
DROP POLICY IF EXISTS "allow authenticated uploads" ON storage.objects;

-- 2c. Owner-scoped INSERT
CREATE POLICY "users_upload_own_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2d. Owner-scoped SELECT
CREATE POLICY "users_read_own_images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2e. Owner-scoped UPDATE (needed for avatar replacement / upsert)
CREATE POLICY "users_update_own_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'user-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2f. Owner-scoped DELETE
CREATE POLICY "users_delete_own_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 2g. Same treatment for user_uploads bucket — make it private + owner-scoped.
UPDATE storage.buckets
  SET public = false
  WHERE id = 'user_uploads';

CREATE POLICY "users_upload_own_uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_read_own_uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_update_own_uploads"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users_delete_own_uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'user_uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- =====================================================
-- FIX 3: SECURITY DEFINER function lockdown
-- =====================================================

-- 3a. Revoke direct EXECUTE from all client roles — this is a trigger,
--     not a callable API.
REVOKE EXECUTE ON FUNCTION public.trigger_gptmini_chat() FROM PUBLIC, anon, authenticated;

-- 3b. Pin search_path so a malicious schema object can't shadow a call.
ALTER FUNCTION public.trigger_gptmini_chat() SET search_path = public, pg_temp;


-- =====================================================
-- FIX 4: Account deletion — add DELETE policy on facial_profiles
-- =====================================================

-- 4a. Allow users to delete their own profile row (needed if the edge function
--     ever falls back to client-side deletion, and for completeness).
CREATE POLICY "users_delete_own_profile"
  ON facial_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4b. Tighten the existing facial_profiles policies from TO public → TO authenticated
--     (public includes anon, which is broader than needed for an auth-gated app).
--     We drop and recreate to change the TO clause.
DROP POLICY IF EXISTS "users insert own profile" ON facial_profiles;
DROP POLICY IF EXISTS "users read own profile"  ON facial_profiles;
DROP POLICY IF EXISTS "users update own profile" ON facial_profiles;

CREATE POLICY "users_insert_own_profile"
  ON facial_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_select_own_profile"
  ON facial_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile"
  ON facial_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- Cleanup: remove duplicate user_events policies
-- =====================================================
DROP POLICY IF EXISTS "Users can insert their own events" ON user_events;
DROP POLICY IF EXISTS "Users can read their own events" ON user_events;

-- Keep the authenticated-scoped versions that already exist.
