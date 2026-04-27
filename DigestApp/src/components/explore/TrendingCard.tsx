import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TrendingCardProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  readTime?: string;
  onPress?: () => void;
}

export default function TrendingCard({
  title,
  subtitle,
  imageUrl,
  readTime,
  onPress,
}: TrendingCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <View style={styles.badges}>
          <View style={styles.trendingBadge}>
            <Text style={styles.trendingText}>TRENDING</Text>
          </View>
          {readTime && (
            <Text style={styles.readTime}>{readTime.toUpperCase()}</Text>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 64,
    height: 180,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerHighest,
    marginBottom: 20,
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
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  trendingBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  trendingText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.onPrimary,
    textTransform: 'uppercase',
  },
  readTime: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.white60,
  },
  title: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
    lineHeight: 26,
    color: Colors.onSurface,
  },
});
