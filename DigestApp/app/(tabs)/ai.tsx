import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useNews } from '../../src/hooks/useNews';
import Header from '../../src/components/common/Header';
import ArticleContext from '../../src/components/chat/ArticleContext';
import ChatBubble from '../../src/components/chat/ChatBubble';
import AIResponse from '../../src/components/chat/AIResponse';
import ChatInput from '../../src/components/chat/ChatInput';
import api from '../../src/services/api';
import { Article } from '../../src/types';

const MAX_QUESTIONS = 10;

const SUGGESTED_QUESTIONS = [
  'Summarize this article',
  "What's the key takeaway?",
  'Why does this matter?',
  'Explain like I\'m 15',
  'What are both sides of this?',
];

interface ChatMsg {
  id: string;
  role: 'user' | 'ai';
  content: string;
  isRelevant?: boolean;
}

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ articleData?: string }>();
  const scrollRef = useRef<ScrollView>(null);

  // Get article context — prefer passed article, fallback to first feed article
  const { articles: feedArticles } = useNews({ limit: 1 });
  const [contextArticle, setContextArticle] = useState<Article | null>(null);

  useEffect(() => {
    if (params.articleData) {
      try {
        const parsed = JSON.parse(params.articleData);
        setContextArticle(parsed);
        // Reset chat when article changes
        setMessages([]);
        setQuestionsUsed(0);
      } catch {
        // fallback
      }
    }
  }, [params.articleData]);

  // Fallback to first feed article if no article was passed
  useEffect(() => {
    if (!contextArticle && feedArticles.length > 0) {
      setContextArticle(feedArticles[0]);
    }
  }, [feedArticles, contextArticle]);

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Build article content string for the AI
  const getArticleContent = useCallback(() => {
    if (!contextArticle) return '';
    const sections = contextArticle.fullContent || [];
    const fullText = sections.map((s) => s.content).join('\n\n');
    return fullText || contextArticle.summary || '';
  }, [contextArticle]);

  // Build chat history for the API
  const getChatHistory = useCallback(() => {
    return messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));
  }, [messages]);

  const handleSendMessage = useCallback(
    async (question: string) => {
      if (!contextArticle || isLoading || questionsUsed >= MAX_QUESTIONS) return;

      // Add user message
      const userMsg: ChatMsg = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: question,
      };
      setMessages((prev) => [...prev, userMsg]);
      setQuestionsUsed((prev) => prev + 1);
      setIsLoading(true);

      // Scroll to bottom
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const result = await api.sendChatMessage(
          question,
          {
            title: contextArticle.title,
            content: getArticleContent(),
            category: contextArticle.category,
          },
          getChatHistory()
        );

        const aiMsg: ChatMsg = {
          id: `ai-${Date.now()}`,
          role: 'ai',
          content: result.answer,
          isRelevant: result.isRelevant,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (error: any) {
        const aiMsg: ChatMsg = {
          id: `ai-err-${Date.now()}`,
          role: 'ai',
          content:
            'Sorry, I couldn\'t process that right now. Please try again in a moment.',
          isRelevant: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
        console.error('[AI Chat] Error:', error.message);
      } finally {
        setIsLoading(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
      }
    },
    [contextArticle, isLoading, questionsUsed, getArticleContent, getChatHistory]
  );

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <View style={styles.container}>
      <Header />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 70 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Article Context Card */}
          {contextArticle ? (
            <ArticleContext
              title={contextArticle.title}
              subtitle={`${contextArticle.category} · ${contextArticle.readTime}`}
              imageUrl={contextArticle.imageUrl}
            />
          ) : (
            <ArticleContext
              title="No Article Selected"
              subtitle="Swipe right on any article to chat about it"
              imageUrl="https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=400"
            />
          )}

          {/* Empty State — Suggested Questions */}
          {messages.length === 0 && contextArticle && (
            <View style={styles.emptyState}>
              <View style={styles.emptyHeader}>
                <MaterialIcons
                  name="auto-awesome"
                  size={20}
                  color={Colors.secondary}
                />
                <Text style={styles.emptyTitle}>Ask me anything</Text>
              </View>
              <Text style={styles.emptySubtitle}>
                about this article. Here are some ideas:
              </Text>

              <View style={styles.suggestionsGrid}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestedQuestion(q)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name="chat-bubble-outline"
                      size={14}
                      color={Colors.secondary}
                    />
                    <Text style={styles.suggestionText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Chat Messages */}
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return <ChatBubble key={msg.id} content={msg.content} />;
            }
            return (
              <AIResponse
                key={msg.id}
                content={msg.content}
                isRelevant={msg.isRelevant}
              />
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <AIResponse content="" isLoading={true} />
          )}

          {/* Limit reached message */}
          {questionsUsed >= MAX_QUESTIONS && (
            <View style={styles.limitBanner}>
              <MaterialIcons name="hourglass-empty" size={18} color={Colors.tertiary} />
              <Text style={styles.limitBannerText}>
                You've reached the 10-question limit for this article.
                Swipe right on another article to start a new chat!
              </Text>
            </View>
          )}
        </ScrollView>

        <ChatInput
          onSend={handleSendMessage}
          questionsUsed={questionsUsed}
          maxQuestions={MAX_QUESTIONS}
          disabled={isLoading || !contextArticle}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: 20,
  },
  // Empty state
  emptyState: {
    marginBottom: 24,
  },
  emptyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 20,
    marginLeft: 28,
  },
  suggestionsGrid: {
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  suggestionText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: Colors.onSurface,
    flex: 1,
  },
  // Limit banner
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: 'rgba(255,219,143,0.08)',
    borderRadius: BorderRadius.xl,
    padding: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,219,143,0.15)',
  },
  limitBannerText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    lineHeight: 20,
    color: Colors.tertiary,
    flex: 1,
  },
});
