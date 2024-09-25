import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

export const useUserStats = () => {
    const table = 'videos';
    const { supabase, user } = useSupabase();
    const [stats, setStats] = useState({
        totalVideos: 0,
        likedVideos: 0,
        favoritedVideos: 0,
        notedVideos: 0,
        hiddenVideos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        if (!user) {
            console.log('No user found');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Fetching stats for user:', user.id);

            const { data: totalVideos, error: totalError } = await supabase
                .from(table)
                .select('id', { count: 'exact' })
                .eq('user_id', user.id);

            if (totalError) {
                console.error('Error fetching total videos:', totalError);
                throw totalError;
            }

            const { data: likedVideos, error: likedError } = await supabase
                .from(table)
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('type', 'liked')
                .eq('is_hidden', false);

            if (likedError) {
                console.error('Error fetching liked videos:', likedError);
                throw likedError;
            }

            const { data: favoritedVideos, error: favoritedError } = await supabase
                .from(table)
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('type', 'collected')
                .eq('is_hidden', false);

            if (favoritedError) {
                console.error('Error fetching favorited videos:', favoritedError);
                throw favoritedError;
            }

            const { data: notedVideos, error: notedError } = await supabase
                .from(table)
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('type', 'post')
                .eq('is_hidden', false);

            if (notedError) {
                console.error('Error fetching noted videos:', notedError);
                throw notedError;
            }

            const { data: hiddenVideos, error: hiddenError } = await supabase
                .from(table)
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('is_hidden', true);

            if (hiddenError) {
                console.error('Error fetching hidden videos:', hiddenError);
                throw hiddenError;
            }

            console.log('Stats fetched successfully');

            setStats({
                totalVideos: totalVideos.length,
                likedVideos: likedVideos.length,
                favoritedVideos: favoritedVideos.length,
                notedVideos: notedVideos.length,
                hiddenVideos: hiddenVideos.length,
            });
        } catch (err) {
            console.error('Error in fetchStats:', err);
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    return { stats, loading, error, refetchStats: fetchStats };
};