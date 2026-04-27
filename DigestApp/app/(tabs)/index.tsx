import React, { useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors } from '../../src/constants/theme';
import { ARTICLES } from '../../src/constants/mockData';
import FeedCard from '../../src/components/feed/FeedCard';
import Header from '../../src/components/common/Header';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const flatListRef = useRef<FlatList>(null);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof ARTICLES)[0]; index: number }) => (
      <FeedCard article={item} index={index} />
    ),
    []
  );

  const keyExtractor = useCallback((item: (typeof ARTICLES)[0]) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        ref={flatListRef}
        data={ARTICLES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    // No additional padding needed — cards handle their own
  },
});
