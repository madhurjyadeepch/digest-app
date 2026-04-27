import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';

interface ChatInputProps {
  onSend?: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  // 64 (tab bar) + max(insets.bottom, 16) + 16 (spacing above tab bar)
  const bottomPad = 64 + Math.max(insets.bottom, 16) + 16;

  const handleSend = () => {
    if (text.trim() && onSend) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPad }]}>
      {/* Subtle glow effect */}
      <View style={styles.glowOuter} />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask Digest about this article..."
          placeholderTextColor="rgba(173,170,171,0.5)"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <View style={styles.actions}>
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialIcons
              name="attach-file"
              size={22}
              color={Colors.onSurfaceVariant}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="arrow-upward"
              size={20}
              color={Colors.onPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  glowOuter: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    height: 52,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,141,135,0.06)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    color: Colors.onSurface,
    paddingVertical: 0,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
