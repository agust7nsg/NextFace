-- The user_events.user_id FK had ON DELETE NO ACTION, which blocks
-- auth.admin.deleteUser when any user_events rows exist for that user.
-- Change it to CASCADE so deleting the auth user cleans up events automatically.
ALTER TABLE public.user_events
  DROP CONSTRAINT user_events_user_id_fkey,
  ADD CONSTRAINT user_events_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;