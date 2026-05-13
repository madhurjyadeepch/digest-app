import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useBookmarks } from '../../src/hooks/useBookmarks';
import Header from '../../src/components/common/Header';

const SETTINGS_ITEMS = [
  { icon: 'notifications-none', label: 'Notifications', subtitle: 'Push alerts in simple language' },
  { icon: 'history', label: 'Reading History', subtitle: 'Your recent reads' },
  { icon: 'tune', label: 'Preferences', subtitle: 'Content & language settings' },
  { icon: 'dark-mode', label: 'Appearance', subtitle: 'Dark mode enabled' },
  { icon: 'info-outline', label: 'About Digest', subtitle: 'Version 1.0.0' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 70 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>M</Text>
          </View>
          <Text style={styles.name}>Reader</Text>
          <Text style={styles.email}>digest@reader.com</Text>
        </View>

        {/* Saved Articles Section */}
        <View style={styles.savedSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="bookmark" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Saved Articles</Text>
          </View>

          {bookmarksLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : bookmarks.length > 0 ? (
            <View style={styles.savedList}>
              {bookmarks.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={styles.savedItem}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: article.imageUrl }}
                    style={styles.savedImage}
                    resizeMode="cover"
                  />
                  <View style={styles.savedTextSection}>
                    <Text style={styles.savedCategory}>
                      {article.category.toUpperCase()}
                    </Text>
                    <Text style={styles.savedTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <Text style={styles.savedMeta}>
                      {article.author.name} • {article.readTime}
                    </Text>
                  </View>
                  <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons
                      name="bookmark"
                      size={20}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="bookmark-outline" size={48} color={Colors.outlineVariant} />
              <Text style={styles.emptyText}>No saved articles yet</Text>
              <Text style={styles.emptySubtext}>
                Bookmark articles from the feed to read later
              </Text>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsHeader}>SETTINGS</Text>
          <View style={styles.settingsList}>
            {SETTINGS_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.settingsItem}
                activeOpacity={0.7}
              >
                <View style={styles.settingsIconContainer}>
                  <MaterialIcons
                    name={item.icon as any}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.settingsText}>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                  <Text style={styles.settingsSubtitle}>{item.subtitle}</Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={Colors.outlineVariant}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} activeOpacity={0.7}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans-ExtraBold',
    fontSize: 28,
    color: Colors.onPrimary,
  },
  name: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },

  // Saved Articles
  savedSection: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    color: Colors.onSurface,
  },
  savedList: {
    gap: 12,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    padding: 12,
    gap: 14,
  },
  savedImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  savedTextSection: {
    flex: 1,
  },
  savedCategory: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: 3,
  },
  savedTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    lineHeight: 18,
    color: Colors.onSurface,
    marginBottom: 4,
  },
  savedMeta: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },

  // Settings
  settingsSection: {
    marginBottom: 16,
  },
  settingsHeader: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.onSurfaceVariant,
    marginBottom: 12,
  },
  settingsList: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    flex: 1,
  },
  settingsLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.onSurface,
    marginBottom: 1,
  },
  settingsSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  signOutButton: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainer,
    borderRadius: BorderRadius.xl,
  },
  signOutText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: Colors.error,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
  },
  emptySubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: Colors.outlineVariant,
    textAlign: 'center',
  },
});
