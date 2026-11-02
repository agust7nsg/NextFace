import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const DEBOUNCE_MS = 60_000;

export const useActivityTracker = () => {
  const { user } = useAuth();
  const lastUpdateRef = useRef<number>(0);

  const updateLastActive = useCallback(async () => {
    if (!user?.id) return;
    const now = Date.now();
    if (now - lastUpdateRef.current < DEBOUNCE_MS) return;
    lastUpdateRef.current = now;

    const timestamp = new Date().toISOString();
    const { data, error } = await supabase
      .from('facial_profiles')
      .update({ last_active_at: timestamp })
      .eq('user_id', user.id)
      .select();

    if (error || !data || data.length === 0) {
      console.warn('UPDATE failed or no row found, falling back to UPSERT');
      const { error: upsertError } = await supabase
        .from('facial_profiles')
        .upsert({ user_id: user.id, last_active_at: timestamp });
      if (upsertError) {
        console.error('UPSERT also failed:', upsertError);
      } else {
        console.log('UPSERT success');
      }
    } else {
      console.log('UPDATE success');
    }
  }, [user?.id]);

  return { updateLastActive };
};
