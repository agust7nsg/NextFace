-- Test-only helper: lets a client directly toggle is_premium without any code check.
-- Intended only for the internal test APK; not for production.
CREATE OR REPLACE FUNCTION public.set_premium_status(p_status boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  INSERT INTO facial_profiles (user_id, is_premium, premium_granted_at)
  VALUES (v_user, p_status, CASE WHEN p_status THEN now() ELSE NULL END)
  ON CONFLICT (user_id) DO UPDATE
    SET is_premium = p_status,
        premium_granted_at = CASE WHEN p_status THEN now() ELSE facial_profiles.premium_granted_at END;

  RETURN jsonb_build_object('success', true);
END;
$function$;

REVOKE ALL ON FUNCTION public.set_premium_status(boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_premium_status(boolean) TO authenticated;
