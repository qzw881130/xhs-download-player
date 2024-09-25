import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Appbar } from 'react-native-paper';
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

    const renderAppBar = () => (
        <Appbar.Header style={styles.appbar}>
            <Appbar.Content title="帐号" style={styles.appbarContent} />
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

    if (!user) {
        console.log('AccountPage: No user found');
        return (
            <View style={styles.container}>
                {renderAppBar()}
                <View style={styles.centerContent}>
                    <Text>Please log in to view your account information.</Text>
                    <Button onPress={() => navigation.navigate('LoginRegister')}>Log In</Button>
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
                </View>
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