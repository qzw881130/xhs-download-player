import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text, Card, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSupabase } from '../contexts/SupabaseContext';

export const AccountPage = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [stats, setStats] = useState({
        totalVideos: 0,
        likedVideos: 0,
        favoritedVideos: 0,
        notedVideos: 0,
        hiddenVideos: 0,
    });
    // const supabase = useSupabase();
    const { user, supabase } = useSupabase();

    console.log('user==', JSON.stringify(user, null, 2))

    useEffect(() => {
        const loadUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            console.log(data)
            if (error) {
                console.error('Error fetching session:', error);
            } else {
                const user = session.user;
                console.log('user==', user);
                if (user) {
                    setEmail(user.email);
                    // Fetch stats from your backend or Supabase
                    // Example:
                    // const { data } = await supabase.from('videos').select('*');
                    // setStats({
                    //     totalVideos: data.length,
                    //     likedVideos: data.filter(video => video.liked).length,
                    //     favoritedVideos: data.filter(video => video.favorited).length,
                    //     notedVideos: data.filter(video => video.noted).length,
                    //     hiddenVideos: data.filter(video => video.hidden).length,
                    // });
                }
            }
        };

        loadUser();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        await AsyncStorage.clear();
        navigation.navigate('LoginRegister');
    };

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
                        <Text>{email}</Text>
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