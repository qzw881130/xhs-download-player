import { useState, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

export const useNextVideo = () => {
    const { supabase, user } = useSupabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getNextVideo = useCallback(async (video_id, is_random = false) => {
        if (!user) {
            console.log('No user found, aborting fetch');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('videos')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_hidden', false);

            if (is_random) {
                // 随机选择一个不是当前视频的视频
                query = query
                    .neq('id', video_id)
                    .order('RANDOM()')
                    .limit(1);
            } else {
                // 获取当前视频的创建时间
                const { data: currentVideo } = await supabase
                    .from('videos')
                    .select('created_at')
                    .eq('id', video_id)
                    .single();

                if (!currentVideo) {
                    throw new Error('Current video not found');
                }

                // 获取下一个视频
                query = query
                    .gt('created_at', currentVideo.created_at)
                    .order('created_at', { ascending: true })
                    .limit(1);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                return data[0];
            } else if (!is_random) {
                // 如果没有找到下一个视频，返回第一个视频
                const { data: firstVideo, error: firstVideoError } = await supabase
                    .from('videos')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_hidden', false)
                    .order('created_at', { ascending: true })
                    .limit(1);

                if (firstVideoError) {
                    throw firstVideoError;
                }

                return firstVideo[0];
            }

            return null;
        } catch (err) {
            console.error('Error in getNextVideo:', err);
            setError(err.message || 'An error occurred while fetching the next video');
            return null;
        } finally {
            setLoading(false);
        }
    }, [supabase, user]);

    return { getNextVideo, loading, error };
};