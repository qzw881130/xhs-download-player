import React, { createContext, useContext, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
    const supabase = useMemo(() => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    }), []);

    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    );
};

export const useSupabase = () => {
    const context = useContext(SupabaseContext);
    if (context === null) {
        throw new Error('useSupabase must be used within a SupabaseProvider');
    }
    return context;
};