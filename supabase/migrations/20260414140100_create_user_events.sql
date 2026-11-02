/*
  # Create user_events table

  ## Summary
  Creates a new table to log key user actions for event tracking purposes.

  ## New Tables
  - `user_events`
    - `id` (uuid, primary key, auto-generated)
    - `user_id` (uuid, references auth.users) - the user who triggered the event
    - `event_type` (text) - name of the event (e.g. "analysis_completed", "chat_message_sent")
    - `metadata` (jsonb) - arbitrary key/value payload for the event
    - `created_at` (timestamptz, default now()) - when the event occurred

  ## Security
  - RLS enabled
  - Authenticated users can insert their own events
  - Authenticated users can select their own events
*/

CREATE TABLE IF NOT EXISTS user_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON user_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own events"
  ON user_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
