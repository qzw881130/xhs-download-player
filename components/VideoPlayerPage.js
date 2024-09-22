import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, PanResponder, TouchableWithoutFeedback, Animated, ActivityIndicator } from 'react-native';
import { Appbar, IconButton, Text, Drawer, List, Button, Divider, SegmentedButtons, RadioButton, Switch } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';

const { width, height } = Dimensions.get('window');

export const VideoPlayerPage = ({ video, onClose, onNextVideo }) => {
    const insets = useSafeAreaInsets();
    const [lastSwipeTime, setLastSwipeTime] = useState(0);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [activeSettings, setActiveSettings] = useState('');
    const slideAnim = useRef(new Animated.Value(300)).current; // Start from 300 (off-screen)
    const [playMode, setPlayMode] = useState('single');
    const [playOrder, setPlayOrder] = useState('order');
    const [playSpeed, setPlaySpeed] = useState('1x');
    const [autoPlay, setAutoPlay] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const [showCover, setShowCover] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load saved settings when component mounts
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedPlayMode = await AsyncStorage.getItem('playMode');
            const savedPlayOrder = await AsyncStorage.getItem('playOrder');
            const savedPlaySpeed = await AsyncStorage.getItem('playSpeed');
            const savedAutoPlay = await AsyncStorage.getItem('autoPlay');
            if (savedPlayMode) setPlayMode(savedPlayMode);
            if (savedPlayOrder) setPlayOrder(savedPlayOrder);
            if (savedPlaySpeed) setPlaySpeed(savedPlaySpeed);
            if (savedAutoPlay !== null) setAutoPlay(JSON.parse(savedAutoPlay));
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, typeof value === 'boolean' ? JSON.stringify(value) : value);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handlePlayModeChange = (value) => {
        setPlayMode(value);
        saveSettings('playMode', value);
        console.log(`Play mode changed to: ${value}`);
    };

    const handlePlayOrderChange = (value) => {
        setPlayOrder(value);
        saveSettings('playOrder', value);
        console.log(`Play order changed to: ${value}`);
    };

    const handlePlaySpeedChange = (value) => {
        setPlaySpeed(value);
        saveSettings('playSpeed', value);
        console.log(`Play speed changed to: ${value}`);
    };

    const handleAutoPlayChange = (value) => {
        setAutoPlay(value);
        saveSettings('autoPlay', value);
        console.log(`Auto play changed to: ${value}`);
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
                    onNextVideo();
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

    const videoUrl = "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";

    useEffect(() => {
        console.log('Video URL:', videoUrl);
        // 尝试预加载视频
        if (videoRef.current) {
            videoRef.current.loadAsync({ uri: videoUrl }, {}, false)
                .then(() => console.log('Video preloaded successfully'))
                .catch(error => console.error('Error preloading video:', error));
        }
    }, []);

    const handlePlayPress = async () => {
        console.log('Play button pressed');
        if (videoRef.current) {
            try {
                const status = await videoRef.current.getStatusAsync();
                console.log('Current video status:', status);

                if (!status.isLoaded) {
                    console.log('Video not loaded, attempting to load...');
                    await videoRef.current.loadAsync({ uri: videoUrl }, {}, false);
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
            }
        } else {
            console.log('Video ref is null');
        }
    };

    const onVideoEnd = async () => {
        if (playMode === 'single') {
            await videoRef.current.replayAsync();
        } else if (playMode === 'auto') {
            onNextVideo();
        }
    };

    useEffect(() => {
        console.log('Video changed:', video.title);
    }, [video]);

    const onPlaybackStatusUpdate = (status) => {
        console.log('Playback status:', status);
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

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Video
                ref={videoRef}
                source={{ uri: videoUrl }}
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
                onLoad={() => setIsLoading(false)}
                onLoadStart={() => setIsLoading(true)}
            />
            {showCover && (
                <Image source={{ uri: video.image }} style={styles.cover} />
            )}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
            )}
            <View style={styles.content}>
                <IconButton
                    icon={isPlaying ? "pause" : "play"}
                    size={50}
                    style={styles.playButton}
                    onPress={handlePlayPress}
                    color="white"
                />
                <View style={styles.titleContainer}>
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
                                    styles.drawerContainer,
                                    {
                                        transform: [{ translateY: slideAnim }],
                                    },
                                ]}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={{ color: '#000', fontSize: 18 }}>控制面板</Text>
                                    <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                                        <IconButton
                                            icon="close"
                                            size={24}
                                            color="#000"
                                            onPress={closeSettings}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Divider />
                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>播放倍速</Text>
                                    <View style={styles.settingControl}>
                                        <SegmentedButtons
                                            density="small"
                                            value={playSpeed}
                                            onValueChange={handlePlaySpeedChange}
                                            buttons={[
                                                { label: '0.5x', value: '0.5x' },
                                                { label: '1x', value: '1x' },
                                                { label: '1.5x', value: '1.5x' },
                                                { label: '2x', value: '2x' },
                                            ]}
                                        />
                                    </View>
                                </View>

                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>播放模式</Text>
                                    <View style={styles.settingControl}>
                                        <RadioButton.Group
                                            onValueChange={handlePlayModeChange}
                                            value={playMode}
                                        >
                                            <View style={styles.radioButtonGroup}>
                                                <TouchableOpacity
                                                    style={styles.radioButtonRow}
                                                    onPress={() => handlePlayModeChange('single')}
                                                >
                                                    <RadioButton value="single" />
                                                    <Text style={styles.radioButtonLabel}>单视频循环</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.radioButtonRow}
                                                    onPress={() => handlePlayModeChange('auto')}
                                                >
                                                    <RadioButton value="auto" />
                                                    <Text style={styles.radioButtonLabel}>自动播放下一个</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </RadioButton.Group>
                                    </View>
                                </View>

                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>播放顺序</Text>
                                    <View style={styles.settingControl}>
                                        <RadioButton.Group
                                            onValueChange={handlePlayOrderChange}
                                            value={playOrder}
                                        >
                                            <View style={styles.radioButtonGroup}>
                                                <TouchableOpacity
                                                    style={styles.radioButtonRow}
                                                    onPress={() => handlePlayOrderChange('order')}
                                                >
                                                    <RadioButton value="order" />
                                                    <Text style={styles.radioButtonLabel}>顺序播放</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.radioButtonRow}
                                                    onPress={() => handlePlayOrderChange('random')}
                                                >
                                                    <RadioButton value="random" />
                                                    <Text style={styles.radioButtonLabel}>随机播放</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </RadioButton.Group>
                                    </View>
                                </View>

                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>自动播放</Text>
                                    <View style={styles.settingControl}>
                                        <Switch
                                            value={autoPlay}
                                            onValueChange={handleAutoPlayChange}
                                        />
                                    </View>
                                </View>
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
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    titleContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        color: 'white',
        fontSize: 18,
    },
    drawerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 10,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    settingLabel: {
        fontSize: 14,
        color: '#333',
        flex: 1, // 添加这一行
    },
    settingControl: {
        flex: 5, // 增加这个值，给按钮组更多空间
        alignItems: 'flex-start',
    },
    radioButtonGroup: {
        flexDirection: 'row', // 使按钮组水平排列
        justifyContent: 'flex-start', // 靠右对齐
    },
    radioButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
        paddingVertical: 8,  // 增加可点击区域
        paddingHorizontal: 5,  // 增加可点击区域
    },
    radioButtonLabel: {
        marginLeft: 4,
        fontSize: 12, // 减小字体大小以适应一行
        color: '#333',
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
});