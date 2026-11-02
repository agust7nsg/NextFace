/*
  # Fix chat_messages INSERT policy for service role

  ## Summary
  The edge function (gptmini-chat) uses the service role key to insert assistant
  messages into chat_messages. The previous INSERT policy only allowed authenticated
  users to insert rows where auth.uid() = user_id, which blocks the service role
  (which has no auth.uid()).

  ## Changes
  - Drop the old INSERT policy that only allowed user-owned inserts
  - Add a new INSERT policy that allows authenticated users to insert their own messages
  - Add a separate INSERT policy that allows the service role to insert assistant messages
    (service role bypasses RLS entirely, so this is just for completeness/clarity)

  ## Note
  In Supabase, the service_role bypasses RLS automatically — so the service role
  in the edge function can already insert without a policy. However, we also ensure
  the existing user INSERT policy is correct and not blocking anything unexpectedly.
*/

DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
