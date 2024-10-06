import React, { useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabase } from '../contexts/SupabaseContext';
import { useUserStats } from '../hooks/useUserStats';
import { useNavigation } from '@react-navigation/native';
import { getCacheSize, clearCache } from '../utils/videoProxy';

export const AccountPage = () => {
    const { user, supabase } = useSupabase();
    const { stats, loading, error, refetchStats } = useUserStats();
    const navigation = useNavigation();
    const [cacheSize, setCacheSize] = useState('0');
    const [clearingCache, setClearingCache] = useState(false);

    useEffect(() => {
        console.log('AccountPage: Current user:', user);
        loadCacheSize();
    }, [user]);

    const loadCacheSize = async () => {
        const size = await getCacheSize();
        setCacheSize(size);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            await AsyncStorage.clear();
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginRegister' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleClearCache = async () => {
        Alert.alert(
            "清除缓存",
            "确定要清除所有缓存的视频吗？",
            [
                {
                    text: "取消",
                    style: "cancel"
                },
                {
                    text: "确定",
                    onPress: async () => {
                        setClearingCache(true);
                        const success = await clearCache();
                        if (success) {
                            await loadCacheSize();
                            Alert.alert("成功", "缓存已清除");
                        } else {
                            Alert.alert("错误", "清除缓存时出现问题");
                        }
                        setClearingCache(false);
                    }
                }
            ]
        );
    };

    const renderAppBar = () => (
        <Appbar.Header style={styles.appbar}>
            <Appbar.Content
                title="帐号"
                titleStyle={styles.appbarTitle}
                style={styles.appbarContent}
            />
        </Appbar.Header>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                {renderAppBar()}
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" />
                </View>
            </View>
        );
    }

    if (error) {
        console.error('AccountPage: Error fetching stats:', error);
        return (
            <View style={styles.container}>
                {renderAppBar()}
                <View style={styles.centerContent}>
                    <Text>Error: {error}</Text>
                    <Button onPress={refetchStats}>Retry</Button>
                </View>
            </View>
        );
    }

    console.log('AccountPage: Rendering stats:', stats);

    return (
        <View style={styles.container}>
            {renderAppBar()}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.accountSection}>
                    <Text style={styles.email}>{user?.email}</Text>
                    <Button mode="contained" onPress={handleLogout} style={styles.button}>
                        退出
                    </Button>
                </View>
                <View style={styles.cacheSection}>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.cardTitle}>缓存大小: </Text>
                            <Text>{cacheSize} MB</Text>
                        </Card.Content>
                    </Card>
                    <Button
                        mode="outlined"
                        onPress={handleClearCache}
                        style={styles.button}
                        disabled={clearingCache}
                    >
                        {clearingCache ? "正在清除..." : "清除缓存"}
                    </Button>
                </View>
                {/* <View style={styles.statsSection}>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.cardTitle}>点赞视频数: </Text>
                            <Text>{stats.likedVideos}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Text style={styles.cardTitle}>收藏视频数: </Text>
                            <Text>{stats.favoritedVideos}</Text>
                        </Card.Content>
                    </Card>
                </View> */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    appbar: {
        elevation: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        borderColor: 'yellow',
        marginTop: 30
    },
    appbarContent: {
        alignItems: 'center',
        borderWidth: 0,
        borderColor: 'red',
        padding: 1
    },
    appbarTitle: {
        color: '#000000', // 更深的颜色，可以根据需要调整
        fontWeight: 'bold', // 加粗字体
        fontSize: 26, // 增大字体大小
        padding: 10
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    accountSection: {
        marginBottom: 16,
        alignItems: 'center',
    },
    email: {
        fontSize: 18,
        marginBottom: 8,
        color: '#333', // 更深的颜色
        fontWeight: '600', // 稍微加粗
    },
    button: {
        marginTop: 8,
    },
    statsSection: {
        flex: 1,
    },
    card: {
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cacheSection: {
        marginTop: 16,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        marginBottom: 12,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    button: {
        marginTop: 8,
        width: '100%',
    },
});