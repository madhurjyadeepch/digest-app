import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../src/constants/theme';
import { useSharedBookmarks } from '../src/services/bookmarkContext';

export default function SavedArticlesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { bookmarks, loading, removeBookmark } = useSharedBookmarks();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Articles</Text>
        <View style={styles.headerRight}>
          <Text style={styles.countBadge}>
            {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : bookmarks.length > 0 ? (
          <View style={styles.savedList}>
            {bookmarks.map((article, index) => (
              <TouchableOpacity
                key={article.id}
                style={styles.savedItem}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: '/article/[id]' as any,
                    params: { id: article.id, articleData: JSON.stringify(article) },
                  });
                }}
              >
                <Image
                  source={{ uri: article.imageUrl }}
                  style={styles.savedImage}
                  resizeMode="cover"
                />
                <View style={styles.savedTextSection}>
                  <Text style={styles.savedCategory}>
                    {article.category?.toUpperCase()}
                  </Text>
                  <Text style={styles.savedTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={styles.savedMeta}>
                    {article.author?.name || 'Staff'} • {article.readTime}
                  </Text>
                </View>
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  onPress={() => removeBookmark(article.id)}
                >
                  <MaterialIcons
                    name="bookmark"
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="bookmark-outline"
              size={64}
              color={Colors.outlineVariant}
            />
            <Text style={styles.emptyTitle}>No saved articles</Text>
            <Text style={styles.emptySubtext}>
              Double-tap any article to save it for later.{'\n'}
              Your saved articles will appear here.
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.browseButtonText}>BROWSE ARTICLES</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(72,72,73,0.15)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginLeft: 14,
  },
  headerRight: {},
  countBadge: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: 'rgba(255,141,135,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  savedList: {
    gap: 12,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 12,
    gap: 14,
  },
  savedImage: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  savedTextSection: {
    flex: 1,
  },
  savedCategory: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: 4,
  },
  savedTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    lineHeight: 19,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  savedMeta: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 20,
    color: Colors.onSurface,
    marginTop: 8,
  },
  emptySubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  browseButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.onPrimary,
  },
});
