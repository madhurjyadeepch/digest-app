import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../../constants/theme';

interface ChatInputProps {
  onSend?: (message: string) => void;
  questionsUsed: number;
  maxQuestions: number;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  questionsUsed,
  maxQuestions,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const bottomPad = 64 + Math.max(insets.bottom, 16) + 16;
  const limitReached = questionsUsed >= maxQuestions;

  const handleSend = () => {
    if (text.trim() && onSend && !limitReached && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPad }]}>
      {/* Question counter */}
      <View style={styles.counterRow}>
        <Text style={styles.counterText}>
          {limitReached
            ? 'Question limit reached'
            : `${questionsUsed}/${maxQuestions} questions`}
        </Text>
        {limitReached && (
          <View style={styles.limitBadge}>
            <MaterialIcons name="block" size={10} color={Colors.error} />
            <Text style={styles.limitText}>LIMIT</Text>
          </View>
        )}
      </View>

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          (limitReached || disabled) && styles.inputDisabled,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholder={
            limitReached
              ? 'You\'ve used all 10 questions'
              : 'Ask about this article...'
          }
          placeholderTextColor="rgba(173,170,171,0.5)"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!limitReached && !disabled}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (limitReached || disabled || !text.trim()) && styles.sendDisabled,
          ]}
          onPress={handleSend}
          activeOpacity={0.8}
          disabled={limitReached || disabled || !text.trim()}
        >
          <MaterialIcons
            name="arrow-upward"
            size={20}
            color={
              limitReached || disabled || !text.trim()
                ? Colors.onSurfaceVariant
                : Colors.onPrimary
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: Colors.background,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  counterText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  limitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,115,81,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  limitText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: Colors.onSurface,
    paddingVertical: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendDisabled: {
    backgroundColor: Colors.surfaceContainer,
  },
});
