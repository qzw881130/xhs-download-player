import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const useSupabaseClient = () => {
    const supabase = useMemo(() => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    }), []);
    return supabase;
};