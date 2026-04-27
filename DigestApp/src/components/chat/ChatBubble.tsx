import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../../constants/theme';

interface ChatBubbleProps {
  content: string;
}

export default function ChatBubble({ content }: ChatBubbleProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{content}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  bubble: {
    maxWidth: '85%',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 32,
    borderTopRightRadius: 8,
  },
  text: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onPrimary,
  },
});
