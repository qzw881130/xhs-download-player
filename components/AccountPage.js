import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabase } from '../contexts/SupabaseContext';
import { useUserStats } from '../hooks/useUserStats';

export const AccountPage = ({ navigation }) => {
    const { user, supabase } = useSupabase();
    const { stats, loading, error, refetchStats } = useUserStats();

    useEffect(() => {
        console.log('AccountPage: Current user:', user);
    }, [user]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await AsyncStorage.clear();
        navigation.navigate('LoginRegister');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        console.error('AccountPage: Error fetching stats:', error);
        return (
            <View style={styles.container}>
                <Text>Error: {error}</Text>
                <Button onPress={refetchStats}>Retry</Button>
            </View>
        );
    }

    if (!user) {
        console.log('AccountPage: No user found');
        return (
            <View style={styles.container}>
                <Text>Please log in to view your account information.</Text>
                <Button onPress={() => navigation.navigate('LoginRegister')}>Log In</Button>
            </View>
        );
    }

    console.log('AccountPage: Rendering stats:', stats);

    return (
        <View style={styles.container}>
            <View style={styles.accountSection}>
                <Text style={styles.email}>{user.email}</Text>
                <Button mode="contained" onPress={handleLogout} style={styles.button}>
                    退出
                </Button>
            </View>
            <View style={styles.statsSection}>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Text style={styles.cardTitle}>帐户邮箱: </Text>
                        <Text>{user.email}</Text>
                    </Card.Content>
                </Card>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Text style={styles.cardTitle}>总视频数: </Text>
                        <Text>{stats.totalVideos}</Text>
                    </Card.Content>
                </Card>
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
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Text style={styles.cardTitle}>笔记视频数: </Text>
                        <Text>{stats.notedVideos}</Text>
                    </Card.Content>
                </Card>
                <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Text style={styles.cardTitle}>隐藏视频数: </Text>
                        <Text>{stats.hiddenVideos}</Text>
                    </Card.Content>
                </Card>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    accountSection: {
        marginBottom: 16,
        alignItems: 'center',
    },
    email: {
        fontSize: 18,
        marginBottom: 8,
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