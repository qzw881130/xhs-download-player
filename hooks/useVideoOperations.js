import { useSupabase } from '../contexts/SupabaseContext';

export const useVideoOperations = () => {
    const { supabase, user } = useSupabase();

    const hideVideo = async (vid) => {
        try {
            const { data, error } = await supabase
                .from('videos')
                .update({ is_hidden: true })
                .eq('user_id', user.id)
                .eq('vid', vid);

            if (error) throw error;

            console.log('Video hidden successfully');
            return true;
        } catch (error) {
            console.error('Error hiding video:', error);
            return false;
        }
    };

    // 可以在这里添加其他与视频相关的操作

    return {
        hideVideo,
        // 其他操作...
    };
};
