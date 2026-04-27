import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { ChatMessage } from '../../types';

interface AIResponseProps {
  message: ChatMessage;
}

export default function AIResponse({ message }: AIResponseProps) {
  // Parse content with bold markers
  const renderContent = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        // This is bold text — find matching highlight
        const highlight = message.highlights?.find((h) => h.text === part);
        return (
          <Text
            key={i}
            style={[
              styles.contentText,
              {
                fontFamily: 'PlusJakartaSans-Bold',
                color: highlight?.color || Colors.secondary,
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

  return (
    <View style={styles.container}>
      {/* AI Avatar + Label */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <MaterialIcons name="psychology" size={16} color={Colors.onSecondary} />
        </View>
        <Text style={styles.label}>DIGEST INTELLIGENCE</Text>
      </View>

      {/* Main Content */}
      <View style={styles.contentSection}>
        <Text style={styles.contentWrapper}>{renderContent(message.content)}</Text>

        {/* Info Cards Grid */}
        {message.infoCards && message.infoCards.length > 0 && (
          <View style={styles.cardsGrid}>
            {message.infoCards.map((card, index) => (
              <View
                key={index}
                style={[
                  styles.infoCard,
                  { borderLeftColor: card.borderColor },
                ]}
              >
                <MaterialIcons
                  name={card.icon as any}
                  size={22}
                  color={card.titleColor}
                  style={styles.cardIcon}
                />
                <Text style={[styles.cardTitle, { color: card.titleColor }]}>
                  {card.title}
                </Text>
                <Text style={styles.cardContent}>{card.content}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Quote */}
        {message.quote && (
          <Text style={styles.quoteText}>{message.quote}</Text>
        )}

        {/* Warning Card */}
        {message.warning && (
          <View style={styles.warningCard}>
            <MaterialIcons
              name="warning"
              size={22}
              color={Colors.errorDim}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningText}>{message.warning.content}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: '90%',
    marginBottom: 24,
    gap: 16,
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
  label: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  contentSection: {
    gap: 16,
  },
  contentWrapper: {
    // Parent Text for inline rendering
  },
  contentText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 17,
    lineHeight: 28,
    color: Colors.onSurface,
  },
  cardsGrid: {
    gap: 12,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: 20,
    borderRadius: BorderRadius.xl,
    borderLeftWidth: 4,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cardContent: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurfaceVariant,
  },
  quoteText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 4,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.surfaceContainer,
    padding: 20,
    borderRadius: 20,
    marginTop: 4,
  },
  warningText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.onSurface,
  },
});
