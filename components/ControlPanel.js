import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, SegmentedButtons, RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ControlPanel = ({ closeSettings, saveSetting = () => { } }) => {
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

    const saveSettings = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, value);
            saveSetting();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handlePlayModeChange = (value) => {
        setPlayMode(value);
        saveSettings('playMode', value);
    };

    const handlePlayOrderChange = (value) => {
        setPlayOrder(value);
        saveSettings('playOrder', value);
    };

    const handlePlaySpeedChange = (value) => {
        setPlaySpeed(value);
        saveSettings('playSpeed', value);
    };

    return (
        <View style={styles.drawerContainer}>
            <View style={styles.header}>
                <Text style={styles.headerText}>控制面板</Text>
                <TouchableOpacity onPress={closeSettings}>
                    <Text style={styles.closeButton}>X</Text>
                </TouchableOpacity>
            </View>
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
                                <Text style={styles.radioButtonLabel}>单视频循环</Text>
                                <RadioButton value="single" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.radioButtonRow}
                                onPress={() => handlePlayModeChange('auto')}
                            >

                                <Text style={styles.radioButtonLabel}>自动播放下一个</Text>
                                <RadioButton value="auto" />
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
                                <Text style={styles.radioButtonLabel}>顺序播放</Text>
                                <RadioButton value="order" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.radioButtonRow}
                                onPress={() => handlePlayOrderChange('random')}
                            >

                                <Text style={styles.radioButtonLabel}>随机播放</Text>
                                <RadioButton value="random" />
                            </TouchableOpacity>
                        </View>
                    </RadioButton.Group>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
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
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    settingLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    settingControl: {
        flex: 4,
    },
    radioButtonGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    radioButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 0,
    },
    radioButtonLabel: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
});