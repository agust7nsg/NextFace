# Fix Missing facial_analyses Table

The `facial_analyses` table doesn't exist in your Supabase database. You need to create it manually.

## Steps to Fix:

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute this SQL**
   ```sql
   /*
     # Create facial analyses table

     1. New Tables
       - `facial_analyses`
         - `id` (uuid, primary key)
         - `user_id` (uuid, foreign key to auth.users)
         - `overall_score` (decimal)
         - `scores` (jsonb - array of score objects)
         - `recommendations` (text array)
         - `image_url` (text, optional)
         - `created_at` (timestamp)
         - `updated_at` (timestamp)

     2. Security
       - Enable RLS on `facial_analyses` table
       - Add policy for users to read/write their own analyses
   */

   CREATE TABLE IF NOT EXISTS facial_analyses (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     overall_score decimal(3,1) NOT NULL,
     scores jsonb NOT NULL,
     recommendations text[] DEFAULT '{}',
     image_url text,
     created_at timestamptz DEFAULT now(),
     updated_at timestamptz DEFAULT now()
   );

   ALTER TABLE facial_analyses ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can read own analyses"
     ON facial_analyses
     FOR SELECT
     TO authenticated
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own analyses"
     ON facial_analyses
     FOR INSERT
     TO authenticated
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own analyses"
     ON facial_analyses
     FOR UPDATE
     TO authenticated
     USING (auth.uid() = user_id)
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can delete own analyses"
     ON facial_analyses
     FOR DELETE
     TO authenticated
     USING (auth.uid() = user_id);

   -- Create index for better performance
   CREATE INDEX IF NOT EXISTS facial_analyses_user_id_idx ON facial_analyses(user_id);
   CREATE INDEX IF NOT EXISTS facial_analyses_created_at_idx ON facial_analyses(created_at DESC);
   ```

4. **Run the Query**
   - Click "Run" to execute the SQL
   - You should see "Success. No rows returned" message

5. **Refresh your app**
   - The errors should be resolved and the Results page should work

## What this creates:
- The `facial_analyses` table with all required columns
- Row Level Security policies so users only see their own data
- Indexes for better performance
- Proper foreign key relationships

After running this SQL in your Supabase dashboard, your app will be able to save and retrieve facial analysis results properly.