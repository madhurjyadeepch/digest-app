import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing } from '../../constants/theme';
import { Article } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ArticleHeroProps {
  article: Article;
}

export default function ArticleHero({ article }: ArticleHeroProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: article.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(14,14,15,0.4)', Colors.background]}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {article.category.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.title}>
          {article.title}
        </Text>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: article.author.avatar }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.authorName}>{article.author.name}</Text>
            <Text style={styles.authorRole}>
              {article.author.role} • {article.readTime}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: 500,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    width: '100%',
    paddingHorizontal: Spacing.xxxl,
  },
  badge: {
    backgroundColor: Colors.secondaryFixed,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.onSecondaryFixed,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 36,
    letterSpacing: -1.5,
    lineHeight: 38,
    color: Colors.onSurface,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 30,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainer,
  },
  authorName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: Colors.onSurface,
  },
  authorRole: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
});
