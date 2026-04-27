import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { RelatedArticle } from '../../types';

interface RelatedCardProps {
  article: RelatedArticle;
  onPress?: () => void;
}

export default function RelatedCard({ article, onPress }: RelatedCardProps) {
  const categoryColor =
    article.categoryColor === 'primary'
      ? Colors.primary
      : article.categoryColor === 'secondary'
      ? Colors.secondary
      : article.categoryColor === 'tertiary'
      ? Colors.tertiary
      : Colors.error;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <Text style={[styles.category, { color: categoryColor }]}>
        {article.category.toUpperCase()}
      </Text>
      <Text style={styles.title}>{article.title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    aspectRatio: 4 / 3,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: Colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  category: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    lineHeight: 20,
    color: Colors.onSurface,
    marginTop: 4,
  },
});
