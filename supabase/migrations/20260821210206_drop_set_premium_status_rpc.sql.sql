-- Remove the test-only set_premium_status RPC.
-- It granted is_premium directly to any authenticated caller with no payment
-- or code verification. The creator-code path (redeem_creator_code) remains
-- the only legitimate way for a user to obtain premium.
REVOKE EXECUTE ON FUNCTION public.set_premium_status(boolean) FROM authenticated, anon, PUBLIC;
DROP FUNCTION IF EXISTS public.set_premium_status(boolean);
