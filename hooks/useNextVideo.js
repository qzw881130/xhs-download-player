import { useState, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

export const useNextVideo = () => {
    const { supabase, user } = useSupabase();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getNextVideo = useCallback(async (video_id, type, is_random) => {
        if (!user) {
            console.log('No user found, aborting fetch');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`Fetching next video. Current video ID: ${video_id}, Is random: ${is_random}`);

            let query = supabase
                .from('videos')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_hidden', false)
                .eq('type', type)
                .neq('id', video_id);

            if (!!is_random) {
                // 获取符合条件的记录总数
                const { count: totalCount, error: countError } = await query.select('*', { count: 'exact', head: true });


                console.log('count===', totalCount, 'countError===', countError)

                if (countError) {
                    console.error('Error getting count:', countError);
                    throw countError;
                }

                console.log(`Total count of videos: ${totalCount}`);

                if (totalCount === null || totalCount === 0) {
                    console.log('No videos found or count is null');
                    return null;
                }

                // 生成一个随机偏移量
                const randomOffset = Math.floor(Math.random() * count);

                console.log(`Random offset: ${randomOffset}`);

                // 使用 limit 和 offset 取出一条记录
                const { data, error } = await query.limit(1).offset(randomOffset);

                if (error) {
                    console.error('Error fetching random video:', error);
                    throw error;
                }

                console.log(`Fetched random video:`, data);

                if (data && data.length > 0) {
                    return data[0];
                }
            } else {
                // 获取当前视频的创建时间
                const { data: currentVideo, error: currentVideoError } = await supabase
                    .from('videos')
                    .select('created_at')
                    .eq('id', video_id)
                    .single();

                if (currentVideoError) {
                    console.error('Error fetching current video:', currentVideoError);
                    throw currentVideoError;
                }

                if (!currentVideo) {
                    console.log('Current video not found');
                    throw new Error('Current video not found');
                }

                console.log(`Current video created_at: ${currentVideo.created_at}`);

                // 获取下一个视频
                const { data, error } = await query
                    .gt('created_at', currentVideo.created_at)
                    .order('created_at', { ascending: true })
                    .limit(1);

                if (error) {
                    console.error('Error fetching next video:', error);
                    throw error;
                }

                console.log(`Fetched next video:`, data);

                if (data && data.length > 0) {
                    return data[0];
                } else {
                    console.log('No next video found, fetching first video');
                    // 如果没有找到下一个视频，返回第一个视频
                    const { data: firstVideo, error: firstVideoError } = await supabase
                        .from('videos')
                        .select('*')
                        .eq('user_id', user.id)
                        .eq('is_hidden', false)
                        .order('created_at', { ascending: true })
                        .limit(1);

                    if (firstVideoError) {
                        console.error('Error fetching first video:', firstVideoError);
                        throw firstVideoError;
                    }

                    console.log(`Fetched first video:`, firstVideo);

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