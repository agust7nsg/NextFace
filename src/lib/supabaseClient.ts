import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://hebwatwkpszebonmrige.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlYndhdHdrcHN6ZWJvbm1yaWdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMjkyNzQsImV4cCI6MjA3MDgwNTI3NH0.8nzmRDHCn5Z8deJ5hHOAeSf4K80GkzXd-sisVLikE64";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
