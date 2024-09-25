import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, PanResponder, TouchableWithoutFeedback, Animated, ActivityIndicator } from 'react-native';
import { Appbar, IconButton, Text } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { ControlPanel } from './ControlPanel';
import { useNextVideo } from '../hooks/useNextVideo';

const { width, height } = Dimensions.get('window');

export const VideoPlayerPage = ({ video, onClose, onNextVideo }) => {
    const insets = useSafeAreaInsets();
    const [lastSwipeTime, setLastSwipeTime] = useState(0);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(300)).current;
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef(null);
    const [showCover, setShowCover] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const { getNextVideo, loading: loadingNextVideo } = useNextVideo();

    const [playMode, setPlayMode] = useState('single');
    const [playOrder, setPlayOrder] = useState('order');
    const [playSpeed, setPlaySpeed] = useState('1x');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedPlayMode = await AsyncStorage.getItem('playMode');
            const savedPlayOrder = await AsyncStorage.getItem('playOrder');
            const savedPlaySpeed = await AsyncStorage.getItem('playSpeed');
            if (savedPlayMode) setPlayMode(savedPlayMode);
            if (savedPlayOrder) setPlayOrder(savedPlayOrder);
            if (savedPlaySpeed) setPlaySpeed(savedPlaySpeed);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return Math.abs(gestureState.dy) > 10;
            },
            onPanResponderRelease: (evt, gestureState) => {
                const now = Date.now();
                if (gestureState.dy < -50 && now - lastSwipeTime > 500) {  // 向上滑动超过50个单位，且距离上次滑动超过500ms
                    console.log('Swiped up, fetching next video');
                    handleNextVideo();
                    setLastSwipeTime(now);
                }
            },
        })
    ).current;

    const handleBackPress = () => {
        console.log('Back button pressed in VideoPlayerPage');
        if (onClose) {
            onClose();
        } else {
            console.log('onClose is not defined');
        }
    };

    const handleSettingsPress = () => {
        setIsSettingsVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const closeSettings = () => {
        Animated.timing(slideAnim, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsSettingsVisible(false);
        });
    };

    const videoUrl = video.video_src;

    useEffect(() => {
        console.log('Video URL:', videoUrl);
        if (!videoUrl) {
            console.error('Invalid video URL');
            return;
        }
        // 尝试预加载视频
        if (videoRef.current) {
            videoRef.current.loadAsync({ uri: videoUrl }, {}, false)
                .then(() => {
                    console.log('Video preloaded successfully');
                    setShowCover(false);  // Hide cover when video is loaded
                    videoRef.current.playAsync();  // Start playing the video
                })
                .catch(error => console.error('Error preloading video:', error));
        }
    }, [videoUrl]);

    const handlePlayPress = async () => {
        console.log('Play button pressed');
        if (!videoUrl) {
            console.error('No video URL available');
            return;
        }
        if (videoRef.current) {
            try {
                const status = await videoRef.current.getStatusAsync();
                console.log('Current video status:', status);

                if (!status.isLoaded) {
                    console.log('Video not loaded, attempting to load...');
                    await videoRef.current.loadAsync({ uri: videoUrl }, {}, false);
                    const newStatus = await videoRef.current.getStatusAsync();
                    console.log('New video status after loading:', newStatus);
                }

                if (isPlaying) {
                    console.log('Pausing video');
                    await videoRef.current.pauseAsync();
                } else {
                    console.log('Playing video');
                    await videoRef.current.playAsync();
                    setShowCover(false);
                }
                setIsPlaying(!isPlaying);
            } catch (error) {
                console.error('Error playing/pausing video:', error);
                setIsLoading(false);
                // 可以在这里添加一个用户提示，比如显示一个错误消息
            }
        } else {
            console.log('Video ref is null');
        }
    };

    const handleNextVideo = async () => {
        try {
            const playOrder = await AsyncStorage.getItem('playOrder');
            const nextVideo = await getNextVideo(video.id, video.type, playOrder === 'random');
            console.log('nextVideo====', nextVideo ? nextVideo.id : 'No next video found');
            if (nextVideo) {
                onNextVideo(nextVideo);
            } else {
                console.log('No next video available');
                // 可以在这里添加一些用户反馈，比如显示一个提示消息
            }
        } catch (error) {
            console.error('Error getting next video:', error);
            // 可以在这里添加一些错误处理，比如显示一个错误消息
        }
    };

    const onVideoEnd = async () => {
        const playMode = await AsyncStorage.getItem('playMode') || 'single';
        if (playMode === 'single') {
            await videoRef.current.replayAsync();
        } else if (playMode === 'auto') {
            handleNextVideo();
        }
    };

    useEffect(() => {
        console.log('Video changed:', video.title);
    }, [video]);

    const onPlaybackStatusUpdate = (status) => {
        // console.log('Playback status:', status);
        if (status.isLoaded) {
            setIsLoading(false);
            // 视频加载成功后的处理
            if (status.didJustFinish) {
                onVideoEnd();
            }
        } else {
            // 视频加载失败的处理
            console.error('Video failed to load:', status.error);
            setIsLoading(false);
        }
    };

    const togglePlayPause = async () => {
        if (videoRef.current) {
            try {
                if (isPlaying) {
                    await videoRef.current.pauseAsync();
                } else {
                    await videoRef.current.playAsync();
                    setShowCover(false);
                }
                setIsPlaying(!isPlaying);
            } catch (error) {
                console.error('Error toggling play/pause:', error);
            }
        }
    };

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <TouchableWithoutFeedback onPress={togglePlayPause}>
                <View style={styles.videoContainer}>
                    <Video
                        ref={videoRef}
                        source={videoUrl ? { uri: videoUrl } : undefined}
                        style={styles.video}
                        resizeMode="contain"
                        isLooping={playMode === 'single'}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                        rate={parseFloat(playSpeed)}
                        shouldPlay={isPlaying}
                        useNativeControls={false}
                        onError={(error) => {
                            console.error('Video playback error:', error);
                            setIsLoading(false);
                        }}
                        onLoad={() => {
                            setIsLoading(false);
                            setShowCover(false);
                        }}
                        onLoadStart={() => setIsLoading(true)}
                    />
                    {showCover && (
                        <Image source={{ uri: video.image_src }} style={styles.cover} />
                    )}
                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                        </View>
                    )}
                    {!isLoading && !isPlaying && (
                        <View style={styles.playButtonContainer}>
                            <IconButton
                                icon="play"
                                size={50}
                                iconColor="white"
                                style={styles.playButton}
                                onPress={handlePlayPress}
                            />
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>ID: {video.id}</Text>
                    </View>
                    <Text style={styles.title}>{video.title}</Text>
                </View>
            </View>
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent']}
                style={styles.headerGradient}
            >
                <Appbar.Header style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress}>
                        <Appbar.BackAction color="white" />
                    </TouchableOpacity>
                    <Appbar.Content title="" />
                    <Appbar.Action icon="cog" onPress={handleSettingsPress} color="white" />
                </Appbar.Header>
            </LinearGradient>
            {isSettingsVisible && (
                <TouchableWithoutFeedback onPress={closeSettings}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={[
                                    styles.controlPanelContainer,
                                    {
                                        transform: [{ translateY: slideAnim }],
                                    },
                                ]}
                            >
                                <ControlPanel
                                    closeSettings={closeSettings}
                                    saveSetting={loadSettings}
                                />
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    cover: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
        resizeMode: 'cover',
    },
    content: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',  // 将内容移到底部
        padding: 16,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100, // 调整这个值以适应你的需求
    },
    header: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 16,
        borderRadius: 8,
    },
    badgeContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
    },
    title: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    videoContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    controlPanelContainer: {
        maxHeight: '80%',  // 限制最大高度
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});