import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabase } from '../contexts/SupabaseContext';
import { useUserStats } from '../hooks/useUserStats';
import { useNavigation } from '@react-navigation/native';

export const AccountPage = () => {
    const { user, supabase } = useSupabase();
    const { stats, loading, error, refetchStats } = useUserStats();
    const navigation = useNavigation();

    useEffect(() => {
        console.log('AccountPage: Current user:', user);
    }, [user]);

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
    },
    appbarContent: {
        alignItems: 'center',
    },
    appbarTitle: {
        color: '#000000', // 更深的颜色，可以根据需要调整
        fontWeight: 'bold', // 加粗字体
        fontSize: 26, // 增大字体大小
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
});