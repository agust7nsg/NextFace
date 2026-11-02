/*
  # Create chat_sessions table

  ## Summary
  Stores AI chat sessions linked to a user's facial analysis.
  One chat session per analysis per user (enforced by unique constraint).

  ## New Tables
  - `chat_sessions`
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users)
    - `analysis_id` (uuid, FK to face_analyses — the analysis this chat is about)
    - `analysis_score` (integer — snapshot of the score at chat creation time)
    - `messages` (jsonb array — full message history [{role, content, created_at}])
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Constraints
  - UNIQUE(user_id, analysis_id) — only one chat per analysis

  ## Security
  - RLS enabled
  - SELECT, INSERT, UPDATE, DELETE restricted to the owning user
*/

CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL,
  analysis_score integer NOT NULL DEFAULT 0,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chat_sessions_user_analysis_unique UNIQUE (user_id, analysis_id)
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS chat_sessions_user_id_idx ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS chat_sessions_analysis_id_idx ON chat_sessions(analysis_id);
