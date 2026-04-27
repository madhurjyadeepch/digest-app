import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing } from '../../src/constants/theme';
import { CATEGORIES } from '../../src/constants/mockData';
import Header from '../../src/components/common/Header';
import CategoryCard from '../../src/components/explore/CategoryCard';
import TrendingCard from '../../src/components/explore/TrendingCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Explore Header */}
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>
          Curated streams across every dimension of modern life.
        </Text>

        {/* Trending Card */}
        <View style={styles.trendingSection}>
          <TrendingCard
            title="THE QUANTUM LEAP IN NEURAL ARCHITECTURE"
            readTime="8 Min Read"
            imageUrl="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"
          />
        </View>

        {/* Category Grid */}
        <View style={styles.grid}>
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxxl,
  },
  title: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 44,
    letterSpacing: -1.5,
    color: Colors.onBackground,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    marginBottom: 24,
    maxWidth: 300,
  },
  trendingSection: {
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
