import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';

export default function SubscribeCTA() {
  return (
    <View style={styles.container}>
      <View style={styles.textSection}>
        <Text style={styles.title}>Support Deep Journalism</Text>
        <Text style={styles.subtitle}>
          Join 50k others who value quality over quantity.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} activeOpacity={0.8}>
        <Text style={styles.buttonText}>SUBSCRIBE NOW</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    marginHorizontal: Spacing.xxxl,
    marginVertical: Spacing.huge,
    gap: 20,
  },
  textSection: {
    gap: 6,
  },
  title: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 24,
    letterSpacing: -0.8,
    color: Colors.onPrimary,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: 'rgba(78,0,6,0.8)',
  },
  button: {
    backgroundColor: Colors.onPrimary,
    alignSelf: 'flex-start',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.primary,
    textTransform: 'uppercase',
  },
});
