import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/theme';
import { Category } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - 64 - CARD_GAP) / 2;

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: category.backgroundColor },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconRow}>
        <MaterialIcons
          name={category.icon as any}
          size={32}
          color={category.textColor}
          style={{ opacity: 0.4 }}
        />
      </View>
      <Text style={[styles.name, { color: category.textColor }]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: BorderRadius.xl,
    padding: 20,
    justifyContent: 'space-between',
  },
  iconRow: {
    alignItems: 'flex-end',
  },
  name: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
});
