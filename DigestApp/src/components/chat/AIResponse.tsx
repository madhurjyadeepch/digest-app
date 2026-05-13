import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/theme';

interface AIResponseProps {
  content: string;
  isRelevant?: boolean;
  isLoading?: boolean;
}

export default function AIResponse({
  content,
  isRelevant = true,
  isLoading = false,
}: AIResponseProps) {
  // Parse bold markers (**text**) into styled spans
  const renderContent = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <Text
            key={i}
            style={[
              styles.contentText,
              {
                fontFamily: 'PlusJakartaSans-Bold',
                color: Colors.secondary,
              },
            ]}
          >
            {part}
          </Text>
        );
      }
      return (
        <Text key={i} style={styles.contentText}>
          {part}
        </Text>
      );
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <MaterialIcons name="psychology" size={16} color={Colors.onSecondary} />
          </View>
          <Text style={styles.label}>DIGEST AI</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.secondary} />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* AI Avatar + Label */}
      <View style={styles.headerRow}>
        <View style={[styles.avatar, !isRelevant && styles.avatarOffTopic]}>
          <MaterialIcons
            name={isRelevant ? 'psychology' : 'info-outline'}
            size={16}
            color={isRelevant ? Colors.onSecondary : Colors.onSurface}
          />
        </View>
        <Text style={styles.label}>DIGEST AI</Text>
        {!isRelevant && (
          <View style={styles.offTopicBadge}>
            <Text style={styles.offTopicText}>OFF TOPIC</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View
        style={[
          styles.contentSection,
          !isRelevant && styles.contentSectionOffTopic,
        ]}
      >
        <Text style={styles.contentWrapper}>{renderContent(content)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '92%',
    marginBottom: 20,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOffTopic: {
    backgroundColor: Colors.surfaceContainerHighest,
  },
  label: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  offTopicBadge: {
    backgroundColor: 'rgba(255,115,81,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  offTopicText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 8,
    letterSpacing: 1.5,
    color: Colors.error,
  },
  contentSection: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
    padding: 20,
    marginLeft: 38,
  },
  contentSectionOffTopic: {
    borderWidth: 1,
    borderColor: 'rgba(255,115,81,0.2)',
    backgroundColor: 'rgba(255,115,81,0.04)',
  },
  contentWrapper: {},
  contentText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 38,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl,
  },
  loadingText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
