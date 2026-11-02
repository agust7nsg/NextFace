/*
  # Fix chat_messages SELECT policy

  ## Problem
  The existing SELECT policy only allows users to read rows where user_id = auth.uid().
  This blocks assistant messages inserted by the Edge Function (service role), which may
  have a different user_id.

  ## Fix
  Replace the SELECT policy to also allow reading any message that belongs to an analysis
  owned by the authenticated user. This ensures assistant replies are always visible.
*/

DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;

CREATE POLICY "Users can view messages from their analyses"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM facial_analyses
      WHERE facial_analyses.id = chat_messages.analysis_id
        AND facial_analyses.user_id = auth.uid()
    )
  );
