import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface ArticleContextProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  onViewArticle?: () => void;
}

export default function ArticleContext({
  title,
  subtitle,
  imageUrl,
  onViewArticle,
}: ArticleContextProps) {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.textSection}>
        <Text style={styles.label}>CURRENT CONTEXT</Text>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onViewArticle} activeOpacity={0.7}>
        <Text style={styles.buttonText}>View Article</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    flex: 1,
  },
  label: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.secondary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    letterSpacing: -0.3,
    color: Colors.onSurface,
    lineHeight: 18,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    lineHeight: 15,
  },
  button: {
    backgroundColor: Colors.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    color: Colors.onSurface,
  },
});
