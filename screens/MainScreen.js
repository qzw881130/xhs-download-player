import React, { useState } from 'react';
import { View } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoListPage } from '../components/VideoListPage';
import { VideoPlayerPage } from '../components/VideoPlayerPage';

// 模拟数据
const mockData = Array(50).fill().map((_, index) => ({
    id: `${index}`,
    title: `视频标题 ${index + 1}`,
    image: `https://picsum.photos/300/450?random=${index}`,
}));

function MainScreen() {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'liked', title: '点赞', icon: 'heart' },
        { key: 'collected', title: '收藏', icon: 'star' },
        { key: 'post', title: '笔记', icon: 'notebook' },
        { key: 'about', title: '关于', icon: 'information' },
    ]);
    const [selectedVideo, setSelectedVideo] = useState(null);

    const handleVideoPress = (video) => {
        setSelectedVideo(video);
    };

    const handleClosePlayer = () => {
        console.log('Closing player'); // 添加这行来调试
        setSelectedVideo(null);
    };

    const renderScene = BottomNavigation.SceneMap({
        liked: () => <VideoListPage title="我的点赞视频" count={mockData.length} data={mockData} onVideoPress={handleVideoPress} />,
        collected: () => <VideoListPage title="我的收藏视频" count={mockData.length} data={mockData} onVideoPress={handleVideoPress} />,
        post: () => <VideoListPage title="我的笔记视频" count={mockData.length} data={mockData} onVideoPress={handleVideoPress} />,
        about: () => <VideoListPage title="关于" count={0} data={[]} onVideoPress={handleVideoPress} />,
    });

    const renderIcon = ({ route, focused, color }) => {
        return <MaterialCommunityIcons name={route.icon} size={24} color={color} />;
    };

    if (selectedVideo) {
        return <VideoPlayerPage video={selectedVideo} onClose={handleClosePlayer} />;
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