/*
  # Add avatar_path to facial_profiles

  ## Changes
    - Add `avatar_path` column to `facial_profiles` table
      - Stores the Supabase Storage file path (not the full URL)
      - Format: user-uploads/{user.id}/{random-uuid}.jpg
      - Nullable to support users without avatars
  
  ## Notes
    - No default value set - users start without an avatar
    - Images will be fetched at runtime using supabase.storage.from("user-images").getPublicUrl()
*/

-- Add avatar_path column to facial_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'facial_profiles' AND column_name = 'avatar_path'
  ) THEN
    ALTER TABLE facial_profiles ADD COLUMN avatar_path text;
  END IF;
END $$;