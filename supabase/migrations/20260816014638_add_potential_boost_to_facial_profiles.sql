/*
# Add potential boost columns to facial_profiles

1. Modified Tables
  - `facial_profiles`
    - `potential_boost` (integer, nullable) - The user's calculated attractiveness boost percentage (32-74%)
    - `potential_focus_area` (text, nullable) - The area the user identified as having the most untapped potential
    - `potential_test_completed_at` (timestamptz, nullable) - When the user last completed the potential test

2. Security
  - No new policies needed; existing facial_profiles policies already scope by user_id.

3. Notes
  - These columns store the result of the True Potential Test so it persists across sessions and devices.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facial_profiles' AND column_name = 'potential_boost') THEN
    ALTER TABLE facial_profiles ADD COLUMN potential_boost integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facial_profiles' AND column_name = 'potential_focus_area') THEN
    ALTER TABLE facial_profiles ADD COLUMN potential_focus_area text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'facial_profiles' AND column_name = 'potential_test_completed_at') THEN
    ALTER TABLE facial_profiles ADD COLUMN potential_test_completed_at timestamptz;
  END IF;
END $$;