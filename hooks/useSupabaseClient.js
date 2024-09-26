import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const useSupabaseClient = () => {
    const supabase = useMemo(() => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    }), []);
    return supabase;
};