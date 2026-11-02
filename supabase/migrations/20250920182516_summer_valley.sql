/*
  # Create face analyses table for history

  1. New Tables
    - `face_analyses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `image_url` (text, optional)
      - `analysis` (jsonb - exact object from Edge Function)

  2. Security
    - Enable RLS on `face_analyses` table
    - Add policies for users to read/write/delete their own analyses
*/

CREATE TABLE IF NOT EXISTS face_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  image_url text,
  analysis jsonb NOT NULL
);

ALTER TABLE face_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analyses"
  ON face_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON face_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON face_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS face_analyses_user_id_idx ON face_analyses(user_id);
CREATE INDEX IF NOT EXISTS face_analyses_created_at_idx ON face_analyses(created_at DESC);