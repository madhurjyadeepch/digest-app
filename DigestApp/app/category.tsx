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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../src/constants/theme';
import { useNews } from '../src/hooks/useNews';
import { useSharedBookmarks } from '../src/services/bookmarkContext';
import FeedCard from '../src/components/feed/FeedCard';
import { Article } from '../src/types';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Map frontend category IDs to backend API category values
const CATEGORY_MAP: Record<string, string> = {
  world: 'politics',
  tech: 'technology',
  culture: 'entertainment',
  science: 'science',
  finance: 'business',
  life: '',        // general feed
  design: '',      // general feed
  health: 'health',
};

export default function CategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  // Map frontend category ID to backend category
  const backendCategory = CATEGORY_MAP[id || ''] ?? '';

  const { articles, loading, error, refreshing, loadingMore, refresh, loadMore, hasMore } =
    useNews({ category: backendCategory, limit: 10 });
  const { saveBookmark } = useSharedBookmarks();

  const handleDoubleTap = useCallback(
    (article: Article) => {
      saveBookmark(article);
    },
    [saveBookmark]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Article; index: number }) => (
      <FeedCard article={item} index={index} onDoubleTap={handleDoubleTap} />
    ),
    [handleDoubleTap]
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

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Loading more stories...</Text>
      </View>
    );
  }, [loadingMore]);

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>CATEGORY</Text>
          <Text style={styles.headerTitle}>{name || id?.toUpperCase() || 'Articles'}</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Loading state */}
      {loading && articles.length === 0 ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading {name?.toLowerCase() || ''} news...</Text>
        </View>
      ) : error && articles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorEmoji}>📡</Text>
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>TRY AGAIN</Text>
          </TouchableOpacity>
        </View>
      ) : articles.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorEmoji}>📰</Text>
          <Text style={styles.errorTitle}>No Articles Found</Text>
          <Text style={styles.errorText}>
            No articles available for this category right now. Try again later.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>REFRESH</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
          onEndReached={loadMore}
          onEndReachedThreshold={1.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(38,38,39,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    letterSpacing: 3,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 18,
    letterSpacing: -0.3,
    color: Colors.onSurface,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  list: {
    flex: 1,
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
