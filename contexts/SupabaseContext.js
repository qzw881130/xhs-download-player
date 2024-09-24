import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import { useSupabaseClient } from '../hooks/useSupabaseClient';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const supabase = useSupabaseClient();
    // const supabase = useMemo(() => createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    //     persistSession: true,
    //     autoRefreshToken: true,
    //     detectSessionInUrl: false,
    // }), []);

    useEffect(() => {
        // 检查当前会话并设置用户
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        checkSession();

        // 监听认证状态的变化
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener?.unsubscribe();
        };
    }, []);

    return (
        <SupabaseContext.Provider value={{ supabase, user, session }}>
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