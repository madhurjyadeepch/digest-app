import React, { useRef, useCallback, useState } from 'react';
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
const DOUBLE_TAP_DELAY = 300;

interface FeedCardProps {
  article: Article;
  index: number;
  onDoubleTap?: (article: Article) => void;
}

export default function FeedCard({ article, index, onDoubleTap }: FeedCardProps) {
  const router = useRouter();

  const translateX = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);

  // Double-tap detection
  const lastTapRef = useRef<number>(0);

  // Save animation
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const saveScale = useRef(new Animated.Value(0)).current;
  const saveOpacity = useRef(new Animated.Value(0)).current;

  const triggerSaveAnimation = useCallback(() => {
    setShowSaveIndicator(true);
    saveScale.setValue(0);
    saveOpacity.setValue(1);

    Animated.parallel([
      Animated.spring(saveScale, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(saveOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setShowSaveIndicator(false);
    });
  }, [saveScale, saveOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        // Detect double-tap on touch start
        const now = Date.now();
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
          // Double tap detected — save article
          if (onDoubleTap) {
            triggerSaveAnimation();
            onDoubleTap(article);
          }
          lastTapRef.current = 0; // Reset
          return false; // Don't capture for swipe
        }
        lastTapRef.current = now;
        return false;
      },
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
            router.push({
              pathname: '/(tabs)/ai' as any,
              params: { articleData: JSON.stringify(article) },
            });
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

          {/* Title Section — always shows full title */}
          <View style={styles.topSection}>
            <Text style={styles.category}>
              {article.category}
            </Text>
            <Text style={styles.title}>
              {article.title}
            </Text>
          </View>

          {/* Summary + Swipe Hints — clips if title is long */}
          <View style={styles.bottomSection}>
            <Text style={styles.summary} numberOfLines={3}>
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

          {/* Double-tap save indicator */}
          {showSaveIndicator && (
            <Animated.View
              style={[
                styles.saveIndicator,
                {
                  opacity: saveOpacity,
                  transform: [{ scale: saveScale }],
                },
              ]}
            >
              <MaterialIcons
                name="bookmark"
                size={52}
                color="#fff"
              />
              <Text style={styles.saveIndicatorText}>SAVED</Text>
            </Animated.View>
          )}
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
    flexShrink: 0,
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
    flexShrink: 1,
    overflow: 'hidden',
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
  saveIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  saveIndicatorText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 14,
    letterSpacing: 4,
    color: '#fff',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
