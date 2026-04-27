/**
 * Digest App - Vivid Obsidian Design System
 * Based on DESIGN.md: "The Kinetic Editorial"
 *
 * Color palette anchored by deep monochromatic base
 * with high-contrast, neon-tinted highlights.
 */

export const Colors = {
  // Foundation
  background: '#0e0e0f',
  onBackground: '#ffffff',

  // Surface hierarchy (physical stack of luxury paper)
  surfaceContainerLowest: '#000000',
  surfaceContainerLow: '#131314',
  surfaceContainer: '#1a191b',
  surfaceContainerHigh: '#201f21',
  surfaceContainerHighest: '#262627',
  surfaceBright: '#2c2c2d',
  surfaceVariant: '#262627',

  // On-Surface
  onSurface: '#ffffff',
  onSurfaceVariant: '#adaaab',

  // Primary - Coral
  primary: '#ff8d87',
  primaryFixed: '#ff7670',
  primaryFixedDim: '#ff5a57',
  primaryDim: '#ff716b',
  primaryContainer: '#ff7670',
  onPrimary: '#65000a',
  onPrimaryContainer: '#4e0006',
  onPrimaryFixed: '#000000',
  onPrimaryFixedVariant: '#600009',

  // Secondary - Teal
  secondary: '#26fedc',
  secondaryFixed: '#26fedc',
  secondaryFixedDim: '#00efce',
  secondaryDim: '#00efce',
  secondaryContainer: '#006b5b',
  onSecondary: '#005d4f',
  onSecondaryContainer: '#ddfff5',
  onSecondaryFixed: '#00483d',
  onSecondaryFixedVariant: '#006859',

  // Tertiary - Amber
  tertiary: '#ffdb8f',
  tertiaryFixed: '#f9cc61',
  tertiaryFixedDim: '#eabe55',
  tertiaryDim: '#eabe55',
  tertiaryContainer: '#f9cc61',
  onTertiary: '#664c00',
  onTertiaryContainer: '#5b4400',
  onTertiaryFixed: '#443100',
  onTertiaryFixedVariant: '#674d00',

  // Error
  error: '#ff7351',
  errorContainer: '#b92902',
  errorDim: '#d53d18',
  onError: '#450900',
  onErrorContainer: '#ffd2c8',

  // Outlines
  outline: '#767576',
  outlineVariant: '#484849',

  // Inverse
  inverseSurface: '#fcf8f9',
  inverseOnSurface: '#565556',
  inversePrimary: '#bb1824',

  // Surface tint
  surfaceTint: '#ff8d87',

  // Transparent variants
  white10: 'rgba(255,255,255,0.1)',
  white50: 'rgba(255,255,255,0.5)',
  white60: 'rgba(255,255,255,0.6)',
  white70: 'rgba(255,255,255,0.7)',
  white90: 'rgba(255,255,255,0.9)',
  black40: 'rgba(0,0,0,0.4)',
  black80: 'rgba(0,0,0,0.8)',
} as const;

export const Typography = {
  // Display - breaking news, major headers
  displayLarge: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 48,
    letterSpacing: -0.96, // -0.02em
    lineHeight: 52,
  },
  displayMedium: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 40,
    letterSpacing: -0.8,
    lineHeight: 44,
  },
  displaySmall: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 32,
    letterSpacing: -0.64,
    lineHeight: 36,
  },

  // Headline - article titles in feeds
  headlineLarge: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    letterSpacing: -0.56,
    lineHeight: 34,
  },
  headlineMedium: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    letterSpacing: -0.48,
    lineHeight: 30,
  },

  // Body - long-form reading
  bodyLarge: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 28,
  },
  bodyMedium: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 24,
  },

  // Label - categories, metadata (uppercase, tracked)
  labelLarge: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    letterSpacing: 1.5, // tracked wider
    lineHeight: 18,
    textTransform: 'uppercase' as const,
  },
  labelMedium: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    letterSpacing: 1.2,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  labelSmall: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 1.5,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 24,   // 1.5rem - main cards
  full: 9999,
} as const;
