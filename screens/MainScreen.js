import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoListPage } from '../components/VideoListPage';
import { VideoPlayerPage } from '../components/VideoPlayerPage';
import { AccountPage } from '../components/AccountPage';

function MainScreen() {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'liked', title: '点赞', icon: 'heart' },
        { key: 'collected', title: '收藏', icon: 'star' },
        // { key: 'post', title: '笔记', icon: 'notebook' },
        // { key: 'about', title: '关于', icon: 'information' },
        { key: 'account', title: '帐号', icon: 'account' },
    ]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleVideoPress = useCallback((item) => {
        setSelectedVideo(item);
    }, []);

    const handleClosePlayer = useCallback(() => {
        console.log('Closing player');
        setSelectedVideo(null);
    }, []);

    const handleNextVideo = (video) => {
        // console.log('next video', video)
        setSelectedVideo(video);
    };

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