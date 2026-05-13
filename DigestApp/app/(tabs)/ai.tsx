import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../src/constants/theme';
import { CHAT_MESSAGES } from '../../src/constants/mockData';
import { useNews } from '../../src/hooks/useNews';
import Header from '../../src/components/common/Header';
import ArticleContext from '../../src/components/chat/ArticleContext';
import ChatBubble from '../../src/components/chat/ChatBubble';
import AIResponse from '../../src/components/chat/AIResponse';
import ChatInput from '../../src/components/chat/ChatInput';
import { ChatMessage } from '../../src/types';

export default function AIScreen() {
  const insets = useSafeAreaInsets();

  // Use first article from real news feed as context
  const { articles } = useNews({ limit: 1 });
  const contextArticle = articles.length > 0 ? articles[0] : null;

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    if (item.type === 'user') {
      return <ChatBubble content={item.content} />;
    }
    return <AIResponse message={item} />;
  };

  return (
    <View style={styles.container}>
      <Header />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={CHAT_MESSAGES}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 70 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            contextArticle ? (
              <ArticleContext
                title={contextArticle.title}
                subtitle={contextArticle.summary}
                imageUrl={contextArticle.imageUrl}
              />
            ) : (
              <ArticleContext
                title="Digest AI Assistant"
                subtitle="Ask me anything about the latest news"
                imageUrl="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800"
              />
            )
          }
        />
        <ChatInput
          onSend={(message) => {
            console.log('Send message:', message);
          }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 100,
  },
});
