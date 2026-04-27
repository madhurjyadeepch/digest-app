import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../constants/theme';
import { ArticleSection } from '../../types';

interface ArticleBodyProps {
  sections: ArticleSection[];
}

export default function ArticleBody({ sections }: ArticleBodyProps) {
  return (
    <View style={styles.container}>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'paragraph':
            return index === 0 ? (
              <View key={index} style={styles.leadContainer}>
                <View style={styles.leadBorder} />
                <Text style={styles.leadText}>{section.content}</Text>
              </View>
            ) : (
              <Text key={index} style={styles.bodyText}>
                {section.content}
              </Text>
            );

          case 'heading':
            return (
              <Text key={index} style={styles.heading}>
                {section.content}
              </Text>
            );

          case 'quote':
            return (
              <View key={index} style={styles.quoteContainer}>
                <Text style={styles.quoteText}>{section.content}</Text>
              </View>
            );

          default:
            return null;
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.huge,
    gap: 24,
  },
  leadContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  leadBorder: {
    width: 4,
    backgroundColor: Colors.secondary,
    borderRadius: 2,
  },
  leadText: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 20,
    lineHeight: 32,
    color: Colors.onSurfaceVariant,
  },
  bodyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 18,
    lineHeight: 32,
    color: Colors.white90,
  },
  heading: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 28,
    letterSpacing: -0.8,
    color: Colors.primary,
    marginTop: 20,
  },
  quoteContainer: {
    backgroundColor: Colors.surfaceContainerHigh,
    borderTopWidth: 2,
    borderTopColor: Colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 24,
    marginVertical: 16,
  },
  quoteText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 20,
    lineHeight: 30,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
});
