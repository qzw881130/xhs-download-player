import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { Appbar, Text, Card, Button, Menu, ActivityIndicator } from 'react-native-paper';
import SearchModal from './SearchModal';
import { useFilteredVideoList } from '../hooks/useFilteredVideoList';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 24) / 2;

export const VideoListPage = ({ title, type, onVideoPress }) => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const itemsPerPage = 10;

    const {
        filteredData,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        search,
        count,
        pageSize,
        pages,
        page,
        setPage
    } = useFilteredVideoList({ type, pageSize: itemsPerPage });

    const [refreshing, setRefreshing] = useState(false);

    console.log('count,pageSize,pages,page====', count, pageSize, pages, page);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => onVideoPress(item)}>
            <Card style={styles.card}>
                <Card.Cover source={{ uri: item.image_src || 'https://via.placeholder.com/150x200' }} style={styles.cardImage} />
                <Card.Content>
                    <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const handleSearch = (query) => {
        search(query);
    };

    const handleLoadMore = () => {
        if (hasMore) {
            loadMore();
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    if (loading && page === 1) {
        return (
            <View style={styles.container}>
                <Appbar.Header>
                    <Appbar.Content title={title} />
                    <Appbar.Action icon="magnify" onPress={() => setSearchVisible(true)} />
                </Appbar.Header>
                <ActivityIndicator animating={true} size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title={title + `（共${count}个)`} />
                <Appbar.Action icon="magnify" onPress={() => setSearchVisible(true)} />
            </Appbar.Header>
            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                ListEmptyComponent={<Text style={styles.emptyText}>暂无数据</Text>}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={() => (
                    loading && page > 1 ? <ActivityIndicator size="small" /> : null
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={["#0000ff"]}
                        tintColor="#0000ff"
                    />
                }
            />
            <SearchModal
                visible={searchVisible}
                onDismiss={() => setSearchVisible(false)}
                onVideoPress={onVideoPress}
                type={type}
                onSearch={handleSearch}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row: {
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    card: {
        width: COLUMN_WIDTH,
        marginBottom: 8,
    },
    cardImage: {
        height: COLUMN_WIDTH * 1.5,
    },
    cardTitle: {
        fontSize: 14,
        marginTop: 4,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
    },
});
