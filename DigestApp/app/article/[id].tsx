import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import api from '../../src/services/api';
import ArticleHero from '../../src/components/article/ArticleHero';
import ArticleBody from '../../src/components/article/ArticleBody';
import SubscribeCTA from '../../src/components/article/SubscribeCTA';
import RelatedCard from '../../src/components/article/RelatedCard';
import { Article } from '../../src/types';

export default function ArticleScreen() {
  const { id, articleData } = useLocalSearchParams<{
    id: string;
    articleData?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [id]);

  async function loadArticle() {
    setLoading(true);

    // First try to use the passed article data (avoids extra API call)
    if (articleData) {
      try {
        const parsed = JSON.parse(articleData);
        setArticle(parsed);
        setLoading(false);
        return;
      } catch {
        // Fall through to API call
      }
    }

    // Fetch from API
    try {
      const fetched = await api.getArticleById(id);
      if (fetched) {
        setArticle(fetched);
      }
    } catch (error) {
      console.error('[ArticleScreen] Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // No article found
  if (!article) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 8 }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.notFoundText}>Article not found</Text>
        <TouchableOpacity
          style={styles.goBackBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackText}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero */}
        <ArticleHero article={article} />

        {/* Article Body */}
        {article.fullContent && article.fullContent.length > 0 ? (
          <ArticleBody sections={article.fullContent} />
        ) : (
          <View style={styles.summaryBody}>
            <Text style={styles.summaryText}>{article.summary}</Text>
            {article.sourceUrl && (
              <TouchableOpacity
                style={styles.readFullButton}
                onPress={() => Linking.openURL(article.sourceUrl!)}
                activeOpacity={0.7}
              >
                <Text style={styles.readFullText}>READ FULL ARTICLE</Text>
                <MaterialIcons
                  name="open-in-new"
                  size={16}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Source link for API articles */}
        {article.sourceUrl && (
          <View style={styles.sourceSection}>
            <TouchableOpacity
              style={styles.sourceButton}
              onPress={() => Linking.openURL(article.sourceUrl!)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="open-in-new"
                size={16}
                color={Colors.secondary}
              />
              <Text style={styles.sourceText}>
                View original on {article.source || 'source'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Subscribe CTA */}
        <SubscribeCTA />

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <View style={styles.relatedSection}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>READ NEXT</Text>
              <TouchableOpacity>
                <Text style={styles.archiveLink}>VIEW ARCHIVE</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedScroll}
            >
              {article.relatedArticles.map((related) => (
                <View key={related.id} style={styles.relatedCardWrapper}>
                  <RelatedCard article={related} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>DIGEST</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>PRIVACY</Text>
            <Text style={styles.footerLink}>TERMS</Text>
            <Text style={styles.footerLink}>CONTACT</Text>
          </View>
          <Text style={styles.footerCopy}>
            © 2024 Digest Editorial. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 100,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(14,14,15,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  notFoundText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },
  goBackBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainer,
  },
  goBackText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.onSurface,
  },
  summaryBody: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.huge,
    backgroundColor: Colors.surfaceContainerLow,
  },
  summaryText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 18,
    lineHeight: 30,
    color: Colors.onSurface,
    marginBottom: 24,
  },
  readFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: Colors.surfaceContainer,
  },
  readFullText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.primary,
  },
  sourceSection: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: Colors.outlineVariant,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },
  relatedSection: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xxxl,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xxxl,
  },
  relatedTitle: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 28,
    letterSpacing: -0.8,
    color: Colors.onSurface,
  },
  archiveLink: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.secondary,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.secondary,
  },
  relatedScroll: {
    gap: 16,
  },
  relatedCardWrapper: {
    width: 200,
  },
  footer: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: Spacing.xxxl,
    paddingTop: Spacing.huge,
    paddingBottom: Spacing.massive,
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(72,72,73,0.1)',
  },
  footerLogo: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 20,
    letterSpacing: 6,
    color: Colors.onSurface,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.onSurfaceVariant,
  },
  footerCopy: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
});
