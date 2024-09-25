import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';

export const useFilteredVideoList = ({ type, initialPage = 1, pageSize = 10 }) => {
    const { supabase, user } = useSupabase();
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(initialPage);
    const [pages, setPages] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [count, setCount] = useState(0);

    const fetchFilteredVideos = useCallback(async () => {
        if (!user) {
            console.log('No user found, aborting fetch');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`Fetching videos for user: ${user.id}, type: ${type}`);

            let query = supabase
                .from('videos')
                .select('id, vid,title, video_src, image_src, is_hidden', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('is_hidden', false)
                .eq('type', type)
                .not('video_src', 'is', null)  // 确保 video_src 不为 null
                .not('video_src', 'eq', '')    // 确保 video_src 不为空字符串
                .order('created_at', { ascending: false });

            if (keyword) {
                query = query.ilike('title', `%${keyword}%`);
            }

            const { data, error, count: totalCount } = await query;

            if (error) {
                console.error('Error fetching videos:', error);
                throw error;
            }

            console.log('Total count:', totalCount);
            // console.log('Fetched data:', data);

            if (totalCount === null) {
                console.warn('Total count is null, this might indicate an issue with the query or permissions');
                setCount(0);
                setPages(0);
            } else {
                setCount(totalCount);
                setPages(Math.ceil(totalCount / pageSize));
            }

            const currentPage = page;
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize;

            setFilteredData(data);
            setHasMore(endIndex < totalCount);
            setPage(currentPage);

        } catch (err) {
            console.error('Error in fetchFilteredVideos:', err);
            setError(err.message || 'An error occurred while fetching filtered videos');
        } finally {
            setLoading(false);
        }
    }, [supabase, user, page, pageSize, keyword, type]);

    useEffect(() => {
        fetchFilteredVideos();
    }, [user, keyword, type, page]);

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const refresh = () => {
        fetchFilteredVideos(true);
    };

    const search = (newKeyword) => {
        setKeyword(newKeyword);
    };

    return {
        filteredData,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        search,
        count,
        pageSize,
        pages,
        page,
        setPage
    };
};