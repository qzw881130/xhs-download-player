import React, { useState, useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoListPage } from '../components/VideoListPage';
import { VideoPlayerPage } from '../components/VideoPlayerPage';
import { AccountPage } from '../components/AccountPage';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

function MainContent({ navigation }) {
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'liked', title: '点赞', icon: 'thumb-up' },
        { key: 'collected', title: '收藏', icon: 'star' },
        { key: 'account', title: '帐号', icon: 'account' },
    ]);

    const handleVideoPress = useCallback((item) => {
        navigation.navigate('VideoPlayer', { video: item });
    }, [navigation]);

    const renderScene = BottomNavigation.SceneMap({
        liked: () => <VideoListPage title="我的点赞视频" type='liked' onVideoPress={handleVideoPress} />,
        collected: () => <VideoListPage title="我的收藏视频" type='collected' onVideoPress={handleVideoPress} />,
        account: () => <AccountPage />
    });

    const renderIcon = ({ route, focused, color }) => {
        return <MaterialCommunityIcons name={route.icon} size={22} color={color} />;
    };

    return (
        <BottomNavigation
            navigationState={{ index, routes }}
            labeled={true}
            shifting={false}
            onIndexChange={setIndex}
            renderScene={renderScene}
            renderIcon={renderIcon}
            barStyle={styles.barStyle}
            style={styles.viewStyle}
        />
    );
}

function MainScreen() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainContent" component={MainContent} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
        </Stack.Navigator>
    );
}

function VideoPlayerScreen({ route, navigation }) {
    const { video } = route.params;

    const handleClosePlayer = useCallback(() => {
        console.log('Closing player');
        navigation.goBack();
    }, [navigation]);

    return (
        <VideoPlayerPage
            srcVideo={video}
            onClose={handleClosePlayer}
        />
    );
}

const styles = StyleSheet.create({
    barStyle: {
        marginBottom: Platform.OS === 'ios' ? -35 : -10,
    },
    viewStyle: {
    }
});

export default MainScreen;