import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Dimensions, Keyboard } from 'react-native';
import { Modal, Portal, Searchbar, IconButton, Text, Card, Button, Menu, ActivityIndicator } from 'react-native-paper';
import { useFilteredVideoList } from '../hooks/useFilteredVideoList';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 32) / 2; // 调整列宽，为间距留出空间

const SearchModal = ({ visible, onDismiss, onVideoPress, type }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const itemsPerPage = 10;

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

    const onChangeSearch = query => {
        setSearchQuery(query);
        // search(query);
    };

    const handleSearch = () => {
        search(searchQuery);
        Keyboard.dismiss(); // 隐藏键盘
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => onVideoPress(item)}>
            <Card style={styles.card}>
                <Card.Cover source={{ uri: item.image_src || `https://via.placeholder.com/150x200` }} style={styles.cardImage} />
                <Card.Content>
                    <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);
    const pageOptions = Array.from({ length: pages }, (_, i) => i + 1);

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
                    <Searchbar
                        placeholder=""
                        onChangeText={onChangeSearch}
                        value={searchQuery}
                        style={styles.searchbar}
                        inputStyle={styles.searchbarInput}
                        contentStyle={styles.searchbarContent}
                        onSubmitEditing={handleSearch}
                    />
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
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.1}
                    refreshing={loading}
                    onRefresh={refresh}
                />
                {pages > 1 && (
                    <View style={styles.pagination}>
                        <Button
                            onPress={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            上一页
                        </Button>
                        <Menu
                            visible={menuVisible}
                            onDismiss={closeMenu}
                            anchor={
                                <Button onPress={openMenu}>
                                    {`第 ${page} 页`}
                                </Button>
                            }
                        >
                            {pageOptions.map((p) => (
                                <Menu.Item
                                    key={p}
                                    onPress={() => {
                                        setPage(p);
                                        closeMenu();
                                    }}
                                    title={`第 ${p} 页`}
                                />
                            ))}
                        </Menu>
                        <Button
                            onPress={() => setPage(p => Math.min(pages, p + 1))}
                            disabled={page === pages}
                        >
                            下一页
                        </Button>
                    </View>
                )}
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
    },
    searchBtn: {
        fontSize: 18,
    },
    searchbarInput: {
        fontSize: 16,
        paddingVertical: 0,
        // backgroundColor: 'red',
        textAlignVertical: 'center',
        marginTop: -5
    },
    searchbarContent: {
        justifyContent: 'center', // 添加这行确保文本居中
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
});

export default SearchModal;