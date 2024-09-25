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

            const { data: likedVideos, error: likedError } = await supabase
                .from(table)
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('type', 'liked')
                .eq('is_hidden', false)
                .not('video_src', 'is', null)  // 确保 video_src 不为 null
                .not('video_src', 'eq', '')    // 确保 video_src 不为空字符串
                ;

            if (likedError) {
                console.error('Error fetching liked videos:', likedError);
                throw likedError;
            }

            const { data: favoritedVideos, error: favoritedError } = await supabase
                .from(table)
                .select('id', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('type', 'collected')
                .eq('is_hidden', false)
                .not('video_src', 'is', null)  // 确保 video_src 不为 null
                .not('video_src', 'eq', '')    // 确保 video_src 不为空字符串
                ;

            if (favoritedError) {
                console.error('Error fetching favorited videos:', favoritedError);
                throw favoritedError;
            }


            console.log('Stats fetched successfully');

            setStats({
                likedVideos: likedVideos.length,
                favoritedVideos: favoritedVideos.length,
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