/*
  # Create chat_messages table

  ## Summary
  Creates a table to store individual chat messages linked to facial analyses.
  Each message is stored as a separate row with role (user/assistant) and content.

  ## New Tables
  - `chat_messages`
    - `id` (uuid, primary key) - Unique identifier for each message
    - `analysis_id` (uuid) - Links to the analysis being discussed
    - `user_id` (uuid, FK to auth.users) - User who owns this chat
    - `role` (text) - Either 'user' or 'assistant'
    - `content` (text) - The message content
    - `created_at` (timestamptz) - When the message was created

  ## Security
  - RLS enabled
  - Users can only view and insert their own messages
  - Messages are ordered by created_at for chronological display

  ## Indexes
  - Index on analysis_id for fast message retrieval per analysis
  - Index on user_id for user-scoped queries
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS chat_messages_analysis_id_idx ON chat_messages(analysis_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);
