import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Appbar, Text, Card, Button, Menu } from 'react-native-paper';
import SearchModal from './SearchModal';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 24) / 2;

export const VideoListPage = ({ title, count, data, onVideoPress }) => {
    const [page, setPage] = useState(1);
    const [menuVisible, setMenuVisible] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);
    const [filteredData, setFilteredData] = useState(data);
    const itemsPerPage = 10;

    const onChangeSearch = query => setSearchQuery(query);

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

    const handleSearch = (query) => {
        const filtered = data.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredData(filtered);
        setPage(1);
    };

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title={title} subtitle={count > 0 ? `共${count}个` : undefined} />
                <Appbar.Action icon="magnify" onPress={() => setSearchVisible(true)} />
            </Appbar.Header>
            <FlatList
                data={filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage)}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
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
            <SearchModal
                visible={searchVisible}
                onDismiss={() => setSearchVisible(false)}
                onSearch={handleSearch}
                data={data}
                onVideoPress={onVideoPress}
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