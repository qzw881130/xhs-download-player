import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { Modal, Portal, Searchbar, IconButton, Text, Card, Button, Menu } from 'react-native-paper';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 32) / 2; // 调整列宽，为间距留出空间

const SearchModal = ({ visible, onDismiss, onSearch, data, onVideoPress }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [page, setPage] = useState(1);
    const [menuVisible, setMenuVisible] = useState(false);
    const itemsPerPage = 10;

    const onChangeSearch = query => setSearchQuery(query);

    const handleSearch = () => {
        const filtered = data.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredData(filtered);
        setPage(1);
        onSearch(searchQuery);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => onVideoPress(item)}>
            <Card style={styles.card}>
                <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
                <Card.Content>
                    <Text numberOfLines={2} style={styles.cardTitle}>{item.title}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);
    const pageOptions = Array.from({ length: totalPages }, (_, i) => i + 1);

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
                        placeholder="搜索"
                        onChangeText={onChangeSearch}
                        value={searchQuery}
                        style={styles.searchbar}
                        onSubmitEditing={handleSearch}
                        right={() => (
                            <IconButton
                                icon="magnify"
                                size={24}
                                onPress={handleSearch}
                            />
                        )}
                    />
                </View>
                <FlatList
                    data={filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage)}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={styles.emptyText}>暂无数据</Text>}
                />
                {totalPages > 1 && (
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
                            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
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
    },
    backIcon: {
        marginRight: 8,
    },
    searchbar: {
        flex: 1,
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
        marginBottom: 16, // 增加底部间距
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

export default SearchModal;