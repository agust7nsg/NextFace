/*
  # Add last_active_at to facial_profiles

  1. Changes
    - Adds `last_active_at` (timestamptz) column to `facial_profiles` table
    - Defaults to now() on creation
    - Used to track when a user last performed a key action in the app
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facial_profiles' AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE facial_profiles ADD COLUMN last_active_at timestamptz DEFAULT now();
  END IF;
END $$;
