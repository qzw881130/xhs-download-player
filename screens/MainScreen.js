import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoListPage } from '../components/VideoListPage';
import { VideoPlayerPage } from '../components/VideoPlayerPage';
import { AccountPage } from '../components/AccountPage';

// 模拟数据
const mockData = Array(50).fill().map((_, index) => ({
    id: `${index}`,
    title: `视频标题 ${index + 1}`,
    // image: `https://picsum.photos/300/450?random=${index}`,
    image: `http://sns-webpic-qc.xhscdn.com/202409182225/64e97642b1c3146d49a9cc2a1e6cd009/1040g00831440robo1k5g5onqq5q5b0p4p0k7fuo!nd_dft_wlteh_webp_3`
}));

function MainScreen() {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'liked', title: '点赞', icon: 'heart' },
        { key: 'collected', title: '收藏', icon: 'star' },
        { key: 'post', title: '笔记', icon: 'notebook' },
        // { key: 'about', title: '关于', icon: 'information' },
        { key: 'account', title: '帐号', icon: 'account' },
    ]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

    const handleVideoPress = useCallback((item) => {
        setSelectedVideo(item);
    }, []);

    const handleClosePlayer = useCallback(() => {
        console.log('Closing player');
        setSelectedVideo(null);
        setSelectedVideoIndex(0);
    }, []);

    const handleNextVideo = useCallback(() => {
        const nextIndex = (selectedVideoIndex + 1) % mockData.length;
        console.log('selectedVideoIndex:', selectedVideoIndex, 'nextIndex:', nextIndex);
        const nextVideo = mockData[nextIndex];
        setSelectedVideoIndex(nextIndex);
        setSelectedVideo(nextVideo);
        console.log('Fetching next video:', nextVideo.title);
    }, [selectedVideoIndex]);

    const renderScene = BottomNavigation.SceneMap({
        liked: () => <VideoListPage title="我的点赞视频" type='liked' onVideoPress={handleVideoPress} />,
        collected: () => <VideoListPage title="我的收藏视频" type='collected' onVideoPress={handleVideoPress} />,
        post: () => <VideoListPage title="我的笔记视频" type='post' onVideoPress={handleVideoPress} />,
        // about: () => <VideoListPage title="关于" count={0} data={[]} onVideoPress={handleVideoPress} />,
        account: () => <AccountPage />
    });

    const renderIcon = ({ route, focused, color }) => {
        return <MaterialCommunityIcons name={route.icon} size={24} color={color} />;
    };

    if (selectedVideo) {
        return <VideoPlayerPage
            key={selectedVideo.id}
            video={selectedVideo}
            onClose={handleClosePlayer}
            onNextVideo={handleNextVideo}
        />;
    }
    return (
        <BottomNavigation
            navigationState={{ index, routes }}
            onIndexChange={setIndex}
            renderScene={renderScene}
            renderIcon={renderIcon}
        />
    );
}

export default MainScreen;