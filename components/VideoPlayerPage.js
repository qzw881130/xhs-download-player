import React from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Appbar, IconButton, Text } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export const VideoPlayerPage = ({ video, onClose }) => {
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        console.log('Back button pressed in VideoPlayerPage');
        if (onClose) {
            onClose();
        } else {
            console.log('onClose is not defined');
        }
    };

    return (
        <View style={styles.container}>
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
                    <Appbar.Action icon="cog" onPress={() => console.log('Settings pressed')} color="white" />
                </Appbar.Header>
            </LinearGradient>
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
});