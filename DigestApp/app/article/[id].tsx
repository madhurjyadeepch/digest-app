import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { ARTICLES } from '../../src/constants/mockData';
import ArticleHero from '../../src/components/article/ArticleHero';
import ArticleBody from '../../src/components/article/ArticleBody';
import SubscribeCTA from '../../src/components/article/SubscribeCTA';
import RelatedCard from '../../src/components/article/RelatedCard';

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const article = ARTICLES.find((a) => a.id === id) || ARTICLES[0];

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
        <ArticleBody sections={article.fullContent} />

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
