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
                .eq('is_hidden', false)
                .neq('id', video_id);

            if (is_random) {
                // 获取符合条件的记录总数
                const { count, error: countError } = await query.select('id', { count: 'exact', head: true });
                if (countError) throw countError;

                // 生成一个随机偏移量
                const randomOffset = Math.floor(Math.random() * count);

                console.log('is_random=====', is_random, 'randomOffset===', randomOffset)
                // 使用 limit 和 offset 取出一条记录
                const { data, error } = await query.limit(1).offset(randomOffset);
                if (error) throw error;

                if (data && data.length > 0) {
                    return data[0];
                }
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
                const { data, error } = await query
                    .gt('created_at', currentVideo.created_at)
                    .order('created_at', { ascending: true })
                    .limit(1);

                if (error) throw error;

                if (data && data.length > 0) {
                    return data[0];
                } else {
                    // 如果没有找到下一个视频，返回第一个视频
                    const { data: firstVideo, error: firstVideoError } = await supabase
                        .from('videos')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_hidden', false)
                        .order('created_at', { ascending: true })
                        .limit(1);

                    if (firstVideoError) throw firstVideoError;

                    return firstVideo[0];
                }
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