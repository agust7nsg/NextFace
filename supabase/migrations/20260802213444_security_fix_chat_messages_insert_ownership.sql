/*
# Bind chat message writes to the owner of the analysis

1. Security changes
   - The INSERT policy on `chat_messages` only required `auth.uid() = user_id`.
     The `analysis_id` column was unconstrained, so a signed-in user could
     insert messages into another user's conversation.
   - The policy is replaced so the parent `facial_analyses` row must also be
     owned by the caller.

2. Notes
   - Legitimate inserts (the user writing in their own analysis chat) are
     unaffected.
   - The service role bypasses RLS and is unaffected.
*/

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;

CREATE POLICY "Users can insert own chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.facial_analyses fa
    WHERE fa.id = chat_messages.analysis_id
      AND fa.user_id = auth.uid()
  )
);
