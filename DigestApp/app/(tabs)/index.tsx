import React, { useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors } from '../../src/constants/theme';
import { useNews } from '../../src/hooks/useNews';
import FeedCard from '../../src/components/feed/FeedCard';
import Header from '../../src/components/common/Header';
import { Article } from '../../src/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const flatListRef = useRef<FlatList>(null);
  const { articles, loading, error, refreshing, loadingMore, refresh, loadMore, hasMore } =
    useNews({ limit: 10 });

  const renderItem = useCallback(
    ({ item, index }: { item: Article; index: number }) => (
      <FeedCard article={item} index={index} />
    ),
    []
  );

  const keyExtractor = useCallback((item: Article) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  // Footer loader for infinite scroll
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Loading more stories...</Text>
      </View>
    );
  }, [loadingMore]);

  // Loading state
  if (loading && articles.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Header />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Fetching latest news...</Text>
      </View>
    );
  }

  // Error state
  if (error && articles.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Header />
        <Text style={styles.errorEmoji}>📡</Text>
        <Text style={styles.errorTitle}>Connection Issue</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>TRY AGAIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        ref={flatListRef}
        data={articles}
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
        // ─── Infinite Scroll ──────────────────────
        onEndReached={loadMore}
        onEndReachedThreshold={1.5}
        ListFooterComponent={renderFooter}
        // ─── Pull to Refresh ─────────────────────
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        // ─── Performance ─────────────────────────
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  list: {
    flex: 1,
  },
  listContent: {
    // No additional padding needed — cards handle their own
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 16,
  },
  footerLoader: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  footerText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    color: Colors.onSurface,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  retryText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    letterSpacing: 2,
    color: Colors.onPrimary,
  },
});
