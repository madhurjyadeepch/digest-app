import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Article } from '../../types';
import { MaterialIcons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

interface FeedCardProps {
  article: Article;
  index: number;
}

export default function FeedCard({ article, index }: FeedCardProps) {
  const router = useRouter();
  const cardNumber = String(index + 1).padStart(2, '0');
  const translateX = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to horizontal swipes (not vertical scrolling)
        return (
          Math.abs(gestureState.dx) > 15 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        );
      },
      onPanResponderGrant: () => {
        hasNavigated.current = false;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx * 0.4); // dampened movement
      },
      onPanResponderRelease: (_, gestureState) => {
        if (hasNavigated.current) return;

        if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swiped LEFT → Full Article
          hasNavigated.current = true;
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            router.push({
              pathname: '/article/[id]' as any,
              params: { id: article.id, articleData: JSON.stringify(article) },
            });
            setTimeout(() => {
              translateX.setValue(0);
              hasNavigated.current = false;
            }, 500);
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swiped RIGHT → AI Chat
          hasNavigated.current = true;
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            router.push('/(tabs)/ai');
            setTimeout(() => {
              translateX.setValue(0);
              hasNavigated.current = false;
            }, 500);
          });
        } else {
          // Spring back
          Animated.spring(translateX, {
            toValue: 0,
            tension: 100,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Swipe indicator opacity based on drag distance
  const leftIndicatorOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const rightIndicatorOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { height: SCREEN_HEIGHT }]}>
      {/* Swipe indicators behind the card */}
      <Animated.View style={[styles.swipeIndicator, styles.swipeLeft, { opacity: leftIndicatorOpacity }]}>
        <MaterialIcons name="article" size={32} color={Colors.onSurface} />
        <Text style={styles.swipeIndicatorText}>Full Article</Text>
      </Animated.View>
      <Animated.View style={[styles.swipeIndicator, styles.swipeRight, { opacity: rightIndicatorOpacity }]}>
        <MaterialIcons name="psychology" size={32} color={Colors.onSurface} />
        <Text style={styles.swipeIndicatorText}>AI Chat</Text>
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.cardWrapper, { transform: [{ translateX }] }]}
      >
        <View style={styles.card}>
          {/* Background Image */}
          <Image
            source={{ uri: article.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />

          {/* Color Tint Overlay — blends with dominant image color */}
          <LinearGradient
            colors={[
              `${article.dominantColor}CC`,
              `${article.dominantColor}EE`,
              `${article.dominantColor}FF`,
            ]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Additional gradient for text readability */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Category Label */}
          <View style={styles.topSection}>
            <Text style={styles.category}>
              {article.category}
            </Text>
            <Text style={styles.title}>
              {article.title}
            </Text>
          </View>

          {/* Summary + Swipe Hints */}
          <View style={styles.bottomSection}>
            <Text style={styles.summary}>
              {article.summary}
            </Text>

            <View style={styles.hintRow}>
              <View style={styles.hintPill}>
                <MaterialIcons name="arrow-back" size={14} color="#fff" />
                <Text style={styles.hintText}>SWIPE LEFT FOR FULL</Text>
              </View>
              <View style={styles.hintPill}>
                <Text style={styles.hintText}>SWIPE RIGHT FOR AI</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#fff" />
              </View>
            </View>
          </View>

          {/* Card Number Watermark */}
          <View style={styles.watermarkContainer}>
            <Text style={styles.watermark}>{cardNumber}</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 110,
    justifyContent: 'center',
    position: 'relative',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    alignItems: 'center',
    gap: 8,
    zIndex: 0,
  },
  swipeLeft: {
    right: 40,
  },
  swipeRight: {
    left: 40,
  },
  swipeIndicatorText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.onSurface,
    textTransform: 'uppercase',
  },
  cardWrapper: {
    flex: 1,
    zIndex: 10,
  },
  card: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    padding: 28,
    justifyContent: 'space-between',
  },
  topSection: {
    zIndex: 10,
    marginTop: 8,
  },
  category: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  title: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 34,
    letterSpacing: -1.2,
    lineHeight: 40,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bottomSection: {
    zIndex: 10,
  },
  summary: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 20,
    color: 'rgba(255,255,255,0.85)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hintRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  hintText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.9)',
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: -30,
    right: -10,
    opacity: 0.08,
    zIndex: 1,
  },
  watermark: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 160,
    letterSpacing: -8,
    color: '#ffffff',
  },
});
