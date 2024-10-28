import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabaseClient } from '../hooks/useSupabaseClient';

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const supabase = useSupabaseClient();

    useEffect(() => {
        const checkStoredSession = async () => {
            const storedSession = await AsyncStorage.getItem('supabase.session');
            if (storedSession) {
                const sessionData = JSON.parse(storedSession);
                const { data, error } = await supabase.auth.setSession(sessionData);
                if (error) {
                    console.error('Error restoring session:', error);
                    await AsyncStorage.removeItem('supabase.session');
                } else {
                    setSession(data.session);
                    setUser(data.user);
                }
            }
        };

        checkStoredSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            setUser(newSession?.user || null);
            setSession(newSession);

            if (newSession) {
                await AsyncStorage.setItem('supabase.session', JSON.stringify(newSession));
            } else {
                await AsyncStorage.removeItem('supabase.session');
            }
        });

        return () => {
            if (authListener && typeof authListener.unsubscribe === 'function') {
                authListener.unsubscribe();
            }
        };
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const register = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const value = {
        supabase,
        user,
        session,
        login,
        register,
        logout
    };

    return (
        <SupabaseContext.Provider value={value}>
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
