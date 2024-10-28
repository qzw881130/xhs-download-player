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

    const fetchFilteredVideos = useCallback(async (currentPage = page) => {
        if (!user) {
            console.log('No user found, aborting fetch');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`Fetching videos for user: ${user.id}, type: ${type}, page: ${currentPage}, pageSize: ${pageSize}`);

            let query = supabase
                .from('videos')
                .select('id, vid, title, video_src, image_src, is_hidden, type', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('is_hidden', false)
                .eq('type', type)
                .not('video_src', 'is', null)
                .not('video_src', 'eq', '')
                .order('created_at', { ascending: false })
                .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

            if (keyword) {
                query = query.ilike('title', `%${keyword}%`);
            }

            const { data, error, count: totalCount } = await query;

            console.log('page==', currentPage, 'range===', (currentPage - 1) * pageSize, currentPage * pageSize - 1, 'data.length=', data.length)
            if (error) {
                console.error('Error fetching videos:', error);
                throw error;
            }

            console.log('Total count:', totalCount);

            if (totalCount === null) {
                console.warn('Total count is null, this might indicate an issue with the query or permissions');
                setCount(0);
                setPages(0);
            } else {
                setCount(totalCount);
                setPages(Math.ceil(totalCount / pageSize));
            }

            setFilteredData(prevData => currentPage === 1 ? data : [...prevData, ...data]);
            setHasMore(currentPage * pageSize < totalCount);
            setPage(currentPage);

        } catch (err) {
            console.error('Error in fetchFilteredVideos:', err);
            setError(err.message || 'An error occurred while fetching filtered videos');
        } finally {
            setLoading(false);
        }
    }, [supabase, user, pageSize, keyword, type]);

    useEffect(() => {
        fetchFilteredVideos(1);
    }, [user, keyword, type]);

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchFilteredVideos(page + 1);
        }
    };

    const refresh = () => {
        fetchFilteredVideos(1);
    };

    const search = (newKeyword) => {
        setKeyword(newKeyword);
        setPage(1);
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
