/*
  # Fix chat_messages realtime delivery

  ## Problem
  The chat_messages table has REPLICA IDENTITY DEFAULT (primary key only).
  Supabase Realtime requires REPLICA IDENTITY FULL to evaluate RLS policies
  on changed rows for authenticated clients. Without it, realtime events are
  dropped for non-service-role subscribers, causing assistant messages to only
  appear after a page reload.

  ## Change
  - Set REPLICA IDENTITY FULL on chat_messages so Supabase Realtime can
    deliver INSERT events to authenticated clients passing RLS checks.
*/

ALTER TABLE chat_messages REPLICA IDENTITY FULL;
