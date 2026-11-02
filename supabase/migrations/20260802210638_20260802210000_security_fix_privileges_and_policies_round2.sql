/*
# Security Round 2: Fix Premium Column Privileges, Remove Anon Writes, Tighten Policies

## What this migration does

1. **CRITICAL — Premium column bypass fix:**
   The previous migration tried to REVOKE UPDATE on is_premium and premium_granted_at
   at the column level, but the table-level GRANT to authenticated includes UPDATE on
   ALL columns, which overrides column-level REVOKE. This migration:
   - Revokes the table-level UPDATE privilege from anon and authenticated on facial_profiles
   - Grants UPDATE back only on safe columns (user_id, avatar_path, analysis,
     overall_score, updated_at, last_active_at), explicitly excluding is_premium and
     premium_granted_at
   - This ensures the redeem_creator_code RPC (SECURITY DEFINER) is the ONLY path to premium

2. **CRITICAL — Remove anon write access to all application tables:**
   The anon role had SELECT, INSERT, UPDATE, DELETE on every table. Since all RLS
   policies are scoped to authenticated, anon should have no access at all.
   - Revokes ALL privileges from anon on facial_analyses, chat_messages,
     facial_profiles, and user_events

3. **HIGH — Tighten user_events table:**
   Users should only INSERT and SELECT their own events (analytics).
   - Revokes UPDATE and DELETE from authenticated on user_events
   - No new policies needed; existing INSERT + SELECT policies are sufficient

4. **HIGH — Tighten chat_messages SELECT policy:**
   Removes the auth.uid() = user_id branch so messages are only readable through
   ownership of the parent analysis, not direct ownership of the message row.

## Verification
After applying, authenticated users can:
- SELECT/INSERT/UPDATE/DELETE their own facial_analyses (excluding premium columns on profiles)
- SELECT/INSERT/UPDATE/DELETE their own chat_messages (through parent analysis ownership)
- SELECT/INSERT their own user_events (no UPDATE/DELETE)
- UPDATE only non-premium columns on their own facial_profiles

Authenticated users CANNOT:
- UPDATE is_premium or premium_granted_at (no column privilege)
- Access other users' data (RLS policies enforce ownership)
- Modify or delete user_events (no UPDATE/DELETE privilege)

Anon users CANNOT:
- Access any application table (all privileges revoked)
*/

-- ============================================================
-- 1. CRITICAL: Fix premium column privileges on facial_profiles
-- ============================================================

-- Revoke table-level UPDATE from both roles (this removes UPDATE on ALL columns)
REVOKE UPDATE ON facial_profiles FROM anon, authenticated;

-- Grant UPDATE back only on safe columns (NOT is_premium, NOT premium_granted_at)
GRANT UPDATE (user_id, avatar_path, analysis, overall_score, updated_at, last_active_at) ON facial_profiles TO authenticated;

-- Also revoke table-level INSERT so users can't INSERT is_premium directly on signup
REVOKE INSERT ON facial_profiles FROM anon, authenticated;
GRANT INSERT (user_id, avatar_path, analysis, overall_score, updated_at, last_active_at) ON facial_profiles TO authenticated;

-- ============================================================
-- 2. CRITICAL: Remove all anon privileges on application tables
-- ============================================================

REVOKE ALL PRIVILEGES ON facial_analyses FROM anon;
REVOKE ALL PRIVILEGES ON chat_messages FROM anon;
REVOKE ALL PRIVILEGES ON facial_profiles FROM anon;
REVOKE ALL PRIVILEGES ON user_events FROM anon;

-- ============================================================
-- 3. HIGH: Remove UPDATE and DELETE from authenticated on user_events
-- ============================================================

REVOKE UPDATE ON user_events FROM authenticated;
REVOKE DELETE ON user_events FROM authenticated;

-- ============================================================
-- 4. HIGH: Tighten chat_messages SELECT policy
-- ============================================================

-- Drop the old policy that allowed reading via either direct user_id OR parent analysis
DROP POLICY IF EXISTS "Users can view messages from their analyses" ON chat_messages;

-- Create a stricter policy: only allow reading messages through parent analysis ownership
CREATE POLICY "Users can view messages from their analyses"
ON chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM facial_analyses
    WHERE facial_analyses.id = chat_messages.analysis_id
    AND facial_analyses.user_id = auth.uid()
  )
);
