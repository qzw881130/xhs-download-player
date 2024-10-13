import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Dimensions, Keyboard, TextInput } from 'react-native';
import { Modal, Portal, IconButton, Text, Card, Button, Menu, ActivityIndicator } from 'react-native-paper';
import { useFilteredVideoList } from '../hooks/useFilteredVideoList';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 32) / 2; // 调整列宽，为间距留出空间

const SearchModal = ({ visible, onDismiss, onVideoPress, type }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const itemsPerPage = 10;
    const searchInputRef = useRef(null);

    const {
        filteredData,
        loading,
        error,
        hasMore,
        loadMore,
        refresh,
        search,
        setKeyword,
        count,
        pageSize,
        pages,
        page,
        setPage
    } = useFilteredVideoList({ type, pageSize: itemsPerPage });

    const onChangeSearch = (query) => {
        setSearchQuery(query);
    };

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            search(searchQuery.trim());
        }
        Keyboard.dismiss();
    }, [searchQuery, search]);

    const handlePlay = (item) => {
        onDismiss();
        onVideoPress(item)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => handlePlay(item)}>
            <Card style={styles.card}>
                <Card.Cover source={{ uri: item.image_src || `https://via.placeholder.com/150x200` }} style={styles.cardImage} />
                <Card.Content>
                    <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            loadMore();
        }
    };

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#0000ff" />
            </View>
        );
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.searchModal}
            >
                <View style={styles.searchContainer}>
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={onDismiss}
                        style={styles.backIcon}
                    />
                    <View style={styles.searchbar}>
                        <TextInput
                            ref={searchInputRef}
                            placeholder="输入搜索内容"
                            onChangeText={onChangeSearch}
                            value={searchQuery}
                            style={styles.searchbarInput}
                            onEndEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                    <Button onPress={handleSearch} labelStyle={styles.searchBtn}>搜索</Button>
                </View>
                <Text style={styles.resultCount}>共找到 {count} 个结果</Text>
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>暂无数据</Text>}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={renderFooter}
                    refreshing={loading && page === 1}
                    onRefresh={refresh}
                />
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    searchModal: {
        backgroundColor: 'white',
        paddingTop: 10,
        margin: 0,
        marginBottom: 20,
        borderRadius: 10,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 8,
    },
    backIcon: {
        marginRight: 8,
    },
    searchbar: {
        flex: 1,
        justifyContent: 'center',
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 10,
    },
    searchbarInput: {
        fontSize: 16,
        height: '100%',
    },
    searchBtn: {
        fontSize: 18,
    },
    resultCount: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        fontSize: 14,
        color: '#666',
    },
    row: {
        justifyContent: 'space-between',
        gap: 5,
    },
    listContent: {
        paddingHorizontal: 8,
    },
    card: {
        width: COLUMN_WIDTH,
        marginBottom: 16,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerLoader: {
        marginTop: 10,
        alignItems: 'center'
    }
});

export default SearchModal;
