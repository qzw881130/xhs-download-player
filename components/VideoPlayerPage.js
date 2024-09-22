import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, PanResponder, TouchableWithoutFeedback } from 'react-native';
import { Appbar, IconButton, Text, Drawer, List, Button, Divider, SegmentedButtons, RadioButton, Switch } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const VideoPlayerPage = ({ video, onClose, onNextVideo }) => {
    const insets = useSafeAreaInsets();
    const [lastSwipeTime, setLastSwipeTime] = useState(0);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [activeSettings, setActiveSettings] = useState('');

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
    };

    const closeSettings = () => {
        setIsSettingsVisible(false);
    };

    useEffect(() => {
        console.log('Video changed:', video.title);
    }, [video]);

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <Image source={{ uri: video.image }} style={styles.cover} />
            <View style={styles.content}>
                <IconButton
                    icon="play"
                    size={50}
                    style={styles.playButton}
                    onPress={() => console.log('Play video pressed')}
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
                            <View style={styles.drawerContainer}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={{ color: '#000', fontSize: 18 }}>控制面板</Text>
                                    <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                                        <IconButton
                                            icon="close"
                                            size={24}
                                            color="#000"
                                            onPress={() => setIsSettingsVisible(false)}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Divider />
                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>播放倍速</Text>
                                    <View style={styles.settingControl}>
                                        <SegmentedButtons
                                            density="small"
                                            buttons={[
                                                { label: '0.5x', value: '0.5x' },
                                                { label: '1x', value: '1x' },
                                                { label: '1.5x', value: '1.5x' },
                                                { label: '2x', value: '2x' },
                                            ]}
                                            onValueChange={(value) => console.log(`${value} pressed`)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>播放模式</Text>
                                    <View style={styles.settingControl}>
                                        <RadioButton.Group
                                            onValueChange={value => console.log(`${value} selected`)}
                                            value="single"
                                        >
                                            <View style={styles.radioButtonGroup}>
                                                <View style={styles.radioButtonRow}>
                                                    <RadioButton value="single" />
                                                    <Text style={styles.radioButtonLabel}>单视频循环</Text>
                                                </View>
                                                <View style={styles.radioButtonRow}>
                                                    <RadioButton value="auto" />
                                                    <Text style={styles.radioButtonLabel}>自动播放下一个</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                    </View>
                                </View>

                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>播放顺序</Text>
                                    <View style={styles.settingControl}>
                                        <RadioButton.Group
                                            onValueChange={value => console.log(`${value} selected`)}
                                            value="order"
                                        >
                                            <View style={styles.radioButtonGroup}>
                                                <View style={styles.radioButtonRow}>
                                                    <RadioButton value="order" />
                                                    <Text style={styles.radioButtonLabel}>顺序播放</Text>
                                                </View>
                                                <View style={styles.radioButtonRow}>
                                                    <RadioButton value="random" />
                                                    <Text style={styles.radioButtonLabel}>随机播放</Text>
                                                </View>
                                            </View>
                                        </RadioButton.Group>
                                    </View>
                                </View>

                                <View style={styles.settingRow}>
                                    <Text style={styles.settingLabel}>自动播放</Text>
                                    <View style={styles.settingControl}>
                                        <Switch value={true} onValueChange={(value) => console.log(`Auto play ${value}`)} />
                                    </View>
                                </View>
                            </View>
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
        // height: 200, // 调整抽屉的高度
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
        marginLeft: 10, // 给每个选项之间添加一些间距
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
});