import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

export const useVideoList = (initialPage = 1, pageSize = 10) => {
    const { supabase, user } = useSupabase();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState('');

    const fetchVideos = useCallback(async (resetPage = false) => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('videos')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_hidden', false)
                .order('created_at', { ascending: false });

            if (keyword) {
                query = query.ilike('title', `%${keyword}%`);
            }

            const currentPage = resetPage ? 1 : page;
            const { data, error, count } = await query
                .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)
                .limit(pageSize);

            if (error) {
                throw error;
            }

            setVideos(prevVideos => resetPage ? data : [...prevVideos, ...data]);
            setHasMore(count > currentPage * pageSize);
            setPage(currentPage);
        } catch (err) {
            console.error('Error fetching videos:', err);
            setError(err.message || 'An error occurred while fetching videos');
        } finally {
            setLoading(false);
        }
    }, [supabase, user, page, pageSize, keyword]);

    useEffect(() => {
        fetchVideos(true);
    }, [user, keyword]);

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const refresh = () => {
        fetchVideos(true);
    };

    const search = (newKeyword) => {
        setKeyword(newKeyword);
    };

    return {
        videos,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        search
    };
};