import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Appbar, Searchbar, Text, Card, Button } from 'react-native-paper';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 24) / 2; // 24 is the total horizontal padding

export const VideoListPage = ({ title, count, data, onVideoPress }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const itemsPerPage = 10; // 假设每页显示10个项目

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

    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
        <View style={styles.container}>
            <Appbar.Header>
                <Appbar.Content title={title} subtitle={count > 0 ? `共${count}个` : undefined} />
            </Appbar.Header>
            {title !== "关于" && (
                <Searchbar
                    placeholder="搜索"
                    onChangeText={onChangeSearch}
                    value={searchQuery}
                    style={styles.searchbar}
                />
            )}
            <FlatList
                data={data.slice((page - 1) * itemsPerPage, page * itemsPerPage)}
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
                    <Text>{`第 ${page} 页，共 ${totalPages} 页`}</Text>
                    <Button
                        onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        下一页
                    </Button>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchbar: {
        margin: 8,
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
        height: COLUMN_WIDTH * 1.5, // 假设图片比例为2:3
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